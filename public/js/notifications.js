document.addEventListener("DOMContentLoaded", () => {
  const bell = document.getElementById("notificationBell");
  const menu = document.getElementById("notificationMenu");
  const maturedMessage = document.getElementById("maturedAccountsMessage");
  const systemMessagesSection = document.getElementById("systemMessagesSection");
  const notificationBadge = bell?.querySelector(".notification-badge");
  let loadingTimer;

  if (!bell || !menu || !maturedMessage || !systemMessagesSection) return;

  const closeMenu = () => {
    menu.hidden = true;
    bell.setAttribute("aria-expanded", "false");
  };

  const setMaturedAccountsLoading = (active) => {
    const loader = document.getElementById("page-loader");
    const bar = document.getElementById("loader-bar");
    const number = document.getElementById("loader-num");
    const text = loader?.querySelector(".loader-text");
    if (!loader || !bar || !number || !text) return;

    if (active) {
      clearInterval(loadingTimer);
      let progress = 20;
      bar.style.width = "20%";
      number.textContent = "20%";
      text.lastChild.nodeValue = " Loading matured accounts...";
      loader.classList.remove("hidden");
      loader.setAttribute("aria-hidden", "false");
      loadingTimer = setInterval(() => {
        progress = Math.min(90, progress + 4);
        bar.style.width = `${progress}%`;
        number.textContent = `${progress}%`;
      }, 160);
      return;
    }

    clearInterval(loadingTimer);
    bar.style.width = "100%";
    number.textContent = "100%";
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.setAttribute("aria-hidden", "true");
      bar.style.width = "0%";
      text.lastChild.nodeValue = " Loading...";
    }, 180);
  };

  bell.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
    bell.setAttribute("aria-expanded", String(!menu.hidden));
  });

  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== bell) closeMenu();
  });

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const appendCell = (row, value) => {
    const cell = document.createElement("td");
    cell.textContent = value || "";
    row.appendChild(cell);
  };

  const showMaturedAccounts = (accounts) => {
    const modal = document.createElement("div");
    modal.className = "matured-accounts-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<div class="matured-accounts-dialog"><div class="matured-accounts-heading"><h3>Matured Accounts</h3><button class="matured-accounts-close" type="button" aria-label="Close">&times;</button></div><div class="matured-accounts-content"></div></div>';

    const content = modal.querySelector(".matured-accounts-content");
    if (!accounts.length) {
      content.textContent = "No matured accounts were found.";
    } else {
      const table = document.createElement("table");
      table.className = "matured-accounts-table";
      table.innerHTML = "<thead><tr><th>S.N.</th><th>Account</th><th>Account Name</th><th>Member</th><th>Account Type</th><th>Maturity Date</th><th>Contact</th></tr></thead>";
      const body = document.createElement("tbody");
      accounts.forEach((account, index) => {
        const row = document.createElement("tr");
        appendCell(row, index + 1);
        appendCell(row, account.SlAlias);
        appendCell(row, account.SLName);
        appendCell(row, account.MemberAlias);
        appendCell(row, account.GLName);
        appendCell(row, formatDate(account.MaturityDate));
        appendCell(row, account.Mobile || account.Phone1);
        body.appendChild(row);
      });
      table.appendChild(body);
      content.appendChild(table);
    }

    const close = () => modal.remove();
    modal.querySelector(".matured-accounts-close").addEventListener("click", close);
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.body.appendChild(modal);
  };

  const showLoginMaturedFds = (accounts) => {
    const modal = document.createElement("div");
    modal.className = "matured-accounts-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<div class="matured-accounts-dialog login-matured-fd-dialog"><div class="matured-accounts-heading"><h3>Matured FD Accounts</h3><button class="matured-accounts-close" type="button" aria-label="Close">&times;</button></div><div class="matured-accounts-content"></div><div class="login-matured-fd-actions"><button class="login-matured-fd-action" type="button" data-action="sms">Send SMS</button><div class="login-matured-fd-action-group"><button class="login-matured-fd-action" type="button" data-action="transfer">Transfer</button><button class="login-matured-fd-action" type="button" data-action="ok">Ok</button><button class="login-matured-fd-action" type="button" data-action="print">Print</button><button class="login-matured-fd-action" type="button" data-action="export">Export</button></div></div></div>';

    const content = modal.querySelector(".matured-accounts-content");
    if (!accounts.length) {
      content.textContent = "No matured FD accounts were found.";
    } else {
      const table = document.createElement("table");
      table.className = "highlight-table matured-accounts-table login-matured-fd-table ";
      table.innerHTML = "<thead><tr><th>S.No</th><th>A/c Type</th><th>A/c Number</th><th>A/c</th><th>Member ID</th><th>Address</th><th>Contact No.</th><th>Mobile</th><th></th><th>End Date</th><th>Transfer A/c</th><th>A/c Name</th></tr></thead>";
      const body = document.createElement("tbody");
      accounts.forEach((account, index) => {
        const row = document.createElement("tr");
        [
          index + 1,
          account.GLName,
          account.SlAlias,
          account.SLName,
          account.MemberAlias,
          account.Address1,
          account.Phone1,
          account.Mobile
        ].forEach((value) => appendCell(row, value));

        const checkboxCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(String(account.Mobile || "").trim());
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        appendCell(row, formatDate(account.MaturityDate));
        appendCell(row, account.TransferSlAlias);
        appendCell(row, account.TransferSLName);
        body.appendChild(row);
      });
      table.appendChild(body);
      content.appendChild(table);
      const highlightRow = (row) => {
        body.querySelectorAll("tr.highlight").forEach((highlightedRow) => {
          highlightedRow.classList.remove("highlight");
        });
        row.classList.add("highlight");
      };
      table.addEventListener("click", (event) => {
        const row = event.target.closest("tbody tr");
        if (!row) return;
        highlightRow(row);
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const rows = Array.from(body.rows);
        if (!rows.length) return;
        event.preventDefault();
        const currentIndex = rows.findIndex((row) => row.classList.contains("highlight"));
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = currentIndex === -1
          ? (direction === 1 ? 0 : rows.length - 1)
          : (currentIndex + direction + rows.length) % rows.length;
        highlightRow(rows[nextIndex]);
        rows[nextIndex].scrollIntoView({ block: "nearest" });
      });
    }

    const close = () => modal.remove();
    modal.querySelector(".matured-accounts-close").addEventListener("click", close);
    modal.querySelector('[data-action="ok"]').addEventListener("click", close);
    modal.querySelector('[data-action="print"]').addEventListener("click", () => {
      const table = modal.querySelector(".login-matured-fd-table");
      if (!table) return;
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Allow pop-ups to print matured FD accounts.");
        return;
      }
      printWindow.document.write("<html><head><title>Matured FD Accounts</title><style>table{border-collapse:collapse;font:12px Arial,sans-serif}th,td{border:1px solid #777;padding:5px;text-align:left}th{background:#e8eef3}</style></head><body></body></html>");
      printWindow.document.body.appendChild(table.cloneNode(true));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
    modal.querySelector('[data-action="export"]').addEventListener("click", () => {
      const table = modal.querySelector(".login-matured-fd-table");
      if (!table) return;
      const csv = Array.from(table.rows, (row) =>
        Array.from(row.cells, (cell) => {
          const checkbox = cell.querySelector('input[type="checkbox"]');
          const value = checkbox ? (checkbox.checked ? "Yes" : "No") : cell.textContent.trim();
          return `"${value.replaceAll('"', '""')}"`;
        }).join(",")
      ).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "matured-fd-accounts.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.body.appendChild(modal);
    modal.tabIndex = -1;
    modal.focus();
  };

  fetch("/api/matured-fd-login")
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load matured FD accounts.");
      return response.json();
    })
    .then((accounts) => {
      const hasMaturedAccounts = accounts.length > 0;
      systemMessagesSection.hidden = !hasMaturedAccounts;
      if (notificationBadge) notificationBadge.textContent = hasMaturedAccounts ? "2" : "1";
    })
    .catch((error) => {
      console.error("Failed to check matured FD accounts:", error);
    });

  maturedMessage.addEventListener("click", async () => {
    closeMenu();
    setMaturedAccountsLoading(true);
    try {
      const response = await fetch("/api/matured-fd-login");
      if (!response.ok) throw new Error("Unable to load matured FD accounts.");
      const accounts = await response.json();
      if (!accounts.length) {
        systemMessagesSection.hidden = true;
        if (notificationBadge) notificationBadge.textContent = "1";
        return;
      }
      showLoginMaturedFds(accounts);
    } catch (error) {
      alert(error.message);
    } finally {
      setMaturedAccountsLoading(false);
    }
  });
});
