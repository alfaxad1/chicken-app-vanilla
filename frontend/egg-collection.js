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

        form.reset();
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
                    <tbody>
                        ${collections
                          .map(
                            (collection) => `
                            <tr>
                                <td>${new Date(
                                  collection.collection_date
                                ).toLocaleDateString()}</td>
                                <td>${collection.eggs_collected}</td>
                                <td>${collection.damaged_eggs}</td>
                                <td>${
                                  collection.eggs_collected -
                                  collection.damaged_eggs
                                }</td>
                                <td>
                                    <button class="delete-btn" onclick="deleteCollection(${
                                      collection.id
                                    })">Delete</button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            `;
      });
  }

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
            labels: data.map((item) =>
              new Date(item.collection_date).toLocaleDateString()
            ),
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
