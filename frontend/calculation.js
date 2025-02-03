const url = "http://localhost:3000";
(function fetchChickenPurchases() {
  fetch(`${url}/api/chicken-purchases`)
    .then((response) => response.json())
    .then((purchases) => {
      if (purchases) {
        const totalPieces = purchases.reduce((sum, purchase) => {
          return sum + purchase.no_of_pieces;
        }, 0);
        console.log(`Total: ${totalPieces}`);
      }
    });
})();

//fetch sales data
(function displaySales() {
  fetch(`${url}/api/sales`)
    .then((response) => response.json())
    .then((sales) => {
      if (sales) {
        const total = sales.reduce((sum, sale) => {
          if ((sale.sale_type = "chicken")) {
            return sum + sale.number_of_pieces;
          }
        }, 0);
        console.log(`Total: ${total}`);
      }
    });
})();
