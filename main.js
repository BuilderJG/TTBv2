// --- Setup Start ---

// grundlegenden Aufbau der Daten festlegen
let dataEmptyMember = {"groups": []}
let dataEmptyGroup = {}
let dataExample = {"members": {"Mitglied 1": {"groups": ["Gruppe 1"]}}, "groups": {"Gruppe 1": {}}}

    // Lädt die Daten aus dem Local Storage
let data = {}
if (localStorage.getItem("data")) {
    data = JSON.parse(localStorage.getItem("data"))
}
saveData(data)

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

// ausschließlich zur Verwendung in der Navigationsleiste; schließt die Nav-Leiste und öffnet die angegebene Seite
function navPage(selectedPage) {
    page(selectedPage)
    toggleNav()
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
    dialogElements[i].innerHTML = `<div class="dialog-content"><a onclick="document.getElementById('${dialogElements[i].id}').close()" class="dialog-close-button"><span class="material-symbols-outlined">close</span></a>${dialogElements[i].innerHTML}</div>`
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
    let elem_dialog = document.getElementById("confirm-dialog")
    document.getElementById("confirm-dialog-title").innerHTML = title
    document.getElementById("confirm-dialog-description").innerHTML = desc
    let btn1 = document.getElementById("confirm-dialog-btn1")
    btn1.innerHTML = btn1_txt
    btn1.onclick = function () {
        elem_dialog.close();
        btn1_fnc()
    }
    let btn2 = document.getElementById("confirm-dialog-btn2")
    btn2.innerHTML = btn2_txt
    btn2.onclick = function () {
        elem_dialog.close();
        btn2_fnc()
    }

    open_dialog("confirm-dialog")
}

// Funktion, um einen simplen Dialog mit einer Auswahlmöglichkeit zu erstellen
function info_dialog(title, desc, btn_txt, btn_fnc) {
    let elem_dialog = document.getElementById("info-dialog")
    document.getElementById("info-dialog-title").innerHTML = title
    document.getElementById("info-dialog-description").innerHTML = desc
    let btn1 = document.getElementById("info-dialog-btn")
    btn1.innerHTML = btn_txt
    btn1.onclick = function () {
        elem_dialog.close();
        btn_fnc()
    }

    open_dialog("info-dialog")
}

    // leere Funktion, wird verwendet, um einen Knopf des confirm_dialog Dialogs (z.B. Abbrechen) lediglich den Dialog schließen zu lassen
function do_nothing() {}

    // erstellt eine Datei mit den angegebenen Eigenschaften und lädt diese automatisch herunter
function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function toggleTableVisibility(tableId) {
    let table = document.getElementById(tableId)
    if (table.classList.contains("hidden")) {
        table.classList.remove("hidden")
    } else {
        table.classList.add("hidden")
    }
}

// --- Basis Ende ---

// --- Funktionen Start ---

    // gibt ein neues Objekt mit dem gleichen Inhalt wie das eingegebene Objekt zurück
function copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

    // überprüft, ob eine Variable ein Objekt ist
function isObject(x) {
    return (typeof x === "object" && !Array.isArray(x) && x !== null)

}

    // gibt das übergebene Objekt in sortierter Form zurück
function sortObject(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

    // repariert das eingegebene Daten-Objekt
function repairData(dataIn) { // dataIn: object = TTB-Data
    let dataOut = {}

    // members
    dataOut["members"] = {}
    let member_groups = []
    if (dataIn.hasOwnProperty("members")) {
        for (let member in dataIn["members"]) {
            if (typeof member === "string") {
                dataOut["members"][member] = copy(dataEmptyMember)
                // property: groups
                if (isObject(dataIn["members"][member]) && dataIn["members"][member].hasOwnProperty("groups")) {
                    for (let group in dataIn["members"][member]["groups"]) {
                        let groupName = dataIn["members"][member]["groups"][group]
                        if (typeof groupName === "string") {
                            dataOut["members"][member]["groups"].push(dataIn["members"][member]["groups"][group])
                            if (!member_groups.includes(dataIn["members"][member]["groups"][group])) {
                                member_groups.push(dataIn["members"][member]["groups"][group])
                            }
                        }
                    }
                }
            }
        }
    }

    // groups
    dataOut["groups"] = {}
    if (dataIn.hasOwnProperty("groups")) {
        for (let group in dataIn["groups"]) {
            if (typeof group === "string") {
                dataOut["groups"][group] = copy(dataEmptyGroup)
            }
        }
    }
    for (let group in member_groups) {
        if (!dataOut["groups"].hasOwnProperty(member_groups[group])) {
            dataOut["groups"][member_groups[group]] = {}
        }
    }

    return dataOut;
}

    // speichert die eingegebenen TTB-Daten in der Variable data und im localstorage
function saveData(dataIn) {
    data = repairData(dataIn)
    localStorage.setItem("data", JSON.stringify(dataIn))
}

// --- Funktionen Ende ---

// --- Verwaltung Start ---

    // legt für jedes Mitglied aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableMitglieder() {
    let table = document.getElementById("VerwaltungTabelleMitglieder");
    let content = `<tr><th>Mitglieder <span class="spacer"></span> <button onclick="verwaltungDialogMitgliedErstellen()"><span class="material-symbols-outlined">add</span></button> <button onclick="toggleTableVisibility('VerwaltungTabelleMitglieder')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
    for (let member in sortObject(data["members"])) {
        content += `<tr><td onclick="verwaltungDialogMitgliedBearbeiten('${member}')">${member}</td></tr>`;
    }
    table.innerHTML = content;
}

    // legt für jede Gruppe aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableGruppen() {
    let table = document.getElementById("VerwaltungTabelleGruppen");
    let content = `<tr><th>Gruppen <span class="spacer"></span> <button><span class="material-symbols-outlined">add</span></button> <button onclick="toggleTableVisibility('VerwaltungTabelleGruppen')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
    for (let group in sortObject(data["groups"])) {
        content += `<tr><td onclick="verwaltungDialogGruppeBearbeiten('${group}')">${group}</td></tr>`;
    }
    table.innerHTML = content;
}

    // Öffnet den Dialog zum Bearbeiten eines Mitglieds
function verwaltungDialogMitgliedBearbeiten(name, erstellen = false) { // Name: String = memberName, erstellen: boolean
    let dialog = document.getElementById("VerwaltungDialogMitgliedBearbeiten")
    let title = document.getElementById("VerwaltungDialogMitgliedBearbeitenTitel")
    if (!erstellen) {
        title.innerText = "Mitglied bearbeiten"
    } else {
        title.innerText = "Mitglied erstellen"
    }

    // input-Felder
    let inputName = document.getElementById("VerwaltungDialogMitgliedBearbeitenName")
    inputName.value = name
    let inputGroups = document.getElementById("VerwaltungDialogMitgliedBearbeitenGruppen")
    let inputGroupsContent = ""
    let groupKeys = Object.keys(data["groups"])
    let checkedTranslate = {true: ' checked = "true"', false: ''}
    for (let i in groupKeys) {
        if (!erstellen) {
            let groupMember = data["members"][name]["groups"].includes(groupKeys[i])
            inputGroupsContent += `<label><input type="checkbox" id="VerwaltungDialogMitgliedBearbeitenGruppen_${i}"${checkedTranslate[groupMember]}>${groupKeys[i]}</label>`
        } else {
            inputGroupsContent += `<label><input type="checkbox" id="VerwaltungDialogMitgliedBearbeitenGruppen_${i}">${groupKeys[i]}</label>`
        }
    }
    inputGroups.innerHTML = inputGroupsContent

    // Buttons
    let saveButton = document.getElementById("VerwaltungDialogMitgliedBearbeitenSpeichern")
    let cancelEditButton = document.getElementById("VerwaltungDialogMitgliedBearbeitenAbbrechen")
    let deleteButton = document.getElementById("VerwaltungDialogMitgliedBearbeitenLöschen")
    saveButton.onclick = function(){verwaltungDialogMitgliedBearbeitenSpeichern(name)}
    cancelEditButton.onclick = function(){dialog.close()}
    deleteButton.onclick = function () {confirm_dialog("Bist du sicher, dass du dieses Mitglied löschen möchtest?", "Du bist kurz davor, dieses Mitglied zu löschen. Diese Aktion kann nicht rückgängig gemacht werden.", "Abbrechen", do_nothing, "Fortfahren", function (){verwaltungDialogMitgliedBearbeitenLoeschen(name);dialog.close()})}
    if (erstellen) {
        saveButton.onclick = function () {
            data["members"][name] = copy(dataEmptyMember)
            saveData(data)
            page("Verwaltung")
            verwaltungDialogMitgliedBearbeitenSpeichern(name)
        }
    }

    open_dialog("VerwaltungDialogMitgliedBearbeiten")
}

    // speichert die Änderungen am Mitglied (wenn korrekt)
function verwaltungDialogMitgliedBearbeitenSpeichern(name) {
    let dialog = document.getElementById("VerwaltungDialogMitgliedBearbeiten")
    let inputName = document.getElementById("VerwaltungDialogMitgliedBearbeitenName").value
    let oldMember = data["members"][name]
    let newMember = copy(dataEmptyMember)

    // name
    if (name !== inputName) { // Name wurde geändert
        if (data["members"].hasOwnProperty(inputName)) { // Name bereits vergeben
            info_dialog("Dieser Name ist bereits vergeben.", "Ein Mitglied mit diesem Namen existiert bereits. Bitte wähle einen anderen Namen.", "Fortfahren", do_nothing)
            return
        } else {
            delete data["members"][name]
        }
    }

    // groups
    let groupKeys = Object.keys(data["groups"])
    for (let i in groupKeys) {
        let checkbox = document.getElementById(`VerwaltungDialogMitgliedBearbeitenGruppen_${i}`)
        if(checkbox.checked) {
            newMember["groups"].push(groupKeys[i])
        }
    }

    // save
    data["members"][inputName] = newMember
    saveData(data)

    verwaltungUpdateTableMitglieder()
    dialog.close()
    if (verwaltungDialogMitgliedBearbeitenHatAenderung(name, oldMember, newMember)) { // Änderungen wurden vorgenommen
        info_dialog("Änderungen gespeichert", "Deine Änderungen wurden übernommen. Du kannst dieses Fenster nun schließen.", "Fortfahren", do_nothing)
    }
}

    // überprüft ob Änderungen an den Daten im Dialog vom Mitglied vorgenommen wurden
function verwaltungDialogMitgliedBearbeitenHatAenderung(name, oldMember, newMember) {
    let changed = false

    // name
    let inputName = document.getElementById("VerwaltungDialogMitgliedBearbeitenName").value
    if (inputName !== name) {
        changed = true
    }

    // groups
    if (newMember["groups"].sort().join(", ") !== oldMember["groups"].sort().join(", ")) {
        changed = true
    }

    return changed
}

    // löscht ein Mitglied
function verwaltungDialogMitgliedBearbeitenLoeschen(name) {
    delete data["members"][name]
    saveData(data)
    page("Verwaltung")
    info_dialog("Mitglied gelöscht", "Das Mitglied wurde erfolgreich gelöscht. Du kannst dieses Fenster nun schließen.", "Fortfahren", do_nothing)
}

function verwaltungDialogMitgliedErstellen() {
    let name = "Neues Mitglied"
    while (data["members"].hasOwnProperty(name)) {
        if (name.endsWith(")")) {
            name = name.substring(0, name.length-2) + (parseInt(name.substring(name.length-2, name.length-1)) + 1) + ")"
        } else {
            name += " (1)"
        }
    }
    verwaltungDialogMitgliedBearbeiten(name, true)
}

    // Öffnet den Dialog zum Bearbeiten einer Gruppe
function verwaltungDialogGruppeBearbeiten(name) {
    open_dialog("VerwaltungDialogMitgliedBearbeiten")
}

// --- Verwaltung Ende ---

// --- Einstellungen Start ---

    // importiert die Daten aus der angegebenen Datei in dem Input-Feld in den Einstellungen
function einstellungenImportJsonData() {
    let file_to_read = document.getElementById("Einstellungen_input_import_data").files[0];
    let file_read = new FileReader();
    file_read.onload = function (e) {
        saveData(JSON.parse(e.target.result.toString()))
        page('Verwaltung')
    };
    file_read.readAsText(file_to_read);
}

    // überschreibt die gespeicherten Daten mit Beispiel-Daten
function einstellungenResetData() {
    saveData(dataExample)
    page('Verwaltung')
}

// --- Einstellungen Ende ---