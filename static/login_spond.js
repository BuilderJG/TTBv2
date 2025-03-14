let spondData

    // verarbeitet, übermittelt die Anmeldedaten, verarbeitet die Antwort
function loginSpondLoginSubmitSpondLoginForm() {
    let loginErrorMessage = document.getElementById("LoginSpondLoginSectionLoginDatenErrorMessage")
    let name = document.getElementById("LoginSpondLoginSectionLoginDatenMail").value;
    let password = document.getElementById("LoginSpondLoginSectionLoginDatenPasswort").value;

    if (name.length === 0 || password.length === 0) {
        loginErrorMessage.innerText = "Das Formular muss ausgefüllt sein."
        return
    }

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

            if (data["error"] !== "false") { // Fehler aufgetreten
                if (data["error"] === "invalid-login") {
                    loginErrorMessage.innerText = "Die Anmeldedaten sind ungültig. Bitte versuche es erneut."
                } else if (data["error"] === "rate-limited") {
                    loginErrorMessage.innerText = "Zu viele Anmeldeversuche. Bitte versuche es später erneut."
                } else {
                    loginErrorMessage.innerText = "Ein Fehler ist aufgetreten."
                }
            } else {
                loginErrorMessage.innerText = ""
                spondData = data["data"]
                page("LoginSpondAuswahlGruppe")
            }
        })
}

// aktualisiert die Tabelle bzw. erstellt diese
function loginSpondAuswahlGruppeUpdateTableAuswahlGruppen() {
    let table = document.getElementById("LoginSpondAuswahlGruppeTableGruppen")
    let group_name
    let content = `<tr><th>Gruppen <span class="spacer"></span> <button onclick="toggleTableVisibility('LoginSpondAuswahlGruppeTableGruppen')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
    for (let i in spondData) {
        if (spondData[i].hasOwnProperty("name")) {
            group_name = spondData[i]["name"]
        } else {
            group_name = "Unbenannte Gruppe"
        }
        content += `<tr onclick="toggleCheckmark('LoginSpondAuswahlGruppeTableGruppen_${i}')"><td><label onclick="event.stopImmediatePropagation();loginSpondAuswahlGruppeUpdateCheckmarkAuswahlGruppen(${i})" for="LoginSpondAuswahlGruppeTableGruppen_${i}"><input onchange="loginSpondAuswahlGruppeUpdateCheckmarkAuswahlGruppen(${i})" type="checkbox" id="LoginSpondAuswahlGruppeTableGruppen_${i}"> ${group_name}</div></label> <span class="spacer"></span> <button onclick="event.stopImmediatePropagation();loginSpondAuswahlGruppeUpdateDialogInfoGruppe(${i})"><span class="material-symbols-outlined">more_horiz</span></button></td></tr>`;
    }
    table.innerHTML = content;
    if (spondData.length > 0) {
        toggleCheckmark('LoginSpondAuswahlGruppeTableGruppen_0')
    }
}

// ausgelöst durch Veränderungen an einem Checkmark in der Tabelle
function loginSpondAuswahlGruppeUpdateCheckmarkAuswahlGruppen(index) {
    for (let i in spondData) {
        let checkmark = document.getElementById(`LoginSpondAuswahlGruppeTableGruppen_${i}`)
        checkmark.checked = parseInt(i) === index;
    }
}

// füllt den Dialog mit den Daten für die entsprechende Gruppe und öffnet den Dialog
function loginSpondAuswahlGruppeUpdateDialogInfoGruppe(index) {
    let elem = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppe")

    document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeSchließen").onclick = function () {elem.close()}

    let title = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeTitel")
    let img = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeBild")
    let activity = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeActivity")
    let description = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeDescription")
    let memberCount = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeMemberCount")
    let subGroupCount = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeSubGroupCount")
    let roleCount = document.getElementById("LoginSpondAuswahlGruppeDialogInfoGruppeInfoRoleCount")

    if (spondData[index].hasOwnProperty("name")) {
        title.innerText = `Gruppe: ${spondData[index]["name"]}`
        img.alt = `Titelbild von ${spondData[index]["name"]}`
    } else {
        title.innerText = "Gruppe: Unbenannte Gruppe"
        img.alt = "Titelbild von Unbenannte Gruppe"
    }

    if (spondData[index].hasOwnProperty("imageUrl")) {
        img.src = spondData[index]["imageUrl"]
    } else {
        img.src = "/static/images/spond-default-group-image.png"
    }

    if (spondData[index].hasOwnProperty("activity")) {
        activity.innerText = spondData[index]["activity"]
    } else {
        activity.innerText = "-"
    }

    if (spondData[index].hasOwnProperty("description")) {
        description.innerText = spondData[index]["description"]
    } else {
        description.innerText = "-"
    }

    if (spondData[index].hasOwnProperty("members")) {
        memberCount.innerText = spondData[index]["members"].length
    } else {
        memberCount.innerText = "0"
    }

    if (spondData[index].hasOwnProperty("subGroups")) {
        subGroupCount.innerText = spondData[index]["subGroups"].length
    } else {
        subGroupCount.innerText = "0"
    }

    if (spondData[index].hasOwnProperty("roles")) {
        roleCount.innerText = spondData[index]["roles"].length
    } else {
        roleCount.innerText = "0"
    }

    openDialog(elem.id)
}