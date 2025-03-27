const purchaseContainer = document.getElementById("purchase-container");
purchaseContainer.style.display = "none";

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

const url = "http://localhost:3000";
const purchaseForm = document.getElementById("purchase-form");
const purchasesData = document.getElementById("purchases-data");

let currentPage = 0;
const recordsPerPage = 10;

const sellerId = localStorage.getItem("ID");

document.addEventListener("DOMContentLoaded", function () {
  function displayPurchases() {
    fetch(`${url}/api/batch-purchases/${sellerId}`)
      .then((response) => response.json())
      .then((purchases) => {
        purchasesData.innerHTML = `
        <input
        id="search-bar"
        class="fas fa-search"
        placeholder="search"
        type="text"
      />
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity (bags)</th>
                  <th>Cost (Ksh)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="purchases-table-body"></tbody>
            </table>
            <button id="prev-button" style="display: none;"><</button>
            <button id="next-button">></button>
          `;

        const prevButton = document.getElementById("prev-button");
        const nextButton = document.getElementById("next-button");

        //search bar implementation
        searchBar = document.getElementById("search-bar");
        const tableBody = document.getElementById("purchases-table-body");

        const renderTable = (filteredPurchases) => {
          tableBody.innerHTML = "";

          const start = currentPage * recordsPerPage;
          const end = start + recordsPerPage;
          const paginatedPurchases = filteredPurchases.slice(start, end);

          paginatedPurchases.forEach((purchase) => {
            const row = document.createElement("tr");

            //logic to remove the actions column when the user is not an admin
            let actions = `
              <td class="action-buttons" id="purchase-actions">
                <button class="edit-btn" onclick="enableEditingPurchase(${purchase.id})">Edit</button>
                <button class="save-btn"id="save-btn-purchase-${purchase.id}" onclick="savePurchase(${purchase.id})" style="display:none;">Save</button>
                <button class="delete-btn" id="delete-btn-purchase-${purchase.id}" onclick="deletePurchase(${purchase.id})">Delete</button>
              </td>`;
            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role !== "admin" && user.role !== "superadmin") {
              actions = `<td></td>`;
            }

            row.innerHTML = `
              <td><input type="text" id="purchase-product-${purchase.id}" value="${purchase.product_name}" disabled></td>
              <td><input type="number" id="purchase-quantity-${purchase.id}" value="${purchase.quantity}" disabled></td>
              <td><input type="number" id="purchase-price-${purchase.id}" value="${purchase.price}" disabled></td>
              <td><input type="date" id="purchase-date-${purchase.id}" value="${purchase.purchase_date}" disabled></td>
              ${actions}
               `;
            tableBody.appendChild(row);
          });
          // Disable the next button if there are no more records
          nextButton.style.display =
            end >= filteredPurchases.length ? "none" : "inline";
          // Disable the previous button if on the first page
          prevButton.style.display = currentPage === 0 ? "none" : "inline";
        };
        renderTable(purchases);

        searchBar.addEventListener("keyup", (e) => {
          const searchString = e.target.value.toLowerCase();
          const filteredPurchases = purchases.filter((purchase) => {
            return purchase.product_name.toLowerCase().includes(searchString);
          });
          renderTable(filteredPurchases);
        });
        nextButton.addEventListener("click", () => {
          currentPage++;
          renderTable(purchases);
        });
        prevButton.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--;
            renderTable(purchases);
          }
        });
      })
      .catch((error) => console.error("Error fetching purchases:", error));
  }
  window.enableEditingPurchase = function (id) {
    document.getElementById(`purchase-product-${id}`).disabled = false;
    document.getElementById(`purchase-quantity-${id}`).disabled = false;
    document.getElementById(`purchase-price-${id}`).disabled = false;
    document.getElementById(`purchase-date-${id}`).disabled = false;
    document.getElementById(`save-btn-purchase-${id}`).style.display = "inline";
  };

  window.savePurchase = function (id) {
    const product_name = document.getElementById(
      `purchase-product-${id}`
    ).value;
    const quantity = document.getElementById(`purchase-quantity-${id}`).value;
    const price = document.getElementById(`purchase-price-${id}`).value;
    const purchase_date = document.getElementById(`purchase-date-${id}`).value;

    fetch(`${url}/api/batch-purchases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name,
        quantity,
        price,
        purchase_date,
        sellerId,
      }),
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
        displayPurchases();
      })
      .catch((error) => console.error("Error updating purchase:", error));
  };

  window.deletePurchase = function (id) {
    const confirmed = confirm("Do you want to delete this purchase?");
    if (confirmed) {
      fetch(`${url}/api/batch-purchases/${id}`, {
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
          displayPurchases();
        })
        .catch((error) => {
          console.error("Error:", error);
          displayPurchases();
        });
    }
  };

  displayPurchases();

  purchaseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const product = document.getElementById("product").value;
    const qty = document.getElementById("quantity").value;
    const price = document.getElementById("cost").value;
    const date = document.getElementById("purchase-date").value;
    //const sellerId = localStorage.getItem("ID");

    fetch(`${url}/api/batch-purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, qty, price, date, sellerId }),
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
        displayPurchases();
        closeForm();
        purchaseForm.reset();
      });
  });
});
