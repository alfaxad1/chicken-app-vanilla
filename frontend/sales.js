document.addEventListener("DOMContentLoaded", function () {
  const saleTypeSelect = document.getElementById("sale-type");
  const chickenSaleFields = document.getElementById("chicken-sale-fields");
  const eggsSaleFields = document.getElementById("eggs-sale-fields");
  const salesForm = document.getElementById("sales-form");
  const salesData = document.getElementById("sales-data");

  // Initially show chicken sale fields
  chickenSaleFields.style.display = "block";
  eggsSaleFields.style.display = "none";

  // Handle sale type change
  saleTypeSelect.addEventListener("change", function () {
    if (this.value === "chicken") {
      chickenSaleFields.style.display = "block";
      eggsSaleFields.style.display = "none";
    } else {
      chickenSaleFields.style.display = "none";
      eggsSaleFields.style.display = "block";
    }
  });

  // Auto-calculate totals
  document
    .getElementById("price-per-piece")
    .addEventListener("input", calculateChickenTotal);
  document
    .getElementById("number-of-pieces")
    .addEventListener("input", calculateChickenTotal);
  document
    .getElementById("price-per-tray")
    .addEventListener("input", calculateEggsTotal);
  document
    .getElementById("quantity-trays")
    .addEventListener("input", calculateEggsTotal);

  function calculateChickenTotal() {
    const price =
      parseFloat(document.getElementById("price-per-piece").value) || 0;
    const pieces =
      parseInt(document.getElementById("number-of-pieces").value) || 0;
    document.getElementById("total-price-chicken").value = (
      price * pieces
    ).toFixed(2);
  }

  function calculateEggsTotal() {
    const price =
      parseFloat(document.getElementById("price-per-tray").value) || 0;
    const quantity =
      parseInt(document.getElementById("quantity-trays").value) || 0;
    document.getElementById("total-price-eggs").value = (
      price * quantity
    ).toFixed(2);
  }

  // Handle sales form submission
  salesForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data based on sale type
    let saleData;
    const saleType = saleTypeSelect.value;

    if (saleType === "chicken") {
      saleData = {
        customer_id: document.getElementById("customer-id-chicken").value,
        sale_type: "chicken",
        chicken_type: document.getElementById("type-of-chicken").value,
        price_per_piece: document.getElementById("price-per-piece").value,
        number_of_pieces: document.getElementById("number-of-pieces").value,
        total_price: document.getElementById("total-price-chicken").value,
        date: document.getElementById("chicken-sale-date").value,
      };
    } else {
      saleData = {
        customer_id: document.getElementById("customer-id-eggs").value,
        sale_type: "eggs",
        quantity_sold: document.getElementById("quantity-trays").value,
        price_per_unit: document.getElementById("price-per-tray").value,
        total_price: document.getElementById("total-price-eggs").value,
        date: document.getElementById("eggs-sale-date").value,
      };
    }
    const url = "http://localhost:3000";

    // Save to the database
    fetch(`${url}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        alert("Sale saved successfully!");
        displaySales();
        salesForm.reset();
      })
      .catch((error) => {
        console.error("Error saving sale:", error);
        alert("Error saving sale. Please try again.");
      });
  });

  function displaySales() {
    fetch(`${url}/api/sales`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((sales) => {
        console.log("Received sales data:", sales);

        // Ensure salesData exists
        if (!salesData) {
          console.error("Sales data container not found");
          return;
        }

        // Clear previous content
        salesData.innerHTML = "";

        // Create table structure
        const table = document.createElement("table");
        table.innerHTML = `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer ID</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Price per Unit</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="sales-table-body"></tbody>
            `;
        salesData.appendChild(table);

        // Get table body
        const tableBody = document.getElementById("sales-table-body");

        // Ensure table body exists
        if (!tableBody) {
          console.error("Sales table body not found");
          return;
        }

        // Check if sales array is empty
        if (sales.length === 0) {
          tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center;">No sales recorded yet.</td>
                    </tr>
                `;
          return;
        }

        // Populate table with sales data
        sales.forEach((sale) => {
          const row = document.createElement("tr");

          // Format the date
          const formattedDate = sale.date
            ? new Date(sale.date).toLocaleDateString()
            : "N/A";

          // Determine sale type and quantity
          const saleType = sale.chicken_type || "Eggs";
          const quantity = sale.number_of_pieces || sale.quantity_sold || "N/A";
          const pricePerUnit =
            sale.price_per_piece || sale.price_per_unit || "N/A";

          row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${sale.customer_id || "N/A"}</td>
                    <td>${saleType}</td>
                    <td>${quantity}</td>
                    <td>${pricePerUnit}</td>
                    <td>${sale.total_price || "N/A"}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" onclick="enableEditingSale(${
                          sale.id
                        })">Edit</button>
                        <button class="delete-btn" onclick="deleteSale(${
                          sale.id
                        })">Delete</button>
                    </td>
                `;

          tableBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Error fetching sales:", error);

        // Ensure salesData exists before modifying
        if (salesData) {
          salesData.innerHTML = `<p>Error loading sales: ${error.message}. Please try again later.</p>`;
        } else {
          console.error("Sales data container not found");
        }
      });
  }

  // Call displaySales when the page loads
  document.addEventListener("DOMContentLoaded", displaySales);

  window.enableEditingSale = function (id) {
    // Implement editing functionality here
  };

  window.deleteSale = function (id) {
    const confirmed = confirm("Do you want to delete this sale?");
    if (confirmed) {
      fetch(`${url}/api/sales/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          displaySales();
        })
        .catch((error) => {
          console.error("Error deleting sale:", error);
          displaySales();
        });
    }
  };

  // Display sales when the page loads
  displaySales();
});
