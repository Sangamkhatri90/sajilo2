function fetchMemberName({ inputId, outputId, fetchUrl, requestKey }) {
    const accountNumber = document.getElementById(inputId).value.trim();
    if (!accountNumber) return;

    fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [requestKey]: accountNumber })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById(outputId).value = data.MemberDetail || 'Invalid Account Number';
    })
    .catch(err => {
        console.error('Error fetching member name:', err);
        document.getElementById(outputId).value = 'Error fetching data';
    });
}