import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.model'; 

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User Model Test', () => {
    // validating user creation with all required fields
    it('create & save user successfully', async () => {
        const userData = {
            first_name: 'John',
            last_name: 'Doe',
            username: 'johndoe',
            email: 'john.doe@example.com',
            password: 'password123',
        };
        const validUser = new userModel(userData);
        const savedUser = await validUser.save();

        // verify insertion of fields
        expect(savedUser._id).toBeDefined();
        expect(savedUser.first_name).toBe('John');
        expect(savedUser.email).toBe(userData.email);
        
        // check if password is hashed
        expect(await bcrypt.compare('password123', savedUser.password)).toBe(true);
    });

    // test email validation
    it('fail saving user with invalid email', async () => {
        const userData = {
            first_name: 'Jane',
            last_name: 'Doe',
            username: 'janedoe',
            email: 'not-an-email',
            password: 'password123',
        };
        let err;
        try {
            const invalidUser = new userModel(userData);
            await invalidUser.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

});
