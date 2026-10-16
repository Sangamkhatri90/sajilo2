
                        // Function to display the selected date and its corresponding day of the week
                        function displayDateAndDay(dateId, dayId) {
                            const dateValue = document.getElementById(dateId).value;
                            const dateObj = new Date(dateValue);

                            // Get the corresponding day of the week
                            const dayOfWeek = getDayOfWeek(dateObj);

                            // Set the value of the day of the week text field
                            document.getElementById(dayId).value = dayOfWeek;
                        }

                        // Function to get the day of the week from a date object
                        function getDayOfWeek(date) {
                            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            return daysOfWeek[date.getDay()];
                        }

                        // Function to calculate the day difference between Date 1 and Date 2
                        function calculateDayDifference() {
                            const date1 = new Date(document.getElementById('date1').value);
                            const date2 = new Date(document.getElementById('date2').value);

                            // Ensure both dates are selected
                            if (!date1 || !date2) {
                                showCustomAlert('Please select both dates!');
                                return;
                            }

                            // Calculate the difference in milliseconds
                            const timeDifference = date2 - date1;

                            // Convert milliseconds to days
                            const dayCount = timeDifference / (1000 * 3600 * 24);

                            // Display the day count
                            document.getElementById('dayCount').value = Math.abs(dayCount);
                        }
                   