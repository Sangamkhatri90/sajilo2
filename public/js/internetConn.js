
        const banner = document.getElementById('connection-status-banner');

        function updateOnlineStatus() {
            if (navigator.onLine) {
                banner.textContent = "Internet connection restored.";
                banner.classList.add('online');
                banner.style.display = 'block';
                // Hide banner after 3 seconds
                setTimeout(() => {
                    banner.style.display = 'none';
                    banner.classList.remove('online');
                }, 3000);
            } else {
                banner.innerHTML = `
        Your internet connection seems to be interrupted, so some features and services will not be available although some features seem to be running.<br>
        It is recommended to check your internet connection.
      `;
                banner.classList.remove('online');
                banner.style.display = 'block';
                // Hide banner after 3 seconds
                setTimeout(() => {
                    banner.style.display = 'none';
                    banner.classList.remove('online');
                }, 10000);
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Initial check on page load
        if (!navigator.onLine) {
            updateOnlineStatus();
        }
