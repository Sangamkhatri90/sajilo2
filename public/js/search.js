//Receipt Voucher Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("rv-search-button");
    const movableDiv = document.getElementById("movableDiv98");
    const searchPanel = document.getElementById("rv-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1490px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});

//Ledger Master
document.addEventListener("DOMContentLoaded", function () {
const searchButton = document.getElementById("lm-search-button");
const movableDiv = document.getElementById("movableDiv88");
const searchPanel = document.getElementById("lm-search");

searchButton.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default button behavior

    // Toggle the search panel visibility
    if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
        searchPanel.style.display = "block";
        movableDiv.style.width = "92%"; // Expand the movableDiv
    } else {
        searchPanel.style.display = "none";
        movableDiv.style.width = "920px"; // Restore the original width
    }

    // Smooth transitions for both the div and panel
    movableDiv.style.transition = "width 0.3s ease";
    searchPanel.style.transition = "all 0.3s ease";
});
});

//Sub Ledger Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("slm-search-button");
    const movableDiv = document.getElementById("movableDiv91");
    const searchPanel = document.getElementById("slm-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "97%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1000px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

    
    
//Collector Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("cm-search-button");
    const movableDiv = document.getElementById("movableDiv94");
    const searchPanel = document.getElementById("cm-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "86%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "870px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });
    
//Doc Class Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("dcm-search-button");
    const movableDiv = document.getElementById("movableDiv30");
    const searchPanel = document.getElementById("dcm-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "86%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "860px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

//Journal Voucher Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("jv-search-button");
    const movableDiv = document.getElementById("movableDiv38");
    const searchPanel = document.getElementById("jv-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1490px"; // Adjust width for the movableDiv to accommodate the bigger panel
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1027px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

//Member Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("mm-search-button");
    const movableDiv = document.getElementById("movableDiv96");
    const searchPanel = document.getElementById("mm-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1425px"; // Adjust width for the movableDiv to accommodate the bigger panel
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "947px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

    //Account Type Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("atm-search-button");
    const movableDiv = document.getElementById("movableDiv76");
    const searchPanel = document.getElementById("atm-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "84%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "820px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

       //Interest Setting
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("is-search-button");
    const movableDiv = document.getElementById("movableDiv37");
    const searchPanel = document.getElementById("is-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "92%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "820px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

    
       //Penalty Setting
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("ps-search-button");
    const movableDiv = document.getElementById("movableDiv45");
    const searchPanel = document.getElementById("ps-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "92%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "820px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

        //Rebate Setting
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("rs-search-button");
    const movableDiv = document.getElementById("movableDiv49");
    const searchPanel = document.getElementById("rs-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "92%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "820px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

    
        //Alert Setting
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("as-search-button");
    const movableDiv = document.getElementById("movableDiv102");
    const searchPanel = document.getElementById("as-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "92%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "820px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

//Cheque Master Issue
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("cim-search-button");
    const movableDiv = document.getElementById("movableDiv104");
    const searchPanel = document.getElementById("cim-search");
    
    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior
    
        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "85%"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "857px"; // Restore the original width
        }
    
        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
    });

    //Payment Voucher Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("pvm-search-button");
    const movableDiv = document.getElementById("movableDiv106");
    const searchPanel = document.getElementById("pvm-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1480px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});

    //Collection Master
    document.addEventListener("DOMContentLoaded", function () {
        const searchButton = document.getElementById("colm-search-button");
        const movableDiv = document.getElementById("movableDiv108");
        const searchPanel = document.getElementById("colm-search");
    
        searchButton.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent default button behavior
    
            // Toggle the search panel visibility
            if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
                searchPanel.style.display = "block";
                movableDiv.style.width = "1482px"; // Expand the movableDiv
            } else {
                searchPanel.style.display = "none";
                movableDiv.style.width = "1013px"; // Restore the original width
            }
    
            // Smooth transitions for both the div and panel
            movableDiv.style.transition = "width 0.3s ease";
            searchPanel.style.transition = "all 0.3s ease";
        });
    });

        //Transaction Master
        document.addEventListener("DOMContentLoaded", function () {
            const searchButton = document.getElementById("tm-search-button");
            const movableDiv = document.getElementById("movableDiv99");
            const searchPanel = document.getElementById("tm-search");
        
            searchButton.addEventListener("click", function (e) {
                e.preventDefault(); // Prevent default button behavior
        
                // Toggle the search panel visibility
                if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
                    searchPanel.style.display = "block";
                    movableDiv.style.width = "1910px"; // Expand the movableDiv
                } else {
                    searchPanel.style.display = "none";
                    movableDiv.style.width = "1060px"; // Restore the original width
                }
        
                // Smooth transitions for both the div and panel
                movableDiv.style.transition = "width 0.3s ease";
                searchPanel.style.transition = "all 0.3s ease";
            });
        });

//Distribution Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("dim-search-button");
    const movableDiv = document.getElementById("movableDiv110");
    const searchPanel = document.getElementById("dim-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1482px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});

//Interest Posting Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("ipm-search-button");
    const movableDiv = document.getElementById("movableDiv112");
    const searchPanel = document.getElementById("ipm-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1482px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});

//Mbank Voucher Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("mvm-search-button");
    const movableDiv = document.getElementById("movableDiv114");
    const searchPanel = document.getElementById("mvm-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1482px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});

//Share Transaction Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("stm-search-button");
    const movableDiv = document.getElementById("movableDiv116");
    const searchPanel = document.getElementById("stm-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1482px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});


//Collection Cheque Master
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("ccm-search-button");
    const movableDiv = document.getElementById("movableDiv119");
    const searchPanel = document.getElementById("ccm-search");

    searchButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default button behavior

        // Toggle the search panel visibility
        if (searchPanel.style.display === "none" || searchPanel.style.display === "") {
            searchPanel.style.display = "block";
            movableDiv.style.width = "1482px"; // Expand the movableDiv
        } else {
            searchPanel.style.display = "none";
            movableDiv.style.width = "1013px"; // Restore the original width
        }

        // Smooth transitions for both the div and panel
        movableDiv.style.transition = "width 0.3s ease";
        searchPanel.style.transition = "all 0.3s ease";
    });
});