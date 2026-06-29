(function (global) {
    const pendingRequests = {};
    const debounceTimers = {};

    function fetchMemberName({ inputId, outputId, fetchUrl, requestKey }) {
        if (!inputId || !outputId || !fetchUrl || !requestKey) {
            return;
        }

        const input = document.getElementById(inputId);
        const output = document.getElementById(outputId);

        if (!input || !output) {
            return;
        }

        const accountNumber = input.value.trim();
        if (!accountNumber) {
            output.value = '';
            return;
        }

        const requestKeyId = `${inputId}:${outputId}`;
        const requestId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

        if (debounceTimers[requestKeyId]) {
            clearTimeout(debounceTimers[requestKeyId]);
        }

        debounceTimers[requestKeyId] = setTimeout(() => {
            pendingRequests[requestKeyId] = requestId;

            fetch(fetchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [requestKey]: accountNumber })
            })
                .then(r => r.json())
                .then(data => {
                    if (pendingRequests[requestKeyId] !== requestId) {
                        return;
                    }

                    const memberDetail = data.MemberDetail || data.MemberName || data.memberName || '';
                    if (memberDetail) {
                        output.value = memberDetail;
                    } else {
                        output.value = data.message || 'Invalid Account Number';
                    }
                })
                .catch(err => {
                    if (pendingRequests[requestKeyId] !== requestId) {
                        return;
                    }

                    console.error('Error fetching member name:', err);
                    output.value = 'Error fetching data';
                });
        }, 250);
    }

    global.fetchMemberName = fetchMemberName;
})(window);