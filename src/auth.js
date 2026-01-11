// ============================================
// AUTHENTICATION SYSTEM
// ============================================
// Handles: Registration, Login, Session Management, Single Device Login

// Generate unique device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Get all registered users
function getAllUsers() {
  const usersJson = localStorage.getItem('registeredUsers');
  return usersJson ? JSON.parse(usersJson) : [];
}

// Save all users
function saveAllUsers(users) {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Check if email or phone already exists
function userExists(email, phone) {
  const users = getAllUsers();
  return users.some(user => 
    user.email.toLowerCase() === email.toLowerCase() || 
    user.phone === phone
  );
}

// Register new user
function registerUser(userData) {
  const users = getAllUsers();
  
  // Check if user already exists
  if (userExists(userData.email, userData.phone)) {
    return {
      success: false,
      message: 'Email or phone number already registered!'
    };
  }

  // Create new user object
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email.toLowerCase(),
    phone: userData.phone,
    password: userData.password, // In production, this should be hashed
    gender: userData.gender,
    country: userData.country,
    registeredAt: new Date().toISOString(),
    deviceId: null, // Will be set on first login
    lastLogin: null
  };

  // Add user to array
  users.push(newUser);
  saveAllUsers(users);

  return {
    success: true,
    message: 'Registration successful!',
    user: newUser
  };
}

// Find user by email or phone
function findUser(emailOrPhone) {
  const users = getAllUsers();
  const input = emailOrPhone.trim().toLowerCase();
  
  return users.find(user => 
    user.email.toLowerCase() === input || 
    user.phone === emailOrPhone.trim()
  );
}

// Login user
function loginUser(emailOrPhone, password) {
  const user = findUser(emailOrPhone);
  
  if (!user) {
    return {
      success: false,
      message: 'Email/Phone or password is incorrect!'
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: 'Email/Phone or password is incorrect!'
    };
  }

  const currentDeviceId = getDeviceId();
  
  // Check if user is logged in on another device
  const activeSession = getActiveSession();
  if (activeSession && activeSession.userId === user.id && activeSession.deviceId !== currentDeviceId) {
    return {
      success: false,
      message: 'You are already logged in on another device. Please logout from that device first.'
    };
  }

  // Check if user has a device assigned and it's different
  if (user.deviceId && user.deviceId !== currentDeviceId) {
    return {
      success: false,
      message: 'This account is already logged in on another device. Please logout from that device first.'
    };
  }

  // Update user device and last login
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].deviceId = currentDeviceId;
    users[userIndex].lastLogin = new Date().toISOString();
    saveAllUsers(users);
  }

  // Create session (1 year expiration)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  const session = {
    userId: user.id,
    deviceId: currentDeviceId,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    loginTime: new Date().toISOString(),
    expiresAt: oneYearFromNow.toISOString()
  };

  localStorage.setItem('activeSession', JSON.stringify(session));
  localStorage.setItem('isLoggedIn', 'true');

  return {
    success: true,
    message: 'Login successful!',
    user: user,
    session: session
  };
}

// Get active session
function getActiveSession() {
  const sessionJson = localStorage.getItem('activeSession');
  if (!sessionJson) return null;

  const session = JSON.parse(sessionJson);
  
  // Check if session expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt) {
    logout();
    return null;
  }

  // Verify device ID matches
  const currentDeviceId = getDeviceId();
  if (session.deviceId !== currentDeviceId) {
    logout();
    return null;
  }

  return session;
}

// Check if user is logged in
function isLoggedIn() {
  const session = getActiveSession();
  return session !== null;
}

// Get current user
function getCurrentUser() {
  const session = getActiveSession();
  if (!session) return null;

  const users = getAllUsers();
  return users.find(u => u.id === session.userId);
}

// Logout user
function logout() {
  const session = getActiveSession();
  
  if (session) {
    // Remove device ID from user
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === session.userId);
    if (userIndex !== -1) {
      users[userIndex].deviceId = null;
      saveAllUsers(users);
    }
  }

  localStorage.removeItem('activeSession');
  localStorage.removeItem('isLoggedIn');
  
  return {
    success: true,
    message: 'Logged out successfully!'
  };
}

// Check session on page load
function checkSession() {
  const session = getActiveSession();
  return session !== null;
}

// Export functions (for use in other files)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDeviceId,
    registerUser,
    loginUser,
    logout,
    isLoggedIn,
    getCurrentUser,
    getActiveSession,
    checkSession,
    userExists,
    findUser
  };
}
