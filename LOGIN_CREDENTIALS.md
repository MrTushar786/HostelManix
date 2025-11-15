# Login Credentials

## Default Login Credentials

After running the seed script, you can use these credentials:

### Admin Panel
- **Role**: Admin
- **Username**: `admin`
- **Password**: `admin123`

### Student Portal
- **Role**: Student
- **Username**: `student`
- **Password**: `student123`
- **Student ID**: `STU001`

## How to Create Users

### Option 1: Run Seed Script (Recommended)

1. Make sure MongoDB is running
2. Navigate to server directory:
   ```bash
   cd server
   ```
3. Run the seed script:
   ```bash
   npm run seed
   ```

This will create both admin and student users automatically.

### Option 2: Use API Registration Endpoint

#### Create Admin User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

#### Create Student User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student",
    "password": "student123",
    "role": "student",
    "studentId": "STU001"
  }'
```

Then create the student profile:
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STU001",
    "name": "John Doe",
    "email": "student@hostel.com",
    "phone": "1234567890",
    "userId": "USER_ID_FROM_REGISTRATION"
  }'
```

### Option 3: Using Browser Console

Open browser console on the login page and run:

```javascript
// Create Admin
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

// Create Student
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'student',
    password: 'student123',
    role: 'student',
    studentId: 'STU001'
  })
})
.then(r => r.json())
.then(console.log);
```

## Important Notes

- Make sure the backend server is running before creating users
- Make sure MongoDB is running and connected
- You can create multiple users with different usernames
- Passwords are automatically hashed and stored securely
- After creating a student user, make sure to also create the student profile

