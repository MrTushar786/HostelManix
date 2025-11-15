import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import roomRoutes from './routes/rooms.js';
import feeRoutes from './routes/fees.js';
import leaveRoutes from './routes/leaves.js';
import complaintRoutes from './routes/complaints.js';
import maintenanceRoutes from './routes/maintenance.js';
import attendanceRoutes from './routes/attendance.js';
import messMenuRoutes from './routes/messMenu.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mess-menu', messMenuRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HostelManix API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

