/* ==========================================================================
   AUTHENTICATION INPUT VALIDATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    
    // ----------------- Password Strength Indicator -----------------
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            let score = 0;
            
            if (val.length === 0) {
                strengthIndicator.style.backgroundColor = 'transparent';
                strengthIndicator.style.width = '0%';
                return;
            }
            
            if (val.length >= 6) score++;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;
            
            // Map scores to progress and colors
            if (score <= 1) {
                strengthIndicator.style.backgroundColor = '#ef4444'; // Red
                strengthIndicator.style.width = '25%';
            } else if (score <= 3) {
                strengthIndicator.style.backgroundColor = '#f59e0b'; // Orange
                strengthIndicator.style.width = '60%';
            } else {
                strengthIndicator.style.backgroundColor = '#10b981'; // Green
                strengthIndicator.style.width = '100%';
            }
        });
    }
    
    // ----------------- Register Form Check -----------------
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (!name) {
                e.preventDefault();
                showToast('Please enter your full name.', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                e.preventDefault();
                showToast('Please enter a valid corporate or public email address.', 'error');
                return;
            }
            
            if (password.length < 8) {
                e.preventDefault();
                showToast('Password must contain at least 8 characters.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                e.preventDefault();
                showToast('Passwords do not match. Please verify and try again.', 'error');
                return;
            }
        });
    }
    
    // ----------------- Login Form Check -----------------
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!validateEmail(email)) {
                e.preventDefault();
                showToast('Please enter a valid email address format.', 'error');
                return;
            }
            
            if (!password) {
                e.preventDefault();
                showToast('Please provide your account password.', 'error');
                return;
            }
        });
    }
    
    // Helper function to validate email structure
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return re.test(email);
    }
});
