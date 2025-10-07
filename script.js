// Admin credentials
const ADMIN_EMAIL = "admin@dedsec.com";
const ADMIN_PASSWORD = "admin123";

// Check if user is logged in
function checkAuth() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

// Check if user is admin
function isAdmin() {
    const userEmail = localStorage.getItem('userEmail');
    return userEmail === ADMIN_EMAIL;
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

// Toggle hint visibility
function toggleHint(element) {
    const hintContent = element.querySelector('.hint-content');
    hintContent.classList.toggle('revealed');
    
    const hintTitle = element.querySelector('.hint-title span');
    hintTitle.textContent = hintContent.classList.contains('revealed') ? 'Hide Hint' : 'Show Hint';
}

// Validate flag submission
function validateFlag(event, correctFlag, category, challengeId) {
    event.preventDefault();
    
    if (!checkAuth()) {
        showNotification('Please login to submit flags', 'error');
        return;
    }
    
    const form = event.target;
    const input = form.querySelector('.flag-input');
    const button = form.querySelector('.submit-btn');
    const status = form.closest('.challenge-card').querySelector('.challenge-status');
    
    const userFlag = input.value.trim();
    
    if (userFlag === correctFlag) {
        // Correct flag
        showNotification('Correct flag! Challenge solved!', 'success');
        status.textContent = 'Solved';
        status.classList.remove('status-unsolved');
        status.classList.add('status-solved');
        
        button.textContent = 'Solved';
        button.classList.add('solved');
        button.disabled = true;
        
        // Save solved challenge to localStorage
        saveSolvedChallenge(challengeId, category);
        
        // Update stats
        updateStats();
        
        // Update dashboard if on dashboard page
        if (document.getElementById('recent-challenges')) {
            loadDashboard();
        }
    } else {
        // Incorrect flag
        showNotification('Incorrect flag. Try again!', 'error');
        input.value = '';
        input.focus();
    }
}

// Save solved challenge to localStorage
function saveSolvedChallenge(challengeId, category) {
    const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
    solvedChallenges[challengeId] = {
        solved: true,
        category: category,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('solvedChallenges', JSON.stringify(solvedChallenges));
}

// Load solved challenges and update UI
function loadSolvedChallenges() {
    const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
    
    for (const [challengeId, data] of Object.entries(solvedChallenges)) {
        const challengeElement = document.getElementById(challengeId);
        if (challengeElement && data.solved) {
            const status = challengeElement.querySelector('.challenge-status');
            const button = challengeElement.querySelector('.submit-btn');
            const form = challengeElement.querySelector('.flag-form');
            
            if (status) {
                status.textContent = 'Solved';
                status.classList.remove('status-unsolved');
                status.classList.add('status-solved');
            }
            
            if (button) {
                button.textContent = 'Solved';
                button.classList.add('solved');
                button.disabled = true;
            }
            
            if (form) {
                const input = form.querySelector('.flag-input');
                if (input) {
                    input.disabled = true;
                }
            }
        }
    }
    
    updateStats();
}

// Update statistics
function updateStats() {
    const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
    
    let total = 0;
    let crypto = 0;
    let reverse = 0;
    let web = 0;
    let forensics = 0;
    let misc = 0;
    
    for (const challenge of Object.values(solvedChallenges)) {
        if (challenge.solved) {
            total++;
            
            switch (challenge.category) {
                case 'crypto':
                    crypto++;
                    break;
                case 'reverse':
                    reverse++;
                    break;
                case 'web':
                    web++;
                    break;
                case 'forensics':
                    forensics++;
                    break;
                case 'misc':
                    misc++;
                    break;
            }
        }
    }
    
    // Update stats on challenges page
    if (document.getElementById('total-solved')) {
        document.getElementById('total-solved').textContent = total;
        document.getElementById('crypto-solved').textContent = crypto;
        document.getElementById('reverse-solved').textContent = reverse;
        document.getElementById('web-solved').textContent = web;
        document.getElementById('forensics-solved').textContent = forensics;
        document.getElementById('misc-solved').textContent = misc;
    }
    
    // Update stats on dashboard
    if (document.getElementById('dashboard-total')) {
        document.getElementById('dashboard-total').textContent = total;
        document.getElementById('dashboard-crypto').textContent = crypto;
        document.getElementById('dashboard-reverse').textContent = reverse;
        document.getElementById('dashboard-web').textContent = web;
        document.getElementById('dashboard-forensics').textContent = forensics;
        document.getElementById('dashboard-misc').textContent = misc;
    }
    
    // Update profile stats
    if (document.getElementById('profile-total')) {
        document.getElementById('profile-total').textContent = total;
        document.getElementById('profile-crypto').textContent = crypto;
        document.getElementById('profile-reverse').textContent = reverse;
        document.getElementById('profile-web').textContent = web;
        document.getElementById('profile-forensics').textContent = forensics;
        document.getElementById('profile-misc').textContent = misc;
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        localStorage.removeItem('solvedChallenges');
        showNotification('Progress has been reset', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Handle login
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
        // Regular user login
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[email];
        
        if (user && user.password === password) {
            setTimeout(() => {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', user.name);
                localStorage.setItem('isAdmin', 'false');
                
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
                showNotification('Login successful!', 'success');
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showNotification('Invalid email or password', 'error');
        }
    }
}

// Handle registration
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
            password: password, // In real app, this should be hashed
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Log the user in
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('isAdmin', 'false');
        
        registerBtn.innerHTML = 'Register';
        registerBtn.disabled = false;
        showNotification('Registration successful! You are now logged in.', 'success');
        window.location.href = 'dashboard.html';
    }, 1500);
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

// Load challenges from localStorage
function loadChallenges() {
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    
    // If no challenges in localStorage, use the hardcoded ones as fallback
    if (Object.keys(challenges).length === 0) {
        initializeDefaultChallenges();
        return;
    }
    
    // Clear existing challenge grids
    document.querySelectorAll('.challenge-grid').forEach(grid => {
        grid.innerHTML = '';
    });
    
    // Add each challenge to the appropriate category
    for (const [challengeId, challenge] of Object.entries(challenges)) {
        const challengeCard = document.createElement('div');
        challengeCard.className = `challenge-card ${challenge.category}-challenge`;
        challengeCard.id = challengeId;
        
        challengeCard.innerHTML = `
            <div class="challenge-header">
                <div>
                    <h3 class="challenge-title">${challenge.title}</h3>
                    <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                        ${challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </span>
                </div>
                <span class="challenge-status status-unsolved">Unsolved</span>
            </div>
            <p class="challenge-description">${challenge.description}</p>
            ${challenge.hint ? `
            <div class="hint-revealer" onclick="toggleHint(this)">
                <div class="hint-title">
                    <i class="fas fa-lightbulb"></i>
                    <span>Show Hint</span>
                </div>
                <div class="hint-content">${challenge.hint}</div>
            </div>` : ''}
            ${challenge.fileLink ? `
            <a href="${challenge.fileLink}" class="download-link" target="_blank">
                <i class="fas fa-download"></i> Download File
            </a>` : ''}
            ${challenge.creator ? `<p><strong>Creator:</strong> ${challenge.creator}</p>` : ''}
            <form class="flag-form" onsubmit="validateFlag(event, '${challenge.flag}', '${challenge.category}', '${challengeId}')">
                <input type="text" class="flag-input" placeholder="Enter flag: dedSEC{...}" required>
                <button type="submit" class="submit-btn">Submit Flag</button>
            </form>
        `;
        
        // Add to the appropriate category grid
        const categoryGrid = document.getElementById(`${challenge.category}-challenges`);
        if (categoryGrid) {
            categoryGrid.appendChild(challengeCard);
        }
    }
    
    // Load solved challenges to update UI
    loadSolvedChallenges();
}

// Initialize with default challenges if localStorage is empty
function initializeDefaultChallenges() {
    const defaultChallenges = {
        "challenge-crypto-1": {
            title: "Caesar Cipher",
            category: "crypto",
            difficulty: "easy",
            description: "Decrypt this message encrypted with a Caesar cipher: Kvvk zj r wvuv jkfev!",
            hint: "The shift is 9 positions",
            flag: "dedSEC{caesar_cipher_basics}",
            fileLink: "",
            creator: "DEDSEC Team",
            createdAt: new Date().toISOString()
        },
        "challenge-web-1": {
            title: "Simple Login Bypass",
            category: "web",
            difficulty: "easy",
            description: "Bypass the login form to get the flag. The form checks credentials client-side.",
            hint: "Check the page source for JavaScript validation",
            flag: "dedSEC{client_side_validation}",
            fileLink: "",
            creator: "DEDSEC Team",
            createdAt: new Date().toISOString()
        },
        "challenge-forensics-1": {
            title: "Hidden in Plain Sight",
            category: "forensics",
            difficulty: "medium",
            description: "There's more to this image than meets the eye. Find the hidden flag.",
            hint: "Check the file metadata and look for steganography",
            flag: "dedSEC{metadata_master}",
            fileLink: "",
            creator: "DEDSEC Team",
            createdAt: new Date().toISOString()
        },
        "challenge-reverse-1": {
            title: "Simple Reverse",
            category: "reverse",
            difficulty: "medium",
            description: "Analyze this binary to find the flag. What does it check for?",
            hint: "Use strings command or a disassembler",
            flag: "dedSEC{reverse_engineering_start}",
            fileLink: "",
            creator: "DEDSEC Team",
            createdAt: new Date().toISOString()
        },
        "challenge-misc-1": {
            title: "Binary Exploitation 101",
            category: "misc",
            difficulty: "hard",
            description: "Exploit the buffer overflow vulnerability in this program.",
            hint: "Look for buffer overflow in the input function",
            flag: "dedSEC{buffer_overflow_basics}",
            fileLink: "",
            creator: "DEDSEC Team",
            createdAt: new Date().toISOString()
        }
    };
    
    localStorage.setItem('challenges', JSON.stringify(defaultChallenges));
    loadChallenges();
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

// Load dashboard data
function loadDashboard() {
    updateStats();
    loadRecentActivity();
    updateUserWelcome();
}

// Load recent activity for dashboard
function loadRecentActivity() {
    const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    const recentContainer = document.getElementById('recent-challenges');
    const noActivity = document.getElementById('no-activity');
    
    if (Object.keys(solvedChallenges).length === 0) {
        if (noActivity) noActivity.style.display = 'block';
        return;
    }
    
    if (noActivity) noActivity.style.display = 'none';
    if (recentContainer) recentContainer.innerHTML = '';
    
    // Sort by timestamp (newest first) and take last 3
    const sortedChallenges = Object.entries(solvedChallenges)
        .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
        .slice(0, 3);
    
    sortedChallenges.forEach(([challengeId, data]) => {
        const challenge = challenges[challengeId];
        if (challenge && recentContainer) {
            const activityCard = document.createElement('div');
            activityCard.className = 'challenge-card solved-challenge';
            activityCard.innerHTML = `
                <div class="challenge-header">
                    <h3 class="challenge-title">${challenge.title}</h3>
                    <span class="challenge-status status-solved">Solved</span>
                </div>
                <p class="challenge-description">Category: ${challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}</p>
                <p class="challenge-description">Solved on: ${new Date(data.timestamp).toLocaleDateString()}</p>
                <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                    ${challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </span>
            `;
            recentContainer.appendChild(activityCard);
        }
    });
}

// Update user welcome message
function updateUserWelcome() {
    const userWelcome = document.getElementById('user-welcome');
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
    
    if (userName && userWelcome) {
        userWelcome.textContent = `Welcome, ${userName}`;
    }
}

// Admin Functions
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

// Initialize the application
function initApp() {
    // Load challenges when the page loads
    if (document.querySelector('.challenge-grid')) {
        const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
        if (Object.keys(challenges).length === 0) {
            initializeDefaultChallenges();
        } else {
            loadChallenges();
        }
        setupCategoryNavigation();
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
    
    // Load profile when on profile page
    if (document.getElementById('profile-stats')) {
        loadProfile();
    }
    
    // Check authentication status and update UI
    updateAuthUI();
}

// Load profile data
function loadProfile() {
    updateStats();
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
    const userEmail = localStorage.getItem('userEmail');
    
    if (document.getElementById('profile-name')) {
        document.getElementById('profile-name').textContent = userName;
    }
    if (document.getElementById('profile-email')) {
        document.getElementById('profile-email').textContent = userEmail;
    }
    
    loadProfileChallenges();
}

// Load challenges for profile page
function loadProfileChallenges() {
    const solvedChallenges = JSON.parse(localStorage.getItem('solvedChallenges')) || {};
    const challenges = JSON.parse(localStorage.getItem('challenges')) || {};
    const profileChallenges = document.getElementById('profile-challenges');
    
    if (!profileChallenges) return;
    
    if (Object.keys(solvedChallenges).length === 0) {
        profileChallenges.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-flag"></i>
                </div>
                <div class="empty-text">No challenges solved yet. Start solving challenges to see your progress here!</div>
            </div>
        `;
        return;
    }
    
    profileChallenges.innerHTML = '';
    
    Object.entries(solvedChallenges)
        .sort(([,a], [,b]) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach(([challengeId, data]) => {
            const challenge = challenges[challengeId];
            if (challenge) {
                const challengeCard = document.createElement('div');
                challengeCard.className = 'challenge-card solved-challenge';
                challengeCard.innerHTML = `
                    <div class="challenge-header">
                        <h3 class="challenge-title">${challenge.title}</h3>
                        <span class="challenge-status status-solved">Solved</span>
                    </div>
                    <p class="challenge-description">${challenge.description}</p>
                    <div class="challenge-meta">
                        <span class="challenge-category category-${challenge.category}">
                            ${challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                        </span>
                        <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                            ${challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </span>
                        <span class="challenge-date">
                            Solved on: ${new Date(data.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                `;
                profileChallenges.appendChild(challengeCard);
            }
        });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);