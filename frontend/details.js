document.addEventListener("DOMContentLoaded", function () {
  const url = "http://localhost:3000";
  const id = localStorage.getItem("ID");
  console.log("id is: ", id);
  const details = document.getElementById("data");

  const fetchData = () => {
    fetch(`${url}/api/chicken-purchases/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const item = data[0];
        details.innerHTML = `
        <p>${item.supplier_id}</p>
        <p>${item.chicken_type}</p>
        <p>${item.no_of_pieces}</p>
        `;
      });
  };
  fetchData();
});
