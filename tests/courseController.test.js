import request from 'supertest';
import app from '../app'; // Import your Express app
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Course Controller - addCourse', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should add a course successfully with valid data', async () => {
        const courseData = {
            code: "CS101",
            title: "Introduction to Computer Science",
            description: "A foundational course in computer science.",
            category: ["Programming", "Computer Science"],
            instructor: new mongoose.Types.ObjectId(), // Mocked instructor ID
            start_date: new Date(),
            end_date: new Date(),
            bibliography: [{ title: "Computer Science Illuminated", author: "Nell Dale" }]
        };

        const response = await request(app)
            .post('/courses') // Adjust the endpoint as needed
            .send(courseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('code', courseData.code);
    });

    it('should return an error when required fields are missing', async () => {
        const incompleteData = {
            title: "Incomplete Course",
            // Missing other required fields
        };

        const response = await request(app)
            .post('/courses') // Adjust the endpoint as needed
            .send(incompleteData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.emptyFields).toContain('code');
    });

});
