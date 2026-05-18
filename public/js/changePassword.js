 
    const form = document.getElementById('changePasswordForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        messageDiv.textContent = '';
        messageDiv.className = 'message';

        try {
            const response = await axios.post('/change-password', {
                currentPassword,
                newPassword,
                confirmPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you are storing JWT in localStorage
                }
            });

            messageDiv.textContent = response.data.message;
            messageDiv.classList.add('success');
        } catch (error) {
            if (error.response) {
                messageDiv.textContent = error.response.data.message;
                messageDiv.classList.add('error');
            } else {
                messageDiv.textContent = 'An error occurred';
                messageDiv.classList.add('error');
            }
        }
    });
