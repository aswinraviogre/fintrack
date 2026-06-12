(() => {
  "use strict";

  const STORAGE_KEY = "fintrack_transactions";

  const EXPENSE_CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Other",
  ];

  const INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Other",
  ];

  const CATEGORY_COLORS = {
    Food: "#f97316",
    Transport: "#3b82f6",
    Shopping: "#ec4899",
    Bills: "#8b5cf6",
    Entertainment: "#eab308",
    Healthcare: "#14b8a6",
    Salary: "#22c55e",
    Freelance: "#06b6d4",
    Investment: "#a78bfa",
    Gift: "#f472b6",
    Other: "#6b7280",
  };

  let transactions = [];
  let chartInstance = null;

  const els = {
    form: document.getElementById("transactionForm"),
    amount: document.getElementById("amount"),
    type: document.getElementById("type"),
    category: document.getElementById("category"),
    date: document.getElementById("date"),
    note: document.getElementById("note"),
    formError: document.getElementById("formError"),
    totalIncome: document.getElementById("totalIncome"),
    totalExpense: document.getElementById("totalExpense"),
    netBalance: document.getElementById("netBalance"),
    topCategory: document.getElementById("topCategory"),
    insightText: document.getElementById("insightText"),
    transactionList: document.getElementById("transactionList"),
    transactionCount: document.getElementById("transactionCount"),
    tableEmpty: document.getElementById("tableEmpty"),
    filterCategory: document.getElementById("filterCategory"),
    filterDateFrom: document.getElementById("filterDateFrom"),
    filterDateTo: document.getElementById("filterDateTo"),
    clearFilters: document.getElementById("clearFilters"),
    chartCanvas: document.getElementById("spendingChart"),
    chartEmpty: document.getElementById("chartEmpty"),
  };

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  }

  function formatDate(isoDate) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoDate + "T00:00:00"));
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      transactions = raw ? JSON.parse(raw) : [];
    } catch {
      transactions = [];
    }
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  function populateCategorySelect(selectEl, type) {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    selectEl.innerHTML = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");
  }

  function populateFilterCategories() {
    const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
    els.filterCategory.innerHTML =
      '<option value="all">All categories</option>' +
      allCategories.map((c) => `<option value="${c}">${c}</option>`).join("");
  }

  function getFilteredTransactions() {
    const cat = els.filterCategory.value;
    const from = els.filterDateFrom.value;
    const to = els.filterDateTo.value;

    return transactions.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      return true;
    });
  }

  function computeTotals(list) {
    let income = 0;
    let expense = 0;
    const expenseByCategory = {};

    for (const t of list) {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    }

    let topCat = "—";
    let topAmount = 0;
    for (const [cat, amt] of Object.entries(expenseByCategory)) {
      if (amt > topAmount) {
        topAmount = amt;
        topCat = cat;
      }
    }

    return { income, expense, net: income - expense, topCat, topAmount, expenseByCategory };
  }

  function generateInsight(allTotals, filteredList) {
    if (transactions.length === 0) {
      return "Add transactions to see personalized insights.";
    }

    const { income, expense, net, topCat, topAmount, expenseByCategory } = allTotals;

    if (expense === 0 && income > 0) {
      return `You've recorded ${formatMoney(income)} in income with no expenses yet — your savings rate is 100%.`;
    }

    if (income === 0 && expense > 0) {
      return `You've spent ${formatMoney(expense)} with no income logged. Consider adding income sources for a complete picture.`;
    }

    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(0) : 0;

    if (net < 0) {
      return `Warning: You're overspending by ${formatMoney(Math.abs(net))}. Expenses exceed income — review your ${topCat !== "—" ? topCat.toLowerCase() : "top"} spending.`;
    }

    if (Number(savingsRate) >= 20) {
      const topPct = expense > 0 ? ((topAmount / expense) * 100).toFixed(0) : 0;
      return `Great job! You're saving ${savingsRate}% of your income. ${topCat} is your largest expense at ${topPct}% of total spending.`;
    }

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthExpenses = transactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(thisMonth)
    );
    const thisMonthTotal = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);

    if (thisMonthExpenses.length >= 3 && thisMonthTotal > expense * 0.5) {
      return `Most of your spending (${formatMoney(thisMonthTotal)}) happened this month. ${topCat} accounts for ${formatMoney(topAmount)} overall — the biggest slice of your budget.`;
    }

    const categories = Object.keys(expenseByCategory);
    if (categories.length >= 3) {
      return `Your spending is spread across ${categories.length} categories. ${topCat} leads at ${formatMoney(topAmount)}, but you're only saving ${savingsRate}% of income — aim for 20%+.`;
    }

    return `${topCat} is your top spending category at ${formatMoney(topAmount)}. Your net balance is ${formatMoney(net)} (${savingsRate}% savings rate).`;
  }

  function renderSummary() {
    const totals = computeTotals(transactions);

    els.totalIncome.textContent = formatMoney(totals.income);
    els.totalExpense.textContent = formatMoney(totals.expense);
    els.netBalance.textContent = formatMoney(totals.net);
    els.netBalance.classList.toggle("positive", totals.net >= 0);
    els.netBalance.classList.toggle("negative", totals.net < 0);

    els.topCategory.textContent =
      totals.topCat === "—" ? "—" : `${totals.topCat} (${formatMoney(totals.topAmount)})`;

    els.insightText.textContent = generateInsight(totals, getFilteredTransactions());
  }

  function renderChart() {
    const totals = computeTotals(transactions);
    const categories = Object.keys(totals.expenseByCategory);
    const amounts = categories.map((c) => totals.expenseByCategory[c]);
    const colors = categories.map((c) => CATEGORY_COLORS[c] || "#6b7280");

    const hasData = categories.length > 0;

    els.chartEmpty.hidden = hasData;
    els.chartCanvas.hidden = !hasData;

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    if (!hasData) return;

    chartInstance = new Chart(els.chartCanvas, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [
          {
            label: "Spending",
            data: amounts,
            backgroundColor: colors.map((c) => c + "cc"),
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatMoney(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#8b9cb3" },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#8b9cb3",
              callback: (v) => "₹" + v,
            },
          },
        },
      },
    });
  }

  function renderTransactionList() {
    const filtered = getFilteredTransactions().sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    els.transactionCount.textContent = `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;
    els.tableEmpty.hidden = filtered.length > 0;

    els.transactionList.innerHTML = filtered
      .map(
        (t) => `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td><span class="tag tag--${t.type}">${t.type}</span></td>
          <td><span class="cat-badge">${t.category}</span></td>
          <td class="note-cell" title="${escapeHtml(t.note || "")}">${escapeHtml(t.note || "—")}</td>
          <td class="table__amount amount--${t.type}">${t.type === "income" ? "+" : "−"}${formatMoney(t.amount)}</td>
          <td><button class="btn btn--danger" data-delete="${t.id}" aria-label="Delete transaction">✕</button></td>
        </tr>`
      )
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    renderSummary();
    renderChart();
    renderTransactionList();
  }

  function handleSubmit(e) {
    e.preventDefault();
    els.formError.hidden = true;

    const amount = parseFloat(els.amount.value);
    const type = els.type.value;
    const category = els.category.value;
    const date = els.date.value;
    const note = els.note.value.trim();

    if (!amount || amount <= 0) {
      els.formError.textContent = "Please enter a valid amount greater than zero.";
      els.formError.hidden = false;
      return;
    }

    if (!date) {
      els.formError.textContent = "Please select a date.";
      els.formError.hidden = false;
      return;
    }

    transactions.push({
      id: crypto.randomUUID(),
      amount,
      type,
      category,
      date,
      note,
    });

    saveTransactions();
    els.form.reset();
    els.date.value = todayISO();
    populateCategorySelect(els.category, els.type.value);
    render();
  }

  function handleDelete(e) {
    const btn = e.target.closest("[data-delete]");
    if (!btn) return;

    const id = btn.dataset.delete;
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    render();
  }

  function handleTypeChange() {
    populateCategorySelect(els.category, els.type.value);
  }

  function clearFilters() {
    els.filterCategory.value = "all";
    els.filterDateFrom.value = "";
    els.filterDateTo.value = "";
    renderTransactionList();
  }

  function seedSampleData() {
    if (transactions.length > 0) return;

    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offset);
      return dt.toISOString().slice(0, 10);
    };

    transactions = [
      { id: crypto.randomUUID(), amount: 45000, type: "income", category: "Salary", date: d(25), note: "Monthly salary" },
      { id: crypto.randomUUID(), amount: 3500, type: "income", category: "Freelance", date: d(10), note: "Logo design" },
      { id: crypto.randomUUID(), amount: 850, type: "expense", category: "Food", date: d(1), note: "Groceries" },
      { id: crypto.randomUUID(), amount: 450, type: "expense", category: "Transport", date: d(2), note: "Petrol" },
      { id: crypto.randomUUID(), amount: 1200, type: "expense", category: "Bills", date: d(5), note: "Electric bill" },
      { id: crypto.randomUUID(), amount: 650, type: "expense", category: "Entertainment", date: d(3), note: "Streaming + movie" },
      { id: crypto.randomUUID(), amount: 1500, type: "expense", category: "Shopping", date: d(7), note: "New shoes" },
      { id: crypto.randomUUID(), amount: 420, type: "expense", category: "Food", date: d(0), note: "Lunch out" },
    ];

    saveTransactions();
  }

  function init() {
    loadTransactions();
    seedSampleData();
    populateCategorySelect(els.category, "expense");
    populateFilterCategories();
    els.date.value = todayISO();

    els.form.addEventListener("submit", handleSubmit);
    els.type.addEventListener("change", handleTypeChange);
    els.transactionList.addEventListener("click", handleDelete);
    els.filterCategory.addEventListener("change", renderTransactionList);
    els.filterDateFrom.addEventListener("change", renderTransactionList);
    els.filterDateTo.addEventListener("change", renderTransactionList);
    els.clearFilters.addEventListener("click", clearFilters);

    render();
  }

  init();
})();
