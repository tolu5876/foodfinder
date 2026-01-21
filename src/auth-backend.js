// ============================================
// AUTHENTICATION SYSTEM - NODE.JS VERSION
// ============================================
// Handles: Registration, Login, Session Management, Multi-Device Support

// API Base URL - works on both local and Vercel
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : window.location.hostname.includes('vercel.app')
    ? '/api'
    : '/api';

// Generate unique device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Register new user - Firebase version
async function registerUser(userData) {
  try {
    // Use Firebase registration from firebase-auth.js
    if (typeof window.registerUser === 'function') {
      // Check if user already exists in localStorage first
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailExists = existingUsers.some(user => 
        user.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        return {
          success: false,
          message: 'User with this email already exists! Please use a different email or login.'
        };
      }
      
      const result = await window.registerUser({
        email: userData.email,
        password: userData.password,
        firstName: userData.first_name,
        lastName: userData.last_name
      });
      
      if (result.success) {
        // Save additional user data to localStorage for duplicate checking
        const extendedUserData = {
          ...result.user,
          phone: userData.phone || '',
          gender: userData.gender || '',
          country: userData.country || ''
        };
        
        // Add to registered users list
        existingUsers.push({
          email: userData.email.toLowerCase(),
          uid: result.user.uid,
          registeredAt: new Date().toISOString()
        });
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        localStorage.setItem('currentUser', JSON.stringify(extendedUserData));
        
        return {
          success: true,
          message: 'Registration successful!',
          user: extendedUserData
        };
      } else {
        // Check Firebase error messages
        if (result.message.includes('email-already-in-use')) {
          return {
            success: false,
            message: 'User with this email already exists! Please login instead.'
          };
        } else if (result.message.includes('weak-password')) {
          return {
            success: false,
            message: 'Password is too weak. Please choose a stronger password.'
          };
        } else if (result.message.includes('invalid-email')) {
          return {
            success: false,
            message: 'Invalid email address. Please check and try again.'
          };
        }
        return result;
      }
    } else {
      // Fallback simulation
      return {
        success: true,
        message: 'Registration successful!'
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed'
    };
  }
}

// Login user - Firebase version
async function loginUser(emailOrPhone, password) {
  try {
    // Use Firebase login from firebase-auth.js
    if (typeof window.loginUser === 'function') {
      const result = await window.loginUser(emailOrPhone, password);
      
      if (result.success) {
        // Store session data
        const session = {
          userId: result.user.uid,
          deviceId: getDeviceId(),
          email: result.user.email,
          displayName: result.user.displayName,
          sessionToken: 'firebase_token_' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('activeSession', JSON.stringify(session));
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          message: 'Login successful!',
          user: result.user
        };
      } else {
        return result;
      }
    } else {
      // Fallback simulation
      return {
        success: false,
        message: 'Login system not available'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed'
    };
  }
}

// Validate session with backend
async function validateSession(sessionToken, deviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        device_id: deviceId
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Session validation error:', error);
    return { success: false };
  }
}

// Get active session
async function getActiveSession() {
  const sessionJson = localStorage.getItem('activeSession');
  if (!sessionJson) return null;

  const session = JSON.parse(sessionJson);
  
  // Check if session expired locally
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt) {
    await logout();
    return null;
  }

  // Validate session with backend
  const validation = await validateSession(session.sessionToken, session.deviceId);
  if (!validation.success) {
    await logout();
    return null;
  }

  return session;
}

// Check if user is logged in
async function isLoggedIn() {
  const session = await getActiveSession();
  return session !== null;
}

// Get current user
async function getCurrentUser() {
  const session = await getActiveSession();
  if (!session) return null;

  return {
    user_id: session.userId,
    first_name: session.firstName,
    last_name: session.lastName,
    email: session.email,
    phone: session.phone
  };
}

// Logout user
async function logout() {
  const sessionJson = localStorage.getItem('activeSession');
  
  if (sessionJson) {
    const session = JSON.parse(sessionJson);
    
    try {
      // Call backend logout
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: session.sessionToken,
          device_id: session.deviceId
        })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Clear local storage
  localStorage.removeItem('activeSession');
  localStorage.removeItem('isLoggedIn');
  
  return {
    success: true,
    message: 'Logged out successfully!'
  };
}

// Check session on page load
async function checkSession() {
  const session = await getActiveSession();
  return session !== null;
}

// Helper function to get auth headers for API calls
function getAuthHeaders() {
  const sessionJson = localStorage.getItem('activeSession');
  if (!sessionJson) return {};

  const session = JSON.parse(sessionJson);
  return {
    'Authorization': `Bearer ${session.sessionToken}`,
    'Device-ID': session.deviceId
  };
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
    validateSession,
    getAuthHeaders
  };
}
