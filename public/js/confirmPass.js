
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const messageElement = document.getElementById('messages');
  
    function checkPasswords() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
  
        if (password && confirmPassword) {
            if (password === confirmPassword) {
                messageElement.textContent = 'Passwords match.';
                messageElement.className = 'success';
            } else {
                messageElement.textContent = 'Passwords do not match.';
                messageElement.className = 'errors';
            }
        } else {
            messageElement.textContent = '';
            messageElement.className = '';
        }
    }
  
    passwordInput.addEventListener('input', checkPasswords);
    confirmPasswordInput.addEventListener('input', checkPasswords);
  
    document.getElementById("myButton").addEventListener("click", function(event) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            event.preventDefault();
            showCustomAlert('Passwords do not match!');
        }
    });
  });