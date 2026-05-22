
                document.addEventListener("DOMContentLoaded", () => {
                    // Select ALL forms with class "enter-nav"
                    const forms = document.querySelectorAll("form.enter-navagation");

                    forms.forEach(form => {
                        // Get inputs for this form only
                        const inputs = Array.from(form.querySelectorAll("input, select, textarea"))
                            .filter(el => !["submit", "button", "checkbox", "radio"].includes(el.type));

                        form.addEventListener("keydown", (e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // Stop form submit on Enter

                                const currentIndex = inputs.indexOf(document.activeElement);

                                if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
                                    inputs[currentIndex + 1].focus(); // Move to next field
                                } else if (currentIndex === inputs.length - 1) {
                                    // Last field reached
                                    const submitBtn = form.querySelector("[type='submit']");
                                    if (submitBtn) submitBtn.focus(); // focus the submit button
                                    // If you want it to auto-submit, replace .focus() with .click()
                                }
                            }
                        });
                    });
                });
  