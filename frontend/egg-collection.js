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
  const form = document.getElementById("egg-collection-form");
  let chart = null;

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const collectionDate = document.getElementById("collection-date").value;
    const eggsCollected = document.getElementById("eggs-collected").value;
    const damagedEggs = document.getElementById("damaged-eggs").value;

    let currentPage = 0;
    const recordsPerPage = 7;

    // Save to database
    fetch(`${url}/api/egg-collection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_date: collectionDate,
        eggs_collected: eggsCollected,
        damaged_eggs: damagedEggs,
      }),
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

        closeForm();
        displayCollectionHistory();
        updateChart();
      })
      .catch((error) => console.error("Error:", error));
  });

  // Function to display collection history
  function displayCollectionHistory() {
    fetch(`${url}/api/egg-collection`)
      .then((response) => response.json())
      .then((collections) => {
        const tableContainer = document.getElementById("collection-data");
        tableContainer.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Eggs Collected</th>
                            <th>Damaged Eggs</th>
                            <th>Good Eggs</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="collection-table-body"></tbody>                   
                </table>
            `;

        const tableBody = document.getElementById("collection-table-body");
        tableBody.innerHTML = "";

        collections.forEach((collection) => {
          let actions = `
            <td class="action-buttons">
                <button class="edit-btn" onclick="enableEditingCollection(${collection.id})">Edit</button>
                <button id="save-btn-collection-${collection.id}" onclick="saveCollection(${collection.id})" style="display:none;">Save</button>
                <button class="delete-btn" onclick="deleteCollection(${collection.id})">Delete</button>
            </td>
      `;

          const row = document.createElement("tr");
          row.innerHTML = `
         <td><input type="date" id="collection-date-${collection.id}" value="${
            collection.collection_date.split("T")[0]
          }" disabled></td>
         <td><input type="text" id="collected-eggs-${collection.id}" value="${
            collection.eggs_collected
          }" disabled></td>
         <td><input type="text" id="damaged-eggs-${collection.id}" value="${
            collection.damaged_eggs
          }" disabled></td>
         <td><input type="text" id="good-eggs-${collection.id}" value="${
            collection.eggs_collected - collection.damaged_eggs
          }" disabled></td>
        ${actions}
      `;

          tableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error:", error));
  }
  window.enableEditingCollection = function (id) {
    document.getElementById(`collection-date-${id}`).disabled = false;
    document.getElementById(`collected-eggs-${id}`).disabled = false;
    document.getElementById(`damaged-eggs-${id}`).disabled = false;
    document.getElementById(`good-eggs-${id}`).disabled = false;
    document.getElementById(`save-btn-collection-${id}`).style.display =
      "inline";
  };

  window.saveCollection = function (id) {
    const date = document.getElementById(`collection-date-${id}`).value;
    const collectedEggs = document.getElementById(`collected-eggs-${id}`).value;
    const damagedEggs = document.getElementById(`damaged-eggs-${id}`).value;
    const goodEggs = document.getElementById(`good-eggs-${id}`).value;

    fetch(`${url}/api/egg-collection/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date,
        collectedEggs: collectedEggs,
        damagedEggs: damagedEggs,
      }),
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

        updateChart();
        displayCollectionHistory();
      });
  };

  // Function to update the chart
  function updateChart() {
    fetch(`${url}/api/egg-collection/monthly`)
      .then((response) => response.json())
      .then((data) => {
        const ctx = document
          .getElementById("eggCollectionChart")
          .getContext("2d");

        if (chart) {
          chart.destroy();
        }

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((item) => item.collection_date.split("T")[0]),
            datasets: [
              {
                label: "Eggs Collected",
                data: data.map((item) => item.eggs_collected),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Eggs",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
          },
        });
      });
  }

  // Function to delete collection
  window.deleteCollection = function (id) {
    if (confirm("Are you sure you want to delete this record?")) {
      fetch(`${url}/api/egg-collection/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          const info = document.getElementById("info");
          const toast = document.createElement("div");
          toast.classList.add("toast");
          toast.innerHTML = `<p>${data.message}</p>`;
          info.appendChild(toast);
          setTimeout(() => {
            toast.remove();
          }, 2000);

          displayCollectionHistory();
          updateChart();
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  // Initial load
  displayCollectionHistory();
  updateChart();
});
