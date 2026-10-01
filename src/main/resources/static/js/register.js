const registerForm = document.getElementById("registerForm");

const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://localhost:8081/api/users/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.text();

        if (response.ok) {

            message.textContent =
                "Registration successful!";

            registerForm.reset();

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1000);

        } else {

            message.textContent =
                data || "Registration failed.";

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

    }

});