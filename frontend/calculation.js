const url = "http://localhost:3000";
(function fetchChickenPurchases() {
  fetch(`${url}/api/chicken-purchases`)
    .then((response) => response.json())
    .then((purchases) => {
      let totalPieces = 0;
      if (purchases) {
        totalPieces = purchases.reduce((sum, purchase) => {
          return sum + purchase.no_of_pieces;
        }, 0);
        console.log(`Total Chicken Bought: ${totalPieces}`);
      }
      const stats = document.getElementById("quick-stats");
      const tittle = document.createElement("h2");
      tittle.classList.add("tittle");
      tittle.textContent = "Total Chicken Bought";
      stats.appendChild(tittle);
      const data = document.createElement("div");
      data.classList.add("data");
      data.innerHTML = `<p>${totalPieces}</p>`;
      stats.appendChild(data);
    });
})();

//fetch sales data
(function displaySales() {
  fetch(`${url}/api/sales`)
    .then((response) => response.json())
    .then((sales) => {
      if (sales) {
        const total = sales.reduce((sum, sale) => {
          if (sale.sale_type === "chicken") {
            return sum + sale.number_of_pieces;
          }
        }, 0);
        console.log(`Total: ${total}`);
      }
    });
})();
