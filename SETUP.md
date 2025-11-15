# Quick Setup Guide

## 1. Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
npm install
```

## 2. Configure Environment

### Backend (.env in server/ directory)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostelmanix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### Frontend (.env in root - optional)
```
VITE_API_URL=http://localhost:5000/api
```

## 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Copy connection string to MONGODB_URI

## 4. Start Backend Server

```bash
cd server
npm run dev
```

Backend runs on: http://localhost:5000

## 5. Start Frontend

```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## 6. Create Admin User

Use Postman, curl, or browser console:

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  })
})
.then(r => r.json())
.then(console.log);
```

## 7. Login

- Go to http://localhost:5173
- Select "Admin" role
- Username: `admin`
- Password: `admin123`

## Important Notes

- All student components need studentId in sessionStorage after login
- For student login, create a student user first with userId linked to User model
- Make sure MongoDB is running before starting backend
- Token is stored in sessionStorage and expires after 7 days

