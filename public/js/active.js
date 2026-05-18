document.addEventListener('DOMContentLoaded', function() {
    // Handle primary dropdowns
    document.querySelectorAll('.menu-item > div > .uls').forEach(menuLink => {
        menuLink.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent bubbling

            // Toggle the primary dropdown menu
            const dropdown = this.nextElementSibling; // Gets the dropdown-menu
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }

            // Close other primary dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(item => {
                if (item !== dropdown) {
                    item.style.display = 'none';
                }
            });
        });
    });


    // Handle nested dropdowns
    document.querySelectorAll('.dropdown-menu > ul > li > a').forEach(menuLink => {
        menuLink.addEventListener('click', function(event) {
            // Prevent the default anchor behavior
            event.preventDefault();
            event.stopPropagation(); // Prevent bubbling

            // Check if the clicked item has a nested dropdown
            const nestedDropdown = this.nextElementSibling; // Gets the dropdown-menu-1
            if (nestedDropdown) {
                // Toggle nested dropdown
                nestedDropdown.style.display = nestedDropdown.style.display === 'block' ? 'none' : 'block';
            }

            // Close other nested dropdowns
            document.querySelectorAll('.dropdown-menu-1').forEach(item => {
                if (item !== nestedDropdown) {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Prevent nested dropdown clicks from closing the dropdown
    document.querySelectorAll('.dropdown-menu-1').forEach(nestedDropdown => {
        nestedDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    // Handle third-level nested dropdowns
    document.querySelectorAll('.dropdown-menu-1 > ul > li > a').forEach(menuLink => {
        menuLink.addEventListener('click', function(event) {
            // Prevent the default anchor behavior
            event.preventDefault();
            event.stopPropagation(); // Prevent bubbling

            // Check if the clicked item has a third-level dropdown
            const thirdLevelDropdown = this.nextElementSibling; // Gets the dropdown-menu-2
            if (thirdLevelDropdown) {
                // Toggle third-level dropdown
                thirdLevelDropdown.style.display = thirdLevelDropdown.style.display === 'block' ? 'none' : 'block';
            }

            // Close other third-level dropdowns
            document.querySelectorAll('.dropdown-menu-2').forEach(item => {
                if (item !== thirdLevelDropdown) {
                    item.style.display = 'none';
                }
            });
        });
    });

        // ✅ Hide all dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu, .dropdown-menu-1, .dropdown-menu-2')
            .forEach(menu => menu.style.display = 'none');
    });

    document.addEventListener('.dropdown-menu submenu').addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu, .dropdown-menu-1, .dropdown-menu-2')
            .forEach(menu => menu.style.display = 'none');
    });

    // Prevent third-level dropdown clicks from closing the dropdown
    document.querySelectorAll('.dropdown-menu-2').forEach(thirdLevelDropdown => {
        thirdLevelDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });
    let parent = this.closest("ul").closest("li")?.querySelector("a");
    while (parent) {
        parent.classList.add("active-parent");
        parent = parent.closest("ul").closest("li")?.querySelector("a");
    }
});



// Function to synchronize input values
function syncInputs(sourceId, targetId) {
    const sourceInput = document.getElementById(sourceId);
    const targetInput = document.getElementById(targetId);

    sourceInput.addEventListener('input', () => {
        targetInput.value = sourceInput.value;
    });
}

// Synchronize values for district
syncInputs('district-id', 'district-alias');

// Synchronize values for qualification
syncInputs('qualification-id', 'qualification-alias');

// Synchronize values for profession
syncInputs('profession-id', 'profession-alias');

// Synchronize values for denomination
syncInputs('denomination-id', 'denominationalias');

// Synchronize values for Vouchers Menu Setup
syncInputs('voucher-menuname', 'voucher-menudisplayname');


// Listen for the Profession New button to enable input fields
document.getElementById('profession-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new profession entry
    document.getElementById('profession-id').disabled = false;
    document.getElementById('profession-alias').disabled = false;
    document.getElementById('profession-save-button').disabled = false;  // Enable Save
    document.getElementById('profession-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('profession-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('profession-cancel-button').disabled = false;
    // Automatically focus on the first input field (profession-id)
    document.getElementById('profession-id').focus();
    // Clear input fields as well
    document.getElementById('profession-id').value = '';  // Clear the profession input field
    document.getElementById('profession-alias').value = '';  // Clear the alias profession

});
document.getElementById('profession-edit-button').addEventListener('click', function() {
   
    document.getElementById('profession-id').disabled = false;
    document.getElementById('profession-alias').disabled = false;
    document.getElementById('profession-save-button').disabled = false;  // Enable Save
    document.getElementById('profession-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('profession-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('profession-cancel-button').disabled = false;
    // Automatically focus on the first input field (profession-id)
    document.getElementById('profession-id').focus();
  

});
document.getElementById('profession-delete-button').addEventListener('click', function() {

    document.getElementById('profession-save-button').disabled = true;  // Enable Save
    document.getElementById('profession-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('profession-edit-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('profession-cancel-button').disabled = false;
});
// Listen for the "Profession-Cancel" button click to reset the form to its initial state
document.getElementById('profession-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('profession-id').value = '';  
    document.getElementById('profession-alias').value = '';  

    // Disable input fields and buttons
    document.getElementById('profession-id').disabled = true;
    document.getElementById('profession-alias').disabled = true;
    document.getElementById('profession-save-button').disabled = true;  // Disable Save button
    document.getElementById('profession-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('profession-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('profession-new-button').disabled = false;  // Enable New button
    
});

// Listen for the Qualification New button to enable input fields
document.getElementById('qualification-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new Qualification entry
    document.getElementById('qualification-id').disabled = false;
    document.getElementById('qualification-alias').disabled = false;
    document.getElementById('qualification-save-button').disabled = false;  // Enable Save
    document.getElementById('qualification-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('qualification-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('qualification-cancel-button').disabled = false;

     // Automatically focus on the first input field (qualification-id)
     document.getElementById('qualification-id').focus();
     // Clear input fields as well
     document.getElementById('qualification-id').value = '';  // Clear the qualification input field
     document.getElementById('qualification-alias').value = '';  // Clear the alias input field
  
});
document.getElementById('qualification-edit-button').addEventListener('click', function() {
    
    document.getElementById('qualification-id').disabled = false;
    document.getElementById('qualification-alias').disabled = false;
    document.getElementById('qualification-save-button').disabled = false;  // Enable Save
    document.getElementById('qualification-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('qualification-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('qualification-cancel-button').disabled = false;

     // Automatically focus on the first input field (qualification-id)
     document.getElementById('qualification-id').focus();
    
  
});
document.getElementById('qualification-delete-button').addEventListener('click', function() {
    document.getElementById('qualification-save-button').disabled = true;  // Enable Save
    document.getElementById('qualification-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('qualification-edit-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('qualification-cancel-button').disabled = false;
});
// Listen for the "Qualification-Cancel" button click to reset the form to its initial state
document.getElementById('qualification-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('qualification-id').value = '';  
    document.getElementById('qualification-alias').value = '';  

    // Disable input fields and buttons
    document.getElementById('qualification-id').disabled = true;
    document.getElementById('qualification-alias').disabled = true;
    document.getElementById('qualification-save-button').disabled = true;  // Disable Save button
    document.getElementById('qualification-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('qualification-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('qualification-new-button').disabled = false;  // Enable New button
   
});

// Listen for the District New button to enable input fields
// NEW button
document.getElementById('district-new-button').addEventListener('click', function () {

    selectedDistrict = null; // reset

    // Enable inputs
    document.getElementById('district-id').disabled = false;
    document.getElementById('district-alias').disabled = false;

    // Clear fields
    document.getElementById('district-id').value = '';
    document.getElementById('district-alias').value = '';

    // Buttons
    document.getElementById('district-save-button').disabled = false;
    document.getElementById('district-edit-button').disabled = true;
    document.getElementById('district-delete-button').disabled = true;
    document.getElementById('district-cancel-button').disabled = false;

    // Focus first field
    document.getElementById('district-id').focus();
});


// EDIT button
document.getElementById('district-edit-button').addEventListener('click', function () {

  

    // district-id usually should not be editable
    document.getElementById('district-id').disabled = false;

    document.getElementById('district-alias').disabled = false;

    // Buttons
    document.getElementById('district-save-button').disabled = false;
    document.getElementById('district-new-button').disabled = true;
    document.getElementById('district-delete-button').disabled = true;
    document.getElementById('district-cancel-button').disabled = false;

    document.getElementById('district-id').focus();
});


// DELETE button
document.getElementById('district-delete-button').addEventListener('click', function () {

    if (!selectedDistrict) {
        showDistrictsList();   // show list if nothing selected
        return;
    }

    // No field enabling here — delete uses modal
    deleteDistrict();

});


// CANCEL button
document.getElementById('district-cancel-button').addEventListener('click', function () {

    selectedDistrict = null;

    // Clear fields
    document.getElementById('district-id').value = '';
    document.getElementById('district-alias').value = '';

    // Disable inputs
    document.getElementById('district-id').disabled = true;
    document.getElementById('district-alias').disabled = true;

    // Restore default button state
    document.getElementById('district-save-button').disabled = true;
    document.getElementById('district-edit-button').disabled = false;
    document.getElementById('district-delete-button').disabled = false;
    document.getElementById('district-new-button').disabled = false;

});


// Listen for the Route New button to enable input fields
document.getElementById('routem-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new Route  entry
   
    document.getElementById('routem-id').disabled = false;
    document.getElementById('routem-alias').disabled = false;
    document.getElementById('routem-save-button').disabled = false;  // Enable Save
    document.getElementById('routem-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('routem-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('routem-cancel-button').disabled = false;

    // Automatically focus on the first input field (district-id)
    document.getElementById('routem-id').focus();
       // Clear input fields as well
       document.getElementById('routem-id').value = '';  // Clear the district input field
       document.getElementById('routem-alias').value = '';  // Clear the alias input field
    

});
document.getElementById('routem-edit-button').addEventListener('click', function() {
    document.getElementById('routem-id').disabled = false;
    document.getElementById('routem-alias').disabled = false;
    document.getElementById('routem-save-button').disabled = false;  // Enable Save
    document.getElementById('routem-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('routem-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('routem-cancel-button').disabled = false;

    // Automatically focus on the first input field (district-id)
    document.getElementById('routem-id').focus();

});
document.getElementById('routem-delete-button').addEventListener('click', function() {
   
    document.getElementById('routem-save-button').disabled = true;  
    document.getElementById('routem-new-button').disabled = true; 
    document.getElementById('routem-edit-button').disabled = true; 
    document.getElementById('routem-cancel-button').disabled = false;


});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('routem-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('routem-id').value = '';  
    document.getElementById('routem-alias').value = '';  

    // Disable input fields and buttons
    document.getElementById('routem-id').disabled = true;
    document.getElementById('routem-alias').disabled = true;
    document.getElementById('routem-save-button').disabled = true;  // Disable Save button
    document.getElementById('routem-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('routem-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('routem-new-button').disabled = false;  // Enable New button
    
});

// Ensure the select dropdown is disabled on load
document.getElementById('vdc-alias').setAttribute('disabled', 'true');
// Listen for the vdc New button to enable input fields
document.getElementById('vdc-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('vdc-id').disabled = false;
    document.getElementById('vdc-alias').disabled = false;
    document.getElementById('vdc-save-button').disabled = false;  // Enable Save
    document.getElementById('vdc-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('vdc-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('vdc-cancel-button').disabled = false;

    // Automatically focus on the first input field (district-id)
    document.getElementById('vdc-id').focus();
       // Clear input fields as well
       document.getElementById('vdc-id').value = '';  // Clear the district input field
       document.getElementById('vdc-alias').value = '';  // Clear the alias input field
});
document.getElementById('vdc-edit-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('vdc-id').disabled = false;
    document.getElementById('vdc-alias').disabled = false;
    document.getElementById('vdc-save-button').disabled = false;  // Enable Save
    document.getElementById('vdc-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('vdc-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('vdc-cancel-button').disabled = false;

    // Automatically focus on the first input field (district-id)
    document.getElementById('vdc-id').focus();
      
});
document.getElementById('vdc-delete-button').addEventListener('click', function() {
   
    document.getElementById('vdc-save-button').disabled = true;  // Enable Save
    document.getElementById('vdc-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('vdc-edit-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('vdc-cancel-button').disabled = false;

});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('vdc-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('vdc-id').value = '';  
    document.getElementById('vdc-alias').value = '';  

    // Disable input fields and buttons
    document.getElementById('vdc-id').disabled = true;
    document.getElementById('vdc-alias').setAttribute('disabled', 'true');
    document.getElementById('vdc-save-button').disabled = true;  // Disable Save button
    document.getElementById('vdc-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('vdc-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('vdc-new-button').disabled = false;  // Enable New button
   
});
// Listen for the Denomination New button to enable input fields
document.getElementById('denomination-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('denomination-id').disabled = false;
    document.getElementById('denomination-alias').disabled = false;
    document.getElementById('denomination-save-button').disabled = false;  // Enable Save
    document.getElementById('denomination-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('denomination-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
       // Automatically focus on the first input field (denomination-id)
       document.getElementById('denomination-id').focus();
       // Clear input fields as well
       document.getElementById('denomination-id').value = '';  // Clear the denomination input field
       document.getElementById('denomination-alias').value = '';  // Clear the alias input field
});
document.getElementById('denomination-edit-button').addEventListener('click', function() {
   
    document.getElementById('denomination-id').disabled = false;
    document.getElementById('denomination-alias').disabled = false;
    document.getElementById('denomination-save-button').disabled = false;  // Enable Save
    document.getElementById('denomination-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('denomination-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
       // Automatically focus on the first input field (denomination-id)
       document.getElementById('denomination-id').focus();
      
});
document.getElementById('denomination-delete-button').addEventListener('click', function() {
   
    
    document.getElementById('denomination-save-button').disabled = true;  // Enable Save
    document.getElementById('denomination-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('denomination-edit-button').disabled = true; // Disable Delete (until you implement delete logic)
       
      
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('denomination-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('denomination-id').value = '';  
    document.getElementById('denomination-alias').value = '';  

    // Disable input fields and buttons
    document.getElementById('denomination-id').disabled = true;
    document.getElementById('denomination-alias').disabled = true;
    document.getElementById('denomination-save-button').disabled = true;  // Disable Save button
    document.getElementById('denomination-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('denomination-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('denomination-new-button').disabled = false;  // Enable New button
   
});
// Listen for the Narration New button to enable input fields
document.getElementById('narration-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new profession entry
    document.getElementById('narration-id').disabled = false;
    document.getElementById('narration-save-button').disabled = false;  // Enable Save
    document.getElementById('narration-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('narration-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('narration-cancel-button').disabled = false;
    // Automatically focus on the first input field (narration-id)
    document.getElementById('narration-id').focus();
    // Clear input fields as well
    document.getElementById('narration-id').value = '';  // Clear the narration input field
   
});
document.getElementById('narration-edit-button').addEventListener('click', function() {
   
    document.getElementById('narration-id').disabled = false;
    document.getElementById('narration-save-button').disabled = false;  // Enable Save
    document.getElementById('narration-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('narration-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('narration-cancel-button').disabled = false;
    // Automatically focus on the first input field (narration-id)
    document.getElementById('narration-id').focus();
   
   
});
document.getElementById('narration-delete-button').addEventListener('click', function() {
   
   
    document.getElementById('narration-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('narration-edit-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('narration-save-button').disabled = true;
   
   
   
});
// Listen for the "Narration-Cancel" button click to reset the form to its initial state
document.getElementById('narration-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('narration-id').value = '';  

    // Disable input fields and buttons
    document.getElementById('narration-id').disabled = true;
    document.getElementById('narration-save-button').disabled = true;  // Disable Save button
    document.getElementById('narration-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('narration-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('narration-new-button').disabled = false;  // Enable New button
    
});

// Listen for the Ledger-group New button to enable input fields
document.getElementById('ledgerm-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('ledgerm-id').disabled = false;
    document.getElementById('ledger-under').disabled = false;
    document.getElementById('ledgermalias').disabled = false;
    document.getElementById('ledgermaltalias').disabled = false;
    document.getElementById('ledgerm-remark').disabled = false;
    document.getElementById('ledgerm-save-button').disabled = false;  // Enable Save
    document.getElementById('ledgerm-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgerm-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgerm-cancel-button').disabled = false; 
    // Automatically focus on the first input field (ledgerm-id)
      document.getElementById('ledgerm-id').focus();
      // Clear input fields as well
      document.getElementById('ledgerm-id').value = '';  // Clear the narration input field
     
});
document.getElementById('ledgerm-edit-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('ledgerm-id').disabled = false;
    document.getElementById('ledger-under').disabled = false;
    document.getElementById('ledgermalias').disabled = false;
    document.getElementById('ledgermaltalias').disabled = false;
    document.getElementById('ledgerm-remark').disabled = false;
    document.getElementById('ledgerm-save-button').disabled = false;  // Enable Save
    document.getElementById('ledgerm-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgerm-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgerm-cancel-button').disabled = false; 
    // Automatically focus on the first input field (ledgerm-id)
      document.getElementById('ledgerm-id').focus();
     
     
});
document.getElementById('ledgerm-delete-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    
    document.getElementById('ledgerm-save-button').disabled = true;  // Enable Save
    document.getElementById('ledgerm-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgerm-edit-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgerm-cancel-button').disabled = false; 
  
     
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('ledgerm-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('ledgerm-id').value = '';  
    document.getElementById('ledgermalias').value = '';  
    document.getElementById('ledgermaltalias').value = '';  
    document.getElementById('ledgerm-remark').value = ''; 
    document.getElementById('ledger-under').value = '';  
 
    // Disable input fields and buttons
    document.getElementById('ledgerm-id').disabled = true;
    document.getElementById('ledgermalias').disabled = true;
    document.getElementById('ledgermaltalias').disabled = true;
    document.getElementById('ledgerm-remark').disabled = true;
    document.getElementById('ledger-under').disabled = true;
    document.getElementById('ledgerm-save-button').disabled = true;  // Disable Save button
    document.getElementById('ledgerm-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('ledgerm-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('ledgerm-new-button').disabled = false;  // Enable New button
   
});
// Listen for the ta-code-menu New button to enable input fields
document.getElementById('ta-code-menu-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('ta-code-menu-name').disabled = false;
    document.getElementById('ta-code-menu-alias').disabled = false;
    document.getElementById('ta-code-order').disabled = false;
    document.getElementById('ta-code-remarks').disabled = false;
    document.getElementById('ta-code-menu-save-button').disabled = false;  // Enable Save
    document.getElementById('ta-code-menu-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ta-code-menu-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
});
document.getElementById('ta-code-menu-edit-button').addEventListener('click', function() {
   
    document.getElementById('ta-code-menu-name').disabled = false;
    document.getElementById('ta-code-menu-alias').disabled = false;
    document.getElementById('ta-code-order').disabled = false;
    document.getElementById('ta-code-remarks').disabled = false;
    document.getElementById('ta-code-menu-save-button').disabled = false;  // Enable Save
    document.getElementById('ta-code-menu-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ta-code-menu-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
});
document.getElementById('ta-code-menu-delete-button').addEventListener('click', function() {
   
   
    document.getElementById('ta-code-menu-save-button').disabled = true;  // Enable Save
    document.getElementById('ta-code-menu-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ta-code-menu-edit-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
});
// Listen for the Define-Nepali-date New button to enable input fields
document.getElementById('define-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new District entry
    document.getElementById('define-nepali-date').disabled=false;
    document.getElementById('define-english-date').disabled=false;
    document.getElementById('baisakh').disabled=false;
    document.getElementById('jestha').disabled = false;
    document.getElementById('ashadh').disabled = false;
    document.getElementById('shrawan').disabled = false;  
    document.getElementById('bhadra').disabled = false;
    document.getElementById('ashwin').disabled = false;
    document.getElementById('kartik').disabled = false; 
    document.getElementById('mangsir').disabled = false;
    document.getElementById('poush').disabled = false;
    document.getElementById('magh').disabled = false;
    document.getElementById('falgun').disabled = false;
    document.getElementById('chaitra').disabled = false;
    document.getElementById('define-save-button').disabled = false;  // Enable Save
    document.getElementById('define-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('define-delete-button').disabled = true; // Disable Delete (until you implement delete logic
    document.getElementById('define-cancel-button').disabled = false;
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('define-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('define-nepali-date').value = '';  
    document.getElementById('define-english-date').value = '';  

    // Disable input fields and buttons
    document.getElementById('define-nepali-date').disabled = true;
    document.getElementById('define-english-date').disabled = true;
    document.getElementById('baisakh').disabled=true;
    document.getElementById('jestha').disabled = true;
    document.getElementById('ashadh').disabled = true;
    document.getElementById('shrawan').disabled = true;  
    document.getElementById('bhadra').disabled = true;
    document.getElementById('ashwin').disabled = true;
    document.getElementById('kartik').disabled = true; 
    document.getElementById('mangsir').disabled = true;
    document.getElementById('poush').disabled = true;
    document.getElementById('magh').disabled = true;
    document.getElementById('falgun').disabled = true;
    document.getElementById('chaitra').disabled = true;
    document.getElementById('define-save-button').disabled = true;  // Disable Save button
    document.getElementById('define-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('define-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('define-new-button').disabled = false;  // Enable New button
    document.getElementById('define-cancel-button').disabled = true;  // Disable Cancel button
});
document.getElementById('define-delete-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new District entry
    document.getElementById('define-nepali-date').disabled=false;
    document.getElementById('define-english-date').disabled=false;
    document.getElementById('baisakh').disabled=false;
    document.getElementById('jestha').disabled = false;
    document.getElementById('ashadh').disabled = false;
    document.getElementById('shrawan').disabled = false;  
    document.getElementById('bhadra').disabled = false;
    document.getElementById('ashwin').disabled = false;
    document.getElementById('kartik').disabled = false; 
    document.getElementById('mangsir').disabled = false;
    document.getElementById('poush').disabled = false;
    document.getElementById('magh').disabled = false;
    document.getElementById('falgun').disabled = false;
    document.getElementById('chaitra').disabled = false;
    document.getElementById('define-save-button').disabled = false;  // Enable Save
    document.getElementById('define-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('define-new-button').disabled = true; // Disable Delete (until you implement delete logic
    document.getElementById('define-cancel-button').disabled = false;
});

document.getElementById('define-edit-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new District entry
    document.getElementById('define-nepali-date').disabled=false;
    document.getElementById('define-english-date').disabled=false;
    document.getElementById('baisakh').disabled=false;
    document.getElementById('jestha').disabled = false;
    document.getElementById('ashadh').disabled = false;
    document.getElementById('shrawan').disabled = false;  
    document.getElementById('bhadra').disabled = false;
    document.getElementById('ashwin').disabled = false;
    document.getElementById('kartik').disabled = false; 
    document.getElementById('mangsir').disabled = false;
    document.getElementById('poush').disabled = false;
    document.getElementById('magh').disabled = false;
    document.getElementById('falgun').disabled = false;
    document.getElementById('chaitra').disabled = false;
    document.getElementById('define-save-button').disabled = false;  // Enable Save
    document.getElementById('define-delete-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('define-new-button').disabled = true; // Disable Delete (until you implement delete logic
    document.getElementById('define-cancel-button').disabled = false;
});
// Listen for the Vouchermenu New button to enable input fields
document.getElementById('vouchermenuset-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new District entry
    document.getElementById('voucher-menuname').disabled = false;
    document.getElementById('voucher-menualias').disabled = false;
    document.getElementById('voucher-menuorder').disabled = false;
    document.getElementById('voucher-menudisplayname').disabled = false;
    document.getElementById('voucher-menudr-ledger').disabled = false;
    document.getElementById('voucher-menusubdr').disabled = false;
    document.getElementById('voucher-menucr-ledger').disabled = false;
    document.getElementById('voucher-menusubcr').disabled = false;
    document.getElementById('voucher-menuentrytype').disabled = false;
    document.getElementById('voucher-menusinglelgr').disabled = false;
    document.getElementById('voucher-menushowta').disabled = false;
    document.getElementById('voucher-menuallowadjust').disabled = false;
    document.getElementById('voucher-menuprintreceipt').disabled = false;
    document.getElementById('voucher-menuprintdes').disabled = false;
    document.getElementById('voucher-menu-remark').disabled = false;
    document.getElementById('vouchermenuset-save-button').disabled = false;  // Enable Save
    document.getElementById('vouchermenuset-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('vouchermenuset-delete-button').disabled = true; // Disable Delete (until you implement delete logic)
    document.getElementById('vouchermenuset-cancel-button').disabled = false;
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('vouchermenuset-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('voucher-menuname').value = '';
    document.getElementById('voucher-menualias').value = '';
    document.getElementById('voucher-menuorder').value = '';
    document.getElementById('voucher-menudisplayname').value = '';
    document.getElementById('voucher-menudr-ledger').value = '';
    document.getElementById('voucher-menusubdr').value = '';
    document.getElementById('voucher-menucr-ledger').value = '';
    document.getElementById('voucher-menusubcr').value = '';
    document.getElementById('voucher-menuentrytype').value = '';
    document.getElementById('voucher-menusinglelgr').value = '';
    document.getElementById('voucher-menushowta').value = '';
    document.getElementById('voucher-menuallowadjust').value = '';
    document.getElementById('voucher-menuprintreceipt').value = '';
    document.getElementById('voucher-menuprintdes').value = '';
    document.getElementById('voucher-menu-remark').value = '';

    // Disable input fields and buttons
    document.getElementById('voucher-menuname').disabled = true;
    document.getElementById('voucher-menualias').disabled = true;
    document.getElementById('voucher-menuorder').disabled = true;
    document.getElementById('voucher-menudisplayname').disabled = true;
    document.getElementById('voucher-menudr-ledger').disabled = true;
    document.getElementById('voucher-menusubdr').disabled = true;
    document.getElementById('voucher-menucr-ledger').disabled = true;
    document.getElementById('voucher-menusubcr').disabled = true;
    document.getElementById('voucher-menuentrytype').disabled = true;
    document.getElementById('voucher-menusinglelgr').disabled = true;
    document.getElementById('voucher-menushowta').disabled = true;
    document.getElementById('voucher-menuallowadjust').disabled = true;
    document.getElementById('voucher-menuprintreceipt').disabled = true;
    document.getElementById('voucher-menuprintdes').disabled = true;
    document.getElementById('voucher-menu-remark').disabled = true;
    document.getElementById('vouchermenuset-save-button').disabled = true;  // Disable Save button
    document.getElementById('vouchermenuset-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('vouchermenuset-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('vouchermenuset-new-button').disabled = false;  // Enable New button
    document.getElementById('vouchermenuset-cancel-button').disabled = true;  // Disable Cancel button
});



// Listen for the Ledger Sub-group New button to enable input fields
document.getElementById('ledgermsub-new-button').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('ledgermsub-id').disabled = false;
    document.getElementById('ledgermsubalias').disabled = false;
    document.getElementById('ledgermsubaltalias').disabled = false;
    document.getElementById('ledgermsub-remark').disabled = false;
    document.getElementById('ledgermsub-deprication').disabled = false;
    document.getElementById('LedgerGroup2').disabled = false;
    document.getElementById('ledgermsub-save-button').disabled = false;  // Enable Save
    document.getElementById('ledgermsub-edit-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgermsub-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgermsub-cancel-button').disabled = false; 
    // Automatically focus on the first input field (ledgerm-id)
      document.getElementById('ledgermsub-id').focus();
      // Clear input fields as well
      document.getElementById('ledgermsub-id').value = ''; 
      document.getElementById('ledgermsubalias').value = '';  
      document.getElementById('ledgermsubaltalias').value = '';  
      document.getElementById('ledgermsub-remark').value = ''; 
      document.getElementById('ledgermsub-deprication').value = '';
      document.getElementById('LedgerGroup2').value = '';   // Clear the narration input field
     
});
document.getElementById('ledgermsub-edit-button').addEventListener('click', function() {
    
    document.getElementById('ledgermsub-id').disabled = false;
    document.getElementById('ledgermsubalias').disabled = false;
    document.getElementById('ledgermsubaltalias').disabled = false;
    document.getElementById('ledgermsub-remark').disabled = false;
    document.getElementById('ledgermsub-deprication').disabled = false;
    document.getElementById('LedgerGroup2').disabled = false;
    document.getElementById('ledgermsub-save-button').disabled = false;  // Enable Save
    document.getElementById('ledgermsub-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgermsub-delete-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgermsub-cancel-button').disabled = false; 
    // Automatically focus on the first input field (ledgerm-id)
      document.getElementById('ledgermsub-id').focus();
     
     
});

document.getElementById('ledgermsub-delete-button').addEventListener('click', function() {
    
    document.getElementById('ledgermsub-save-button').disabled = true;
    document.getElementById('ledgermsub-new-button').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('ledgermsub-edit-button').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('ledgermsub-cancel-button').disabled = false; 
   
     
     
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('ledgermsub-cancel-button').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('ledgermsub-id').value = '';  
    document.getElementById('ledgermsubalias').value = '';  
    document.getElementById('ledgermsubaltalias').value = '';  
    document.getElementById('ledgermsub-remark').value = ''; 
    document.getElementById('ledgermsub-deprication').value = '';
    document.getElementById('LedgerGroup2').value = '';  
 
    // Disable input fields and buttons
    document.getElementById('ledgermsub-id').disabled = true;
    document.getElementById('ledgermsubalias').disabled = true;
    document.getElementById('ledgermsubaltalias').disabled = true;
    document.getElementById('ledgermsub-remark').disabled = true;
    document.getElementById('ledgermsub-deprication').disabled = true;
    document.getElementById('LedgerGroup2').disabled = true;
    document.getElementById('ledgermsub-save-button').disabled = true;  // Disable Save button
    document.getElementById('ledgermsub-edit-button').disabled = false;  // Enable Edit button
    document.getElementById('ledgermsub-delete-button').disabled = false;  // Enable Delete button
    document.getElementById('ledgermsub-new-button').disabled = false;  // Enable New button
    document.getElementById('ledgermsub-cancel-button').disabled = true;  // Disable Cancel button
});
//Chekbox functionality of the Account analysis
document.getElementById('showDataDiv').addEventListener('change', function() {
    const isChecked = this.checked; // Check if the checkbox is checked

    // Disable or enable elements based on checkbox state
    document.getElementById('startDate').disabled = isChecked;
    document.getElementById('endDate').disabled = isChecked;
    document.getElementById('ason').disabled = isChecked;
    document.getElementById('select-all').disabled = isChecked;
    document.getElementById('showBlankDiv').disabled = isChecked;

    // If "Members Details" is checked, uncheck and disable the other checkboxes
    if (isChecked) {
        document.getElementById('showBlankDiv').checked = false;
        document.getElementById('select-all').checked = false;
    }

});

//Chekbox functionality of the Cash Flow Statement
document.getElementById('cashflow-summary').addEventListener('change', function() {
    const isChecked = this.checked; // Check if the checkbox is checked

    // Disable or enable elements based on checkbox state
    document.getElementById('cashflow-group-wise').disabled = isChecked;
    document.getElementById('cashflow-sub-ledger').disabled = isChecked;

    // If "Summary" is checked, uncheck and disable the other checkboxes
    if (isChecked) {
        document.getElementById('cashflow-group-wise').checked = false;
        document.getElementById('cashflow-sub-ledger').checked = false;
    }

});



document.getElementById('UDFNewbtn').addEventListener('click', function() {
     const UDFDecimalCB = document.getElementById('UDFDecimalCB');
     const UDFShowTotalCB = document.getElementById('UDFShowTotalCB');
    // Enable the input fields and buttons for a new UDF entry
    document.getElementById('UDFField').disabled = false;
    document.getElementById('UDFModule').disabled = false;
    document.getElementById('UDFType').disabled = false;
    document.getElementById('UDFLength').disabled = false;
    document.getElementById('UDForder').disabled = false;
    document.getElementById('UDFDecimalCB').disabled = false;
    document.getElementById('UDFItemwiseCB').disabled = false;
    document.getElementById('UDFShowTotalCB').disabled = false;
    document.getElementById('UDFMandatoryCB').disabled = false;
    document.getElementById('UDFActiveCB').disabled = true;
    document.getElementById('UDFremark').disabled = false;
    document.getElementById('UDFsavebtn').disabled = false;  // Enable Save
    document.getElementById('UDFEditBtn').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('UDFDeleteBtn').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('UDFcancelBtn').disabled = false; 
    // Automatically focus on the first input field (UDFField)
      document.getElementById('UDFField').focus();
      // Clear input fields as well
      document.getElementById('UDFField').value = '';  // Clear the narration input field
     
 function toggleCheckboxesUDF() {
        const isNumber = typeSelect.value === "Number";

        UDFDecimalCB.disabled = !isNumber;
        UDFShowTotalCB.disabled = !isNumber;

        // Optional: also uncheck when disabled
        if (!isNumber) {
            UDFDecimalCB.checked = false;
            UDFShowTotalCB.checked = false;
        }
    }

    // Trigger when user changes selection
    typeSelect.addEventListener("change", toggleCheckboxesUDF);

    // Trigger once on page load
    toggleCheckboxesUDF();




});
document.getElementById('UDFEditBtn').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    document.getElementById('UDFField').disabled = false;
    document.getElementById('UDFModule').disabled = false;
    document.getElementById('UDFType').disabled = false;
    document.getElementById('UDFLength').disabled = false;
    document.getElementById('UDForder').disabled = false;
    document.getElementById('UDFDecimalCB').disabled = false;
    document.getElementById('UDFItemwiseCB').disabled = false;
    document.getElementById('UDFShowTotalCB').disabled = false;
    document.getElementById('UDFMandatoryCB').disabled = false;
    document.getElementById('UDFActiveCB').disabled = false;
    document.getElementById('UDFremark').disabled = false;
    document.getElementById('UDFsavebtn').disabled = false;  // Enable Save
    document.getElementById('UDFNewbtn').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('UDFDeleteBtn').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('UDFcancelBtn').disabled = false; 
    // Automatically focus on the first input field (UDFField)
      document.getElementById('UDFField').focus();
     
     
});
document.getElementById('UDFDeleteBtn').addEventListener('click', function() {
    // Enable the input fields and buttons for a new vdc entry
    
    document.getElementById('UDFsavebtn').disabled = true;  // Enable Save
    document.getElementById('UDFNewbtn').disabled = true; // Disable Edit (you will implement edit logic later)
    document.getElementById('UDFEditBtn').disabled = true; // Disable Delete (until you implement deletta-code-menu
    document.getElementById('UDFcancelBtn').disabled = false; 
  
     
});
// Listen for the "Cancel" button click to reset the form to its initial state
document.getElementById('UDFcancelBtn').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('UDFField').value = '';
    document.getElementById('UDFModule').value = '';
    document.getElementById('UDFType').value = '';
    document.getElementById('UDFLength').value = '';
    document.getElementById('UDForder').value = '';
    document.getElementById('UDFDecimalCB').value = '';
    document.getElementById('UDFItemwiseCB').value = "";
    document.getElementById('UDFShowTotalCB').value = "";
    document.getElementById('UDFMandatoryCB').value = "";
    document.getElementById('UDFActiveCB').value = "";
    document.getElementById('UDFremark').value = ""; 
 
    // Disable input fields and buttons
     document.getElementById('UDFField').disabled = true;
    document.getElementById('UDFModule').disabled = true;
    document.getElementById('UDFType').disabled = true;
    document.getElementById('UDFLength').disabled = true;
    document.getElementById('UDForder').disabled = true;
    document.getElementById('UDFDecimalCB').disabled = true;
    document.getElementById('UDFItemwiseCB').disabled = true;
    document.getElementById('UDFShowTotalCB').disabled = true;
    document.getElementById('UDFMandatoryCB').disabled = true;
    document.getElementById('UDFActiveCB').disabled = true;
    document.getElementById('UDFremark').disabled = true;
    document.getElementById('UDFsavebtn').disabled = true;  // Disable Save button
    document.getElementById('UDFEditBtn').disabled = false;  // Enable Edit button
    document.getElementById('UDFDeleteBtn').disabled = false;  // Enable Delete button
    document.getElementById('UDFNewbtn').disabled = false;  // Enable New button
   
     deleteMode = false;
    selectedUDFID = null;
    document.getElementById("UDFDeleteBtn").innerText = "Delete";
    document.getElementById("udfListdiv").style.display = "none";
    document.getElementById("udfListdiv").innerHTML = "";
});