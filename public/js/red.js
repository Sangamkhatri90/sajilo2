
  document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with class 'balance'
    const balanceElements = document.querySelectorAll('.balance');
    
    balanceElements.forEach(function(balanceElement) {
      // Get the balance from the data attribute
      const balance = parseFloat(balanceElement.getAttribute('data-balance'));
      
      // Check if the balance is negative
      if (balance < 0) {
        // If negative, set the text color to red
        balanceElement.style.color = 'red';
      }
    });
  });

