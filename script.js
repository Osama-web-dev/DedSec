// Admin credentials
const ADMIN_EMAIL = "admin@dedsec.com";
const ADMIN_PASSWORD = "admin123";

// Enhanced admin functions
function isAdmin() {
    const userEmail = localStorage.getItem('userEmail');
    return userEmail === ADMIN_EMAIL;
}

function handleChallengeSubmit(event) {
    event.preventDefault();
    
    if (!isAdmin()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    const challengeId = document.getElementById('challenge-id').value;
    const title = document.getElementById('challenge-title').value;
    const category = document.getElementById('challenge-category').value;
    const creator = document.getElementById('challenge-creator').value;
    const difficulty = document.getElementById('challenge-difficulty').value;
    const description = document.getElementById('challenge-description').value;
    const hint = document.getElementById('challenge-hint').value;
    const flag = document.getElementById('challenge-flag').value;
    const fileLink = document.getElementById('challenge-file-link').value;
    const submitBtn = document.getElementById('submit-challenge-btn');
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Saving...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
        
        if (challengeId) {
            // Update existing challenge
            challenges[challengeId] = {
                ...challenges[challengeId],
                title,
                category,
                difficulty,
                description,
                hint,
                flag,
                fileLink,
                creator,
                updatedAt: new Date().toISOString()
            };
            showNotification('Challenge updated successfully!', 'success');
        } else {
            // Create new challenge
            const newChallengeId = 'challenge-' + Date.now();
            challenges[newChallengeId] = {
                title,
                category,
                difficulty,
                description,
                hint,
                flag,
                fileLink,
                creator,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            showNotification('Challenge added successfully!', 'success');
        }
        
        localStorage.setItem('challenges', JSON.stringify(challenges));
        
        // Reset form and UI
        submitBtn.innerHTML = 'Add Challenge';
        submitBtn.disabled = false;
        document.getElementById('form-title').textContent = 'Add New Challenge';
        document.getElementById('cancel-edit-btn').style.display = 'none';
        document.getElementById('challenge-id').value = '';
        event.target.reset();
        
        // Refresh admin lists
        loadAdminChallenges();
        updateAdminStats();
        if (window.location.pathname.includes('challenges.html')) {
            loadChallenges();
        }
    }, 1000);
}

function editChallenge(challengeId) {
    if (!isAdmin()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    const challenge = challenges[challengeId];
    
    if (challenge) {
        // Populate form with challenge data
        document.getElementById('challenge-id').value = challengeId;
        document.getElementById('challenge-title').value = challenge.title;
        document.getElementById('challenge-creator').value = challenge.creator;
        document.getElementById('challenge-category').value = challenge.category;
        document.getElementById('challenge-difficulty').value = challenge.difficulty;
        document.getElementById('challenge-description').value = challenge.description;
        document.getElementById('challenge-hint').value = challenge.hint || '';
        document.getElementById('challenge-flag').value = challenge.flag;
        document.getElementById('challenge-file-link').value = challenge.fileLink || '';
        
        // Update UI for edit mode
        document.getElementById('form-title').textContent = 'Edit Challenge';
        document.getElementById('submit-challenge-btn').textContent = 'Update Challenge';
        document.getElementById('cancel-edit-btn').style.display = 'inline-block';
        
        // Scroll to form
        document.getElementById('challenge-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelEdit() {
    document.getElementById('challenge-form').reset();
    document.getElementById('challenge-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Challenge';
    document.getElementById('submit-challenge-btn').textContent = 'Add Challenge';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

function clearForm() {
    if (confirm('Are you sure you want to clear the form?')) {
        cancelEdit();
    }
}

function deleteChallenge(challengeId) {
    if (!isAdmin()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
        const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
        delete challenges[challengeId];
        localStorage.setItem('challenges', JSON.stringify(challenges));
        
        showNotification('Challenge deleted successfully!', 'success');
        loadAdminChallenges();
        updateAdminStats();
        
        // Also remove from solved challenges
        const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
        delete solvedChallenges[challengeId];
        localStorage.setItem('solvedChallenges', JSON.stringify(solvedChallenges));
        
        if (window.location.pathname.includes('challenges.html')) {
            loadChallenges();
            updateStats();
        }
    }
}

function loadAdminChallenges() {
    if (!document.getElementById('admin-challenges-list')) return;
    
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    const challengesList = document.getElementById('admin-challenges-list');
    const searchTerm = document.getElementById('search-challenges').value.toLowerCase();
    const filterCategory = document.getElementById('filter-category').value;
    
    if (Object.keys(challenges).length === 0) {
        challengesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-text">No challenges found. Create your first challenge above!</div>
            </div>
        `;
        return;
    }
    
    challengesList.innerHTML = '';
    
    Object.entries(challenges)
        .filter(([id, challenge]) => {
            const matchesSearch = challenge.title.toLowerCase().includes(searchTerm) ||
                                 challenge.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !filterCategory || challenge.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort(([,a], [,b]) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(([challengeId, challenge]) => {
            const challengeCard = document.createElement('div');
            challengeCard.className = 'admin-challenge-card';
            challengeCard.innerHTML = `
                <div class="admin-challenge-header">
                    <div>
                        <h4 class="admin-challenge-title">${challenge.title}</h4>
                        <div class="admin-challenge-meta">
                            <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                                ${challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                            </span>
                            <span class="challenge-category category-${challenge.category}">
                                ${challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                            </span>
                            <span class="challenge-date">
                                ${new Date(challenge.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div class="admin-challenge-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editChallenge('${challengeId}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteChallenge('${challengeId}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <p class="admin-challenge-description">${challenge.description}</p>
                <div class="admin-challenge-details">
                    <div><strong>Flag:</strong> <code>${challenge.flag}</code></div>
                    ${challenge.hint ? `<div><strong>Hint:</strong> ${challenge.hint}</div>` : ''}
                    ${challenge.fileLink ? `<div><strong>File:</strong> <a href="${challenge.fileLink}" target="_blank">Download</a></div>` : ''}
                    <div><strong>Creator:</strong> ${challenge.creator}</div>
                </div>
            `;
            challengesList.appendChild(challengeCard);
        });
}

function filterChallenges() {
    loadAdminChallenges();
}

function updateAdminStats() {
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    const stats = {
        total: 0,
        crypto: 0,
        reverse: 0,
        web: 0,
        forensics: 0,
        misc: 0
    };
    
    Object.values(challenges).forEach(challenge => {
        stats.total++;
        stats[challenge.category]++;
    });
    
    document.getElementById('total-challenges').textContent = stats.total;
    document.getElementById('crypto-challenges-count').textContent = stats.crypto;
    document.getElementById('reverse-challenges-count').textContent = stats.reverse;
    document.getElementById('web-challenges-count').textContent = stats.web;
    document.getElementById('forensics-challenges-count').textContent = stats.forensics;
    document.getElementById('misc-challenges-count').textContent = stats.misc;
}

// Enhanced authentication to check for admin
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    
    // Show loading state
    loginBtn.innerHTML = '<span class="loading"></span> Logging in...';
    loginBtn.disabled = true;
    
    // Check for admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setTimeout(() => {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAdmin', 'true');
            
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showNotification('Admin login successful!', 'success');
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        // Regular user login (you can implement proper user authentication here)
        setTimeout(() => {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAdmin', 'false');
            
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showNotification('Login successful!', 'success');
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const registerBtn = document.getElementById('register-btn');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Prevent registering with admin email
    if (email === ADMIN_EMAIL) {
        showNotification('This email is reserved for admin use', 'error');
        return;
    }
    
    // Show loading state
    registerBtn.innerHTML = '<span class="loading"></span> Creating account...';
    registerBtn.disabled = true;
    
    // Simulate registration process
    setTimeout(() => {
        // Store user data in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[email] = {
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Log the user in
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAdmin', 'false');
        
        registerBtn.innerHTML = 'Register';
        registerBtn.disabled = false;
        showNotification('Registration successful! You are now logged in.', 'success');
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Enhanced auth UI to show admin link
function updateAuthUI() {
    const isLoggedIn = checkAuth();
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
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
    } else {
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = 'block');
        adminElements.forEach(el => el.style.display = 'none');
    }
}

// Enhanced initApp function
function initApp() {
    // Load challenges when the page loads
    if (document.querySelector('.challenge-grid')) {
        const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
        if (Object.keys(challenges).length === 0) {
            initializeDefaultChallenges();
        } else {
            loadChallenges();
        }
    }
    
    // Load dashboard when on dashboard page
    if (document.getElementById('recent-challenges')) {
        loadDashboard();
    }
    
    // Load admin interface when on admin page
    if (document.getElementById('admin-challenges-list')) {
        if (!isAdmin()) {
            showNotification('Access denied. Admin privileges required.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        loadAdminChallenges();
        updateAdminStats();
    }
    
    // Check authentication status and update UI
    updateAuthUI();
}