const request = require('supertest');
const app = require('../src/app');
const { resetData } = require('./setup');

beforeEach(async () => {
  await resetData();
});

describe('User APIs', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('alice@example.com');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'a@x.com', password: 'secret123' });
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice2', email: 'a@x.com', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid registration', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Bob', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
  });

  it('logs in and returns a JWT', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'Bob', email: 'bob@x.com', password: 'secret123' });
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'bob@x.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('bob@x.com');
  });
});
