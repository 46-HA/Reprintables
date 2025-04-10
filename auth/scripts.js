// JavaScript for user authentication with local storage

// Show Login Form
function showLoginForm() {
    document.getElementById('login-modal').style.display = 'block';
}

// Close Login Form
function closeLoginForm() {
    document.getElementById('login-modal').style.display = 'none';
}

// Show Sign Up Form
function showSignupForm() {
    document.getElementById('signup-modal').style.display = 'block';
}

// Close Sign Up Form
function closeSignupForm() {
    document.getElementById('signup-modal').style.display = 'none';
}

// Handle Login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        alert('Login successful!');
        closeLoginForm();
        // Redirect to dashboard or main page
    } else {
        alert('Invalid email or password');
    }
});

// Handle Signup
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userExists = users.find(user => user.email === email);

    if (userExists) {
        alert('User already exists!');
    } else {
        const newUser = { email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign up successful!');
        closeSignupForm();
    }
});
