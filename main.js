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

    // speichert, welche Mitglieder für die Anwesenheit ausgewählt wurden
let anwesenheitSelectedMembers = []

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
    let pageFunctions = {"Anwesenheit": [anwesenheitUpdateDatumAuswahl, anwesenheitUpdateTableGruppenAuswahl], "Verwaltung": [verwaltungUpdateTableMitglieder, verwaltungUpdateTableGruppen]} // die Funktionen, die beim Aufrufen einer Seite ausgeführt werden sollen
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
let openDialogs = 0
let dialogElements = Array.from(document.getElementsByTagName("dialog"))
for (let i in dialogElements) {
    dialogElements[i].addEventListener("close", () => {
        openDialogs -= 1
        if (openDialogs === 0) {
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
function openDialog(dialogId) { //dialogId: string = HTML-ID
    openDialogs += 1
    if (openDialogs === 1) {
        document.getElementsByTagName("body")[0].style.overflowY = "hidden"
    }
    document.getElementById(dialogId).showModal()
}

    // Funktion, um einen simplen Dialog mit zwei Auswahlmöglichkeiten zu erstellen
function confirmDialog(title, desc, btn1_txt, btn1_fnc, btn2_txt, btn2_fnc) {
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

    openDialog("confirm-dialog")
}

    // Funktion, um einen simplen Dialog mit einer Auswahlmöglichkeit zu erstellen
function infoDialog(title, desc, btn_txt, btn_fnc) {
    let elem_dialog = document.getElementById("info-dialog")
    document.getElementById("info-dialog-title").innerHTML = title
    document.getElementById("info-dialog-description").innerHTML = desc
    let btn1 = document.getElementById("info-dialog-btn")
    btn1.innerHTML = btn_txt
    btn1.onclick = function () {
        elem_dialog.close();
        btn_fnc()
    }

    openDialog("info-dialog")
}

    // leere Funktion, wird verwendet, um einen Knopf des confirm_dialog Dialogs (z.B. Abbrechen) lediglich den Dialog schließen zu lassen
function doNothing() {}

    // erstellt eine Datei mit den angegebenen Eigenschaften und lädt diese automatisch herunter
function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    // noinspection JSUnresolvedReference
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

    // versteckt bzw. zeigt die angegebene Tabelle
function toggleTableVisibility(tableId) {
    let table = document.getElementById(tableId)
    if (table.classList.contains("hidden")) {
        table.classList.remove("hidden")
    } else {
        table.classList.add("hidden")
    }
}

    // wechselt den Zustand des angegeben Checkmarks
function toggleCheckmark(checkmarkId) {
    let checkmark = document.getElementById(checkmarkId)
    checkmark.checked = !checkmark.checked;
    if(checkmarkId.startsWith("AnwesenheitTabelleAuswahl_")) {
        anwesenheitTableGruppenAuswahlCheckmarkUpdate(parseInt(checkmarkId.substring("AnwesenheitTabelleAuswahl_".length)))
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

    // für Funktionen, die einen neuen Eintrag erstellen, um Duplikaten vorzubeugen
function createNewName(name) {
    if (name.endsWith(")") && name.substring(0, name.length-2).endsWith("(")) {
        name = name.substring(0, name.length-2) + (parseInt(name.substring(name.length-2, name.length-1)) + 1) + ")"
    } else {
        name += " (1)"
    }
    return name
}

    // setzt das Zeichen 0 vor, bis die Wunschlänge erreicht ist
function pad(inString, length) {
    inString = inString.toString();
    while (inString.length < length) inString = "0" + inString;
    return inString;
}

// --- Funktionen Ende ---

// --- Anwesenheit Start ---

    // bereitet das Eingabefeld für das Datum vor
function anwesenheitUpdateDatumAuswahl() {
    let date = new Date()
    let dateInput = document.getElementById("AnwesenheitInputDatum")
    let datepicker = new Datepicker(dateInput, {"language": "de", "format": "dd-mm-yyyy", "autohide": true})
    datepicker.setDate(date)
}

    // aktualisiert die Tabelle bzw. erstellt diese
function anwesenheitUpdateTableGruppenAuswahl(recreate = true) {
    let table = document.getElementById("AnwesenheitTabelleGruppenAuswahl")
    let groupKeys = ["alle"].concat(Object.keys(data["groups"]).sort())
    let groupMembers = {}
    if (recreate) {
        let content = `<tr><th>beteiligte Gruppen <span class="spacer"></span> <button onclick="toggleTableVisibility('AnwesenheitTabelleGruppenAuswahl')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
        for (let i in groupKeys) {
            content += `<tr onclick="toggleCheckmark('AnwesenheitTabelleAuswahl_${i}')"><td><label onclick="event.stopImmediatePropagation()" for="AnwesenheitTabelleAuswahl_${i}"><div id="AnwesenheitTabelleAuswahl_${i}_p"><input onchange="anwesenheitTableGruppenAuswahlCheckmarkUpdate(${i})" type="checkbox" id="AnwesenheitTabelleAuswahl_${i}"> ${groupKeys[i]}</div></label> <span class="spacer"></span> <button onclick="event.stopImmediatePropagation();anwesenheitDialogMitgliederAuswahl(${i})"><span class="material-symbols-outlined">more_horiz</span></button></td></tr>`;
        }
        table.innerHTML = content;
    }

    for (let group in data["groups"]) {
        groupMembers[group] = {"total": 0, "selected": 0}
    }

    if (anwesenheitSelectedMembers.sort() === Object.keys(data["members"]).sort()) { // alle Mitglieder ausgewählt
        for (let i in groupKeys) {
            document.getElementById(`AnwesenheitTabelleAuswahl_${i}`).checked = true
        }
    } else {
        for (let member in data["members"]) {
            for (let i in data["members"][member]["groups"]) {
                groupMembers[data["members"][member]["groups"][i]]["total"] += 1
                if (anwesenheitSelectedMembers.includes(member)) {
                    groupMembers[data["members"][member]["groups"][i]]["selected"] += 1
                }
            }
        }

        for (let group in groupMembers) {
            let index = groupKeys.indexOf(group)
            if (groupMembers[group]["total"] === groupMembers[group]["selected"] && groupMembers[group]["total"] > 0) { // alle Mitglieder ausgewählt, Gruppe nicht leer
                document.getElementById(`AnwesenheitTabelleAuswahl_${index}`).checked = true
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_${index}_p`)
                if (element.classList.contains("anwesenheitGroupWithEdits")) {
                    element.classList.remove("anwesenheitGroupWithEdits")
                }
            } else if (groupMembers[group]["selected"] > 0 && groupMembers[group]["total"] > 0) { // einige Mitglieder ausgewählt, Gruppe nicht leer
                document.getElementById(`AnwesenheitTabelleAuswahl_${index}`).checked = false
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_${index}_p`)
                if (!element.classList.contains("anwesenheitGroupWithEdits")) {
                    element.classList.add("anwesenheitGroupWithEdits")
                }
            } else if (groupMembers[group]["selected"] === 0 && groupMembers[group]["total"] > 0) { // keine Mitglieder ausgewählt, Gruppe nicht leer
                document.getElementById(`AnwesenheitTabelleAuswahl_${index}`).checked = false
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_${index}_p`)
                if (element.classList.contains("anwesenheitGroupWithEdits")) {
                    element.classList.remove("anwesenheitGroupWithEdits")
                }
            } else if (groupMembers[group]["total"] === 0) { // Gruppe leer
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_${index}`)
                if (!element.classList.contains("anwesenheitEmptyGroup")) {
                    element.classList.add("anwesenheitEmptyGroup")
                }
            }
        }
        if (anwesenheitSelectedMembers.length > 0) { // Mitglieder ausgewählt
            if (anwesenheitSelectedMembers.length === Object.keys(data["members"]).length) { // alle Mitglieder ausgewählt
                document.getElementById(`AnwesenheitTabelleAuswahl_0`).checked = true
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_0_p`)
                if (element.classList.contains("anwesenheitGroupWithEdits")) {
                    element.classList.remove("anwesenheitGroupWithEdits")
                }
            } else { // einige Mitglieder ausgewählt
                document.getElementById(`AnwesenheitTabelleAuswahl_0`).checked = false
                let element = document.getElementById(`AnwesenheitTabelleAuswahl_0_p`)
                if (!element.classList.contains("anwesenheitGroupWithEdits")) {
                    element.classList.add("anwesenheitGroupWithEdits")
                }
            }
        }
    }
}

    // ausgelöst durch Veränderungen an einem Checkmark in der Tabelle
function anwesenheitTableGruppenAuswahlCheckmarkUpdate(index) {
    let groupKeys = ["alle"].concat(Object.keys(data["groups"]).sort())
    let value = document.getElementById(`AnwesenheitTabelleAuswahl_${index}`).checked

    // ausgewählte Gruppe, deren Mitglieder
    if (index === 0) { // alle
        if (!value) { // entfernt
            anwesenheitSelectedMembers = []
        } else { // hinzugefügt
            anwesenheitSelectedMembers = Object.keys(data["members"])
        }
        for (let i in groupKeys) {
            document.getElementById(`AnwesenheitTabelleAuswahl_${i}`).checked = value
            let element = document.getElementById(`AnwesenheitTabelleAuswahl_${i}_p`)
            if (element.classList.contains("anwesenheitGroupWithEdits")) {
                element.classList.remove("anwesenheitGroupWithEdits")
            }
        }
    } else {
        for (let member in data["members"]) {
            if (data["members"][member]["groups"].includes(groupKeys[index])) {
                if (value && !anwesenheitSelectedMembers.includes(member)) { // Gruppe hinzugefügt, Mitglied noch nicht ausgewählt
                    anwesenheitSelectedMembers.push(member)
                } else if (!value) { // Gruppe entfernt
                    let position = anwesenheitSelectedMembers.indexOf(member)
                    anwesenheitSelectedMembers.splice(position, 1)
                }
            }
        }

        anwesenheitUpdateTableGruppenAuswahl(false)

        let allTrue = true
        for (let i in groupKeys) {
            let element = document.getElementById(`AnwesenheitTabelleAuswahl_${i}`)
            if (i > 0 && element.checked === false && !element.classList.contains("anwesenheitEmptyGroup")) {
                allTrue = false
            }
        }
        document.getElementById(`AnwesenheitTabelleAuswahl_0`).checked = allTrue;
    }
}

function anwesenheitDialogMitgliederAuswahl(index) {
    let groupKeys = ["alle"].concat(Object.keys(data["groups"]).sort())
    let members = []

    let title = document.getElementById("AnwesenheitDialogMitgliederAuswahlTitel")
    let table = document.getElementById("AnwesenheitTabelleMitgliederAuswahl")
    if (index > 0) {
        title.innerText = `${groupKeys[index]} - Mitglieder auswählen`
    } else {
        title.innerText = "Mitglieder auswählen"
    }

    for (let member in data["members"]) {
        if (index === 0 || data["members"][member]["groups"].includes(groupKeys[index])) {
            members.push(member)
        }
    }
    members = members.sort()

    let content = `<tr><th>Mitglieder auswählen <span class="spacer"></span> <button onclick="toggleTableVisibility('AnwesenheitTabelleMitgliederAuswahl')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
    for (let i in members) {
        content += `<tr onclick="toggleCheckmark('AnwesenheitTabelleMitgliederAuswahl_${i}')"><td><label onclick="event.stopImmediatePropagation()" for="AnwesenheitTabelleMitgliederAuswahl_${i}"><div id="AnwesenheitTabelleMitgliederAuswahl_${i}_p"><input onchange="anwesenheitTableMitgliederAuswahlCheckmarkUpdate(${i})" type="checkbox" id="AnwesenheitTabelleMitgliederAuswahl_${i}"`
        if (anwesenheitSelectedMembers.includes(members[i])) {
            content += " checked"
        }
        content += `> ${members[i]}</div></label></td></tr>`
            }
    if (members.length === 0) {
        content += `<tr><td>Diese Gruppe enthält keine Mitglieder.</td></tr>`
    }
    table.innerHTML = content
    openDialog("AnwesenheitDialogMitgliederAuswahl")
}

// --- Anwesenheit Ende ---

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

    // Öffnet den Dialog zum Bearbeiten eines Mitglieds
function verwaltungDialogMitgliedBearbeiten(name, erstellen = false) { // Name: String = memberName, erstellen: boolean
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
    for (let i in groupKeys.sort()) {
        if (!erstellen) {
            inputGroupsContent += `<label><input type="checkbox" id="VerwaltungDialogMitgliedBearbeitenGruppen_${i}"`
            if (data["members"][name]["groups"].includes(groupKeys[i])) {
                inputGroupsContent += " checked"
            }
            inputGroupsContent += `>${groupKeys[i]}</label>`
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
    cancelEditButton.onclick = function(){verwaltungDialogMitgliedBearbeitenAbbrechen(name)}
    deleteButton.onclick = function () {confirmDialog("Bist du sicher, dass du dieses Mitglied löschen möchtest?", "Du bist kurz davor, dieses Mitglied zu löschen. Diese Aktion kann nicht rückgängig gemacht werden.", "Abbrechen", doNothing, "Fortfahren", function (){verwaltungDialogMitgliedBearbeitenLoeschen(name)})}
    if (erstellen) {
        saveButton.onclick = function () {
            data["members"][name] = copy(dataEmptyMember)
            saveData(data)
            verwaltungUpdateTableMitglieder()
            verwaltungDialogMitgliedBearbeitenSpeichern(name)
        }
    }

    openDialog("VerwaltungDialogMitgliedBearbeiten")
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
            infoDialog("Dieser Name ist bereits vergeben.", "Ein Mitglied mit diesem Namen existiert bereits. Bitte wähle einen anderen Namen.", "Fortfahren", doNothing)
            return
        } else {
            delete data["members"][name]
        }
    }

    // groups
    let groupKeys = Object.keys(data["groups"])
    for (let i in groupKeys.sort()) {
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
        infoDialog("Änderungen gespeichert", "Deine Änderungen wurden übernommen. Du kannst dieses Fenster nun schließen.", "Fortfahren", doNothing)
    }
}

// führt den Prozess zum Abbrechen der Bearbeitung eines Mitglieds aus
function verwaltungDialogMitgliedBearbeitenAbbrechen(name) {
    let dialog = document.getElementById("VerwaltungDialogMitgliedBearbeiten")
    let oldMember
    if (data["members"].hasOwnProperty(name)) { // bearbeiten
        oldMember = data["members"][name]
    } else { // erstellen
        oldMember = copy(dataEmptyMember)
    }
    let newMember = copy(dataEmptyMember)

    // groups
    let groupKeys = Object.keys(data["groups"])
    for (let i in groupKeys.sort()) {
        let checkbox = document.getElementById(`VerwaltungDialogMitgliedBearbeitenGruppen_${i}`)
        if(checkbox.checked) {
            newMember["groups"].push(groupKeys[i])
        }
    }

    if (verwaltungDialogMitgliedBearbeitenHatAenderung(name, oldMember, newMember)) {
        confirmDialog("Bist du sicher, dass du deine Änderungen verwerfen möchtest?", "Du bist kurz davor, alle deine Änderungen an diesem Mitglied zu verwerfen. Diese Aktion kann nicht rückgängig gemacht werden.", "Abbrechen", doNothing, "Fortfahren", function () {dialog.close()})
    } else {
        dialog.close()
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
    let dialog = document.getElementById("VerwaltungDialogMitgliedBearbeiten")
    verwaltungUpdateTableMitglieder()
    dialog.close()
    infoDialog("Mitglied gelöscht", "Das Mitglied wurde erfolgreich gelöscht. Du kannst dieses Fenster nun schließen.", "Fortfahren", doNothing)
}

    // ermöglicht das Erstellen eines Mitglieds
function verwaltungDialogMitgliedErstellen() {
    let name = "Neues Mitglied"
    while (data["members"].hasOwnProperty(name)) {
        name = createNewName(name)
    }
    verwaltungDialogMitgliedBearbeiten(name, true)
}

    // legt für jede Gruppe aus den Daten eine Reihe in der Tabelle an
function verwaltungUpdateTableGruppen() {
    let table = document.getElementById("VerwaltungTabelleGruppen");
    let content = `<tr><th>Gruppen <span class="spacer"></span> <button onclick="verwaltungDialogGruppeErstellen()"><span class="material-symbols-outlined">add</span></button> <button onclick="toggleTableVisibility('VerwaltungTabelleGruppen')"><span class="material-symbols-outlined">visibility_off</span></button></th></tr>`
    for (let group in sortObject(data["groups"])) {
        content += `<tr><td onclick="verwaltungDialogGruppeBearbeiten('${group}')">${group}</td></tr>`;
    }
    table.innerHTML = content;
}

    // öffnet den Dialog zum Bearbeiten einer Gruppe
function verwaltungDialogGruppeBearbeiten(name, erstellen = false) {
    let title = document.getElementById("VerwaltungDialogGruppeBearbeitenTitel")
    if (!erstellen) {
        title.innerText = "Gruppe bearbeiten"
    } else {
        title.innerText = "Gruppe erstellen"
    }

    // name
    let inputName = document.getElementById("VerwaltungDialogGruppeBearbeitenName")
    inputName.value = name

    // buttons
    let saveButton = document.getElementById("VerwaltungDialogGruppeBearbeitenSpeichern")
    let cancelEditButton = document.getElementById("VerwaltungDialogGruppeBearbeitenAbbrechen")
    let deleteButton = document.getElementById("VerwaltungDialogGruppeBearbeitenLöschen")
    saveButton.onclick = function(){verwaltungDialogGruppeBearbeitenSpeichern(name)}
    cancelEditButton.onclick = function(){verwaltungDialogGruppeBearbeitenAbbrechen(name)}
    deleteButton.onclick = function () {confirmDialog("Bist du sicher, dass du diese Gruppe löschen möchtest?", "Du bist kurz davor, diese Gruppe zu löschen. Diese Aktion kann nicht rückgängig gemacht werden.", "Abbrechen", doNothing, "Fortfahren", function (){verwaltungDialogGruppeBearbeitenLoeschen(name)})}
    if (erstellen) {
        saveButton.onclick = function () {
            data["groups"][name] = copy(dataEmptyGroup)
            saveData(data)
            verwaltungUpdateTableMitglieder()
            verwaltungDialogGruppeBearbeitenSpeichern(name)
        }
    }

    openDialog("VerwaltungDialogGruppeBearbeiten")
}

    // speichert die Änderungen an der Gruppe (wenn korrekt)
function verwaltungDialogGruppeBearbeitenSpeichern(name) {
    let dialog = document.getElementById("VerwaltungDialogGruppeBearbeiten")
    let inputName = document.getElementById("VerwaltungDialogGruppeBearbeitenName").value
    let oldGroup = data["groups"][name]
    let newGroup = copy(dataEmptyGroup)

    // name
    if (name !== inputName) { // Name wurde geändert
        if (data["groups"].hasOwnProperty(inputName)) { // Name bereits vergeben
            infoDialog("Dieser Name ist bereits vergeben.", "Eine Gruppe mit diesem Namen existiert bereits. Bitte wähle einen anderen Namen.", "Fortfahren", doNothing)
            return
        } else {
            delete data["groups"][name]
        }
    }

    // save
    data["groups"][inputName] = newGroup
    for (let member in data["members"]) {
        if (data["members"][member]["groups"].includes(name)) { // Mitglied in alter Gruppe
            let index = data["members"][member]["groups"].indexOf(name);
            if (index >= 0) {
                data["members"][member]["groups"].splice(index, 1); // entfernt alte Gruppe
            }
            data["members"][member]["groups"].push(inputName) // fügt neue Gruppe hinzu
        }
    }
    saveData(data)

    verwaltungUpdateTableGruppen()
    dialog.close()
    if (verwaltungDialogGruppeBearbeitenHatAenderung(name, oldGroup, newGroup)) { // Änderungen wurden vorgenommen
        infoDialog("Änderungen gespeichert", "Deine Änderungen wurden übernommen. Du kannst dieses Fenster nun schließen.", "Fortfahren", doNothing)
    }
}

    // führt den Prozess zum Abbrechen der Bearbeitung einer Gruppe aus
function verwaltungDialogGruppeBearbeitenAbbrechen(name) {
    let dialog = document.getElementById("VerwaltungDialogGruppeBearbeiten")
    let oldGroup
    if (data["groups"].hasOwnProperty(name)) { // bearbeiten
        oldGroup = data["groups"][name]
    } else { // erstellen
        oldGroup = copy(dataEmptyGroup)
    }
    let newGroup = copy(dataEmptyGroup)

    if (verwaltungDialogGruppeBearbeitenHatAenderung(name, oldGroup, newGroup)) {
        confirmDialog("Bist du sicher, dass du deine Änderungen verwerfen möchtest?", "Du bist kurz davor, alle deine Änderungen an dieser Gruppe zu verwerfen. Diese Aktion kann nicht rückgängig gemacht werden.", "Abbrechen", doNothing, "Fortfahren", function () {dialog.close()})
    } else {
        dialog.close()
    }
}

    // überprüft ob Änderungen an den Daten im Dialog vom Mitglied vorgenommen wurden
function verwaltungDialogGruppeBearbeitenHatAenderung(name, oldGroup, newGroup) {
    let changed = false
    console.log(oldGroup, newGroup) // temp, damit nicht länger meckert; Vars könnten später noch benötigt werde

    // name
    let inputName = document.getElementById("VerwaltungDialogGruppeBearbeitenName").value
    if (inputName !== name) {
        changed = true
    }

    return changed
}

    // löscht eine Gruppe
function verwaltungDialogGruppeBearbeitenLoeschen(name) {
    delete data["groups"][name]
    for (let member in data["members"]) {
        if (data["members"][member]["groups"].includes(name)) { // Mitglied in alter Gruppe
            let index = data["members"][member]["groups"].indexOf(name);
            if (index >= 0) {
                data["members"][member]["groups"].splice(index, 1); // entfernt alte Gruppe
            }
        }
    }
    saveData(data)

    let dialog = document.getElementById("VerwaltungDialogGruppeBearbeiten")
    verwaltungUpdateTableGruppen()
    dialog.close()
    infoDialog("Gruppe gelöscht", "Die Gruppe wurde erfolgreich gelöscht. Du kannst dieses Fenster nun schließen.", "Fortfahren", doNothing)
}

    // ermöglicht das Erstellen einer Gruppe
function verwaltungDialogGruppeErstellen() {
    let name = "Neue Gruppe"
    while (data["groups"].hasOwnProperty(name)) {
        name = createNewName(name)
    }
    verwaltungDialogGruppeBearbeiten(name, true)
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

// Öffnet die erste verfügbare Seite
page(document.getElementsByClassName("page")[0].id)