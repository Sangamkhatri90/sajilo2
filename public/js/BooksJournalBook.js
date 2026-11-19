// function to select all checkboxes in a group
                        function selectAll(source, groupClass) {
                            let checkboxes = document.getElementsByName(groupClass);
                            for (let i = 0; i < checkboxes.length; i++) {
                                checkboxes[i].checked = source.checked;
                            }
                        }

