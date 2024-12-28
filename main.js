// --- Setup Start ---

// Öffnet die erste verfügbare Seite
page(document.getElementsByClassName("page")[0].id)
let data = {"members": {"Chihabi, Mohammad": {"groups": ["1. Thor"]}, "Gnieser, Jannik": {"groups": ["1. Thor"]}, "Kusz, Emma": {"groups": ["1. Thor"]}, "Schell, Simon": {"groups": ["1. Thor"]}, "Topel, Felix": {"groups": ["1. Thor"]}}}
if (localStorage.getItem("data")) {
    data = JSON.parse(localStorage.getItem("data"))
} else {
    localStorage.setItem("data", JSON.stringify(data))
}

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
    for (let i in pages) { // Versteckt alle Seiten, außer der ausgewählten
        if (pages[i].id === selectedPage) {
            pages[i].style.display = "block"
        } else {
            pages[i].style.display = "none";
        }
    }
}

// --- Basis Ende ---

// --- Verwaltung Start ---
// --- Verwaltung Ende ---