let spondData

    // verarbeitet, übermittelt die Anmeldedaten, verarbeitet die Antwort
function loginSpondLoginSubmitSpondLoginForm() {
    let name = document.getElementById("LoginSpondLoginSectionLoginDatenMail").value;
    let password = document.getElementById("LoginSpondLoginSectionLoginDatenPasswort").value;

    toggleLoading(true)

    fetch("/api/spond", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username": name, "password": password, "function": "get_all_groups"})
    }).then(response => response.json())
        .then(data => {
            toggleLoading(false)

            let loginErrorMessage = document.getElementById("LoginSpondLoginSectionLoginDatenErrorMessage")
            if (data["error"] !== "false") { // Fehler aufgetreten
                if (data["error"] === "invalid-login") {
                    loginErrorMessage.innerText = "Die Anmeldedaten sind ungültig. Bitte versuche es erneut."
                } else if (data["error"] === "empty") {
                    loginErrorMessage.innerText = "Das Formular muss ausgefüllt sein."
                } else if (data["error"] === "rate-limited") {
                    loginErrorMessage.innerText = "Zu viele Anmeldeversuche. Bitte versuche es später erneut."
                } else {
                    loginErrorMessage.innerText = "Ein Fehler ist aufgetreten."
                }
            } else {
                loginErrorMessage.innerText = ""
                spondData = data["data"]
            }
        })
}