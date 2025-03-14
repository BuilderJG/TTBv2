// --- Setup Start ---

// grundlegenden Aufbau der Daten festlegen
let dataEmptyMember = {
    "address": [null, null, null, null],
    "dateOfBirth": null,
    "email": null,
    "fields": {},
    "firstName": null,
    "id": null,
    "lastName": null,
    "phoneNumber": null,
    "roles": [],
    "subGroups": [],
    "imageUrl": null
}

let dataEmptyGroup = {
    "fieldDefs": [],
    "id": null,
    "imageUrl": null,
    "members": [],
    "name": null,
    "roles": [],
    "signupUrl": null,
    "subGroups": []
}

let dataEmptyRole = {
    "id": null,
    "name": null
}

let dataEmptyField = {
    "id": null,
    "name": null,
    "type": "TEXT"
}

let dataEmptySubGroup = {
    "color": null,
    "id": null,
    "imageUrl": null,
    "name": null
}

let dataEmptyData = {
    "baseData": {
        "spondUser": null,
        "spondPassword": null,
        "spondGroupId": null
    },
    "spondData": {},
    "changedData": {
        "fieldDefs": {
            "added": [],
            "changed": [],
            "removed": []
        },
        "members": {
            "added": [],
            "changed": [],
            "removed": []
        },
        "roles": {
            "added": [],
            "changed": [],
            "removed": []
        },
        "subGroups": {
            "added": [],
            "changed": [],
            "removed": []
        }
    }
}

// Lädt die Daten aus dem Local Storage
let data = {}
if (localStorage.getItem("data")) {
    data = JSON.parse(localStorage.getItem("data"))
}