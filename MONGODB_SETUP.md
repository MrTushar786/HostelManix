# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Step 1: Install MongoDB

#### On Ubuntu/Debian:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### On macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### On Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start automatically as a Windows service

### Step 2: Verify MongoDB is Running

```bash
# Check MongoDB status
sudo systemctl status mongod  # Linux
# or journalctl -u mongod      # View logs

# Test MongoDB connection
mongosh
# or older versions: mongo
```

If you see a MongoDB shell prompt, you're connected!

### Step 3: Configure Your Application

1. Create `.env` file in the `server/` directory:
```bash
cd server
touch .env
```

2. Add MongoDB connection string to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostelmanix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

3. Start your backend server:
```bash
npm run dev
```

You should see: `MongoDB Connected: localhost:27017`

---

## Option 2: MongoDB Atlas (Cloud - Free Tier Available)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (choose FREE tier M0)

### Step 2: Configure Database Access

1. Go to `Database Access` in the left sidebar
2. Click `Add New Database User`
3. Choose `Password` authentication
4. Create username and password (save these!)
5. Set user privileges to `Atlas admin` or `Read and write to any database`
6. Click `Add User`

### Step 3: Configure Network Access

1. Go to `Network Access` in the left sidebar
2. Click `Add IP Address`
3. For development, click `Allow Access from Anywhere` (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click `Confirm`

### Step 4: Get Connection String

1. Go to `Database` in the left sidebar
2. Click `Connect` on your cluster
3. Choose `Connect your application`
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Update Your .env File

Replace `<username>` and `<password>` with your database user credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/hostelmanix?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Replace `yourusername` and `yourpassword` with your actual MongoDB Atlas credentials!

### Step 6: Test Connection

Start your backend server:
```bash
cd server
npm run dev
```

You should see: `MongoDB Connected: ...` (showing Atlas cluster info)

---

## Troubleshooting

### Connection Error: "ECONNREFUSED"

**Problem:** MongoDB is not running or connection string is wrong

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   sudo systemctl status mongod  # Linux
   brew services list            # macOS
   ```

2. Start MongoDB:
   ```bash
   sudo systemctl start mongod   # Linux
   brew services start mongodb-community  # macOS
   ```

3. Verify connection string in `.env` file

### Connection Error: "Authentication failed"

**Problem:** Wrong username/password in connection string

**Solutions:**
1. Double-check username and password in `.env`
2. Make sure you URL-encoded special characters in password
3. For Atlas, verify database user credentials

### Connection Error: "Network access not allowed" (Atlas)

**Problem:** Your IP address is not whitelisted

**Solutions:**
1. Go to Atlas → Network Access
2. Add your current IP address
3. Or temporarily allow 0.0.0.0/0 (not recommended for production)

### MongoDB Command Not Found

**Problem:** MongoDB is not installed or not in PATH

**Solutions:**
```bash
# Check if MongoDB is installed
which mongod

# If not found, install MongoDB (see Step 1 above)
```

---

## Quick Test

### Test Local MongoDB Connection:
```bash
mongosh
# Should connect to: mongodb://127.0.0.1:27017
```

### Test Database Connection from Node.js:
```bash
cd server
node -e "
import('./config/database.js').then(() => {
  console.log('Connected!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
"
```

---

## Common Connection Strings

### Local MongoDB (Default):
```
mongodb://localhost:27017/hostelmanix
```

### Local MongoDB with Authentication:
```
mongodb://username:password@localhost:27017/hostelmanix
```

### MongoDB Atlas (Cloud):
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hostelmanix?retryWrites=true&w=majority
```

### MongoDB Atlas with Additional Options:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hostelmanix?retryWrites=true&w=majority&appName=HostelManix
```

---

## Next Steps

After connecting to MongoDB:

1. **Create default users:**
   ```bash
   cd server
   npm run seed
   ```

2. **Start backend server:**
   ```bash
   npm run dev
   ```

3. **Start frontend:**
   ```bash
   cd ..
   npm run dev
   ```

4. **Login with default credentials:**
   - Admin: `admin` / `admin123`
   - Student: `student` / `student123`

---

## Security Notes

- ⚠️ Never commit `.env` file to git
- ⚠️ Use strong passwords for production
- ⚠️ Restrict IP access in MongoDB Atlas for production
- ⚠️ Use environment variables for sensitive data
- ⚠️ Change default JWT_SECRET in production

