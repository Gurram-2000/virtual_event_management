# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Gmail account (for email notifications) or any email service

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Email Service

### Option A: Using Gmail
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled
3. Create an "App Password":
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
4. Update `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (the 16-char password)
   EMAIL_SERVICE=gmail
   ```

### Option B: Using Other Email Services
Update `.env` with your email service credentials:
```
EMAIL_USER=your_email@provider.com
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=yahoo|outlook|etc
```

## Step 3: Start the Server
```bash
npm start
```

You should see:
```
Server running on port 5000
Environment: development
```

## Step 4: Test the API

### Using VS Code REST Client Extension
1. Install "REST Client" extension in VS Code
2. Open `API_REQUESTS.http`
3. Click "Send Request" above each request

### Using cURL
```bash
# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123!",
    "role": "attendee"
  }'
```

### Using Postman
1. Create a new POST request
2. Set URL to `http://localhost:5000/api/users/register`
3. Set body to JSON:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "Password123!",
     "role": "attendee"
   }
   ```
4. Click Send

## Basic Workflow

### 1. Create Accounts

**Register as Organizer:**
```json
POST /api/users/register
{
  "email": "organizer@example.com",
  "name": "Event Organizer",
  "password": "SecurePass123!",
  "role": "organizer"
}
```
Save the returned `token` for organizer requests.

**Register as Attendee:**
```json
POST /api/users/register
{
  "email": "attendee@example.com",
  "name": "Attendee User",
  "password": "SecurePass123!",
  "role": "attendee"
}
```
Save the returned `token` for attendee requests.

### 2. Create an Event (as Organizer)

```json
POST /api/events/create
Authorization: Bearer <organizer_token>

{
  "title": "Tech Summit 2024",
  "description": "Learn about latest technology trends",
  "date": "2024-02-20",
  "time": "10:00",
  "maxParticipants": 100
}
```
Save the returned event `id`.

### 3. View All Events

```
GET /api/events
```

### 4. Register for Event (as Attendee)

```
POST /api/events/<event_id>/register
Authorization: Bearer <attendee_token>
```

### 5. View Your Registrations

```
GET /api/events/user/registered-events
Authorization: Bearer <attendee_token>
```

### 6. Update Event (as Organizer)

```json
PUT /api/events/<event_id>
Authorization: Bearer <organizer_token>

{
  "title": "Updated Event Title",
  "date": "2024-02-25"
}
```
Email notifications will be sent to all registered attendees.

## Troubleshooting

### Email not sending?
- Check `.env` credentials
- Verify "Less secure apps" is enabled for Gmail
- Check server console for error messages
- Try using an app-specific password instead of regular password

### Cannot create events?
- Make sure you're using an organizer token (role: "organizer")
- Include valid Authorization header: `Bearer <token>`

### Token expired?
- Get a new token by logging in again with `/api/users/login`

### Port already in use?
- Change PORT in `.env` to a different number (e.g., 5001)
- Or kill the process using port 5000

## File Structure Explained

| File | Purpose |
|------|---------|
| `src/server.js` | Main Express server setup |
| `src/db.js` | In-memory data structures and models |
| `src/middleware/authMiddleware.js` | JWT verification and authorization |
| `src/controllers/userController.js` | User logic (register, login, profile) |
| `src/controllers/eventController.js` | Event logic (CRUD, registration) |
| `src/routes/userRoutes.js` | User API endpoints |
| `src/routes/eventRoutes.js` | Event API endpoints |
| `src/utils/emailService.js` | Email sending functionality |
| `.env` | Environment variables |

## Environment Variables Explained

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret key for signing JWTs |
| `NODE_ENV` | Environment (development/production) |
| `EMAIL_USER` | Email account for sending notifications |
| `EMAIL_PASSWORD` | Password/app password for email |
| `EMAIL_SERVICE` | Email service provider (gmail, outlook, etc) |

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (resource created) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Server Error |

## Development Tips

1. **Console Logging**: Check browser/terminal console for debug info
2. **Token Management**: Store tokens in a variable for multiple requests
3. **Testing Order**: Register → Login → Create Event → Register for Event
4. **In-Memory Data**: All data resets when server restarts (intentional for demo)

## Next Steps

After completing this project, consider:
- Adding database integration (MongoDB/PostgreSQL)
- Implementing search and filtering
- Adding event categories and tags
- Setting up unit tests
- Deploying to production (Heroku, AWS, etc.)
- Adding WebSocket support for real-time updates
- Implementing payment processing
- Adding user reviews and ratings

## Support

For issues or questions, check:
1. `README.md` for detailed API documentation
2. Server console for error messages
3. Network tab in browser DevTools for HTTP requests
