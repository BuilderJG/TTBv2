// Setup Start
page(document.getElementsByClassName("page")[0])
// Setup Ende

// Zeigt bzw. versteckt die Navigationsleiste
function toggleNav() {
    console.log("toggle nav");
    let nav = document.getElementsByTagName("nav")[0];
    let content = document.getElementsByTagName("main")[0];
    let header = document.getElementsByTagName("header")[0];
    console.log(nav.st)
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