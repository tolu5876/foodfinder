const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { db, auth } = require('./firebase-config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// User registration with Firebase
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    
    // Create new user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`
    });
    
    // Save user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      firstName: firstName,
      lastName: lastName,
      createdAt: new Date().toISOString(),
      uid: userRecord.uid
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      uid: userRecord.uid 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// User login with Firebase
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate with Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    
    if (!userRecord) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Create custom token for session
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token: customToken,
      user: {
        email: userRecord.email,
        displayName: userRecord.displayName,
        uid: userRecord.uid
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user profile
app.get('/api/user/:uid', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      user: userDoc.data() 
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Save recipe to Firebase
app.post('/api/save-recipe', async (req, res) => {
  try {
    const { userId, recipe } = req.body;
    
    await db.collection('savedRecipes').doc().set({
      userId: userId,
      recipe: recipe,
      savedAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Recipe saved successfully' 
    });
    
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get saved recipes
app.get('/api/recipes/:userId', async (req, res) => {
  try {
    const recipesSnapshot = await db.collection('savedRecipes')
      .where('userId', '==', req.params.userId)
      .orderBy('savedAt', 'desc')
      .get();
    
    const recipes = [];
    recipesSnapshot.forEach(doc => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({ 
      success: true, 
      recipes: recipes 
    });
    
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Firebase server running on port ${PORT}`);
  console.log('📡 API endpoints available:');
  console.log('  POST /api/register - User registration');
  console.log('  POST /api/login - User login');
  console.log('  GET /api/user/:uid - Get user profile');
  console.log('  POST /api/save-recipe - Save recipe');
  console.log('  GET /api/recipes/:userId - Get saved recipes');
});
