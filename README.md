# Virtual Event Management Platform - Backend

A secure, scalable Node.js backend system for a virtual event management platform with user authentication, event scheduling, and participant management.

## Features

- **User Authentication**: Secure registration and login using bcrypt and JWT
- **Event Management**: Create, update, delete, and view events (for organizers)
- **Participant Management**: Register for events, view registrations, and cancel registrations
- **Email Notifications**: Welcome emails on registration and event updates
- **Role-based Access Control**: Distinguish between event organizers and attendees
- **In-Memory Data Storage**: Fast access to user and event data

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Environment Config**: dotenv

## Project Structure

```
virtual_event_management/
├── src/
│   ├── controllers/
│   │   ├── userController.js        # User registration, login, profile
│   │   └── eventController.js       # Event CRUD and registration
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification and authorization
│   ├── routes/
│   │   ├── userRoutes.js            # User endpoints
│   │   └── eventRoutes.js           # Event endpoints
│   ├── utils/
│   │   └── emailService.js          # Email sending functionality
│   ├── db.js                        # In-memory data structures and models
│   └── server.js                    # Express app setup
├── .env                             # Environment variables
├── .gitignore                       # Git ignore file
├── package.json                     # Dependencies and scripts
└── README.md                        # Project documentation
```

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd virtual_event_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` (already provided)
   - Update the following variables:
     ```
     PORT=5000
     JWT_SECRET=your_secret_key_here
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_app_password
     EMAIL_SERVICE=gmail
     ```

   **Note for Gmail**: You need to:
   - Enable "Less secure app access" or use an "App Password"
   - Visit: https://myaccount.google.com/apppasswords

4. **Start the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### User Authentication

#### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "role": "attendee"  // or "organizer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "attendee",
    "token": "jwt_token_here"
  }
}
```

#### Login User
```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "attendee",
    "token": "jwt_token_here"
  }
}
```

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "attendee",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "registeredEvents": [...]
  }
}
```

### Event Management

#### Get All Events
```
GET /api/events
```

#### Get Event by ID
```
GET /api/events/:id
```

#### Create Event (Organizer Only)
```
POST /api/events/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-02-15",
  "time": "10:00",
  "maxParticipants": 100
}
```

#### Update Event (Organizer Only)
```
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "date": "2024-02-16",
  "time": "14:00"
}
```

#### Delete Event (Organizer Only)
```
DELETE /api/events/:id
Authorization: Bearer <token>
```

### Event Registration

#### Register for Event
```
POST /api/events/:id/register
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for event.",
  "data": {
    "registrationId": 1,
    "eventId": 1,
    "eventTitle": "Tech Conference 2024",
    "registeredAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Cancel Event Registration
```
POST /api/events/:id/cancel-registration
Authorization: Bearer <token>
```

#### Get User's Registered Events
```
GET /api/events/user/registered-events
Authorization: Bearer <token>
```

#### Get Organizer's Events
```
GET /api/events/organizer/my-events
Authorization: Bearer <token>
```

### Health Check
```
GET /api/health
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Data Models

### User
```javascript
{
  id: number,
  email: string,
  name: string,
  password: string (hashed),
  role: "organizer" | "attendee",
  createdAt: Date
}
```

### Event
```javascript
{
  id: number,
  title: string,
  description: string,
  date: string (YYYY-MM-DD),
  time: string (HH:MM),
  organizerId: number,
  participants: number[],
  maxParticipants: number,
  createdAt: Date,
  updatedAt: Date
}
```

### EventRegistration
```javascript
{
  id: number,
  userId: number,
  eventId: number,
  registeredAt: Date,
  status: "registered" | "cancelled"
}
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds of 10
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **Authorization**: Role-based access control for organizers
- **Input Validation**: All user inputs are validated
- **Environment Variables**: Sensitive data stored in .env file

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- Real-time notifications using WebSockets
- Event search and filtering
- Event categories and tags
- Ratings and reviews
- Ticket system
- Payment integration
- API rate limiting
- File uploads (event images, documents)

## Testing

You can test the APIs using:
- Postman
- Insomnia
- curl commands
- VS Code REST Client

## License

ISC

## Author

Your Name
