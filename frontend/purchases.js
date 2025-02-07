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
  const purchaseForm = document.getElementById("purchase-form");
  const purchasesData = document.getElementById("purchases-data");

  // Handle purchase form submission
  purchaseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const product = document.getElementById("product").value;
    const qty = document.getElementById("quantity").value;
    const price = document.getElementById("cost").value;
    const date = document.getElementById("purchase-date").value;

    // Save to database
    fetch(`${url}/api/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, qty, price, date }),
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

        displayPurchases();
        purchaseForm.reset();
        closeForm();
      })
      .catch((error) => console.error("Error: ", error));
  });

  function displayPurchases() {
    fetch(`${url}/api/purchases`)
      .then((response) => response.json())
      .then((purchases) => {
        purchasesData.innerHTML = `
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity (kg)</th>
                  <th>Cost (Ksh)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="purchases-table-body"></tbody>
            </table>
          `;

        const tableBody = document.getElementById("purchases-table-body");

        purchases.forEach((purchase) => {
          const row = document.createElement("tr");

          //logic to remove the actions column when the user is not an admin
          let actions = `
              <td class="action-buttons" id="purchase-actions">
                <button onclick="enableEditingPurchase(${purchase.id})">Edit</button>
                <button id="save-btn-purchase-${purchase.id}" onclick="savePurchase(${purchase.id})" style="display:none;">Save</button>
                <button id="delete-btn-purchase-${purchase.id}" onclick="deletePurchase(${purchase.id})">Delete</button>
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
    const product = document.getElementById(`purchase-product-${id}`).value;
    const quantity = document.getElementById(`purchase-quantity-${id}`).value;
    const price = document.getElementById(`purchase-price-${id}`).value;
    const date = document.getElementById(`purchase-date-${id}`).value;

    fetch(`${url}/api/purchases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, quantity, price, date }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        displayPurchases();
      })
      .catch((error) => console.error("Error updating purchase:", error));
  };

  window.deletePurchase = function (id) {
    const confirmed = confirm("Do you want to delete this purchase?");
    if (confirmed) {
      fetch(`${url}/api/purchases/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          displayPurchases();
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
          console.error("Error:", error);
          displayPurchases();
        });
    }
  };

  displayPurchases();
});
