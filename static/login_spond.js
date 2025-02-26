function submitSpondLoginForm() {
    let name = document.getElementById("spond_login-mail").value;
    let password = document.getElementById("spond_login-password").value;

    fetch("/api/spond", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username": name, "password": password, "function": "get_all_groups"})
    }).then(response => response.json())
        .then(data => {
            console.log(data)
            let login_error_message = document.getElementById("spond_login-error_message")
            if (data["error"] !== "false") {
                if (data["error"] === "invalid-login") {
                    login_error_message.innerText = "Die Anmeldedaten sind ungültig. Bitte versuche es erneut."
                } else if (data["error"] === "empty") {
                    login_error_message.innerText = "Das Formular muss ausgefüllt sein."
                } else if (data["error"] === "rate-limited") {
                    login_error_message.innerText = "Zu viele Anmeldeversuche. Bitte versuche es später erneut."
                } else {
                    login_error_message.innerText = "Ein Fehler ist aufgetreten."
                }
            } else {
                login_error_message.innerText = ""
                let spond_data = data["data"]
                console.log(JSON.stringify(spond_data))
            }
        })
}