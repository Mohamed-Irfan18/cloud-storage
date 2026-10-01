const loginForm = document.getElementById("loginForm");

const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://localhost:8081/api/users/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            // Store JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            message.textContent =
                "Login successful!";

            // Go to dashboard
            window.location.href =
                "dashboard.html";

        } else {

            message.textContent =
                data.message || "Login failed.";

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

    }

});