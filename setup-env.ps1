# PowerShell script to create .env files for HostelManix

Write-Host "Setting up HostelManix environment files..." -ForegroundColor Green

# Create server .env file
$serverEnvPath = "server\.env"
if (-not (Test-Path $serverEnvPath)) {
    $serverEnvContent = @"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostelmanix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
"@
    $serverEnvContent | Out-File -FilePath $serverEnvPath -Encoding utf8
    Write-Host "✓ Created $serverEnvPath" -ForegroundColor Green
} else {
    Write-Host "⚠ $serverEnvPath already exists, skipping..." -ForegroundColor Yellow
}

# Create root .env file (optional for frontend)
$rootEnvPath = ".env"
if (-not (Test-Path $rootEnvPath)) {
    $rootEnvContent = @"
VITE_API_URL=http://localhost:5000/api
"@
    $rootEnvContent | Out-File -FilePath $rootEnvPath -Encoding utf8
    Write-Host "✓ Created $rootEnvPath" -ForegroundColor Green
} else {
    Write-Host "⚠ $rootEnvPath already exists, skipping..." -ForegroundColor Yellow
}

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Start backend: cd server && npm run dev" -ForegroundColor White
Write-Host "3. Start frontend: npm run dev" -ForegroundColor White

