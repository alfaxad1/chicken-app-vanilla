// Handles the login functionality
document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // const response = await fetch("http://localhost:3000/api/login", {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({username:username, password: password })
    // });
    // console.log(response)
    // if (response.ok) {
    //     localStorage.setItem('username', username );
    //     window.location.href = 'dashboard.html';
    // } else {
    //     alert('Wrong username or password');
    // }

    // Simple authentication check
    if (username === "12687828" && password === "Nasinyama74") {
      // Redirect to the dashboard page
      localStorage.setItem("username", username);
      window.location.href = "dashboard.html";
    } else {
      alert("Incorrect username or password.");
    }
  });
