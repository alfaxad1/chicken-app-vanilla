const url = "http://localhost:3000";
let totalChickenSold = 0;
let totalChickenBought = 0;
let totalChickenLoss = 0;
let totalChickenInStock = 0;

async function fetchChickenPurchases() {
  return await fetch(`${url}/api/chicken-purchases`)
    .then((response) => response.json())
    .then((purchases) => {
      if (purchases) {
        totalChickenBought = purchases.reduce((sum, purchase) => {
          return sum + purchase.no_of_pieces;
        }, 0);
        console.log(`Total Chicken Bought: ${totalChickenBought}`);
      }
      const stats = document.getElementById("bought");
      const tittle = document.createElement("h2");
      tittle.classList.add("tittle");
      tittle.textContent = "Total Chicken Bought";
      stats.appendChild(tittle);
      const data = document.createElement("div");
      data.classList.add("data");
      data.innerHTML = `<p>${totalChickenBought}</p>`;
      stats.appendChild(data);

      fetchChickenSales().then(() => {
        fetchChickenLoss().then(() => {
          totalChickenInStock =
            totalChickenBought - (totalChickenSold + totalChickenLoss);
          console.log(`Total Chicken In Stock: ${totalChickenInStock}`);

          const stats = document.getElementById("total");
          const tittle = document.createElement("h2");
          tittle.classList.add("tittle");
          tittle.textContent = "Total Chicken In Stock";
          stats.appendChild(tittle);
          const data = document.createElement("div");
          data.classList.add("data");
          data.innerHTML = `<p>${totalChickenInStock}</p>`;
          stats.appendChild(data);
        });
      });
    });
}

//fetch sales data
async function fetchChickenSales() {
  return await fetch(`${url}/api/sales`)
    .then((response) => response.json())
    .then((sales) => {
      let total = 0;
      if (sales) {
        totalChickenSold = sales.reduce((sum, sale) => {
          if (sale.sale_type === "chicken") {
            return sum + sale.number_of_pieces;
          }
        }, 0);
        console.log(`Total Chicken Sold: ${totalChickenSold}`);
      }
      const stats = document.getElementById("sold");
      const tittle = document.createElement("h2");
      tittle.classList.add("tittle");
      tittle.textContent = "Total Chicken Sold";
      stats.appendChild(tittle);
      const data = document.createElement("div");
      data.classList.add("data");
      data.innerHTML = `<p>${totalChickenSold}</p>`;
      stats.appendChild(data);
    });
}

async function fetchChickenLoss() {
  return await fetch(`${url}/api/chicken-loss`)
    .then((response) => response.json())
    .then((losses) => {
      let totalLoss = 0;
      if (losses) {
        totalChickenLoss = losses.reduce((sum, loss) => {
          return sum + loss.number;
        }, 0);
        console.log(`Total Chicken Loss: ${totalChickenLoss}`);
      }
      const stats = document.getElementById("losses");
      const tittle = document.createElement("h2");
      tittle.classList.add("tittle");
      tittle.textContent = "Total Chicken Loss";
      stats.appendChild(tittle);
      const data = document.createElement("div");
      data.classList.add("data");
      data.innerHTML = `<p>${totalChickenLoss}</p>`;
      stats.appendChild(data);
    });
}

fetchChickenPurchases();
