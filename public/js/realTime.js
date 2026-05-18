    // Function to convert number to words
    function numberToWords(num) {
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const g = ['', 'Thousand', 'Lakh', 'Crore', 'Arab'];
      
      // Check if the number is negative
      if (num < 0) {
        return '(' + numberToWords(Math.abs(num)) + ')'; // Recursively call for positive part and wrap in parentheses
      }

      if (num === 0) return 'Zero';
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? '-' + a[num % 10] : '');

      let word = '', unitIndex = 0;
      while (num > 0) {
        const chunk = num % 1000;
        if (chunk) word = chunkToWords(chunk, a, b) + (g[unitIndex] ? ' ' + g[unitIndex] : '') + ' ' + word;
        num = Math.floor(num / 1000);
        unitIndex++;
      }
      return word.trim();
    }

    function chunkToWords(chunk, a, b) {
      const hundred = Math.floor(chunk / 100);
      const remainder = chunk % 100;
      return (hundred ? a[hundred] + ' Hundred' + (remainder ? ' and ' : '') : '') + (remainder < 20 ? a[remainder] : b[Math.floor(remainder / 10)] + (remainder % 10 ? '-' + a[remainder % 10] : ''));
    }

    // Function to update total and total in words
    function updateTotal() {
      const amount = parseFloat(document.getElementById("amount").value) || 0;
      const penalty = parseFloat(document.getElementById("penalty").value) || 0;
      const rebate = parseFloat(document.getElementById("rebate").value) || 0;
      const total = amount + penalty - rebate;

      // Display the total
      document.getElementById("total").value = total;

      // Display the total in words
      if (!isNaN(total)) {
        document.getElementById("totalInWords").value = numberToWords(Math.floor(total));
      } else {
        document.getElementById("totalInWords").value = "";
      }
    }