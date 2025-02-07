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

  const form = document.getElementById("chickenLoss-form");
  const lossData = document.getElementById("chickenLoss-data");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const chickenType = document.getElementById("chicken-type").value;
    const cause = document.getElementById("cause").value;
    const number = document.getElementById("number").value;
    const date = document.getElementById("date").value;
    const saveChickenLoss = () => {
      fetch(`${url}/api/chicken-loss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chickenType, cause, number, date }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const info = document.getElementById("info");
          const toast = document.createElement("div");
          toast.classList.add("toast");
          toast.innerHTML = `<p>${data.message}</p>`;
          info.appendChild(toast);
          setTimeout(() => {
            toast.remove();
          }, 2000);

          fetchChikenLosses();
          form.reset();
          closeForm();
        })
        .catch((error) => {
          console.log("Error saving", error);
        });
    };
    saveChickenLoss();
  });

  const fetchChikenLosses = () => {
    fetch(`${url}/api/chicken-loss`)
      .then((response) => response.json())
      .then((chickenLosses) => {
        console.log(chickenLosses);
        lossData.innerHTML = `
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
      `;

        const tableBody = document.getElementById("chicken-loss-table-body");

        chickenLosses.forEach((chickenLoss) => {
          let actions = `
            <td class="action-buttons">
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
        <td>${chickenLoss.chicken_type}</td>
        <td>${chickenLoss.number}</td>
        <td>${chickenLoss.cause}</td>
        <td>${chickenLoss.date.split("T")[0]}</td>
        ${actions}
      `;

          tableBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.log("Error fetching losses:", error);
      });
  };
  fetchChikenLosses();

  window.deleteChickenLoss = function (id) {
    const confirmed = confirm("Are you sure you want to delete");
    if (confirmed) {
      fetch(`${url}/api/chicken-loss/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          fetchChikenLosses();

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
          console.log("Error deleting:", error);
        });
    }
  };
});
