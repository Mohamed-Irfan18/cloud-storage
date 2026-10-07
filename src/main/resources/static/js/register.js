const registerForm = document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // Basic validation

    if (!username || !email || !password) {

        registerMessage.textContent =
            "Please fill in all fields.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    // Show loading message

    registerMessage.textContent =
        "Creating your account...";

    registerMessage.style.color = "#2563eb";


    try {

        const response = await fetch(
            "/api/users/register",
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


        const result =
            await response.text();


        console.log(
            "Registration status:",
            response.status
        );

        console.log(
            "Registration response:",
            result
        );


        if (!response.ok) {

            registerMessage.textContent =
                result || "Registration failed.";

            registerMessage.style.color =
                "#dc2626";

            return;
        }


        // Success

        registerMessage.textContent =
            "Account created successfully!";

        registerMessage.style.color =
            "#16a34a";


        // Clear fields

        registerForm.reset();


        // Redirect to login

        setTimeout(function () {

            window.location.href =
                "/login.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        registerMessage.textContent =
            "Unable to connect to the server.";

        registerMessage.style.color =
            "#dc2626";
    }

});