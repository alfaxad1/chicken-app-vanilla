const purchaseContainer = document.getElementById("purchase-container");
purchaseContainer.style.display = "none";

const expenseContainer = document.getElementById("expense-container");
expenseContainer.style.display = "none";

const chickenLossContainer = document.getElementById("chicken-loss-container");
chickenLossContainer.style.display = "none";

//chicken loss container start
const createChickenLoss = () => {
  chickenLossContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const closeChickenLossForm = () => {
  chickenLossContainer.style.display = "none";
  document.body.style.overflow = "auto";
};

chickenLossContainer.addEventListener("click", (e) => {
  if (e.target === chickenLossContainer) {
    closeChickenLossForm();
  }
});
//chicken loss container end

//purchases container start
const createPurchase = () => {
  purchaseContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const closeForm = () => {
  purchaseContainer.style.display = "none";
  document.body.style.overflow = "auto";
};

purchaseContainer.addEventListener("click", (e) => {
  if (e.target === purchaseContainer) {
    closeForm();
  }
});
//purchases container end

//expense container start
const createExpense = () => {
  expenseContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const closeExpenseForm = () => {
  expenseContainer.style.display = "none";
  document.body.style.overflow = "auto";
};

expenseContainer.addEventListener("click", (e) => {
  if (e.target === expenseContainer) {
    closeForm();
  }
});
//expense container end
let totalPurchasesCost = 0;
let totalExpensesCost = 0;
let totalChickenLoss = 0;
let totalChickenPurchasesCost = 0;

document.addEventListener("DOMContentLoaded", function () {
  const url = "http://localhost:3000";
  const id = localStorage.getItem("ID");
  console.log("id is: ", id);
  const details = document.getElementById("data");

  const fetchChickenPurchaseData = () => {
    fetch(`${url}/api/chicken-purchases/${id}`)
      .then((response) => response.json())
      .then((chickenPurchases) => {
        console.log(chickenPurchases);
        totalChickenPurchasesCost = chickenPurchases[0].total_price;
        console.log(
          `Total chicken purchase cost: ${totalChickenPurchasesCost}`
        );
      });
  };
  fetchChickenPurchaseData();

  //fetch chicken losses start
  const fetchChikenLosses = () => {
    fetch(`${url}/api/batch-chicken-loss`)
      .then((response) => response.json())
      .then((chickenLosses) => {
        console.log(chickenLosses);
        if (chickenLosses) {
          totalChickenLoss = chickenLosses.reduce((sum, loss) => {
            return sum + loss.number;
          }, 0);
          console.log(`Total Chicken Loss: ${totalChickenLoss}`);
        }
      });
  };
  fetchChikenLosses();
  //fetch chicken losses end

  //fetch expenses start
  function displayExpenses() {
    fetch(`${url}/api/batch-expenses`)
      .then((response) => response.json())
      .then((expenses) => {
        console.log(expenses);
        if (expenses) {
          totalExpensesCost = expenses.reduce((sum, expense) => {
            return sum + expense.Price;
          }, 0);
          console.log(`Total expense cost: ${totalExpensesCost}`);
        }
      });
  }
  displayExpenses();
  //fetch expenses end

  function displayPurchases() {
    fetch(`${url}/api/batch-purchases`)
      .then((response) => response.json())
      .then((purchases) => {
        console.log(purchases);
        if (purchases) {
          totalPurchasesCost = purchases.reduce((sum, purchase) => {
            return sum + purchase.total_cost;
          }, 0);
          console.log(`Total purchase cost: ${totalPurchasesCost}`);
        }
      });
  }
  displayPurchases();

  const chickenLossForm = document.getElementById("chickenLoss-form");
  const expensesForm = document.getElementById("expenses-form");
  const purchaseForm = document.getElementById("purchase-form");

  //chicken loss form submission start
  chickenLossForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const chickenType = document.getElementById("chicken-type").value;
    const cause = document.getElementById("cause").value;
    const number = document.getElementById("number").value;
    const date = document.getElementById("date").value;
    const sellerId = localStorage.getItem("ID");

    const saveChickenLoss = () => {
      fetch(`${url}/api/batch-chicken-loss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chickenType, cause, number, date, sellerId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          chickenLossForm.reset();
          closeChickenLossForm();
        })
        .catch((error) => {
          console.log("Error saving", error);
        });
    };
    saveChickenLoss();
  });
  //chicken loss form submission end

  //expense form submission start
  expensesForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("expense-type").value;
    const cost = document.getElementById("expense-cost").value;
    const date = document.getElementById("expense-date").value;

    fetch(`${url}/api/batch-expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, cost, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        closeExpenseForm();
      });
  });
  //expense form submission end

  purchaseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const product = document.getElementById("product").value;
    const qty = document.getElementById("quantity").value;
    const price = document.getElementById("cost").value;
    const date = document.getElementById("purchase-date").value;

    fetch(`${url}/api/batch-purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, qty, price, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
      });
  });
});
