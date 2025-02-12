const container = document.getElementById("container");
container.style.display = "none";

const create = () => {
  container.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const closeForm = () => {
  container.style.display = "none";
  document.body.style.overflow = "auto";
};

container.addEventListener("click", (e) => {
  if (e.target === container) {
    closeForm();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const url = "http://localhost:3000";
  const expensesForm = document.getElementById("expenses-form");
  const expensesData = document.getElementById("expenses-data");

  // Handle expenses form submission
  expensesForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const type = document.getElementById("expense-type").value;
    const cost = document.getElementById("expense-cost").value;
    const date = document.getElementById("expense-date").value;

    // Save to the database
    fetch(`${url}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, cost, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        const info = document.getElementById("info");
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.innerHTML = `<p>${data.message}</p>`;
        info.appendChild(toast);
        setTimeout(() => {
          toast.remove();
        }, 2000);

        expensesForm.reset();
        closeForm();
        displayExpenses();
      })
      .catch((error) => {
        console.error("Error saving expense:", error);
      });
  });

  function displayExpenses() {
    fetch(`${url}/api/expenses`)
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
        `;

        //search bar implementation
        searchBar = document.getElementById("search-bar");
        const tableBody = document.getElementById("expenses-table-body");
        const renderTable = (filteredExpenses) => {
          tableBody.innerHTML = "";

          filteredExpenses.forEach((expense) => {
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
        };

        renderTable(expenses);

        searchBar.addEventListener("keyup", (e) => {
          const searchString = e.target.value.toLowerCase();
          const filteredExpenses = expenses.filter((expense) => {
            return expense.Type.toLowerCase().includes(searchString);
          });
          renderTable(filteredExpenses);
        });
      })

      .catch((error) => {
        console.error("Error fetching expenses:", error);
        expensesData.innerHTML =
          "<p>Error loading expenses. Please try again later.</p>";
      });
  }

  // Make these functions global so they can be accessed by the onclick handlers
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

    fetch(`${url}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, cost, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        const info = document.getElementById("info");
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.innerHTML = `<p>${data.message}</p>`;
        info.appendChild(toast);
        setTimeout(() => {
          toast.remove();
        }, 2000);
        displayExpenses();
      })
      .catch((error) => console.error("Error updating expense:", error));
  };

  window.deleteExpense = function (id) {
    const confirmed = confirm("Do you want to delete this expense?");
    if (confirmed) {
      fetch(`${url}/api/expenses/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          displayExpenses();
          const info = document.getElementById("info");
          const toast = document.createElement("div");
          toast.classList.add("toast");
          toast.innerHTML = `<p>${data.message}</p>`;
          info.appendChild(toast);
          setTimeout(() => {
            toast.remove();
          }, 2000);
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
          displayExpenses();
        });
    }
  };

  // Display expenses when the page loads
  displayExpenses();
});
