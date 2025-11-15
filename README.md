# HostelManix - Complete Hostel Management System

A full-stack hostel management system with React frontend and Node.js/MongoDB backend.

## Features

### Admin Panel
- Room Management (CRUD operations)
- Fee Management
- Leave Request Management
- Complaint Management
- Maintenance Request Management
- Attendance Management
- Mess Menu Management (create/update/delete per day)
- Students Management (create login + student profile, assign room)
- Dashboard with statistics

### Student Portal
- View Room Information (driven by admin data)
- Check Fee Status (admin controlled)
- Apply for Leave (auto-links to logged-in student)
- Submit Complaints
- Request Maintenance
- View Attendance (live stats)
- View Mess Menu (admin controlled)

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios
- Recharts
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostelmanix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Linux/Mac
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

5. Start the backend server:
```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Initial Setup - Create Admin & Students

Create an admin user, then use the Admin panel to add students (auto-generated studentId supported).

### Create Admin (API)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

### Create Students (via Admin UI)
1. Login as admin in the web app.
2. Go to Admin → Students → "+ Add Student".
3. A `studentId` is auto-generated (Regenerate available). Set username and password.
4. Optionally assign a room. Submit to create login + student profile.

Alternatively you can create via API and then create a student profile:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student01",
    "password": "S3cret!",
    "role": "student",
    "studentId": "STU001"
  }'
```

### (Optional) Using MongoDB shell
```javascript
use hostelmanix
db.users.insertOne({
  username: "admin",
  password: "$2a$10$..." // Hashed password (use bcrypt)
})
```

## Login

- Admin: Use the credentials you created.
- Student: Use the credentials created by Admin on the Students page.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Fees
- `GET /api/fees` - Get all fees
- `GET /api/fees/student/:studentId` - Get fees by student
- `POST /api/fees` - Create fee
- `PUT /api/fees/:id` - Update fee

### Leaves
- `GET /api/leaves` - Get all leaves
- `GET /api/leaves/student/:studentId` - Get leaves by student
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave status

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/student/:studentId` - Get complaints by student
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint

### Maintenance
- `GET /api/maintenance` - Get all maintenance requests
- `GET /api/maintenance/student/:studentId` - Get requests by student
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update maintenance request

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/student/:studentId` - Get attendance by student
- `GET /api/attendance/student/:studentId/stats` - Get attendance statistics
- `POST /api/attendance` - Mark attendance

### Mess Menu
- `GET /api/mess-menu` - Get all menus
- `GET /api/mess-menu/:day` - Get menu for specific day
- `POST /api/mess-menu` - Create menu for a day
- `PUT /api/mess-menu/:day` - Update menu
- `DELETE /api/mess-menu/:day` - Delete menu for a day

## Project Structure

```
HostelManix/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── server.js          # Entry point
├── src/                   # Frontend
│   ├── admin/             # Admin components
│   ├── auth/              # Authentication
│   ├── component/         # Student components
│   ├── student/           # Student dashboard
│   ├── utils/             # Utilities (API client)
│   └── css/               # Stylesheets
└── package.json
```

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses node --watch for auto-reload
```

### Frontend Development
```bash
npm run dev  # Vite dev server with hot reload
```

## Production Build

### Frontend
```bash
npm run build
npm run preview
```

### Backend
```bash
cd server
npm start
```

## Notes

- All API endpoints require authentication except `/api/auth/login` and `/api/auth/register`.
- JWT tokens are stored in sessionStorage; token expires after 7 days.
- Make sure MongoDB is running before starting the backend server.
- After changing Mongoose schemas (e.g., `Student.roomId` to ObjectId), restart the backend.
- Students added from Admin create both a User (role `student`) and a Student profile.

## UI/UX

- The Admin panel theme mirrors the Student portal: solid blue background with glass cards and subtle particles.
- Student pages (Fees, Attendance, Leave, Complaints, Maintenance, Rooms, Mess Menu) are data-driven from Admin.

## License

MIT
