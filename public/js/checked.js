document.getElementById('myForm15').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const mainSelectAllCheckBox = document.getElementById('mainSelectAllCheckBox');
    const accountGroupCheckBox = document.getElementById('accountGroupCheckBox');
    const ledgerCheckBox = document.getElementById('ledgerCheckBox');
    const subLedgerCheckBox = document.getElementById('subLedgerCheckBox');
    const TACodeSetupCheckBox = document.getElementById('TACodeSetupCheckBox');
    const TACodeCheckBox = document.getElementById('TACodeCheckBox');
    const voucherCheckBox = document.getElementById('voucherCheckBox');
    const printDesignCheckBox = document.getElementById('printDesignCheckBox');
    const docClassCheckBox = document.getElementById('docClassCheckBox');
    const areaCheckBox = document.getElementById('areaCheckBox');
    const accountSubGroupCheckBox = document.getElementById('accountSubGroupCheckBox');
    const CMGrpSummaryDiv = document.getElementById('CMGrpSummaryDiv');
    const CMgrpSummaryTable = document.getElementById('CMgrpSummaryTable');
    const CMSubGrpSummaryDiv = document.getElementById('CMSubGrpSummaryDiv');
    const CMSubgrpSummaryTable = document.getElementById('CMSubgrpSummaryTable');
    const CMLedgerMasterSummaryDiv = document.getElementById('CMLedgerMasterSummaryDiv');
    const CMLedgerMasterSummaryTable = document.getElementById('CMLedgerMasterSummaryTable');
    const CMLedgerMasterDiv = document.getElementById('CMLedgerMasterDiv');
    const CMLedgerMasterTable = document.getElementById('CMLedgerMasterTable');
    const CMDocClassMasterDiv = document.getElementById('CMDocClassMasterDiv');
    const CMDocClassMasterTable = document.getElementById('CMDocClassMasterTable');
    const CMSubLedgerMasterDiv = document.getElementById('CMSubLedgerMasterDiv');
    const CMSubLedgerMasterTable = document.getElementById('CMSubLedgerMasterTable');
    const CMTACodeSetupMasterDiv = document.getElementById('CMTACodeSetupMasterDiv');
    const CMTACodeSetupMasterTable = document.getElementById('CMTACodeSetupMasterTable');
    const CMTACodeMasterDiv = document.getElementById('CMTACodeMasterDiv');
    const CMTACodeMasterTable = document.getElementById('CMTACodeMasterTable');
    const CMVoucherMasterDiv = document.getElementById('CMVoucherMasterDiv');
    const CMVoucherMasterTable = document.getElementById('CMVoucherMasterTable');
    const CMAreaMasterDiv = document.getElementById('CMAreaMasterDiv');
    const CMAreaMasterTable = document.getElementById('CMAreaMasterTable');
    const copymastersource = document.getElementById('copymaster-source').value;
    const [orgName, orgAlias] = copymastersource.split('|');
    let highestZIndex = 3;

    // Function to bring the div to the front by updating the z-index
    function bringToFront(element) {
        highestZIndex++;
        element.style.zIndex = highestZIndex;
    }

    // Make div movable
    function makeDivMovable(div) {
        let isDragging = false;
        let offsetX, offsetY;

        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // Allow interaction with input fields
            }
            e.preventDefault();
            bringToFront(div);

            const rect = div.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            isDragging = true;
        });


        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                div.style.left = `${e.pageX - offsetX}px`;
                div.style.top = `${e.pageY - offsetY}px`;
                div.style.position = 'absolute';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }


    makeDivMovable(CMGrpSummaryDiv);
    makeDivMovable(CMSubGrpSummaryDiv);
    makeDivMovable(CMLedgerMasterSummaryDiv);
    makeDivMovable(CMLedgerMasterDiv);
    makeDivMovable(CMDocClassMasterDiv);
    makeDivMovable(CMSubLedgerMasterDiv);
    makeDivMovable(CMTACodeSetupMasterDiv);
    makeDivMovable(CMTACodeMasterDiv);
    makeDivMovable(CMVoucherMasterDiv);
    makeDivMovable(CMAreaMasterDiv);
    if (mainSelectAllCheckBox.checked) {
        const form = event.target;

        const data = {
            source: document.getElementById('copymaster-source').value,
            orgfystart: document.getElementById('fy-start').value,
            orgfyend: document.getElementById('fy-end').value,
            accountGroup: form.accountGroup?.checked ? 'on' : undefined,
            ledgerMaster: form.ledgerMaster?.checked ? 'on' : undefined,
            subledgerMaster: form.subledgerMaster?.checked ? 'on' : undefined,
            taCodeSetup: form.taCodeSetup?.checked ? 'on' : undefined,
            taCode: form.taCode?.checked ? 'on' : undefined,
            voucherMenu: form.voucherMenu?.checked ? 'on' : undefined,
            docClass: form.docClass?.checked ? 'on' : undefined,
            area: document.getElementById('areaCheckBox')?.checked ? 'on' : undefined,
            accountSubGrp: form.accountSubGrp?.checked ? 'on' : undefined
        };

        try {
            const res = await fetch('/copy-master', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            // ✅ Use backend-provided message directly
            showCustomAlert(result.message);
        } catch (err) {
            console.error('❌ Error during fetch:', err);
            showCustomAlert('❌ Error occurred. Check console for details.');
        }
    } else {
        if (accountGroupCheckBox.checked) {

            try {
                const res = await fetch(`/get-cm-first-grp-id?orgName=${encodeURIComponent(orgName)}&orgAlias=${encodeURIComponent(orgAlias)}`);
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();

                CMgrpSummaryTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-group-summary-checkbox" data-lgrgrpid="${row.LgrGrpID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.GrpName}</td>
                    <td>${row.GrpAlias}</td>
                </tr>
            `).join('');

                CMGrpSummaryDiv.style.display = 'block';
            } catch (err) {
                console.error('Error:', err);
            }


            /* ---------- group checkbox change ---------- */
            CMgrpSummaryTable.addEventListener('change', async e => {
                if (!e.target.matches('.cm-group-summary-checkbox')) return;

                const grpCheckboxes = document.querySelectorAll('.cm-group-summary-checkbox');
                const selectedIDs = [...grpCheckboxes]
                    .filter(c => c.checked)
                    .map(c => `id=${encodeURIComponent(c.dataset.lgrgrpid)}`)
                    .join('&');

                if (!selectedIDs) return;

                try {
                    const resp = await fetch(`/cm-get-ledger-sub-groups?${selectedIDs}`);
                    if (!resp.ok) throw new Error(`Server responded with ${resp.status}`);
                    const subGroups = await resp.json();

                    CMSubgrpSummaryTable.innerHTML = subGroups.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-sub-group-summary-checkbox" data-lgrgrpid="${row.LgrSubGrpID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.SubGrpName}</td>
                    <td>${row.SubGrpAlias}</td>
                </tr>
            `).join('');

                } catch (err) {
                    console.error('Error fetching subgroups:', err);
                }
            });

            /* ---------- sub-group checkbox change ---------- */
            CMSubgrpSummaryTable.addEventListener('change', async e => {
                if (!e.target.matches('.cm-sub-group-summary-checkbox')) return;

                const subCheckboxes = document.querySelectorAll('.cm-sub-group-summary-checkbox');
                const LMids = [...subCheckboxes]
                    .filter(c => c.checked)
                    .map(c => `id=${encodeURIComponent(c.dataset.lgrgrpid)}`)
                    .join('&');

                if (!LMids) return;

                try {
                    const r = await fetch(`/cm-get-ledger-sub-master-groups?${LMids}`);
                    if (!r.ok) throw new Error(`Server responded with ${r.status}`);
                    const ledgers = await r.json();

                    CMLedgerMasterSummaryTable.innerHTML = ledgers.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-ledger-sub-group-summary-checkbox" data-glid="${row.GLID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.GLName}</td>
                    <td>${row.GlAlias}</td>
                </tr>
            `).join('');

                } catch (err) {
                    console.error('Error fetching sub-master groups:', err);
                }
            });

            document.getElementById('CMGrpSummaryForm')?.addEventListener('submit', e => {
                e.preventDefault();
                CMGrpSummaryDiv.style.display = 'none';
                CMLedgerMasterSummaryDiv.style.display = 'none';
                CMSubGrpSummaryDiv.style.display = 'block';
            });
            document.getElementById('CMSubGrpSummaryForm')?.addEventListener('submit', e => {
                e.preventDefault();
                CMGrpSummaryDiv.style.display = 'none';
                CMSubGrpSummaryDiv.style.display = 'none';
                CMLedgerMasterSummaryDiv.style.display = 'block';
            });



            document.getElementById('CMLedgerMasterSummaryForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected LgrGrpID
                const selectedGroups = [...document.querySelectorAll('.cm-group-summary-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.lgrgrpid));

                // ✅ Gather selected LgrSubGrpID
                const selectedSubGroups = [...document.querySelectorAll('.cm-sub-group-summary-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.lgrgrpid));

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-ledger-sub-group-summary-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.glid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedGroups, selectedSubGroups, selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
        if (ledgerCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchPostingLedgerForNew`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMLedgerMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-ledger-sub-group-summary-checkbox" data-glid="${row.GLID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.GLName}</td>
                    <td>${row.GlAlias}</td>
                </tr>
            `).join('');

                CMLedgerMasterDiv.style.display = 'block';
                console.log('HAHHAH')
            } catch (err) {
                console.error('Error:', err);
            }
            document.getElementById('CMLedgerMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-ledger-sub-group-summary-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.glid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forLedger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }

        if (docClassCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchDocClasses`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMDocClassMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-doc-class-master-checkbox" data-docclassid="${row.DocClassID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.DocClassName}</td>
                    <td>${row.DocClassAlias}</td>
                </tr>
            `).join('');

                CMDocClassMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMDocClassMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-doc-class-master-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.docclassid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forDocClass', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }

        if (subLedgerCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchSubLedgerMaster`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMSubLedgerMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-sub-ledger-master-checkbox" data-subldgrid="${row.SLID}" data-memberid="${row.MemberID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.SLName}</td>
                    <td>${row.SlAlias}</td>
                </tr>
            `).join('');

                CMSubLedgerMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMSubLedgerMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-sub-ledger-master-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.subldgrid));  // ⚠️ Make sure this is GLID not LgrSubGrpID

 // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedMemberLedgers = [...document.querySelectorAll('.cm-sub-ledger-master-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.memberid));  // ⚠️ Make sure this is GLID not LgrSubGrpID
                try {
                    const res = await fetch('/copy-selected-master-forSubLedgerMaster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers, selectedMemberLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
        if (TACodeSetupCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchTACodeSetupMaster`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMTACodeSetupMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-TA-code-setup-checkbox" data-tacodesetupid="${row.TACodeMenuID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.CodeMenuName}</td>
                    <td>${row.Alias}</td>
                </tr>
            `).join('');

                CMTACodeSetupMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMTACodeSetupMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-TA-code-setup-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.tacodesetupid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forCMTACodeSetup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
        if (TACodeCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchTACodeMaster`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMTACodeMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-TA-code-checkbox" data-tacodeid="${row.TACodeID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.CodeName}</td>
                    <td>${row.Alias}</td>
                </tr>
            `).join('');

                CMTACodeMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMTACodeMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-TA-code-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.tacodeid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forCMTACode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
        if (voucherCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchvoucherMaster`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMVoucherMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-user-define-voucher-checkbox" data-udvid="${row.UDVNo}"></td>
                    <td>${i + 1}</td>
                    <td>${row.MenuName}</td>
                    <td>${row.Alias}</td>
                </tr>
            `).join('');

                CMVoucherMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMVoucherMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-user-define-voucher-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.udvid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forCMVoucherMaster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
        if (areaCheckBox.checked) {
            try {
                const res = await fetch(`/cm-fetchAreaMaster`);
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch ledger data');
                const grpSummaryData = await res.json();
                console.log(grpSummaryData)

                CMAreaMasterTable.innerHTML = grpSummaryData.map((row, i) => `
                <tr>
                    <td><input type="checkbox" class="cm-area-master-voucher-checkbox" data-areaid="${row.AreaID}"></td>
                    <td>${i + 1}</td>
                    <td>${row.AreaName}</td>
                    <td>${row.AreaAlias}</td>
                </tr>
            `).join('');

                CMAreaMasterDiv.style.display = 'block';
                
            } catch (err) {
                console.error('Error:', err);
            }

             document.getElementById('CMAreaMasterForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                // ✅ Gather selected GLID (you must update dataset to store GLID)
                const selectedLedgers = [...document.querySelectorAll('.cm-area-master-voucher-checkbox:checked')]
                    .map(cb => parseInt(cb.dataset.areaid));  // ⚠️ Make sure this is GLID not LgrSubGrpID


                try {
                    const res = await fetch('/copy-selected-master-forCMAreaMaster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedLedgers })
                    });

                    const result = await res.json();
                    showCustomAlert(result.message || "✅ Copy complete.");
                } catch (err) {
                    console.error('❌ Error copying data:', err);
                    showCustomAlert('❌ Failed to copy selected master data.');
                }
            });
        }
    }
                const closeButtons = [
                { buttonId: 'CMGrpSummaryCancel', div: CMGrpSummaryDiv },
                { buttonId: 'CMLedgerMasterSummaryCancel', div: CMLedgerMasterSummaryDiv  },
                { buttonId: 'CMSubGrpSummaryCancel', div: CMSubGrpSummaryDiv },
                { buttonId: 'CMLedgerMasterCancel', div: CMLedgerMasterDiv },
                { buttonId: 'CMDocClassMasterCancel', div: CMDocClassMasterDiv },
                { buttonId: 'CMSubLedgerMasterCancel', div: CMSubLedgerMasterDiv },
                { buttonId: 'CMTACodeSetupMasterCancel', div: CMTACodeSetupMasterDiv },
                { buttonId: 'CMTACodeMasterCancel', div: CMTACodeMasterDiv },
                { buttonId: 'CMVoucherMasterCancel', div: CMVoucherMasterDiv },
                { buttonId: 'CMAreaMasterCancel', div: CMAreaMasterDiv }


            ];

            closeButtons.forEach(({ buttonId, div }) => {
                document.getElementById(buttonId).addEventListener('click', function (e) {
                    e.preventDefault();
                    div.style.display = 'none';
                });
            });
});