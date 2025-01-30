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
        // Display saved purchases
        displayPurchases();

        // Clear form
        purchaseForm.reset();
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

          row.innerHTML = `
              <td><input type="text" id="purchase-product-${purchase.id}" value="${purchase.product_name}" disabled></td>
              <td><input type="number" id="purchase-quantity-${purchase.id}" value="${purchase.quantity}" disabled></td>
              <td><input type="number" id="purchase-price-${purchase.id}" value="${purchase.price}" disabled></td>
              <td><input type="date" id="purchase-date-${purchase.id}" value="${purchase.purchase_date}" disabled></td>
              <td class="action-buttons">
                <button onclick="enableEditingPurchase(${purchase.id})">Edit</button>
                <button id="save-btn-purchase-${purchase.id}" onclick="savePurchase(${purchase.id})" style="display:none;">Save</button>
                <button onclick="deletePurchase(${purchase.id})">Delete</button>
              </td> `;
          tableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching purchases:", error));
  }

  function enableEditingPurchase(id) {
    document.getElementById(`purchase-product-${id}`).disabled = false;
    document.getElementById(`purchase-quantity-${id}`).disabled = false;
    document.getElementById(`purchase-price-${id}`).disabled = false;
    document.getElementById(`purchase-date-${id}`).disabled = false;
    document.getElementById(`save-btn-purchase-${id}`).style.display = "inline";
  }

  function savePurchase(id) {
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
  }

  function deletePurchase(id) {
    const confirmed = confirm("Do you want to delete this purchase?");
    if (confirmed) {
      fetch(`${url}/api/purchases/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          displayPurchases();
        })
        .catch((error) => {
          console.error("Error:", error);
          displayPurchases();
        });
    }
  }

  displayPurchases();
});
