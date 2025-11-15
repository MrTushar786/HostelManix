#!/bin/bash
# Bash script to create .env files for HostelManix

echo "Setting up HostelManix environment files..."

# Create server .env file
if [ ! -f "server/.env" ]; then
    cat > server/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostelmanix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
EOF
    echo "✓ Created server/.env"
else
    echo "⚠ server/.env already exists, skipping..."
fi

# Create root .env file (optional for frontend)
if [ ! -f ".env" ]; then
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo "✓ Created .env"
else
    echo "⚠ .env already exists, skipping..."
fi

echo ""
echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Start backend: cd server && npm run dev"
echo "3. Start frontend: npm run dev"

