// Authentication functions using localStorage

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

// Check if user is logged in
function checkAuth() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

// Check if user is admin
function isAdmin() {
    const userEmail = localStorage.getItem('userEmail');
    return userEmail === "admin@dedsec.com";
}

// Update UI based on authentication status
function updateAuthUI() {
    const isLoggedIn = checkAuth();
    const isAdminUser = isAdmin();
    const authElements = document.querySelectorAll('.auth-only');
    const guestElements = document.querySelectorAll('.guest-only');
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (isLoggedIn) {
        authElements.forEach(el => el.style.display = 'block');
        guestElements.forEach(el => el.style.display = 'none');
        
        // Show admin elements only for admin users
        adminElements.forEach(el => {
            el.style.display = isAdminUser ? 'block' : 'none';
        });
        
        // Update user info
        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
        const userWelcomeElements = document.querySelectorAll('.user-welcome');
        userWelcomeElements.forEach(el => {
            el.textContent = userName;
        });
    } else {
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = 'block');
        adminElements.forEach(el => el.style.display = 'none');
    }
}

// Enhanced Persistent Authentication
function initializeAuth() {
    // Check if user should stay logged in
    const stayLoggedIn = localStorage.getItem('stayLoggedIn') === 'true';
    const loginExpiry = localStorage.getItem('loginExpiry');
    
    if (stayLoggedIn && loginExpiry && new Date().getTime() < parseInt(loginExpiry)) {
        // User is still within login session
        localStorage.setItem('userLoggedIn', 'true');
    } else if (stayLoggedIn) {
        // Session expired
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('stayLoggedIn');
        localStorage.removeItem('loginExpiry');
    }
    
    updateAuthUI();
}

function loginUser(email, password, rememberMe = false) {
    // ... existing login logic ...
    
    if (rememberMe) {
        localStorage.setItem('stayLoggedIn', 'true');
        // Set expiry for 7 days
        const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('loginExpiry', expiryTime.toString());
    }
    
    localStorage.setItem('userLoggedIn', 'true');
    // ... rest of login logic
}

// Update DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    updateAuthUI();
    
    if (window.location.pathname.includes('challenges.html')) {
        setupCategoryNavigation();
    }
});

// Logout function
function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
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

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Load specific page content based on current page
    if (window.location.pathname.includes('challenges.html')) {
        setupCategoryNavigation();
    }
});