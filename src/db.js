// In-memory data store for users and events
let users = [];
let events = [];
let eventRegistrations = [];
let idCounter = {
  user: 1,
  event: 1,
  registration: 1,
};

// User data model
class User {
  constructor(email, name, password, role = 'attendee') {
    this.id = idCounter.user++;
    this.email = email;
    this.name = name;
    this.password = password;
    this.role = role; // 'organizer' or 'attendee'
    this.createdAt = new Date();
  }
}

// Event data model
class Event {
  constructor(title, description, date, time, organizerId) {
    this.id = idCounter.event++;
    this.title = title;
    this.description = description;
    this.date = date;
    this.time = time;
    this.organizerId = organizerId;
    this.participants = [];
    this.maxParticipants = 100;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Event Registration model
class EventRegistration {
  constructor(userId, eventId) {
    this.id = idCounter.registration++;
    this.userId = userId;
    this.eventId = eventId;
    this.registeredAt = new Date();
    this.status = 'registered'; // 'registered', 'cancelled'
  }
}

module.exports = {
  users,
  events,
  eventRegistrations,
  User,
  Event,
  EventRegistration,
};
