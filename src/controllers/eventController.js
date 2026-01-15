const { events, Event, eventRegistrations, EventRegistration, users } = require('../db');
const { sendEventRegistrationEmail, sendEventUpdateEmail } = require('../utils/emailService');

// Create a new event (organizer only)
function createEvent(req, res) {
  try {
    const { title, description, date, time, maxParticipants } = req.body;

    // Validate input
    if (!title || !description || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and time are required.',
      });
    }

    // Create new event
    const newEvent = new Event(title, description, date, time, req.userId);
    if (maxParticipants) {
      newEvent.maxParticipants = maxParticipants;
    }

    events.push(newEvent);

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event.',
      error: error.message,
    });
  }
}

// Get all events
function getAllEvents(req, res) {
  try {
    const allEvents = events.map((event) => ({
      ...event,
      participantCount: event.participants.length,
    }));

    res.status(200).json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events.',
      error: error.message,
    });
  }
}

// Get single event by ID
function getEventById(req, res) {
  try {
    const { id } = req.params;
    const event = events.find((e) => e.id === parseInt(id));

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Get participant details
    const participantDetails = event.participants.map((userId) => {
      const user = users.find((u) => u.id === userId);
      return {
        userId,
        name: user?.name,
        email: user?.email,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...event,
        participantCount: event.participants.length,
        participantDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event.',
      error: error.message,
    });
  }
}

// Update event (organizer only)
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, date, time, maxParticipants } = req.body;

    const event = events.find((e) => e.id === parseInt(id));

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if user is the organizer
    if (event.organizerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update events you created.',
      });
    }

    // Update event fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (maxParticipants) event.maxParticipants = maxParticipants;
    event.updatedAt = new Date();

    // Send update email to all participants
    if (event.participants.length > 0) {
      const updateDetails = `
        - Title: ${title || event.title}
        - Date: ${date || event.date}
        - Time: ${time || event.time}
      `;

      for (const userId of event.participants) {
        const participant = users.find((u) => u.id === userId);
        if (participant) {
          await sendEventUpdateEmail(
            participant.email,
            participant.name,
            event.title,
            updateDetails
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event.',
      error: error.message,
    });
  }
}

// Delete event (organizer only)
function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const eventIndex = events.findIndex((e) => e.id === parseInt(id));

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = events[eventIndex];

    // Check if user is the organizer
    if (event.organizerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete events you created.',
      });
    }

    events.splice(eventIndex, 1);

    // Remove related registrations
    const registrationIndices = eventRegistrations
      .map((r, index) => (r.eventId === parseInt(id) ? index : -1))
      .filter((index) => index !== -1)
      .sort((a, b) => b - a);

    registrationIndices.forEach((index) => {
      eventRegistrations.splice(index, 1);
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event.',
      error: error.message,
    });
  }
}

// Register user for event
async function registerForEvent(req, res) {
  try {
    const { id } = req.params;
    const event = events.find((e) => e.id === parseInt(id));

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if user is already registered
    const existingRegistration = eventRegistrations.find(
      (r) => r.userId === req.userId && r.eventId === parseInt(id) && r.status === 'registered'
    );

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full. Cannot register.',
      });
    }

    // Add participant to event
    event.participants.push(req.userId);

    // Create registration record
    const registration = new EventRegistration(req.userId, parseInt(id));
    eventRegistrations.push(registration);

    // Get user details for email
    const user = users.find((u) => u.id === req.userId);

    // Send confirmation email
    if (user) {
      await sendEventRegistrationEmail(user.email, user.name, event.title);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event.',
      data: {
        registrationId: registration.id,
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event.',
      error: error.message,
    });
  }
}

// Cancel event registration
function cancelEventRegistration(req, res) {
  try {
    const { id } = req.params;
    const registration = eventRegistrations.find(
      (r) => r.userId === req.userId && r.eventId === parseInt(id) && r.status === 'registered'
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    // Remove participant from event
    const event = events.find((e) => e.id === parseInt(id));
    if (event) {
      const participantIndex = event.participants.indexOf(req.userId);
      if (participantIndex > -1) {
        event.participants.splice(participantIndex, 1);
      }
    }

    // Update registration status
    registration.status = 'cancelled';

    res.status(200).json({
      success: true,
      message: 'Event registration cancelled successfully.',
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling registration.',
      error: error.message,
    });
  }
}

// Get user's registered events
function getUserRegisteredEvents(req, res) {
  try {
    const userRegistrations = eventRegistrations.filter(
      (r) => r.userId === req.userId && r.status === 'registered'
    );

    const registeredEvents = userRegistrations.map((reg) => {
      const event = events.find((e) => e.id === reg.eventId);
      return {
        ...event,
        registeredAt: reg.registeredAt,
        registrationId: reg.id,
      };
    });

    res.status(200).json({
      success: true,
      data: registeredEvents.filter((e) => e),
    });
  } catch (error) {
    console.error('Error fetching user registered events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user registered events.',
      error: error.message,
    });
  }
}

// Get organizer's events
function getOrganizerEvents(req, res) {
  try {
    const organizerEvents = events.filter((e) => e.organizerId === req.userId);

    const eventDetails = organizerEvents.map((event) => ({
      ...event,
      participantCount: event.participants.length,
    }));

    res.status(200).json({
      success: true,
      data: eventDetails,
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizer events.',
      error: error.message,
    });
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getUserRegisteredEvents,
  getOrganizerEvents,
};
