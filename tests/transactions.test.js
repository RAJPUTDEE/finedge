const request = require('supertest');
const app = require('../src/app');
const { resetData } = require('./setup');

async function setupUser() {
  await request(app)
    .post('/users')
    .send({ name: 'T', email: 't@x.com', password: 'secret123' });
  const login = await request(app)
    .post('/users/login')
    .send({ email: 't@x.com', password: 'secret123' });
  return login.body.token;
}

let token;

beforeEach(async () => {
  await resetData();
  token = await setupUser();
});

describe('Transaction APIs', () => {
  it('rejects requests without auth', async () => {
    const res = await request(app).get('/transactions');
    expect(res.status).toBe(401);
  });

  it('creates an income transaction', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'income', amount: 5000, category: 'salary', description: 'April pay' });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(5000);
    expect(res.body.type).toBe('income');
  });

  it('rejects invalid amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', amount: -10, category: 'food' });
    expect(res.status).toBe(400);
  });

  it('lists, fetches, updates, and deletes transactions', async () => {
    const created = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', amount: 200, category: 'food' });
    const id = created.body.id;

    const list = await request(app).get('/transactions').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const one = await request(app).get(`/transactions/${id}`).set('Authorization', `Bearer ${token}`);
    expect(one.body.id).toBe(id);

    const patched = await request(app)
      .patch(`/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 250 });
    expect(patched.body.amount).toBe(250);

    const del = await request(app).delete(`/transactions/${id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const after = await request(app).get('/transactions').set('Authorization', `Bearer ${token}`);
    expect(after.body).toHaveLength(0);
  });

  it('returns 404 for unknown transaction', async () => {
    const res = await request(app).get('/transactions/does-not-exist').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
