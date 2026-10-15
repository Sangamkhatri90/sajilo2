(() => {
    let rows = [];
    let busy = false;
    let aliasLength;
    let formatTimeout;
    let searchLoadingTimer;

    // Helpers
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const money = (value) => Number(value || 0).toFixed(2);
    const notify = (message) => {
        if (typeof window.showCustomAlert === 'function') window.showCustomAlert(message);
        else window.alert(message);
    };

    function setSearchLoading(active) {
        const loader = document.getElementById('page-loader');
        const bar = document.getElementById('loader-bar');
        const number = document.getElementById('loader-num');
        const text = loader?.querySelector('.loader-text');
        if (!loader || !bar || !number || !text) return;

        if (active) {
            clearInterval(searchLoadingTimer);
            let progress = 20;
            bar.style.width = '20%';
            number.textContent = '20%';
            text.lastChild.nodeValue = ' Searching member…';
            loader.classList.remove('hidden');
            loader.setAttribute('aria-hidden', 'false');
            searchLoadingTimer = setInterval(() => {
                progress = Math.min(90, progress + 4);
                bar.style.width = `${progress}%`;
                number.textContent = `${progress}%`;
            }, 160);
            return;
        }

        clearInterval(searchLoadingTimer);
        bar.style.width = '100%';
        number.textContent = '100%';
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.setAttribute('aria-hidden', 'true');
            bar.style.width = '0%';
            text.lastChild.nodeValue = ' Loading…';
        }, 180);
    }

    // API
    async function fetchMember(alias) {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alias })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to search for this member.');
        return result;
    }

    async function getAliasLength() {
        if (aliasLength) return aliasLength;
        const response = await fetch('/api/membersearchdigitcheck');
        const result = await response.json();
        aliasLength = Number(result.bodyLength) || 7;
        return aliasLength;
    }

    // Render
    function renderError(message) {
        notify(message);
    }

    function renderResult(memberName, resultRows, alias) {
        rows = resultRows;
        const firstRow = rows[0] || {};
        const hasPhoto = firstRow.Photo && firstRow.Photo !== 'No Photo Available';
        const hasSignature = firstRow.Sign1 && firstRow.Sign1 !== 'No Signature Available';
        const photo = hasPhoto
            ? `<img data-member-media="photo" src="${esc(firstRow.Photo)}" alt="Member photo">`
            : '<div class="searched-member-media-fallback">No photo available</div>';
        const signature = hasSignature
            ? `<img data-member-media="signature" src="${esc(firstRow.Sign1)}" alt="Member signature">`
            : '<div class="searched-member-media-fallback">No signature available</div>';
        const accountRows = rows.map((row, index) => `
            <tr data-index="${index}">
                <td class="display-table-td">${esc(row.SlAlias)}</td>
                <td class="display-table-td">${esc(row.GLName)}</td>
                <td class="display-table-td">${esc(row.SLName)}</td>
                <td class="balance" data-balance="${esc(money(row.Balance))}">${esc(money(row.Balance))}</td>
                
            </tr>`).join('');

        const container = document.getElementById('searchResultContainer');
        container.innerHTML = `
            <div class="body1">
                <form id="searcheddataform">
                    <fieldset class="pvm-fieldset">
                        <legend class="search-result">Searched Results</legend>
                        <button type="button" id="closeSearchedDataForm" class="close-x" title="Close search results">&times;</button>
                        <input type="hidden" id="searchedMemberId" name="MemberId" value="${esc(alias)}">
                        <div class="display-table">
                            <fieldset id="searched-member-details">
                                <legend>Member Details</legend>
                                <div id="searched-member-header">
                                    <div><h2 id="membervalue">Member Name: ${esc(memberName)}</h2></div>
                                    <div id="searched-member-media">
                                        <div class="searched-member-media-item"><span>Photo</span>${photo}</div>
                                        <div class="searched-member-media-item"><span>Signature</span>${signature}</div>
                                    </div>
                                </div>
                            </fieldset>
                            <div class="searched-data-actions">
                                <div><button type="button" id="createMemberBtn" class="Crebtn">New Account</button></div>
                                <div class="choose-transaction">
                                    <label for="actionSelect">Choose an action:</label>
                                    <select id="actionSelect" style="background-color: #dedada; border: 1px solid #ccc;">
                                        <option value="transaction">Transaction</option>
                                        <option value="bigTransaction">Multi Transaction</option>
                                        <option value="openingBalance">Opening Balance</option>
                                    </select>
                                </div>
                            </div>
                            <fieldset id="searched-account-details">
                                <legend>Account Details</legend>
                                <table border="1" id="selectedTable" class="highlight-table">
                                    <thead><tr><th class="display-table-th">Account Id</th><th class="display-table-th">Account Type</th><th class="display-table-th">Account Name</th><th class="display-table-th">Balance</th></tr></thead>
                                    <tbody>${accountRows}</tbody>
                                </table>
                            </fieldset>
                        </div>
                    </fieldset>
                </form>
            </div>`;
        container.querySelectorAll('img[data-member-media]').forEach(image => {
            image.addEventListener('error', () => {
                const fallback = document.createElement('div');
                fallback.className = 'searched-member-media-fallback';
                fallback.textContent = image.dataset.memberMedia === 'photo'
                    ? 'Unable to display photo'
                    : 'Unable to display signature';
                image.replaceWith(fallback);
            }, { once: true });
        });
        window.showSearchedDataForm?.();
    }

    // Flow
    async function runSearch() {
        if (busy) return;
        const input = document.getElementById('alias');
        const checkbox = document.getElementById('autoformatmemberalias');
        let alias = input.value.trim();
        if (!alias) {
            rows = [];
            return renderError('Member alias is required.');
        }

        busy = true;
        setSearchLoading(true);
        try {
            if (checkbox.checked) {
                const requiredLength = await getAliasLength();
                if (alias.length > requiredLength) {
                    rows = [];
                    renderError(`Invalid member alias. It cannot exceed ${requiredLength} digits.`);
                    return;
                }
                alias = alias.padStart(requiredLength, '0');
                input.value = alias;
            }
            const result = await fetchMember(alias);
            renderResult(result.memberName, result.rows, alias);
        } catch (error) {
            rows = [];
            renderError(error.message);
        } finally {
            busy = false;
            setSearchLoading(false);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('.search-form');
        const container = document.getElementById('searchResultContainer');
        const aliasInput = document.getElementById('alias');
        const autoFormatCheckbox = document.getElementById('autoformatmemberalias');

        aliasInput?.addEventListener('input', () => {
            clearTimeout(formatTimeout);
            if (!autoFormatCheckbox?.checked || !aliasInput.value.trim()) return;

            formatTimeout = setTimeout(async () => {
                const typedAlias = aliasInput.value.trim();
                try {
                    const requiredLength = await getAliasLength();
                    if (typedAlias === aliasInput.value.trim() && typedAlias.length <= requiredLength) {
                        aliasInput.value = typedAlias.padStart(requiredLength, '0');
                    }
                } catch (error) {
                    console.error('Unable to auto-format member alias:', error);
                }
            }, 500);
        });

        form?.addEventListener('submit', event => {
            event.preventDefault();
            runSearch();
        });

        container?.addEventListener('click', event => {
            if (event.target.closest('#closeSearchedDataForm')) {
                window.hideSearchedDataForm?.();
                return;
            }
            if (event.target.closest('#createMemberBtn')) {
                const memberId = document.getElementById('searchedMemberId')?.value;
                if (!memberId) return;
                document.getElementById('createAccountFrame').src = `/account/createAccount?MemberId=${encodeURIComponent(memberId)}`;
                const accountPanel = document.getElementById('movableDiv195');
                accountPanel.style.zIndex = '10000';
                accountPanel.style.display = 'block';
                return;
            }
            const row = event.target.closest('tr[data-index]');
            if (row) {
                container.querySelectorAll('tr.highlight').forEach(item => item.classList.remove('highlight'));
                row.classList.add('highlight');
            }
        });

        container?.addEventListener('dblclick', event => {
            const element = event.target.closest('tr[data-index]');
            if (!element) return;
            const row = rows[Number(element.dataset.index)];
            if (!row || typeof window.handleRowClick !== 'function') return;
            window.handleRowClick(row.SlAlias, row.GLName, row.MemberAlias, row.SLName,
                row.Address1, row.Phone1, row.Mobile, row.AccountOpenDate, row.Photo,
                row.Sign1, row.Sign2, row.Sign3, row.Sign4, row.Gender, row.NextofKinName,
                row.NextofKinAddress, row.NextofKinContactNumber, row.Relation, row.DOB,
                row.JV_Miti, row.VoucherNo, row.MemberName, row.JournalEntries);
        });
    });
})();
