# Fastify Authentication API

A full-featured authentication system built with **Fastify**, **MongoDB**, and **JWT**. This project provides complete user registration, login, password reset, and profile management endpoints.

## 📋 Project Description

This is a backend API server built with Fastify that implements secure user authentication and authorization. It includes user registration, login with JWT tokens, password reset functionality, and cookie-based session management.

## ✨ Features

- ✅ **User Registration** - Create new user accounts with email validation
- ✅ **User Login** - Authenticate users with email and password
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Reset** - Forgot password and reset password functionality
- ✅ **HTTP-Only Cookies** - Secure cookie storage (XSS protection)
- ✅ **Password Hashing** - bcryptjs for secure password storage
- ✅ **MongoDB Integration** - Mongoose ODM for database operations
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Logging** - Built-in request logging

## 📁 Project Structure

```
fastify/
├── controllers/
│   └── authController.js       # Authentication business logic
├── models/
│   ├── user.js                 # User schema and model
│   └── thumbnail.js            # Thumbnail schema and model
├── plugins/
│   └── mongodb.js              # MongoDB connection plugin
├── routes/
│   └── auth.js                 # Authentication routes
├── server.js                   # Main server file
├── package.json                # Project dependencies
├── .env                        # Environment variables
└── readme.md                   # Documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fastify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install missing cookie plugin** (if not already installed)
   ```bash
   npm install @fastify/cookie
   ```

4. **Create .env file** and add environment variables (see below)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-secret-key-here
```

**Explanation:**
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for signing JWT tokens (use a strong random string in production)

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

### 1. **Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "country": "USA"
}
```
**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "country": "USA",
    "createdAt": "2024-07-01T10:00:00Z"
  }
}
```

### 2. **Login User**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Note:** Token is also set as HTTP-only cookie

### 3. **Forgot Password**
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```
**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

### 4. **Reset Password**
```
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```
**Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

## 🧪 Testing Endpoints

You can test the API using:
- **Postman** - Import the endpoints and test
- **curl** - Command line tool
- **Thunder Client** - VS Code extension
- **Insomnia** - API testing tool

### Example with curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","country":"USA"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

## 📝 Documentation

- **[Password Reset & Forgot Password Flow](docs/PASSWORD_RESET_FLOW.md)** - Detailed guide on how password reset and forgot password functionality works, with step-by-step flows, security considerations, and testing examples.

## 🏃 Running the Project

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

### Health Check
```
GET http://localhost:3000/test-db
```
Returns MongoDB connection status

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  country: String (optional),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Thumbnail Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  videoName: String (required),
  version: String,
  image: String (required),
  paid: String (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔒 Security Features

- **Password Hashing** - bcryptjs with 10 salt rounds
- **JWT Tokens** - 1 hour expiration time
- **HTTP-Only Cookies** - Prevents XSS attacks
- **Email Uniqueness** - Prevents duplicate accounts
- **Reset Token Expiry** - Tokens expire after 1 hour
- **Generic Error Messages** - Don't reveal if email exists

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastify | ^5.9.0 | Web framework |
| mongoose | ^9.7.3 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | Latest | JWT token generation |
| @fastify/cors | ^11.2.0 | CORS middleware |
| @fastify/cookie | Latest | Cookie handling |
| dotenv | ^17.4.2 | Environment variables |
| nodemon | ^3.1.14 | Development auto-reload |

## 🛠️ Technologies Used

- **Backend Framework:** Fastify
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Runtime:** Node.js
- **Package Manager:** npm

## 📝 Sample Flow

1. User registers with email and password
2. Password is hashed with bcrypt (10 rounds)
3. User data saved to MongoDB
4. User logs in with email and password
5. Password verified using bcrypt.compare()
6. JWT token generated and sent back
7. Token stored in HTTP-only cookie
8. User can access protected routes with token

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify `MONGODB_URI` in `.env`
- Check if MongoDB cluster is running
- Verify IP whitelist in MongoDB Atlas

### JWT Token Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration (1 hour)
- Verify token format in Authorization header

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process: `lsof -ti:3000 | xargs kill -9`

## 📄 License

ISC

## 👨‍💻 Author

sameer