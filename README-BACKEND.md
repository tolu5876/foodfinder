# 🚀 FoodieFindr Backend Setup

## 📋 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run server
```
OR
```bash
npm start
```

### 3. Open Your Browser
Go to: http://localhost:3000

## 🔐 API Endpoints

### POST /api/register
Register a new user
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "gender": "male",
  "country": "Nigeria"
}
```

### POST /api/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/users
View all registered users (for testing)

## 🎯 What This Backend Does

✅ **Handles Registration** - Stores users in memory
✅ **Handles Login** - Validates user credentials  
✅ **CORS Enabled** - Works with your frontend
✅ **Error Handling** - Proper error responses
✅ **Logging** - Console logs for debugging

## 🔧 Features

✅ **In-memory storage** - No database needed
✅ **User validation** - Checks for required fields
✅ **Duplicate prevention** - Stops duplicate emails
✅ **JSON responses** - Works with your frontend
✅ **Status codes** - Proper HTTP status codes

## 🚨 Important Notes

⚠️ **For Development Only** - In-memory storage (data lost on restart)
⚠️ **Password Not Hashed** - Plain text passwords (for demo only)
⚠️ **No Security** - Basic implementation for testing

## 🎮 Test Your Registration

1. **Start server**: `npm run server`
2. **Open browser**: http://localhost:3000
3. **Fill registration form**
4. **Submit** - Should work without network errors!
5. **Check console** - Server logs show registration data

**Your eye icons should now work AND your backend should handle registration!** 🎉

## 🔍 Debug Tips

If you get errors:
1. **Check port 3000 is free**
2. **Make sure Node.js is installed**
3. **Run `npm install` first**
4. **Check browser console for errors**

**Happy coding!** 🍕👁️
