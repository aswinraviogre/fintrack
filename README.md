# FinTrack — Mini Fintech Dashboard

A lightweight personal finance tracker built with HTML, CSS, and JavaScript. Log income and expenses, filter transactions, view a financial summary, explore spending with a chart, and get rule-based insights — all stored locally in your browser.

---

## What the Project Does

FinTrack helps you manage day-to-day personal finances in one place. You can:

- Record transactions (amount, category, type, date, and optional note)
- Browse and filter your transaction history
- See totals for income, expenses, net balance, and top spending category
- Visualize expense breakdown by category in a bar chart
- Read an automatic insight generated from your financial data

All data is persisted in the browser using `localStorage`, so nothing is sent to a server.

---

## How to Install It

This project has **no build step or dependencies to install**. It is a static web app.

1. Clone or download this repository to your machine.
2. Ensure you have a modern web browser (Chrome, Firefox, Edge, or Safari).
3. An internet connection is required on first load to fetch [Chart.js](https://www.chartjs.org/) from a CDN.



## How to Run It

1. Navigate to the project folder.
2. Open `index.html` in your browser (double-click the file or drag it into a browser window).

That’s it. On first visit, sample transactions are loaded automatically so you can explore the dashboard immediately. Your own entries are saved locally and will appear on future visits.

To reset sample data and start fresh, clear site data / local storage for this page in your browser settings.

---

## Features Implemented

| Requirement | Implementation |
|-------------|----------------|
| **Add a transaction** | Form with amount, category, type (income/expense), date, and optional note |
| **List transactions** | Sortable table with delete support |
| **Filtering** | Filter by category and by date range (from / to) |
| **Summary view** | Total income, total expense, net balance, top spending category |
| **Chart** | Bar chart of spending by category (Chart.js) |
| **Insight** | Rule-based observations derived from transaction data |
| **Currency** | All amounts displayed in Indian Rupees (INR / ₹) |
| **Persistence** | Data saved in `localStorage` |

### Transaction categories

- **Expenses:** Food, Transport, Shopping, Bills, Entertainment, Healthcare, Other  
- **Income:** Salary, Freelance, Investment, Gift, Other  

---

## The Insight Derived from the Data

The app includes a **rule-based insight engine** that analyzes your transactions and surfaces one observation at a time. Rules are evaluated in priority order:

1. **No data** — Prompts you to add transactions.
2. **Income only** — Reports 100% savings rate.
3. **Expenses only** — Suggests adding income sources.
4. **Overspending** — Warns when expenses exceed income and points to the top spending category.
5. **Strong savings (≥ 20%)** — Praises savings rate and highlights the largest expense category as a share of total spending.
6. **Heavy current-month spending** — Flags when most spending occurred in the current month.
7. **Spread across categories** — Notes diversification but encourages a higher savings rate.
8. **Default** — Summarizes top category, net balance, and savings rate.

### Example insight (sample data)

With the built-in sample transactions:

- **Total income:** ₹48,500  
- **Total expenses:** ₹5,070  
- **Net balance:** ₹43,430  
- **Top spending category:** Food (₹1,270)

The dashboard shows an insight similar to:

> *Great job! You're saving 90% of your income. Food is your largest expense at 25% of total spending.*

This tells the user they are financially healthy overall while highlighting where most money is going — useful for deciding whether to cut back in a specific category.

---

## Deployed URL

https://fintrack-git-main-aswin-s-projects17.vercel.app/


## Project Structure

```
app1/
├── index.html    # Main page structure
├── styles.css    # Layout and dark-theme styling
├── app.js        # Application logic, chart, insights, s

## Tech Stack

- HTML5  
- CSS3 (custom properties, responsive grid)  
- JavaScript (ES6+)    
- Browser `localStorage` for persistence  
