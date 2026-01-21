// Firebase configuration for FoodFinder
const firebase = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://foodfinder-12345.firebaseio.com"
});

const db = firebase.firestore();
const auth = firebase.auth();

module.exports = { db, auth };
