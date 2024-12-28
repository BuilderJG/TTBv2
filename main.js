// --- Setup Start ---

    // Lädt die Daten aus dem Local Storage bzw. füllt diese mit Beispielinhalten
let data = {"members": {"Chihabi, Mohammad": {"groups": ["1. Thor"]}, "Gnieser, Jannik": {"groups": ["1. Thor"]}, "Kusz, Emma": {"groups": ["1. Thor"]}, "Schell, Simon": {"groups": ["1. Thor"]}, "Topel, Felix": {"groups": ["1. Thor"]}}}
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
    console.log("toggle nav");
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
    let pageFunctions = {"Verwaltung": [verwaltungUpdateTableMitglieder]} // die Funktionen, die beim Aufrufen einer Seite ausgeführt werden sollen
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

// --- Basis Ende ---

// --- Funktionen Start ---

    // repariert das eingegebene Daten-Objekt
function repairData(data) { // data: object = TTB-Data
    let output = {}
    // members
    output["members"] = {}
    if (data.hasOwnProperty("members")) {
        for (let member in data["members"]) {
            if (typeof member === "string") {
                output["members"][member] = {"groups": []}
                for (let property in data["members"][member]) {
                    if (output["members"][member].hasOwnProperty(property)) {
                        output["members"][member][property] = data["members"][member][property];
                    }
                }
            }
        }
    }

    return output;
}

// --- Funktionen Ende ---

// --- Verwaltung Start ---

    // legt für jedes Mitglied aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableMitglieder() {
    let table = document.getElementById("VerwaltungTabelleMitglieder");
    let content = `<tr><th>Name</th></tr>`
    for (let member in data["members"]) {
        content += `<tr><td onclick="">${member}</td></tr>`;
    }
    table.innerHTML = content;
}

// --- Verwaltung Ende ---