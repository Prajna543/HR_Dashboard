const request = require('supertest');
const express = require('express');
const path = require('path');

const app = require('../server'); // Adjust path if needed

describe('API Basic Tests', () => {

  let testUser;

  beforeAll(() => {
    // Use a unique username for every test run to avoid conflicts
    const timestamp = Date.now();
    testUser = {
      username: `testuser_${timestamp}`,
      password: 'testpass',
      role: 'HR'
    };
  });

  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not signup same user twice', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Username already exists');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: testUser.username, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(testUser.username);
    expect(res.body.role).toBe(testUser.role);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: testUser.username, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should get employees list', async () => {
    const res = await request(app).get('/employees');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
