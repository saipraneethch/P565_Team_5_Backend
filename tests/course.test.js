import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import courseModel from '../models/course.model'; // Update the path accordingly

// Create a new instance of the in-memory database
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Course Model Test', () => {
    // Test for validating successful course creation
    it('create & save course successfully', async () => {
        const validCourse = new courseModel({
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'A comprehensive overview of computer science principles.',
            category: ['Programming', 'Basics'],
            instructor: new mongoose.Types.ObjectId(), // Mock ObjectId for instructor
            start_date: new Date(),
            end_date: new Date(),
            bibliography: [{ title: 'Introduction to Algorithms', author: 'Thomas H. Cormen' }]
        });
        const savedCourse = await validCourse.save();

        expect(savedCourse._id).toBeDefined();
        expect(savedCourse.code).toBe(validCourse.code);
        expect(savedCourse.instructor).toEqual(validCourse.instructor);
    });

    // Test for handling required fields
    it('fail to create course without required fields', async () => {
        const courseWithoutRequiredField = new courseModel({ title: 'Only Title' });
        let err;
        try {
            const savedCourseWithoutRequired = await courseWithoutRequiredField.save();
            error = savedCourseWithoutRequired;
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.code).toBeDefined();
    });
});
