document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/profits", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    })
    .then((profits) => {
      if (profits.length === 0) {
        displayNoDataMessage();
      } else {
        displayProfits(profits);
      }
    })
    .catch((error) => {
      console.error("Error getting data:", error);
      const profitsData = document.getElementById("profits-data");
      profitsData.innerHTML = `<p>Error fetching profits: ${error.message}</p>`;
    });

  // Add event listener for download button
  document
    .getElementById("download-btn")
    .addEventListener("click", function () {
      downloadCSV(profits); // Call the download function when clicked
    });
});

// Function to display profits in a table
function displayProfits(profits) {
  const profitsData = document.getElementById("profits-data");
  profitsData.innerHTML = ""; // Clear previous content

  const table = document.createElement("table");
  table.classList.add("profit-table");

  // Add table headers
  table.innerHTML = `
        <thead>
            <tr>
                <th>Month</th>
                <th>Total Purchases</th>
                <th>Total Expenses</th>
                <th>Total Sales</th>
                <th>Profit</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  // Insert rows with data
  const tbody = table.querySelector("tbody");
  profits.forEach((entry) => {
    const row = document.createElement("tr");
    const profitClass = entry.profit >= 0 ? "positive" : "negative";
    row.innerHTML = `
            <td>${entry.month}</td>
            <td>${formatCurrency(entry.total_purchases)}</td>
            <td>${formatCurrency(entry.total_expenses)}</td>
            <td>${formatCurrency(entry.total_sales)}</td>
            <td class="${profitClass}">${formatCurrency(entry.profit)}</td>
        `;
    tbody.appendChild(row);
  });

  profitsData.appendChild(table);
}

// Function to display "no data" message
function displayNoDataMessage() {
  const profitsData = document.getElementById("profits-data");
  profitsData.innerHTML =
    "<p>No profit data available for the selected period.</p>";
}

// Function to download table data as CSV
function downloadCSV(profits) {
  const csvContent = [
    ["Month", "Total Purchases", "Total Expenses", "Total Sales", "Profit"], // Headers
    ...profits.map((entry) => [
      entry.month,
      entry.total_purchases,
      entry.total_expenses,
      entry.total_sales,
      entry.profit,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "profit_report.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}
