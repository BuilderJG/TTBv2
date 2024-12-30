// --- Setup Start ---

    // Lädt die Daten aus dem Local Storage
let data = {}
if (localStorage.getItem("data")) {
    data = JSON.parse(localStorage.getItem("data"))
}
data = repairData(data)
localStorage.setItem("data", JSON.stringify(data))

    // Öffnet die erste verfügbare Seite
page(document.getElementsByClassName("page")[0].id)

// --- Setup Ende ---

// --- Basis Start ---

    // Zeigt bzw. versteckt die Navigationsleiste
function toggleNav() {
    let nav = document.getElementsByTagName("nav")[0];
    let content = document.getElementsByTagName("main")[0];
    let header = document.getElementsByTagName("header")[0];
    if (nav.style.width === "") {
        nav.style.width = "250px"
        content.style.marginLeft = "250px"
        header.style.left = "250px"
    } else {
        nav.style.width = ""
        content.style.marginLeft = ""
        header.style.left = ""
    }
}

    // Zeigt die ausgewählte Seite an
function page(selectedPage) { // selectedPage: String = htmlId
    let pages = Array.from(document.getElementsByClassName("page"));
    let pageFunctions = {"Verwaltung": [verwaltungUpdateTableMitglieder, verwaltungUpdateTableGruppen]} // die Funktionen, die beim Aufrufen einer Seite ausgeführt werden sollen
    for (let i in pages) { // Versteckt alle Seiten, außer der ausgewählten
        if (pages[i].id === selectedPage) {
            pages[i].style.display = "block"
            if (pageFunctions.hasOwnProperty(selectedPage)) { // Führt die Funktionen aus, die mit der Seite verknüpft sind
                for (let j in pageFunctions[selectedPage]) {
                    pageFunctions[selectedPage][j]();
                }
            }
        } else {
            pages[i].style.display = "none";
        }
    }
}

    // erlaubt das Scrollen nur, wenn kein Dialog-Element geöffnet ist
let open_dialogs = 0
let dialogElements = Array.from(document.getElementsByTagName("dialog"))
for (let i in dialogElements) {
    dialogElements[i].addEventListener("close", () => {
        open_dialogs -= 1
        if (open_dialogs === 0) {
            document.getElementsByTagName("body")[0].style.overflowY = "auto"
        }
    })
}

    // schließt das Dialog-Element, sobald außerhalb von diesem geklickt wird
for (let i in dialogElements) {
    dialogElements[i].innerHTML = `<div class="dialog-content"><a onclick="document.getElementById('${dialogElements[i].id}').close()" class="dialog-close-button">&#10005;</a>${dialogElements[i].innerHTML}</div>`
    dialogElements[i].addEventListener("click", () => dialogElements[i].close())
}
let dialogContentDivs = document.getElementsByClassName("dialog-content")
for (let i in dialogContentDivs) {
    if (typeof dialogContentDivs[i] === "object") {
        dialogContentDivs[i].addEventListener("click", (event) => event.stopPropagation())
    }
}


    // öffnet das Dialog-Element mit der angegebenen ID
function open_dialog(dialogId) { //dialogId: string = HTML-ID
    open_dialogs += 1
    if (open_dialogs === 1) {
        document.getElementsByTagName("body")[0].style.overflowY = "hidden"
    }
    document.getElementById(dialogId).showModal()
}

    // Funktion, um einen simplen Dialog mit zwei Auswahlmöglichkeiten zu erstellen
function confirm_dialog(title, desc, btn1_txt, btn1_fnc, btn2_txt, btn2_fnc) {
    let elem_dialog = document.getElementById("confirm-popup")
    document.getElementById("confirm-popup-title").innerHTML = title
    document.getElementById("confirm-popup-description").innerHTML = desc
    let btn1 = document.getElementById("confirm-popup-btn1")
    btn1.innerHTML = btn1_txt
    btn1.onclick = function () {
        elem_dialog.close();
        btn1_fnc()
    }
    let btn2 = document.getElementById("confirm-popup-btn2")
    btn2.innerHTML = btn2_txt
    btn2.onclick = function () {
        elem_dialog.close();
        btn2_fnc()
    }

    open_dialog("confirm-popup")
}

    // leere Funktion, wird verwendet, um einen Knopf des confirm_dialog Dialogs (z.B. Abbrechen) lediglich den Dialog schließen zu lassen
function do_nothing() {}

// --- Basis Ende ---

// --- Funktionen Start ---

    // überprüft, ob eine Variable ein Objekt ist
function isObject(x) {
    return (typeof x === "object" && !Array.isArray(x) && x !== null)

}

    // repariert das eingegebene Daten-Objekt
function repairData(data) { // data: object = TTB-Data
    let output = {}

    // members
    output["members"] = {}
    let member_groups = []
    if (data.hasOwnProperty("members")) {
        for (let member in data["members"]) {
            if (typeof member === "string") {
                output["members"][member] = {"groups": []}
                // property: groups
                if (isObject(data["members"][member]) && data["members"][member].hasOwnProperty("groups")) {
                    for (let group in data["members"][member]["groups"]) {
                        let groupName = data["members"][member]["groups"][group]
                        if (typeof groupName === "string") {
                            output["members"][member]["groups"].push(data["members"][member]["groups"][group])
                            if (!member_groups.includes(data["members"][member]["groups"][group])) {
                                member_groups.push(data["members"][member]["groups"][group])
                            }
                        }
                    }
                }
            }
        }
    }

    // groups
    output["groups"] = {}
    if (data.hasOwnProperty("groups")) {
        for (let group in data["groups"]) {
            if (typeof group === "string") {
                output["groups"][group] = {}
            }
        }
    }
    for (let group in member_groups) {
        if (!output["groups"].hasOwnProperty(member_groups[group])) {
            output["groups"][member_groups[group]] = {}
        }
    }

    return output;
}

// --- Funktionen Ende ---

// --- Verwaltung Start ---

    // legt für jedes Mitglied aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableMitglieder() {
    let table = document.getElementById("VerwaltungTabelleMitglieder");
    let content = `<tr><th>Mitglieder</th></tr>`
    for (let member in data["members"]) {
        content += `<tr><td onclick="">${member}</td></tr>`;
    }
    table.innerHTML = content;
}

    // legt für jede Gruppe aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableGruppen() {
    let table = document.getElementById("VerwaltungTabelleGruppen");
    let content = `<tr><th>Gruppen</th></tr>`
    for (let group in data["groups"]) {
        content += `<tr><td onclick="">${group}</td></tr>`;
    }
    table.innerHTML = content;
}

// --- Verwaltung Ende ---