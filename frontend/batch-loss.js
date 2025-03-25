const chickenLossContainer = document.getElementById("chicken-loss-container");
chickenLossContainer.style.display = "none";

const createChickenLoss = () => {
  chickenLossContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const closeChickenLossForm = () => {
  chickenLossContainer.style.display = "none";
  document.body.style.overflow = "auto";
};

chickenLossContainer.addEventListener("click", (e) => {
  if (e.target === chickenLossContainer) {
    closeChickenLossForm();
  }
});
const chickenLossForm = document.getElementById("chickenLoss-form");
const lossData = document.getElementById("chickenLoss-data");
const url = "http://localhost:3000";
let currentPage = 0;
const recordsPerPage = 10;
const sellerId = localStorage.getItem("ID");

document.addEventListener("DOMContentLoaded", function () {
  const fetchChikenLosses = () => {
    fetch(`${url}/api/batch-chicken-loss/${sellerId}`)
      .then((response) => response.json())
      .then((chickenLosses) => {
        console.log(chickenLosses);
        lossData.innerHTML = `
        <input
        id="search-bar"
        class="fas fa-search"
        placeholder="search"
        type="text"
      />
        <table>
           <thead>
              <tr>
                  <td>Chicken Type</td>
                  <td>Number</td>
                  <td>Cause</td>
                  <td>Date</td>
                  <td>Actions</td>
              </tr>
            </thead>
            <tbody id="chicken-loss-table-body"></tbody>
        </table>
        <button id="prev-button" style="display: none;"><</button>
        <button id="next-button">></button>
      `;

        const prevButton = document.getElementById("prev-button");
        const nextButton = document.getElementById("next-button");

        //search bar implementation
        searchBar = document.getElementById("search-bar");
        const tableBody = document.getElementById("chicken-loss-table-body");

        const renderTable = (filteredChickenLosses) => {
          tableBody.innerHTML = "";

          const start = currentPage * recordsPerPage;
          const end = start + recordsPerPage;
          const paginatedChickenLosses = filteredChickenLosses.slice(
            start,
            end
          );

          paginatedChickenLosses.forEach((chickenLoss) => {
            let actions = `
            <td class="action-buttons">
               <button class="edit-btn" onclick="enableEditingLoss(${chickenLoss.id})">Edit</button>
               <button id="save-btn-loss-${chickenLoss.id}" onclick="saveLoss(${chickenLoss.id})" style="display:none;">Save</button>
               <button class="delete-btn" onclick="deleteChickenLoss(${chickenLoss.id})">
                    Delete
              </button>
            </td>
        `;

            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role !== "admin" && user.role !== "superadmin") {
              actions = `<td></td>`;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
        <td><input type="text" id="chicken-type-${chickenLoss.id}" value="${
              chickenLoss.chicken_type
            }" disabled></td>
        <td><input type="number" id="number-${chickenLoss.id}" value="${
              chickenLoss.number
            }" disabled></td>
        <td><input type="text" id="cause-${chickenLoss.id}" value="${
              chickenLoss.cause
            }" disabled></td>
        <td><input type="date" id="date-${chickenLoss.id}" value="${
              chickenLoss.date.split("T")[0]
            }" disabled></td>
        ${actions}
      `;

            tableBody.appendChild(row);
          });

          // Disable the next button if there are no more records
          nextButton.style.display =
            end >= filteredChickenLosses.length ? "none" : "inline";
          // Disable the previous button if on the first page
          prevButton.style.display = currentPage === 0 ? "none" : "inline";
        };

        renderTable(chickenLosses);

        searchBar.addEventListener("keyup", (e) => {
          const searchString = e.target.value.toLowerCase();
          const filteredChickenLosses = chickenLosses.filter((chickenLoss) => {
            return (
              chickenLoss.cause.toLowerCase().includes(searchString) ||
              chickenLoss.chicken_type.toLowerCase().includes(searchString)
            );
          });
          renderTable(filteredChickenLosses);
        });
        nextButton.addEventListener("click", () => {
          currentPage++;
          renderTable(chickenLosses);
        });
        prevButton.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--;
            renderTable(chickenLosses);
          }
        });
      })
      .catch((error) => {
        console.log("Error fetching losses:", error);
      });
  };

  window.deleteChickenLoss = function (id) {
    const confirmed = confirm("Are you sure you want to delete");
    if (confirmed) {
      fetch(`${url}/api/batch-chicken-loss/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          fetchChikenLosses();
        })
        .catch((error) => {
          console.log("Error deleting:", error);
        });
    }
  };
  fetchChikenLosses();

  chickenLossForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const chickenType = document.getElementById("chicken-type").value;
    const cause = document.getElementById("cause").value;
    const number = document.getElementById("number").value;
    const date = document.getElementById("date").value;
    //const sellerId = localStorage.getItem("ID");

    fetch(`${url}/api/batch-chicken-loss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chickenType, cause, number, date, sellerId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        chickenLossForm.reset();
        closeChickenLossForm();
        fetchChikenLosses();
      })
      .catch((error) => {
        console.log("Error saving", error);
      });
  });
});
