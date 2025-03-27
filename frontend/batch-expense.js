const expenseContainer = document.getElementById("expense-container");
expenseContainer.style.display = "none";

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

const expensesForm = document.getElementById("expenses-form");
const url = "http://localhost:3000";
const expensesData = document.getElementById("expenses-data");
let currentPage = 0;
const recordsPerPage = 10;
const sellerId = localStorage.getItem("ID");

document.addEventListener("DOMContentLoaded", function () {
  function displayExpenses() {
    fetch(`${url}/api/batch-expenses/${sellerId}`)
      .then((response) => response.json())
      .then((expenses) => {
        if (expenses.length === 0) {
          expensesData.innerHTML = "<p>No expenses recorded yet.</p>";
          return;
        }
        expensesData.innerHTML = `
      <input
      id="search-bar"
      class="fas fa-search"
      placeholder="search"
      type="text"
    />
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Cost (Ksh)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="expenses-table-body"></tbody>
        </table>
        <button id="prev-button" style="display: none;"><</button>
        <button id="next-button">></button>
      `;

        const prevButton = document.getElementById("prev-button");
        const nextButton = document.getElementById("next-button");

        //search bar implementation
        searchBar = document.getElementById("search-bar");
        const tableBody = document.getElementById("expenses-table-body");
        const renderTable = (filteredExpenses) => {
          tableBody.innerHTML = "";

          const start = currentPage * recordsPerPage;
          const end = start + recordsPerPage;
          const paginatedExpenses = filteredExpenses.slice(start, end);

          paginatedExpenses.forEach((expense) => {
            //logic to remove the actions column when the user is not an admin
            let actions = `
        <td class="action-buttons">
          <button class="edit-btn" onclick="enableEditingExpense(${expense.id})">Edit</button>
          <button id="save-btn-expense-${expense.id}" onclick="saveExpense(${expense.id})" style="display:none;">Save</button>
          <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
        </td>`;

            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role !== "admin" && user.role !== "superadmin") {
              actions = `<td></td>`;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
          <td><input type="text" id="expense-type-${expense.id}" value="${
              expense.Type
            }" disabled></td>
          <td><input type="number" id="expense-cost-${expense.id}" value="${
              expense.Price
            }" disabled></td>
          <td><input type="date" id="expense-date-${expense.id}" value="${
              expense.Date.split("T")[0]
            }" disabled></td>
        ${actions}
          `;
            tableBody.appendChild(row);
          });

          // Disable the next button if there are no more records
          nextButton.style.display =
            end >= filteredExpenses.length ? "none" : "inline";
          // Disable the previous button if on the first page
          prevButton.style.display = currentPage === 0 ? "none" : "inline";
        };

        renderTable(expenses);

        searchBar.addEventListener("keyup", (e) => {
          const searchString = e.target.value.toLowerCase();
          const filteredExpenses = expenses.filter((expense) => {
            return expense.Type.toLowerCase().includes(searchString);
          });
          renderTable(filteredExpenses);
        });
        nextButton.addEventListener("click", () => {
          currentPage++;
          renderTable(expenses);
        });
        prevButton.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--;
            renderTable(expenses);
          }
        });
      })

      .catch((error) => {
        console.error("Error fetching expenses:", error);
        expensesData.innerHTML =
          "<p>Error loading expenses. Please try again later.</p>";
      });
  }

  window.enableEditingExpense = function (id) {
    document.getElementById(`expense-type-${id}`).disabled = false;
    document.getElementById(`expense-cost-${id}`).disabled = false;
    document.getElementById(`expense-date-${id}`).disabled = false;
    document.getElementById(`save-btn-expense-${id}`).style.display = "inline";
  };

  window.saveExpense = function (id) {
    const type = document.getElementById(`expense-type-${id}`).value;
    const cost = document.getElementById(`expense-cost-${id}`).value;
    const date = document.getElementById(`expense-date-${id}`).value;

    fetch(`${url}/api/batch-expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, cost, date, sellerId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        Toastify({
          text: data.message,
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          stopOnFocus: true,
        }).showToast();
        displayExpenses();
      })
      .catch((error) => console.error("Error updating expense:", error));
  };

  window.deleteExpense = function (id) {
    const confirmed = confirm("Do you want to delete this expense?");
    if (confirmed) {
      fetch(`${url}/api/batch-expenses/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          Toastify({
            text: data.message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            stopOnFocus: true,
          }).showToast();
          displayExpenses();
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
          displayExpenses();
        });
    }
  };
  displayExpenses();

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
        Toastify({
          text: data.message,
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          stopOnFocus: true,
        }).showToast();
        expensesForm.reset();
        closeExpenseForm();
        displayExpenses();
      });
  });
});
