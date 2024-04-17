import express from 'express';

import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcements.controller.js';

const announcementsRouter = express.Router();

announcementsRouter.post('/create-announcement', createAnnouncement);
announcementsRouter.get('/:course_id', getAnnouncements);
announcementsRouter.delete('/:id', deleteAnnouncement);

export default announcementsRouter;
