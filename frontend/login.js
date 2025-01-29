document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        if (data.Status === "Success") {
          window.location.href = "dashboard.html";
          console.log(data);
        } else {
          const error = document.getElementById("error-message");
          error.innerText = "Incorrect username or password";
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  });
