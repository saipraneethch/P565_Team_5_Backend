import { app } from './app.js';
import connectDB from './utils/db.js';
import { config } from 'dotenv';

// Configure environment variables
config();

// Create server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
    connectDB();
});
