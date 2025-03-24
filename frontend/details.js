let totalPurchasesCost = 0;
let totalExpensesCost = 0;
let totalChickenLoss = 0;
let totalChickenPurchasesCost = 0;
let purchaseDate = 0;
let chickenBought = 0;
let totalAgeInWeeks = 0;
let ageInMonths = 0;

document.addEventListener("DOMContentLoaded", function () {
  const url = "http://localhost:3000";
  const id = localStorage.getItem("ID");
  console.log("id is: ", id);
  const details = document.getElementById("data");

  const fetchChickenPurchaseData = async () => {
    await fetch(`${url}/api/chicken-purchases/${id}`)
      .then((response) => response.json())
      .then((chickenPurchases) => {
        console.log(chickenPurchases);
        totalChickenPurchasesCost = chickenPurchases[0].total_price;
        purchaseDate = chickenPurchases[0].purchase_date;
        chickenBought = chickenPurchases[0].no_of_pieces;

        const ageAtPurchase = chickenPurchases[0].age;
        console.log(
          `Total chicken purchase cost: ${totalChickenPurchasesCost}`
        );

        function calculateAgeInWeeks(purchaseDate) {
          let dob = new Date(purchaseDate);
          if (isNaN(dob)) {
            return "Invalid date format. Use YYYY-MM-DD.";
          }
          let currentDate = new Date();

          let diffInMs = currentDate - dob;

          let ageInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
          totalAgeInWeeks = ageInWeeks + ageAtPurchase;
          ageInMonths = (totalAgeInWeeks / 4.345).toFixed(0);

          console.log(`Age in weeks: ${totalAgeInWeeks}`);
          console.log(`Age in months: ${ageInMonths}`);
          console.log(`Age at purchase: ${ageAtPurchase}`);
        }
        calculateAgeInWeeks(purchaseDate);
        fetchChikenLosses().then(() => {
          fetchExpenses().then(() => {
            fetchPurchases().then(() => {
              const chickenInStock =
                parseInt(chickenBought) - parseInt(totalChickenLoss);
              console.log(`Chicken in stock: ${chickenInStock}`);

              details.innerHTML = `
              <button class="back-button" onclick="window.location.href='chickenPurchases.html'"><i class="fas fa-arrow-left"></i >Back</button>
              <h1>${chickenPurchases[0].supplier_id} chicken report</h1>
              <div class="cards-container">
                 <div class="card">
                    <h3>Age at purchase</h3>
                    <h2>${ageAtPurchase}</h2>
                  </div>

                  <div class="card">
                    <h3>Age in weeks</h3>
                    <h2>${totalAgeInWeeks}</h2>
                  </div>

                  <div class="card">
                    <h3>Age in months</h3>
                    <h2>${ageInMonths}</h2>
                  </div>

                  <div class="card">
                    <h3>Total chicken purchase cost</h3>
                    <h2>${totalChickenPurchasesCost}</h2>
                  </div>

                  <div class="card">
                    <h3>Total purchases</h3>
                    <h2>${totalPurchasesCost}</h2>
                  </div>
                  <div class="card">
                    <h3>Total expenses</h3>
                    <h2>${totalExpensesCost}</h2>
                  </div>
                  <div class="card">
                    <h3>Total cost</h3>
                    <h2>
                      ${
                        totalChickenPurchasesCost +
                        totalPurchasesCost +
                        totalExpensesCost
                      }
                    </h2>
                  </div>
                  <div class="card">
                    <h3>Chicken lost</h3>
                    <h2>${totalChickenLoss}</h2>
                  </div>
                  <div class="card">
                    <h3>Chicken in stock</h3>
                    <h2>${chickenInStock}</h2>
                  </div>
                </div>
                `;
            });
          });
        });
      });
  };
  fetchChickenPurchaseData();

  const fetchChikenLosses = async () => {
    await fetch(`${url}/api/batch-chicken-loss`)
      .then((response) => response.json())
      .then((chickenLosses) => {
        console.log(chickenLosses);
        totalChickenLoss = chickenLosses.reduce((sum, loss) => {
          if (loss.seller_id === parseInt(id)) {
            return sum + loss.number;
          }
          return sum;
        }, 0);
        console.log(`Total Chicken Loss: ${totalChickenLoss}`);
      });
  };
  //fetchChikenLosses();

  const fetchExpenses = async () => {
    await fetch(`${url}/api/batch-expenses`)
      .then((response) => response.json())
      .then((expenses) => {
        console.log(expenses);
        totalExpensesCost = expenses.reduce((sum, expense) => {
          if (expense.seller_id === parseInt(id)) {
            return sum + expense.Price;
          }
          return sum;
        }, 0);
        console.log(`Total expense cost: ${totalExpensesCost}`);
      });
  };
  //fetchExpenses();

  const fetchPurchases = async () => {
    await fetch(`${url}/api/batch-purchases`)
      .then((response) => response.json())
      .then((purchases) => {
        console.log(purchases);
        totalPurchasesCost = purchases.reduce((sum, purchase) => {
          if (purchase.seller_id === parseInt(id)) {
            return sum + purchase.price;
          }
          return sum;
        }, 0);
        console.log(`Total purchases cost: ${totalPurchasesCost}`);
      });
  };
  //fetchPurchases();

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
    const sellerId = localStorage.getItem("ID");

    fetch(`${url}/api/batch-expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, cost, date, sellerId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        expensesForm.reset();
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
    const sellerId = localStorage.getItem("ID");

    fetch(`${url}/api/batch-purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, qty, price, date, sellerId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        purchaseForm.reset();
      });
  });
});
