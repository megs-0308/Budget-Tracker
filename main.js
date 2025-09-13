class BudgetTracker {
    constructor() {
      this.transactions = this.loadTransactions();
      this.form = document.getElementById("transactionForm");
      this.transactionList = document.getElementById("transactionList");
      this.balanceElement = document.getElementById("balance");
      this.transactionChart = null; // Chart instance
      this.currencySelector = document.getElementById("currency");
  
      this.currencySymbol = this.currencySelector.value;
  
      this.initEventListeners();
      this.renderTransactions();
      this.updateBalance();
      this.renderChart();
    }
  
    loadTransactions() {
      return JSON.parse(localStorage.getItem("transactions")) || [];
    }
  
    saveTransactions() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }
  
    initEventListeners() {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.addTransaction();
      });
  
      this.currencySelector.addEventListener("change", (e) => {
        this.currencySymbol = e.target.value;
        this.updateBalance();
        this.renderChart();
      });
    }
  
    clearForm() {
      document.getElementById("description").value = "";
      document.getElementById("amount").value = "";
    }
  
    addTransaction() {
      const description = document.getElementById("description").value.trim();
      const amount = parseFloat(document.getElementById("amount").value);
      const type = document.getElementById("type").value;
  
      if (!description || isNaN(amount)) {
        alert("Please provide a valid description and amount.");
        return;
      }
  
      const transaction = {
        id: Date.now(),
        description,
        amount: type === "expense" ? -amount : amount,
        type,
      };
  
      this.transactions.push(transaction);
      this.saveTransactions();
      this.renderTransactions();
      this.updateBalance();
      this.renderChart();
      this.clearForm();
    }
  
    renderTransactions() {
      this.transactionList.innerHTML = "";
      this.transactions
        .slice()
        .sort((a, b) => b.id - a.id)
        .forEach((transaction) => {
          const transactionDiv = document.createElement("div");
          transactionDiv.classList.add("transaction", transaction.type);
          transactionDiv.innerHTML = `
            <span>${transaction.description}</span>
            <span class="transaction-amount-container">
              ${this.currencySymbol}${Math.abs(transaction.amount).toFixed(2)}
              <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            </span>
          `;
          const deleteBtn = transactionDiv.querySelector(".delete-btn");
          deleteBtn.addEventListener("click", (e) => {
            this.deleteTransaction(e.target.dataset.id);
          });
          this.transactionList.appendChild(transactionDiv);
        });
    }
  
    deleteTransaction(id) {
      this.transactions = this.transactions.filter((t) => t.id !== parseInt(id));
      this.saveTransactions();
      this.renderTransactions();
      this.updateBalance();
      this.renderChart();
    }
  
    updateBalance() {
      const balance = this.transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
  
      this.balanceElement.innerHTML = `Balance: ${this.currencySymbol}${balance}`;

      this.balanceElement.style.color = balance >= 0 ? "#2ecc71" : "#e74c3c";
    }
  
    renderChart() {
      const balance = this.transactions.reduce((sum, t) => sum + t.amount, 0);
      const expenses = this.transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
      
      if (this.transactionChart) {
        this.transactionChart.destroy();
      }
  
      const chartData = {
        labels: ["Remaining Balance", "Expenses"],
        datasets: [
          {
            label: "Budget Overview",
            data: [balance >= 0 ? balance : 0, expenses],
            backgroundColor: [this.getBalanceColor(), this.getExpenseColor()],
          },
        ],
      };
  
      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      };
  
      this.transactionChart = new Chart(document.getElementById("transactionChart"), {
        type: "pie",
        data: chartData,
        options: chartOptions,
      });
    }
  
    getBalanceColor() {
      return "rgba(46, 204, 113, 0.5)"; // Green for remaining balance
    }
  
    getExpenseColor() {
      return "rgba(231, 76, 60, 0.5)"; // Red for expenses
    }
  }
  
  const budgetTracker = new BudgetTracker();