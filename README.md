# Student Learning Tracker (MVP)

A simple, responsive web application for students to track their learning goals and topics.

## Features

- **Authentication**: Register, Login, Forgot Password with JWT
- **Learning Goal**: Create and manage one main learning goal
- **Topic Tracking**: Add, edit, delete topics and mark as completed/pending
- **Dashboard**: View progress with statistics and progress bar
- **Responsive**: Works on mobile and desktop

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for validation

## Project Structure

```
student-learning-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── goalController.js
│   │   │   └── topicController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Goal.js
│   │   │   └── Topic.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── goal.js
│   │   │   └── topic.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
└── TODO.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   cd student-learning-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   Edit `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will run on http://localhost:5000

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Goal
- `GET /api/goal` - Get user's goal
- `POST /api/goal` - Create/update goal
- `PUT /api/goal` - Update goal
- `DELETE /api/goal` - Delete goal

### Topics
- `GET /api/topic` - Get all topics
- `POST /api/topic` - Create new topic
- `PUT /api/topic/:id` - Update topic
- `DELETE /api/topic/:id` - Delete topic
- `PUT /api/topic/:id/toggle` - Toggle topic status

## Usage Flow

1. **Register**: Create a new account at `/register`
2. **Login**: Login with credentials at `/login`
3. **Dashboard**: View and manage your learning goal and topics
4. **Goal**: Click "Edit Goal" to set your learning objective
5. **Topics**: 
   - Click "+ Add Topic" to add new topics
   - Click checkboxes to mark topics as completed
   - Click edit icon to rename topics
   - Click delete icon to remove topics

## Development Notes

- The password reset token is returned in the response (MVP version)
- In production, implement proper email sending
- Always use HTTPS in production
- Add proper error handling and logging for production

## License

MIT License

