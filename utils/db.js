import mongoose from 'mongoose';
import { config } from 'dotenv';
config(); // Assuming dotenv is used for DB_URI

const dbUrl = process.env.DB_URI || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected");
    } catch (error) {
        console.error(error.message);
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
