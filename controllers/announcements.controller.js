import userModel from '../models/user.model.js'
import courseModel from '../models/course.model.js';

import announcementsModel from '../models/announcements.model.js';
import mongoose from 'mongoose';

export const getAnnouncements = async(req, res) =>{
    try {
        const { course_id } = req.params;

        // Validate request parameters
        if (!course_id ) {
            return res.status(400).json({ message: "Course_id is required." });
        }

        // Validate the ObjectIds
        if (!mongoose.isValidObjectId(course_id)) {
            return res.status(400).json({ message: "Invalid course ID." });
        }

        // Fetch announcements where the course match the provided ID
        const announcements = await announcementsModel.find({
            course: course_id,
        }).sort({ createdAt: -1 });
        
        // If no announcements found, return a 404 response
        if (announcements.length === 0) {
            return res.status(404).json({ message: "No announcements found for the provided IDs." });
        }

        // Return the announcements
        res.status(200).json({ data: announcements });
    } catch (error) {
        console.error("Failed to fetch announcements:", error);
        res.status(500).json({ message: "An error occurred while fetching announcements.", error: error.toString() });
    }
}

export const createAnnouncement = async (req, res) => {
    const { title, description, course, instructor } = req.body;
    console.log("inside controller")
    console.log(req.body)
    

    try {
       
        const newAnnouncement = await announcementsModel.create({
            title,
            description,
            course,
            instructor,
            
        });

        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error('Error creating new announcement:', error);
        res.status(500).json({ message: 'Error creating new announcement', error });
    }
}

export const deleteAnnouncement = async(req, res) => {
    try {
        const { id } = req.params;
    
        const result = await announcementsModel.findByIdAndDelete(id);
        
        if (!result) {
          return res.status(404).json({ message: "Announcement not found" });
        }
        // Send back a success response
        res.json({ message: "Announcement deleted successfully" });
      } catch (error) {
        // If an error occurs, log it and send back a 500 status with the error message
        console.error("Error deleting announcement:", error);
        res.status(500).json({ error: error.message });
      }

}