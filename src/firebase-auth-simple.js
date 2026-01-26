// Simple Firebase configuration - ADD YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase only if not already initialized
let auth;
try {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    console.log('Firebase initialized successfully');
  } else if (typeof firebase !== 'undefined') {
    auth = firebase.auth();
    console.log('Using existing Firebase instance');
  } else {
    throw new Error('Firebase not loaded');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback to localStorage auth for testing
  auth = {
    createUserWithEmailAndPassword: async (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if user already exists in localStorage
          const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const emailExists = existingUsers.some(user => 
            user.email.toLowerCase() === email.toLowerCase()
          );
          
          if (emailExists) {
            reject(new Error('email-already-in-use'));
            return;
          }
          
          const uid = 'mock_' + Date.now();
          const user = {
            uid: uid,
            email: email,
            displayName: email.split('@')[0],
            updateProfile: (data) => Promise.resolve()
          };
          
          // Save to localStorage
          existingUsers.push({
            email: email.toLowerCase(),
            uid: uid,
            registeredAt: new Date().toISOString()
          });
          localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
          
          resolve({ user });
        }, 1000);
      });
    },
    signInWithEmailAndPassword: async (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if user exists in localStorage
          const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const userExists = existingUsers.find(user => 
            user.email.toLowerCase() === email.toLowerCase()
          );
          
          if (!userExists) {
            reject(new Error('user-not-found'));
            return;
          }
          
          const user = {
            uid: userExists.uid,
            email: email,
            displayName: email.split('@')[0]
          };
          
          resolve({ user });
        }, 1000);
      });
    },
    signOut: async () => {
      return Promise.resolve();
    }
  };
  console.log('Using localStorage fallback auth');
}

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
    console.log('Registration started for:', userData.email);
    console.log('User data being registered:', userData);
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !auth) {
      console.log('Firebase not available, using localStorage fallback');
      throw new Error('Firebase not available');
    }
    
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Update user profile
    await user.updateProfile({
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    // Save complete user data to localStorage
    const completeUserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || '',
      gender: userData.gender || '',
      country: userData.country || '',
      registeredAt: new Date().toISOString()
    };
    
    // Save to registered users list with password
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const newUser = {
      email: userData.email.toLowerCase(),
      uid: user.uid,
      password: userData.password, // Save password for login validation
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: `${userData.firstName} ${userData.lastName}`,
      phone: userData.phone || '',
      gender: userData.gender || '',
      country: userData.country || '',
      registeredAt: new Date().toISOString()
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    console.log('User saved to localStorage:', newUser);
    console.log('All registered users now:', existingUsers);
    
    // Save current user session
    saveSession({
      user: completeUserData,
      deviceId: getDeviceId()
    });
    
    console.log('User registered successfully:', completeUserData);
    
    return { 
      success: true, 
      message: 'Registration successful!',
      user: completeUserData
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Fallback to localStorage if Firebase fails
    if (error.message.includes('Firebase not available') || error.code === 'auth/invalid-api-key') {
      console.log('Using localStorage fallback registration');
      
      try {
        // Check if user already exists in localStorage
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const emailExists = existingUsers.some(user => 
          user.email.toLowerCase() === userData.email.toLowerCase()
        );
        
        if (emailExists) {
          return { 
            success: false, 
            message: 'User with this email already exists! Please login instead.' 
          };
        }
        
        // Create new user with localStorage
        const uid = 'mock_' + Date.now();
        const newUser = {
          email: userData.email.toLowerCase(),
          uid: uid,
          password: userData.password, // Save password for login validation
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone || '',
          gender: userData.gender || '',
          country: userData.country || '',
          registeredAt: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        console.log('User saved to localStorage (fallback):', newUser);
        console.log('All registered users now (fallback):', existingUsers);
        
        // Save session
        saveSession({
          user: {
            uid: uid,
            email: userData.email,
            displayName: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName
          },
          deviceId: getDeviceId()
        });
        
        return { 
          success: true, 
          message: 'Registration successful!',
          user: newUser
        };
        
      } catch (fallbackError) {
        console.error('Fallback registration error:', fallbackError);
        return { 
          success: false, 
          message: 'Registration failed. Please try again.' 
        };
      }
    }
    
    // Handle specific Firebase errors
    let errorMessage = error.message || 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'User with this email already exists! Please login instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please check and try again.';
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
}

// Simple login function without recursion
function loginUserSimple(email, password) {
  return new Promise((resolve, reject) => {
    console.log('Simple login started for:', email);
    
    // Use localStorage fallback to avoid Firebase issues
    setTimeout(() => {
      try {
        // Check if user exists in localStorage
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userExists = existingUsers.find(user => 
          user.email.toLowerCase() === email.toLowerCase()
        );
        
        if (!userExists) {
          resolve({ 
            success: false, 
            message: 'User not found! Please register first.' 
          });
          return;
        }
        
        // For demo, accept any password (you should add proper password validation)
        const user = {
          uid: userExists.uid,
          email: email,
          displayName: email.split('@')[0]
        };
        
        // Save session
        saveSession({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          },
          deviceId: getDeviceId()
        });
        
        console.log('Simple login successful:', user);
        
        resolve({ 
          success: true, 
          message: 'Login successful!',
          user: user
        });
        
      } catch (error) {
        console.error('Simple login error:', error);
        resolve({ 
          success: false, 
          message: 'Login failed. Please try again.' 
        });
      }
    }, 500); // Small delay to simulate async operation
  });
}

// Keep the original function but redirect to simple one
async function loginUser(email, password) {
  try {
    console.log('Login wrapper called');
    return await loginUserSimple(email, password);
  } catch (error) {
    console.error('Login wrapper error:', error);
    return { 
      success: false, 
      message: 'Login failed. Please try again.' 
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
