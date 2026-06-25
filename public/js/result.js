const { response } = require("express");

function handleRowClick(SlAlias, GLName, MemberAlias, SLName, Address1, Phone1, Mobile,
    AccountOpenDate, Photo, Sign1, Sign2, Sign3, Sign4,
      Gender, NextofKinName, NextofKinAddress, NextofKinContactNumber,
       Relation, DOB, JV_Miti, VoucherNo,MemberName, DrAmount, JournalEntries, CrAmount) {
    const action = document.getElementById('actionSelect').value;
    const transactionDiv = document.getElementById("mainCreatTransDiv");
    const multitransactionDiv = document.getElementById("mainmultitransaction");
    const openingBalanceDiv = document.getElementById("mainopeningbalance");
    const voucherNoInput = document.getElementById('MaintransvoucherNo');
    const MaintransMembervalueforeditIN = document.getElementById('MaintransMembervalueforedit'); 
    const memberEditFrom = document.getElementById("ccapctmemedit");

    // Store the Base64-encoded image in sessionStorage
    sessionStorage.setItem('firstPhotoBase64', Photo);
    sessionStorage.setItem('firstSign1Base64', Sign1);
    sessionStorage.setItem('firstSign2Base64', Sign2);
    sessionStorage.setItem('firstSign3Base64', Sign3);
    sessionStorage.setItem('firstSign4Base64', Sign4);

    let url;
    const hideTransactionPanels = () => {
        transactionDiv.style.display = 'none';
        multitransactionDiv.style.display = 'none';
        openingBalanceDiv.style.display = 'none';
    };

    const makeDivMovableOnce = (div) => {
        if (div.dataset.movableBound === 'true') {
            return;
        }

        div.dataset.movableBound = 'true';
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let highestZIndex = 3;

        const bringToFront = (element) => {
            highestZIndex++;
            element.style.zIndex = highestZIndex;
        };

        div.addEventListener('mousedown', (e) => {
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'SELECT'
            ) {
                return;
            }

            e.preventDefault();
            bringToFront(div);

            const rect = div.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                return;
            }

            div.style.left = `${e.pageX - offsetX}px`;
            div.style.top = `${e.pageY - offsetY}px`;
            div.style.position = 'absolute';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    };

    const bindCloseButtonsOnce = (buttonIds, div) => {
        if (div.dataset.closeBound === 'true') {
            return;
        }

        div.dataset.closeBound = 'true';
        buttonIds.forEach((buttonId) => {
            const button = document.getElementById(buttonId);
            if (!button) {
                return;
            }

            button.addEventListener('click', function (e) {
                e.preventDefault();
                div.style.display = 'none';
            });
        });
    };

    if (action === 'transaction') {
       hideTransactionPanels();
       transactionDiv.style.display ='block';
       makeDivMovableOnce(transactionDiv);
       bindCloseButtonsOnce(
            ['mainCreatTransDcloseButton', 'mainCreatTransDcancelButton'],
            transactionDiv
       );



      
       document.getElementById('MaintransMembervalueforedit').value =MemberName + MemberAlias;
       document.getElementById('Maintransaccountnumberofaccpostedit').value =SlAlias;
       document.getElementById('Maintransacctypeforaccpostingedit').value =GLName;
       document.getElementById('Maintransmembervalueforedit').value =SLName;
        
        if (SlAlias) {
        fetch(`/getSubLedgerDetails?SlAlias=${encodeURIComponent(SlAlias)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    showCustomAlert('Error retrieving details. Please try again.');
                    return;
                }

                // Fill the inputs with retrieved data
                // document.getElementById('SLName').value = data.SLName || '';
                // document.getElementById('GLNamess').value = data.GLName || '';
                document.getElementById('MaintransBalance').value = data.Balance || 0;
                // document.getElementById('Amount').value = data.Balance || 0;
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                showCustomAlert('Failed to retrieve details.');
            });
    }
          



  // Hardcoded menuName
  const menuName = "Transaction";

  // Function to fetch configuration and last voucher number
  async function fetchVoucherConfigAndGenerate() {
    try {
        // Fetch configuration
        const configResponse = await fetch(`/getVoucherConfig?menuName=${menuName}`);
        if (!configResponse.ok) throw new Error(`Failed to fetch configuration: ${configResponse.statusText}`);
        const configData = await configResponse.json();
        const { Prefix, Suffix, BodyLength } = configData;

        if (!Prefix || BodyLength === undefined || BodyLength === null) {
            throw new Error('Invalid configuration response');
        }

        // Handle empty Suffix
        const actualSuffix = Suffix || ''; // Default to empty string if Suffix is null/empty
        const numericLength = BodyLength - Prefix.length - actualSuffix.length;

        if (numericLength <= 0) {
            throw new Error('BodyLength must be greater than the sum of Prefix and Suffix lengths');
        }

        // Fetch last VoucherNo
        const lastVoucherResponse = await fetch(`/getLastVoucherNo?prefix=${Prefix}`);
        if (!lastVoucherResponse.ok) throw new Error(`Failed to fetch last voucher number: ${lastVoucherResponse.statusText}`);
        const lastVoucherData = await lastVoucherResponse.json();
        const lastVoucherNo = lastVoucherData.lastVoucherNo;

        // Determine next VoucherNo
        let nextNumber = 1;
        if (lastVoucherNo) {
            const lastNumber = parseInt(lastVoucherNo.slice(Prefix.length, lastVoucherNo.length - actualSuffix.length), 10);
            nextNumber = lastNumber + 1;
        }

        // Pad the number to the calculated length
        const paddedNumber = nextNumber.toString().padStart(numericLength, '0');
        const newVoucherNo = Prefix + paddedNumber + actualSuffix;

        // Update input
        voucherNoInput.value = newVoucherNo;
    } catch (error) {
        console.error('Error generating VoucherNo:', error.message);
        voucherNoInput.value = ''; // Clear field on error
    }
  }

  // Call the function immediately on page load
  fetchVoucherConfigAndGenerate();

   
    MaintransMembervalueforeditIN.addEventListener("dblclick", async function (e) {
        e.preventDefault();
            memberEditFrom.style.display = 'block';
//Edit Form details
document.getElementById("ccapeditmemMemberId").value= MemberAlias;
document.getElementById("ccapeditmemMemberName").value= MemberName;
//KYM form details
document.getElementById("ccapeditmemKYMmemid").value= MemberAlias;
document.getElementById("ccapeditmemKYMmemname").value= MemberName;

                    /* ---------- utilities ---------- */
                    let highestZIndex = 3;

                    const bringToFront = el => {
                        highestZIndex += 1;
                        el.style.zIndex = highestZIndex;
                    };

                    const makeDivMovable = div => {
                        let isDragging = false;
                        let offsetX, offsetY;

                        div.addEventListener('mousedown', e => {
                            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
                            e.preventDefault();
                            bringToFront(div);
                            const { left, top } = div.getBoundingClientRect();
                            offsetX = e.clientX - left;
                            offsetY = e.clientY - top;
                            isDragging = true;
                        });

                        document.addEventListener('mousemove', e => {
                            if (!isDragging) return;
                            div.style.position = 'absolute';
                            div.style.left = `${e.pageX - offsetX}px`;
                            div.style.top = `${e.pageY - offsetY}px`;
                        });

                        document.addEventListener('mouseup', () => { isDragging = false; });
                    };

                    /* ---------- closers ---------- */
                    [
                        { btn: 'ccapctmemeditxbtn', div: memberEditFrom },
                        { btn: 'ccapctmemeditcancelbtn', div: memberEditFrom },

                    ].forEach(({ btn, div }) => {
                        document.getElementById(btn)?.addEventListener('click', e => {
                            e.preventDefault();
                            div.style.display = 'none';
                        });
                    });

                    /* ---------- enable drag ---------- */
                    [memberEditFrom].forEach(makeDivMovable);

                    const ccapeditmemMemberIdval = document.getElementById("ccapeditmemMemberId").value;
                    fetch('/fetchccapeditmemdetails',{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({ccapeditmemMemberIdval})
                    })
                    .then(response=>response.json())
                     .then(data => {
                            if (data.success) {


                                console.log("Recve pward", data.PWardNo)

                                document.getElementById('ccapeditmemProfession').value = (data.Profession || '');
                                document.getElementById('ccapeditmemQualification').value = (data.Qualification || '');

                                document.getElementById('ccapeditmemSex').value = data.Sex;
                                document.getElementById('ccapeditmemstatus').value = data.Status;
                                document.getElementById('ccapeditmemDocumentType').value = data.DocumentType;
                                document.getElementById('ccapeditmemmobile').value = data.Mobile;
                                document.getElementById('ccapeditmemDocumentTypeNo').value = data.DocumentTypeNo;
                                document.getElementById('ccapeditmemDocumentIssueaddress').value = data.DocumentIssueAddress;
                                document.getElementById('ccapeditmemperWard').value = String(data.PWardNo);

                                document.getElementById('ccapeditmemtempdistrict').value = data.TDistrict;
                                document.getElementById('ccapeditmemtempVDC').value = data.TVDC;
                                document.getElementById('ccapeditmemtempWard').value = data.TWardNo;
                                document.getElementById('ccapeditmemtemptel').value = data.TContactNumber;
                                document.getElementById('ccapeditmemtemptole').value = data.TAddress;

                                document.getElementById('ccapeditmemperdistrict').value = data.PDistrict;
                                document.getElementById('ccapeditmemperVDC').value = data.PVDC;

                                document.getElementById('ccapeditmempertel').value = data.PContactNumber;
                                document.getElementById('ccapeditmempertole').value = data.PAddress;

                                document.getElementById('ccapeditmemGuardianRel').value = data.GuardianRelation;
                                document.getElementById('ccapeditmemguardname').value = data.FatherName;
                                document.getElementById('ccapeditmemguardaddress').value = data.FatherAddress;
                                document.getElementById('ccapeditmemguardcontact').value = data.FatherContactNumber;

                                document.getElementById('ccapeditmemNextofKinName').value = data.NextofKinName;
                                document.getElementById('ccapeditmemNextofKinContact').value = data.NextofKinContactNumber;
                                document.getElementById('ccapeditmemNextofKinAddress').value = data.NextofKinAddress;
                                document.getElementById('ccapeditmemkinRelation').value = data.KinRelation;
                                document.getElementById("ccapeditmemgreatguardname").value = data.GrandFatherName;

                                document.getElementById('ccapedtimemremarks').value = data.Remarks;

                                document.getElementById('ccapeditmemacc-photo').src = data.Photo;
                                document.getElementById('ccapeditmemacc-sign1').src = data.Sign1;
                                document.getElementById('ccapeditmemacc-sign2').src = data.Sign2;
                                document.getElementById('ccapeditmemacc-sign3').src = data.Sign3;
                                document.getElementById('ccapeditmemacc-sign4').src = data.Sign4;

                                function slashToHyphen(dateStr) {
                                    if (!dateStr) return "";
                                    return dateStr.replaceAll("/", "-");
                                }

                                document.getElementById('ccapeditmemdob').value = slashToHyphen(data.DateOfBirthNP);
                                document.getElementById('ccapeditmemregdate').value = slashToHyphen(data.DOR_NP);
                                document.getElementById('ccapeditmemIssuedate').value = slashToHyphen(data.DocumentIssueDateNP);

                                document.getElementById('ccapeditmemotherdoc').value = data.DocClassName;
                                document.getElementById("ccapeditmemotherpanmem").value = data.panNo;
                                document.getElementById("ccapeditmemothernid").value = data.NIDNo;
                                if (data.Status == 'Live') {
                                    const div = document.getElementById('membershidleftdiv');
                                    div.style.pointerEvents = 'none';
                                    div.style.backgroundColor = 'grey';
                                }



                                 //KYM form fields 
                                 console.log('Citi', data.DocumentTypeNo);
                                document.getElementById('ccapeditmemKYMmemdob').value = slashToHyphen(data.DateOfBirthNP);
                                document.getElementById('ccapeditmemKYMmemcitizenno').value = data.DocumentTypeNo;
                                document.getElementById('ccapeditmemKYMmemissueautho').value = data.DocumentIssueAddress;
                                document.getElementById('ccapeditmemKYMmemGender').value = data.Sex;
                                document.getElementById('ccapeditmemKYMmemFathername').value = data.FatherName;
                                document.getElementById('ccapeditmemKYMmemselfoccname').value = (data.Profession || '');
                            }

                            else {
                                showCustomAlert(data.message || 'Member not found');
                            }

                        })
                        try {

                        const res = await fetch("/fetchccapeditmemaccdetails", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ccapeditmemMemberIdval })
                        })
                        const data = await res.json();
                        const tbody = document.querySelector("#ccapeditmemAcctable tbody");
                        tbody.innerHTML = '';
                        if (data.success && data.transactions.length > 0) {
                            data.transactions.forEach((txn, index) => {
                                const row = document.createElement("tr");
                                row.innerHTML = `
                                <td>${index + 1}</td>
                                <td>${txn.AccountOpenDateNP}</td>
                                <td>${txn.SlAlias}</td>
                                <td>${txn.SLName}</td>
                                <td>${txn.GLName}</td>
                                <td>${txn.Balance}</td>
          `;
                                tbody.appendChild(row);
                            });
                        }

                        else {
                            tbody.innerHTML = `<tr><td colspan="3">No transactions found</td></tr>`;
                        }

                    }
                    catch (err) {
                        console.error(err);
                        alert("Error loading transactions");
                    }


                    
                })
        
   



        // url = `/transaction?SlAlias=${SlAlias}&GLName=${GLName}&MemberAlias=${MemberAlias}&SLName=${SLName}
        // &Address1=${Address1}&Phone1=${Phone1}&Mobile=${Mobile}&AccountOpenDate=${AccountOpenDate}
        // &Gender=${Gender}&NextofKinName=${NextofKinName}&NextofKinAddress=${NextofKinAddress}
        // &NextofKinContactNumber=${NextofKinContactNumber}&Relation=${Relation}&DOB=${DOB}&JV_Miti=${JV_Miti}&VoucherNo=${VoucherNo}
        // &DrAmount=${DrAmount}&JournalEntries=${encodeURIComponent(JournalEntries)}&CrAmount=${CrAmount}`;
    

    }
    
    else if (action === 'bigTransaction') {
        hideTransactionPanels();
        multitransactionDiv.style.display ='block';
        makeDivMovableOnce(multitransactionDiv);
        bindCloseButtonsOnce(
            ['mainmultitranscloseButton', 'mainMultiTranscancelButton'],
            multitransactionDiv
       );

        url = `/bigTransaction?SlAlias=${SlAlias}
        &Address1=${Address1}&Phone1=${Phone1}&Mobile=${Mobile}
        &Gender=${Gender}&NextofKinName=${NextofKinName}&NextofKinAddress=${NextofKinAddress}
        &NextofKinContactNumber=${NextofKinContactNumber}&Relation=${Relation}&DOB=${DOB}&JV_Miti=${JV_Miti}&VoucherNo=${VoucherNo}
        &DrAmount=${DrAmount}&CrAmount=${CrAmount}`;
        
    } 
    else if (action === 'openingBalance') {

         hideTransactionPanels();
        openingBalanceDiv.style.display ='block';
        makeDivMovableOnce(openingBalanceDiv);
        bindCloseButtonsOnce(
            ['mainopenBalcloseButton', 'mainopenBalcancelButton'],
            openingBalanceDiv
       );


        // Don't pass the base64 image in the URL, it's already stored in sessionStorage
        url = `/openingBalance?SlAlias=${SlAlias}&GLName=${GLName}
       `;
    }

    

}
//Transaction Form Save functionality 
    document.getElementById('MaintranssaveBtn').addEventListener('click', function(event) {
      event.preventDefault();  // Prevent any default action (like form submission or reloading)
  
      // Get the parent form element 
      const form = document.getElementById("mainCreatTransDForm");
  
      // Get values from input fields
      const startDate = document.querySelector('.start-date-local').value;
      const endDate = document.querySelector('.end-date-local').value;
      const transDate = document.getElementById('MaintransdateInput').value;
      const amount = document.getElementById('Maintransamount').value;
  
      // Flag to track if there's any error
      let isError = false;
  
      // Check if the Transaction Date is between Start Date and End Date
      if (transDate < startDate || transDate > endDate) {
        showCustomAlert('Transaction Date must be between the Start Date and End Date!');
        document.getElementById('MaintransdateInput').style.border = '2px solid red'; // Highlight the date input field
        document.getElementById('MaintransdateInput').focus(); // Focus the field
        isError = true; // Set error flag
      } else {
        document.getElementById('MaintransdateInput').style.border = ''; // Reset the border style if no error
      }
  
      // Check if the Amount is greater than 0
      if (amount <= 0) {
        if (!isError) { // Only show alert if no previous errors
          showCustomAlert('0 Amount Voucher cannot be posted!');
          document.getElementById('Maintransamount').style.border = '2px solid red'; // Highlight the amount input field
          document.getElementById('Maintransamount').focus(); // Focus the field
          isError = true; // Set error flag
        }
      } else {
        document.getElementById('Maintransamount').style.border = ''; // Reset the border style if no error
      }
  
      // If no errors, manually submit the form
      if (!isError) {
        console.log('Valid input! Proceed with submitting the form...');
        form.submit();  // Trigger form submission
      }
    });

//      document.addEventListener("DOMContentLoaded",(e)=>{
//         e.preventDefault();

    
//     const transactionType = document.getElementById('transactionTypeforMaintrans');
//     const paymentMethod = document.getElementById('CashChequeforMaintrans');
//     const deposit = [
//         'MaintranschequeNumber', 'MaintranschequeDate', 'Maintransbearer', 'MaintransinterestBal', 
//         'MaintransintAmount', 'MaintransprinTillDate', 'MaintransintTillDate',
//         'MaintranscollateralAmt'
//     ];
//     const withdraw = ['MaintransdepositBy', 'MaintranscontactNumber', 'MaintranssrcofFund'];

//     const toggleElements = (elements, isDisabled) => {
//         elements.forEach(id => {
//             const element = document.getElementById(id);
//             if (element) {
//                 element.style.pointerEvents = isDisabled ? 'none' : '';
//                 element.style.color = isDisabled ? 'gray' : '';
//             }
//         });
//     };

//     const applyToggleBasedOnSelection = () => {
//         const selectedValue = transactionType.value;
//         if (selectedValue === 'Deposit') {
//             toggleElements(deposit, true); // Enable deposit-related fields
//             toggleElements(withdraw, false); // Disable withdraw-related fields
//             paymentMethod.value = 'Cash'; // Set payment method to 'cash'
//           } else if (selectedValue === 'Withdraw') {
//             toggleElements(deposit, false); // Disable deposit-related fields
//             toggleElements(withdraw, true); // Enable withdraw-related fields
//             paymentMethod.value = 'Cheque'; // Set payment method to 'cash'
//           }
//     };

//     // Apply behavior when the page loads
//     applyToggleBasedOnSelection();

//     // Add event listener for dropdown changes
//     transactionType.addEventListener('change', applyToggleBasedOnSelection);
//  });
