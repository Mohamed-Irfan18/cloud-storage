const loginForm = document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    // Basic validation

    if (!username || !password) {

        loginMessage.textContent =
            "Please enter your username and password.";

        loginMessage.style.color = "#dc2626";

        return;
    }


    // Show loading message

    loginMessage.textContent =
        "Signing you in...";

    loginMessage.style.color =
        "#2563eb";


    try {

        const response = await fetch(
            "/api/users/login",
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


        const result =
            await response.text();


        console.log(
            "Login status:",
            response.status
        );

        console.log(
            "Login response:",
            result
        );


        if (!response.ok) {

            loginMessage.textContent =
                result || "Invalid username or password.";

            loginMessage.style.color =
                "#dc2626";

            return;
        }


        /*
         * Backend should return the JWT token.
         */

        let token;

        try {

            const data =
                JSON.parse(result);

            token =
                data.token || data.accessToken;

        } catch (error) {

            // If backend returns plain token

            token = result;
        }


        if (!token) {

            loginMessage.textContent =
                "Login succeeded, but no token was received.";

            loginMessage.style.color =
                "#dc2626";

            return;
        }


        // Store JWT token

        localStorage.setItem(
            "token",
            token
        );


        loginMessage.textContent =
            "Login successful!";

        loginMessage.style.color =
            "#16a34a";


        // Go to dashboard

        setTimeout(function () {

            window.location.href =
                "/dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        loginMessage.textContent =
            "Unable to connect to the server.";

        loginMessage.style.color =
            "#dc2626";
    }

});