document.addEventListener("submit", async function (event) {
  document.getElementById("register-form");
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value.toLowerCase();

  const url = "http://localhost:3000";

  fetch(`${url}/api/users/register`, {
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
        const errorMessage = data.error.message.replace(/"/g, "");
        const userInputError = document.getElementById("validation-message");
        userInputError.innerText = `${errorMessage}`;
      } else {
        const error = document.getElementById("error-message");
        error.innerText = "Error registering user";
      }
      console.log(data.message);
      //user created toast
      const createdToast = document.getElementById("created-toast");
      const toast = document.createElement("div");
      toast.classList.add("created");
      toast.innerHTML = `<p>${data.message}</p>`;
      createdToast.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 5000);
    })
    .catch((error) => {
      console.error("Error logging in:", error);
    });
});
