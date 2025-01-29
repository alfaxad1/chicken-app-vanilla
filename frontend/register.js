document
  .getElementById("register-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value.toLowerCase();

    fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
        role: role,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.Status === "Success") {
          window.location.href = "login.html";
          console.log(data);
        } else if (data.error) {
          const userInputError = document.getElementById("validation-message");
          userInputError.innerText = data.error;
        } else {
          const error = document.getElementById("error-message");
          error.innerText = "Error registering user";
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  });
