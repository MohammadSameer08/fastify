# Password Reset & Forgot Password Flow

This document explains how the password reset and forgot password functionality works in the Fastify Authentication API.

## 📋 Table of Contents
- [Overview](#overview)
- [Forgot Password Flow](#forgot-password-flow)
- [Reset Password Flow](#reset-password-flow)
- [Complete Workflow](#complete-workflow)
- [Security Considerations](#security-considerations)
- [API Examples](#api-examples)
- [Database Schema](#database-schema)

---

## Overview

The password reset feature consists of **two endpoints**:

1. **Forgot Password** (`POST /api/auth/forgot-password`) - Generate a reset token
2. **Reset Password** (`POST /api/auth/reset-password/:token`) - Use token to set new password

This is a **token-based** password reset system similar to industry standards (Gmail, GitHub, etc.).

---

## Forgot Password Flow

### Step-by-Step Process

```
User (Frontend)
    ↓
    ├─→ User enters email → Sends to /forgot-password endpoint
    ↓
Server (Backend)
    ├─→ Receives email in request body
    ├─→ Validates email is provided
    ├─→ Searches database for user with this email
    ├─→ If user NOT found → Return 400 error (User not found)
    ├─→ If user found:
    │   ├─→ Generate random reset token (32 bytes, converted to hex)
    │   ├─→ Set token expiry time (1 hour from now = 3,600,000 ms)
    │   ├─→ Save token & expiry to user document
    │   ├─→ Save to MongoDB
    ├─→ Send success response (200)
    │   └─→ In real app: Send email with reset link
    ↓
Response
    └─→ "Password reset email sent"
```

### Code Flow

```javascript
export const forgotPassword = async (request, reply) => {
  // 1. Extract email from request body
  const { email } = request.body;
  
  // 2. Validate email exists
  if (!email) {
    return reply.status(400).send({ error: "Email is required" });
  }

  // 3. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return reply.status(400).send({ error: "User not found" });
  }

  // 4. Generate reset token (32 random bytes in hex format)
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Example output: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

  // 5. Set expiration time (1 hour from now)
  const resetTokenExpiry = Date.now() + 3600000;
  // 3600000 ms = 60 min × 60 sec × 1000 ms

  // 6. Save token and expiry to user document
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // 7. TODO: Send email to user with reset link
  // Email content: https://yourapp.com/reset?token=a1b2c3d4e5f6...
  // await sendResetEmail(user.email, resetToken);

  // 8. Send response
  reply.send({ message: "Password reset email sent" });
};
```

### What Happens in Database

**Before:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // hashed password
  resetPasswordToken: undefined,
  resetPasswordExpires: undefined
}
```

**After:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // hashed password (unchanged)
  resetPasswordToken: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
  resetPasswordExpires: 1719832800000 // Timestamp (1 hour from now)
}
```

---

## Reset Password Flow

### Step-by-Step Process

```
User (Frontend)
    ↓
    ├─→ Clicks email link with reset token
    ├─→ Navigates to reset password page
    ├─→ Enters new password
    ├─→ Submits to /reset-password/:token endpoint
    ↓
Server (Backend)
    ├─→ Receives token from URL and new password from body
    ├─→ Validate both token and newPassword exist
    ├─→ Query database for user with:
    │   ├─→ resetPasswordToken = token (matches exactly)
    │   └─→ resetPasswordExpires > current time (token not expired)
    ├─→ If NOT found → Return 400 (Invalid or expired token)
    ├─→ If found:
    │   ├─→ Hash new password with bcrypt (10 rounds)
    │   ├─→ Update user.password = hashedNewPassword
    │   ├─→ Clear resetPasswordToken = undefined
    │   ├─→ Clear resetPasswordExpires = undefined
    │   ├─→ Save to MongoDB
    ├─→ Send success response (200)
    ↓
Response
    └─→ "Password has been reset successfully"
```

### Code Flow

```javascript
export const resetPassword = async (request, reply) => {
  // 1. Extract token from URL path
  const { token } = request.params;
  // Example: /reset-password/a1b2c3d4e5f6... → token = "a1b2c3d4e5f6..."

  // 2. Extract new password from request body
  const { newPassword } = request.body;

  // 3. Validate both parameters exist
  if (!token || !newPassword) {
    return reply.status(400).send({ 
      error: "Reset token and new password are required" 
    });
  }

  // 4. Find user with matching token AND non-expired token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() } // $gt = "greater than"
  });

  // 5. If token invalid or expired, reject
  if (!user) {
    return reply.status(400).send({ 
      error: "Invalid or expired reset token" 
    });
  }

  // 6. Hash new password (never store plain text)
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 7. Update user document
  user.password = hashedPassword;          // Update password
  user.resetPasswordToken = undefined;     // Clear token
  user.resetPasswordExpires = undefined;   // Clear expiry
  await user.save();                       // Save to database

  // 8. Send success response
  reply.send({ message: "Password has been reset successfully" });
};
```

### What Happens in Database

**Before Reset:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$old_hashed_password...", // old password
  resetPasswordToken: "a1b2c3d4e5f6g7h8...",  // token still valid
  resetPasswordExpires: 1719832800000          // not expired yet
}
```

**After Reset:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$new_hashed_password...", // new password
  resetPasswordToken: undefined,              // cleared
  resetPasswordExpires: undefined             // cleared
}
```

---

## Complete Workflow

### Timeline Example

```
Time    Event                                   Database State
────────────────────────────────────────────────────────────────
T+0     User clicks "Forgot Password"           No changes

T+1     User enters email: john@example.com     

T+2     Request POST /forgot-password           
        Server generates token:                 
        "abc123xyz789..."                       resetPasswordToken = "abc123xyz789..."
                                                resetPasswordExpires = T+3602 (1 hour)

T+5     User checks email, clicks reset link
        Link: /reset?token=abc123xyz789...

T+10    User enters new password: "newpass123"
        Submits POST /reset-password/:token

T+11    Server validates:
        ✓ Token matches "abc123xyz789..."
        ✓ Expiry time (T+3602) > current (T+11)
        ✓ User found
        
        Server updates:
        - Hashes new password
        - Saves to database
        - Clears token & expiry               resetPasswordToken = undefined
                                                resetPasswordExpires = undefined

T+12    Response: "Password reset successful"

T+3603  If user tried to use expired token:
        ✗ Token expired (T+3602 < current T+3603)
        Response: "Invalid or expired reset token"
```

---

## Security Considerations

### 1. Token Generation
```javascript
crypto.randomBytes(32).toString("hex")
```
- Uses cryptographically secure random number generator
- 32 bytes = 256 bits = 64 hex characters
- Virtually impossible to guess (even with brute force)

### 2. Token Storage
```javascript
// ✅ GOOD - Token stored in database
user.resetPasswordToken = token;

// ❌ BAD - Storing plain text token
// Anyone with database access can reset any password
```

### 3. Token Expiration
```javascript
// ✅ GOOD - Token expires after 1 hour
resetPasswordExpires: Date.now() + 3600000

// ❌ BAD - Token never expires
// Security risk: token can be used indefinitely
```

### 4. MongoDB Query with Expiry Check
```javascript
// ✅ GOOD - Checks expiration in query
const user = await User.findOne({
  resetPasswordToken: token,
  resetPasswordExpires: { $gt: Date.now() }  // Must be in future
});

// ❌ BAD - Only checks token, ignores expiry
const user = await User.findOne({
  resetPasswordToken: token
});
if (Date.now() > user.resetPasswordExpires) { /* too late */ }
```

### 5. Password Hashing
```javascript
// ✅ GOOD - Hash before storing
const hashedPassword = await bcrypt.hash(newPassword, 10);
user.password = hashedPassword;

// ❌ BAD - Storing plain text password
user.password = newPassword;
```

### 6. Clear Tokens After Use
```javascript
// ✅ GOOD - Prevent token reuse
user.resetPasswordToken = undefined;
user.resetPasswordExpires = undefined;
await user.save();

// ❌ BAD - Token remains in database
// User could keep using same token multiple times
```

### 7. Generic Error Messages
```javascript
// ✅ GOOD - Don't reveal system details
return reply.status(400).send({ 
  error: "Invalid or expired reset token" 
});

// ❌ BAD - Reveals system information
return reply.status(400).send({ 
  error: "Token expired at 2024-07-01 10:30:00" 
});
```

---

## API Examples

### Example 1: Successful Password Reset

**Step 1: Forgot Password**
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

**Step 2: Reset Password**
```bash
POST /api/auth/reset-password/abc123xyz789...
Content-Type: application/json

{
  "newPassword": "mynewpassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

### Example 2: Token Not Found
```bash
POST /api/auth/reset-password/invalidtoken123
Content-Type: application/json

{
  "newPassword": "mynewpassword123"
}
```

**Response (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

### Example 3: Token Expired
```bash
# If more than 1 hour has passed since forgot-password was called
POST /api/auth/reset-password/oldtoken123
Content-Type: application/json

{
  "newPassword": "mynewpassword123"
}
```

**Response (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

## Database Schema

### User Document Fields Used

```javascript
{
  _id: ObjectId,                    // Unique user identifier
  
  // User info
  name: String,
  email: String,
  country: String,
  
  // Login password
  password: String,                 // Hashed with bcrypt
  
  // Password reset fields
  resetPasswordToken: String,       // Random token for reset
  resetPasswordExpires: Date,       // When token expires
  
  // Timestamps
  createdAt: Date,                  // When account created
  updatedAt: Date                   // When last updated
}
```

### MongoDB Query Examples

```javascript
// Find user by reset token (before expiry)
db.users.findOne({
  resetPasswordToken: "abc123xyz789...",
  resetPasswordExpires: { $gt: new Date() }
})

// Query explanation:
// - resetPasswordToken: exact match
// - resetPasswordExpires: { $gt: now } = expires in future (not expired)
```

---

## Testing the Flow

### Using Postman

1. **Request 1: Forgot Password**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/forgot-password`
   - Body (JSON): `{ "email": "john@example.com" }`
   - Expected: `200` with message

2. **In Database Console**
   - Find the user and copy the `resetPasswordToken` value
   - Note the `resetPasswordExpires` timestamp

3. **Request 2: Reset Password**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/reset-password/[PASTE_TOKEN_HERE]`
   - Body (JSON): `{ "newPassword": "newpassword123" }`
   - Expected: `200` with success message

4. **Verify in Database**
   - `resetPasswordToken` should now be `null`
   - `resetPasswordExpires` should now be `null`
   - Password should be hashed (different from before)

### Using curl

```bash
# Forgot Password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# Reset Password (replace TOKEN with actual token from database)
curl -X POST http://localhost:3000/api/auth/reset-password/TOKEN \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"newpassword123"}'
```

---

## Troubleshooting

### Issue: "User not found" in Forgot Password
- **Cause:** Email doesn't exist in database
- **Solution:** Make sure user is registered first with this email

### Issue: "Invalid or expired reset token" after 1 hour
- **Cause:** Token expires after 1 hour
- **Solution:** User needs to request forgot-password again

### Issue: Token doesn't work immediately after requesting forgot-password
- **Cause:** Possible race condition or database sync delay
- **Solution:** Wait a few seconds or verify token in database

### Issue: Token works multiple times
- **Cause:** Token not being cleared after successful reset
- **Solution:** Check that `resetPasswordToken` is set to `undefined` in code

---

## Future Enhancements

1. **Email Integration**
   - Actually send reset email with link
   - Use Nodemailer or SendGrid

2. **Frontend Reset Page**
   - Build UI for password reset
   - Validate password strength

3. **Rate Limiting**
   - Limit forgot-password requests per email
   - Prevent password reset spam

4. **Token Security**
   - Hash reset token in database (hash both directions)
   - Add IP address to token validation

5. **Audit Logging**
   - Log password reset attempts
   - Track suspicious activity

---

## Summary

| Step | Endpoint | Method | Token Status | What Happens |
|------|----------|--------|--------------|--------------|
| 1 | `/forgot-password` | POST | Generated | Token created, saved to DB, expires in 1 hour |
| 2 | `/reset-password/:token` | POST | Used | Token validated, password updated, token cleared |
| 3 | (After 1 hour) | - | Expired | Token no longer valid, user must request new one |

