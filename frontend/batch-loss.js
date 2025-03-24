const chickenLossContainer = document.getElementById("chicken-loss-container");
chickenLossContainer.style.display = "none";

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
