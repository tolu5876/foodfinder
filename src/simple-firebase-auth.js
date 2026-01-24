// Simple Firebase configuration for client-side authentication
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

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
  const session = localStorage.getItem('userSession');
  return session ? JSON.parse(session) : null;
}

// Save session
function saveSession(userData) {
  localStorage.setItem('userSession', JSON.stringify(userData));
}

// Clear session
function clearSession() {
  localStorage.removeItem('userSession');
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
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Update user profile
    await user.updateProfile({
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    saveSession({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      deviceId: getDeviceId()
    });
    
    return { 
      success: true, 
      message: 'Registration successful!',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
}

// Login user with Firebase
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    saveSession({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      deviceId: getDeviceId()
    });
    
    return { 
      success: true, 
      message: 'Login successful!',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.message || 'Login failed' 
    };
  }
}

// Logout user
async function logoutUser() {
  try {
    await auth.signOut();
    clearSession();
    return { success: true, message: 'Logged out successfully!' };
  } catch (error) {
    console.error('Logout error:', error);
    clearSession();
    return { success: true, message: 'Logged out' };
  }
}

// Check if user is logged in (for auth state observer)
function onAuthStateChanged(callback) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      callback({
        isLoggedIn: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      });
    } else {
      callback({ isLoggedIn: false, user: null });
    }
  });
}

// Export functions (for use in other files)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDeviceId,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    checkSession,
    onAuthStateChanged
  };
}
