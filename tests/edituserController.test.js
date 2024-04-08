import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app'; 

describe('User Controller', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
https://occ-0-856-1722.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABTHXMvW5ViJR3ZnVVvJVT2-CfMw-0X9_xc73NKPAlqQPOMIhlIItk5mnxlaTJZYuV4u7JBXjdv0KIzvKsthTbDtA-Ub8qTZzOxeh.webp?r=660
  test('POST /users - Create a new user', async () => {
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/users') // Adjust this path to your API endpoint for creating a user
      .send(userData);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(userData.email);
   
  });

  test('GET /users/:id - Get a user by ID', async () => {
    // Assuming you have a user created, use that user's ID here
    const userId = 'someUserId';
    const response = await request(app)
      .get(`/users/${userId}`) // Adjust this path to your API endpoint for fetching a user by ID
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(userId);
  });
});
