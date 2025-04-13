// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  update, 
  remove, 
  onValue 
} from "firebase/database";
import { getAuth } from "firebase/auth"; // Authentication
import { getStorage } from "firebase/storage"; // Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAB0V-k-4lKVWhTBYFnDpvBRTQkwZtqgp4",
  authDomain: "push-and-pull-fitness.firebaseapp.com",
  databaseURL: "https://push-and-pull-fitness-default-rtdb.firebaseio.com",
  projectId: "push-and-pull-fitness",
  storageBucket: "push-and-pull-fitness.firebasestorage.app",
  messagingSenderId: "598786025611",
  appId: "1:598786025611:web:75afb075046a284c1acc8e",
  measurementId: "G-XNWJNLQNB4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);



// CRUD Functions

/**
 * Add data to a specified path.
 * Automatically generates a unique ID.
 * 
 * @param {string} path - Path in the database.
 * @param {Object} data - Data to add.
 * @returns {Promise<void>}
 */
export const addData = async (path, data) => {
    try {
      const dataRef = ref(database, path);
      const newRef = push(dataRef); // Create a unique ID
      await set(newRef, data);
      console.log("Data added successfully!");
    } catch (error) {
      console.error("Error adding data:", error);
    }
  };
  
  /**
   * Read data from a specified path once.
   * 
   * @param {string} path - Path in the database.
   * @param {Function} callback - Callback to process the data.
   */
  export const fetchData = (path, callback) => {
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    }, {
      onlyOnce: true,
    });
  };
  
  /**
   * Update data at a specified path.
   * 
   * @param {string} path - Path in the database.
   * @param {Object} data - Data to update.
   * @returns {Promise<void>}
   */
  export const updateData = async (path, data) => {
    try {
      const dataRef = ref(database, path);
      await update(dataRef, data);
      console.log("Data updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };
  
  /**
   * Delete data at a specified path.
   * 
   * @param {string} path - Path in the database.
   * @returns {Promise<void>}
   */
  export const deleteData = async (path) => {
    try {
      const dataRef = ref(database, path);
      await remove(dataRef);
      console.log("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };
  
  /**
   * Listen to real-time changes at a specified path.
   * 
   * @param {string} path - Path in the database.
   * @param {Function} callback - Callback to process the real-time data.
   */
  export const listenToChanges = (path, callback) => {
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });
  };
  
export default database;