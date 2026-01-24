// ============================================
// FIREBASE AUTHENTICATION SYSTEM
// ============================================
// Handles: Registration, Login, Session Management, Firebase Backend

// Firebase configuration
const API_BASE = 'http://localhost:3000/api';
const firebaseConfig = {
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  databaseURL: '<DATABASE_URL>',
  projectId: '<PROJECT_ID>',
  storageBucket: '<STORAGE_BUCKET>',
  messagingSenderId: '<MESSAGING_SENDER_ID>',
  appId: '<APP_ID>'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Generate unique device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Get current session
function getCurrentSession() {
  const session = firebase.auth().currentUser;
  return session ? session : null;
}

// Save session
function saveSession(userData) {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  firebase.auth().signInWithEmailAndPassword(userData.email, userData.password);
}

// Clear session
function clearSession() {
  firebase.auth().signOut();
}

// Check if user is logged in
function checkSession() {
  const session = getCurrentSession();
  return session !== null;
}

// Get current user
function getCurrentUser() {
  const session = getCurrentSession();
  return session ? session.user : null;
}

// Register new user with Firebase
async function registerUser(userData) {
  try {
    const response = await firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password);
    const user = response.user;
    await user.updateProfile({
      displayName: userData.firstName + ' ' + userData.lastName,
      phoneNumber: userData.phone
    });
    return { success: true, user: user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

// Login user with Firebase
async function loginUser(email, password) {
  try {
    const response = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = response.user;
    return { success: true, user: user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

// Logout user
async function logoutUser() {
  try {
    await firebase.auth().signOut();
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true, message: 'Logged out' };
  }
}

// Get user profile from Firebase
async function getUserProfile(userId) {
  try {
    const user = await firebase.auth().currentUser;
    return user ? user : null;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

// Get active session
function getActiveSession() {
  const session = firebase.auth().currentUser;
  return session ? session : null;
}

// Get all registered users
function getAllUsers() {
  // Implement Firebase Realtime Database or Firestore to retrieve all users
}

// Save all users
function saveAllUsers(users) {
  // Implement Firebase Realtime Database or Firestore to save all users
}

// Check if email or phone already exists
function userExists(email, phone) {
  // Implement Firebase Realtime Database or Firestore to check if email or phone already exists
}

// Find user by email or phone
function findUser(emailOrPhone) {
  // Implement Firebase Realtime Database or Firestore to find user by email or phone

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
