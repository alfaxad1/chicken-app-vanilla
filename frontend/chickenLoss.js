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
            <tbody class="chicken-loss-table-body"></tbody>
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
        <td>${chickenLoss.chickenType}</td>
        <td>${chickenLoss.cause}</td>
        <td>${chickenLoss.number}</td>
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
});
