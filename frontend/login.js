document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const url = "http://localhost:3000";

    fetch(`${url}/api/users/login `, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        if (data.token) {
          const user = JSON.parse(localStorage.getItem("user"));
          const accessTokenExpiry = new Date().getTime() + 3600 * 1000;
          localStorage.setItem("access_token_expiry", accessTokenExpiry);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          if (data.user.role === "superadmin") {
            window.location.href = "superAdmin.html";
          } else {
            window.location.href = "dashboard.html";
          }
          console.log(data.token);
          console.log(user);
          console.log(user.role);
        } else {
          const error = document.getElementById("error-message");
          error.innerText = data.error;
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  });
