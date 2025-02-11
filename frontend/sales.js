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

    // Save to the database
    fetch(`${url}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
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
        displaySales();
        salesForm.reset();
        closeForm();
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

        salesData.innerHTML = `
         <input
        id="search-bar"
        class="fas fa-search"
        placeholder="search"
        type="text"
      />
              <table>
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
              </table>
            `;

        searchBar = document.getElementById("search-bar");
        const tableBody = document.getElementById("sales-table-body");

        const renderTable = (filteredSales) => {
          tableBody.innerHTML = "";

          filteredSales.forEach((sale) => {
            const row = document.createElement("tr");

            // Format the date
            const formattedDate = sale.date
              ? new Date(sale.date).toLocaleDateString()
              : "N/A";

            // Determine sale type and quantity
            const saleType = sale.chicken_type || "Eggs";
            const quantity =
              sale.number_of_pieces || sale.quantity_sold || "N/A";
            const pricePerUnit =
              sale.price_per_piece || sale.price_per_unit || "N/A";

            //logic to remove the actions column when the user is not an admin
            let actions = `
                    <td class="action-buttons">
                        <button class="edit-btn" onclick="enableEditingSale(${sale.id})">Edit</button>
                        <button id="save-btn-sale-${sale.id}" onclick="saveSale(${sale.id})" style="display:none;">Save</button>
                        <button class="delete-btn" onclick="deleteSale(${sale.id})">Delete</button>
                    </td>`;
            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role !== "admin" && user.role !== "superadmin") {
              actions = `<td></td>`;
            }

            row.innerHTML = `
                    <td><input type="date" id="sale-date-${
                      sale.id
                    }" value="${formattedDate}" disabled></td>
                    <td><input type="text" id="customer-id-${sale.id}" value="${
              sale.customer_id || "N/A"
            }" disabled></td>
                    <td><input type="text" id="sale-type-${
                      sale.id
                    }" value="${saleType}" disabled></td>
                    <td><input type="text" id="sale-quantity-${
                      sale.id
                    }" value="${quantity}" disabled></td>
                    <td><input type="text" id="sale-price-${
                      sale.id
                    }" value="${pricePerUnit}" disabled></td>
                    <td><input type="text" id="sale-total-${sale.id}" value="${
              sale.total_price || "N/A"
            }" disabled></td>
                    <td>${actions}</td>
                `;

            tableBody.appendChild(row);
          });
        };
        renderTable(sales);
        searchBar.addEventListener("keyup", (e) => {
          const searchString = e.target.value.toLowerCase();
          const filteredSales = sales.filter((sale) => {
            return sale.customer_id.toLowerCase().includes(searchString);
          });
          renderTable(filteredSales);
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
    document.getElementById(`sale-date-${id}`).disabled = false;
    document.getElementById(`customer-id-${id}`).disabled = false;
    document.getElementById(`sale-type-${id}`).disabled = false;
    document.getElementById(`sale-quantity-${id}`).disabled = false;
    document.getElementById(`sale-price-${id}`).disabled = false;
    document.getElementById(`sale-total-${id}`).disabled = false;
    document.getElementById(`save-btn-sale-${id}`).style.display = "inline";
  };

  window.saveSale = function (id) {
    const saleDate = document.getElementById(`sale-date-${id}`).value;
    const customerId = document.getElementById(`customer-id-${id}`).value;
    const saleType = document.getElementById(`sale-type-${id}`).value;
    const quantity = document.getElementById(`sale-quantity-${id}`).value;
    const pricePerUnit = document.getElementById(`sale-price-${id}`).value;
    const totalPrice = document.getElementById(`sale-total-${id}`).value;

    fetch(`${url}/api/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saleDate,
        customerId,
        saleType,
        quantity,
        pricePerUnit,
        totalPrice,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        displaySales();
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
        console.error("Error saving sale:", error);
        displaySales();
      });
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
          console.error("Error deleting sale:", error);
          displaySales();
        });
    }
  };

  // Display sales when the page loads
  displaySales();
});
