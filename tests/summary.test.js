const request = require('supertest');
const app = require('../src/app');
const { resetData } = require('./setup');

let token;

beforeEach(async () => {
  await resetData();
  await request(app)
    .post('/users')
    .send({ name: 'S', email: 's@x.com', password: 'secret123' });
  const login = await request(app)
    .post('/users/login')
    .send({ email: 's@x.com', password: 'secret123' });
  token = login.body.token;

  await request(app)
    .post('/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'income', amount: 10000, category: 'salary', date: '2026-04-01' });
  await request(app)
    .post('/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'expense', amount: 2000, category: 'food', date: '2026-04-05' });
  await request(app)
    .post('/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'expense', amount: 1500, category: 'transport', date: '2026-04-10' });
});

describe('GET /summary', () => {
  it('returns totals, breakdowns, and tips', async () => {
    const res = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(10000);
    expect(res.body.totalExpenses).toBe(3500);
    expect(res.body.balance).toBe(6500);
    expect(res.body.byCategory.food).toBe(2000);
    expect(Array.isArray(res.body.monthlyTrends)).toBe(true);
    expect(Array.isArray(res.body.tips)).toBe(true);
  });

  it('uses cache on the second call', async () => {
    const first = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(first.body.cached).toBe(false);
    const second = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(second.body.cached).toBe(true);
  });
});
