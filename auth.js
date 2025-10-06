// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCY3gyOmv39fJC3_dkwpBHK9FJX8yKjL1o",
    authDomain: "dedsec-59379.firebaseapp.com",
    databaseURL: "https://dedsec-59379-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dedsec-59379",
    storageBucket: "dedsec-59379.firebasestorage.app",
    messagingSenderId: "206084131371",
    appId: "1:206084131371:web:3212838d970d529567386e",
    measurementId: "G-FF3QWXSQS9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Global variables
let currentUser = null;
const ADMIN_EMAIL = "dedsecctt@gmail.com";

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up authentication state observer
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            currentUser = {
                uid: user.uid,
                email: user.email,
                isAdmin: user.email === ADMIN_EMAIL
            };
            
            updateUIForUser();
            
            // Load specific page content based on current page
            if (window.location.pathname.includes('challenges.html')) {
                loadChallenges();
                loadSolvedChallenges();
                setupCategoryNavigation();
            } else if (window.location.pathname.includes('admin.html')) {
                populateRemoveChallengeDropdown();
            }
        } else {
            // User is signed out
            currentUser = null;
            updateUIForUser();
            
            // Redirect to home if on admin page without permission
            if (window.location.pathname.includes('admin.html')) {
                window.location.href = 'index.html';
            }
        }
    });
});

// Update UI based on user login state
function updateUIForUser() {
    const loginNav = document.getElementById('login-nav');
    const registerNav = document.getElementById('register-nav');
    const logoutNav = document.getElementById('logout-nav');
    const adminNav = document.getElementById('admin-nav');
    
    if (currentUser) {
        if (loginNav) loginNav.style.display = 'none';
        if (registerNav) registerNav.style.display = 'none';
        if (logoutNav) logoutNav.style.display = 'block';
        
        if (currentUser.isAdmin && adminNav) {
            adminNav.style.display = 'block';
        } else if (adminNav) {
            adminNav.style.display = 'none';
        }
    } else {
        if (loginNav) loginNav.style.display = 'block';
        if (registerNav) registerNav.style.display = 'block';
        if (logoutNav) logoutNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
    }
}

// Logout
function logout() {
    auth.signOut()
        .then(() => {
            showNotification('Logged out successfully', 'success');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            showNotification('Error signing out: ' + error.message, 'error');
        });
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
}

// Setup category navigation for challenges page
function setupCategoryNavigation() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            showCategory(category);
            
            // Update active state
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show challenges for a specific category
function showCategory(category) {
    // Hide all challenge sections
    document.querySelectorAll('#crypto-section, #reverse-section, #web-section, #forensics-section, #misc-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested category
    document.getElementById(`${category}-section`).classList.add('active');
}