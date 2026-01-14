// ============================================
// AUTHENTICATION SYSTEM - NODE.JS VERSION
// ============================================
// Handles: Registration, Login, Session Management, Multi-Device Support

// API Base URL - works on both local and Vercel
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
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

// Register new user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
}

// Login user
async function loginUser(emailOrPhone, password) {
  try {
    const device_id = getDeviceId();
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: emailOrPhone,
        password: password,
        device_id: device_id
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Store session data
      const session = {
        userId: result.user.user_id,
        deviceId: device_id,
        email: result.user.email,
        phone: result.user.phone,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        sessionToken: result.session_token,
        expiresAt: result.expires_at,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('activeSession', JSON.stringify(session));
      localStorage.setItem('isLoggedIn', 'true');
    }
    
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.'
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
