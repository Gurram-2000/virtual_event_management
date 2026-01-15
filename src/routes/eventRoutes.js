const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getUserRegisteredEvents,
  getOrganizerEvents,
} = require('../controllers/eventController');
const { verifyToken, isOrganizer } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/create', verifyToken, isOrganizer, createEvent);
router.put('/:id', verifyToken, isOrganizer, updateEvent);
router.delete('/:id', verifyToken, isOrganizer, deleteEvent);

// Event registration routes
router.post('/:id/register', verifyToken, registerForEvent);
router.post('/:id/cancel-registration', verifyToken, cancelEventRegistration);

// User specific routes
router.get('/user/registered-events', verifyToken, getUserRegisteredEvents);
router.get('/organizer/my-events', verifyToken, isOrganizer, getOrganizerEvents);

module.exports = router;
