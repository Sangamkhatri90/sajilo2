document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[action="/submit/createMem"], form[action="/account/createAccount"]');
    if (!form) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form)
            });
            const responseText = await response.text();
            let message = responseText;

            try {
                const responseData = JSON.parse(responseText);
                message = responseData.message || responseData.error || responseText;
            } catch (error) {
                // The existing create routes return plain text for most responses.
            }

            if (!response.ok) {
                throw new Error(message || 'Unable to save the form.');
            }

            alert(message || 'Saved successfully.');
        } catch (error) {
            alert(error.message || 'Unable to save the form. Please correct the details and try again.');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
});
