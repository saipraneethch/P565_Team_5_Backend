const request = require('supertest');
const { app } = require('../app');

describe('User API Endpoints', () => {
  it('should test that the test API endpoint returns a 200 status', async () => {
    const response = await request(app).get('/test');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("API is working");
  });

  // Additional tests for other endpoints
});
