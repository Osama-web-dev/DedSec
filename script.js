// Firebase configuration - Replace with your project's config
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
            loadChallenges();
            loadSolvedChallenges();
        } else {
            // User is signed out
            currentUser = null;
            updateUIForUser();
            showSection('home');
        }
    });
    
    // Set up category navigation
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
    
    // Show home section by default
    showSection('home');
});

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // If showing challenges, update the stats
    if (sectionId === 'challenges') {
        updateStats();
    }
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
        
        // Save solved challenge to Firebase
        if (currentUser) {
            const userProgressRef = database.ref('userProgress/' + currentUser.uid + '/' + challengeId);
            userProgressRef.set({
                solved: true,
                category: category,
                timestamp: new Date().toISOString()
            });
        }
        
        // Update stats
        updateStats();
    } else {
        // Incorrect flag
        showNotification('Incorrect flag. Try again!', 'error');
        input.value = '';
        input.focus();
    }
}

// Load solved challenges and update UI
function loadSolvedChallenges() {
    if (!currentUser) return;
    
    const userProgressRef = database.ref('userProgress/' + currentUser.uid);
    userProgressRef.once('value')
        .then(snapshot => {
            const solvedChallenges = snapshot.val() || {};
            
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
        })
        .catch(error => {
            console.error('Error loading solved challenges:', error);
            showNotification('Error loading your progress', 'error');
        });
}

// Update statistics
function updateStats() {
    if (!currentUser) return;
    
    const userProgressRef = database.ref('userProgress/' + currentUser.uid);
    userProgressRef.once('value')
        .then(snapshot => {
            const solvedChallenges = snapshot.val() || {};
            
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
            
            document.getElementById('total-solved').textContent = total;
            document.getElementById('crypto-solved').textContent = crypto;
            document.getElementById('reverse-solved').textContent = reverse;
            document.getElementById('web-solved').textContent = web;
            document.getElementById('forensics-solved').textContent = forensics;
            document.getElementById('misc-solved').textContent = misc;
        })
        .catch(error => {
            console.error('Error updating stats:', error);
        });
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        if (currentUser) {
            const userProgressRef = database.ref('userProgress/' + currentUser.uid);
            userProgressRef.remove()
                .then(() => {
                    showNotification('Progress has been reset', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error resetting progress:', error);
                    showNotification('Error resetting progress', 'error');
                });
        }
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Handle login with Firebase Auth
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    
    // Show loading state
    loginBtn.innerHTML = '<span class="loading"></span> Logging in...';
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showNotification('Login successful!', 'success');
            showSection('home');
        })
        .catch((error) => {
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showNotification(error.message, 'error');
        });
}

// Handle registration with Firebase Auth
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
    
    // Show loading state
    registerBtn.innerHTML = '<span class="loading"></span> Creating account...';
    registerBtn.disabled = true;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            
            // Create user profile in Firebase Database
            const userData = {
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            };
            
            database.ref('users/' + user.uid).set(userData)
                .then(() => {
                    registerBtn.innerHTML = 'Register';
                    registerBtn.disabled = false;
                    showNotification('Registration successful! You are now logged in.', 'success');
                    showSection('home');
                })
                .catch((error) => {
                    registerBtn.innerHTML = 'Register';
                    registerBtn.disabled = false;
                    showNotification('Error saving user data: ' + error.message, 'error');
                });
        })
        .catch((error) => {
            registerBtn.innerHTML = 'Register';
            registerBtn.disabled = false;
            showNotification(error.message, 'error');
        });
}

// Logout
function logout() {
    auth.signOut()
        .then(() => {
            showNotification('Logged out successfully', 'success');
            showSection('home');
        })
        .catch((error) => {
            showNotification('Error signing out: ' + error.message, 'error');
        });
}

// Update UI based on user login state
function updateUIForUser() {
    const loginNav = document.getElementById('login-nav');
    const registerNav = document.getElementById('register-nav');
    const logoutNav = document.getElementById('logout-nav');
    const adminNav = document.getElementById('admin-nav');
    
    if (currentUser) {
        loginNav.style.display = 'none';
        registerNav.style.display = 'none';
        logoutNav.style.display = 'block';
        
        if (currentUser.isAdmin) {
            adminNav.style.display = 'block';
            populateRemoveChallengeDropdown();
        } else {
            adminNav.style.display = 'none';
        }
    } else {
        loginNav.style.display = 'block';
        registerNav.style.display = 'block';
        logoutNav.style.display = 'none';
        adminNav.style.display = 'none';
    }
}

// Add new challenge to Firebase (admin function)
function addChallenge(event) {
    event.preventDefault();
    
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('You must be an admin to add challenges', 'error');
        return;
    }
    
    const title = document.getElementById('challenge-title').value;
    const category = document.getElementById('challenge-category').value;
    const creator = document.getElementById('challenge-creator').value;
    const difficulty = document.getElementById('challenge-difficulty').value;
    const description = document.getElementById('challenge-description').value;
    const hint = document.getElementById('challenge-hint').value;
    const flag = document.getElementById('challenge-flag').value;
    const fileLink = document.getElementById('challenge-file-link').value;
    const addChallengeBtn = document.getElementById('add-challenge-btn');
    
    // Generate a unique ID for the challenge
    const challengeId = 'challenge-' + Math.random().toString(36).substr(2, 9);
    
    // Show loading state
    addChallengeBtn.innerHTML = '<span class="loading"></span> Adding...';
    addChallengeBtn.disabled = true;
    
    // Add new challenge to Firebase
    const challengeData = {
        title: title,
        category: category,
        difficulty: difficulty,
        description: description,
        hint: hint,
        flag: flag,
        fileLink: fileLink,
        creator: creator,   // <--- add this
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
    };

    
    database.ref('challenges/' + challengeId).set(challengeData)
        .then(() => {
            addChallengeBtn.innerHTML = 'Add Challenge';
            addChallengeBtn.disabled = false;
            showNotification('Challenge added successfully!', 'success');
            event.target.reset();
            loadChallenges(); // Reload challenges to show the new one
            populateRemoveChallengeDropdown(); // Update the remove dropdown
        })
        .catch((error) => {
            addChallengeBtn.innerHTML = 'Add Challenge';
            addChallengeBtn.disabled = false;
            showNotification('Error adding challenge: ' + error.message, 'error');
        });
}

// Remove challenge from Firebase (admin function)
function removeChallenge() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('You must be an admin to remove challenges', 'error');
        return;
    }
    
    const challengeId = document.getElementById('remove-challenge').value;
    
    if (!challengeId) {
        showNotification('Please select a challenge to remove', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to remove this challenge? This action cannot be undone.')) {
        database.ref('challenges/' + challengeId).remove()
            .then(() => {
                showNotification('Challenge removed successfully!', 'success');
                loadChallenges(); // Reload challenges
                populateRemoveChallengeDropdown(); // Update the remove dropdown
            })
            .catch((error) => {
                showNotification('Error removing challenge: ' + error.message, 'error');
            });
    }
}

// Populate the remove challenge dropdown
function populateRemoveChallengeDropdown() {
    if (!currentUser || !currentUser.isAdmin) return;
    
    const removeSelect = document.getElementById('remove-challenge');
    removeSelect.innerHTML = '<option value="">-- Select Challenge --</option>';
    
    database.ref('challenges').once('value')
        .then(snapshot => {
            const challenges = snapshot.val() || {};
            
            for (const [challengeId, challenge] of Object.entries(challenges)) {
                const option = document.createElement('option');
                option.value = challengeId;
                option.textContent = challenge.title;
                removeSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error loading challenges for removal:', error);
        });
}

// Load challenges from Firebase
function loadChallenges() {
    database.ref('challenges').once('value')
        .then(snapshot => {
            const challenges = snapshot.val() || {};
            
            // If no challenges in Firebase, use the hardcoded ones as fallback
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
                document.getElementById(`${challenge.category}-challenges`).appendChild(challengeCard);
            }
            
            // Load solved challenges to update UI
            if (currentUser) {
                loadSolvedChallenges();
            }
        })
        .catch(error => {
            console.error('Error loading challenges:', error);
            showNotification('Error loading challenges', 'error');
        });
}

// Initialize with default challenges if Firebase is empty
function initializeDefaultChallenges() {
    const defaultChallenges = {
        
    };
    
    // Save default challenges to Firebase
    database.ref('challenges').set(defaultChallenges)
        .then(() => {
            loadChallenges(); // Recursively call to load the default challenges
        })
        .catch(error => {
            console.error('Error saving default challenges:', error);
            showNotification('Error initializing challenges', 'error');
        });
}