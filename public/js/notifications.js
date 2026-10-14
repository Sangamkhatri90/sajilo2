document.addEventListener("DOMContentLoaded", () => {
  const bell = document.getElementById("notificationBell");
  const menu = document.getElementById("notificationMenu");
  const maturedMessage = document.getElementById("maturedAccountsMessage");
  let loadingTimer;

  if (!bell || !menu || !maturedMessage) return;

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

  maturedMessage.addEventListener("click", async () => {
    closeMenu();
    setMaturedAccountsLoading(true);
    try {
      const response = await fetch("/api/matured-accounts");
      if (!response.ok) throw new Error("Unable to load matured accounts.");
      showMaturedAccounts(await response.json());
    } catch (error) {
      alert(error.message);
    } finally {
      setMaturedAccountsLoading(false);
    }
  });
});
