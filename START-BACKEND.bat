@echo off
echo 🚀 Starting FoodieFindr Professional Backend...
echo.
echo 📦 Installing dependencies...
call npm install
echo.
echo 🔧 Starting professional server...
call npm start
echo.
echo ✅ Backend should be running on http://localhost:3000
echo 📝 Registration page: http://localhost:3000
echo 🔐 Login page: http://localhost:3000/login
echo 📊 Users API: http://localhost:3000/api/users
echo.
echo 💾 Users will be saved to: users.json
echo.
pause
