// Zwischen den Seiten wechseln
const navbarLinks = document.querySelectorAll('.navbar span');
const pages = document.querySelectorAll('.page');
const navbarHighlight = document.querySelector('.navbar .highlight');

let initialClickStates = {
  // alle-spiele scrollToCurrentDay wird beim laden der Seite aufgerufen (matches.js)
  "favoriten": true,
  "serie-a": true,
  "premier-league": true,
  "la-liga": true,
  "bundesliga": true,
  "ligue-1": true,
  "champions-league": true,
};

navbarLinks.forEach((link, index) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute('data-target');
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.classList.contains(target)) {
        page.classList.add('active');
      }
    });

    if (target === "favoriten" && initialClickStates["favoriten"]) {
      initialClickStates["favoriten"] = false;
      scrollToCurrentDay(".page.favoriten", "auto");
    }

    navbarLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});


// Zwischen den Ligen wählen
const ligaSelektors = document.querySelectorAll('.liga-selektor');

ligaSelektors.forEach(selector => {
  selector.addEventListener("click", () => {
    const target = selector.getAttribute('data-target');
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.classList.contains(target)) {
        page.classList.add('active');
      }
    });

    if (target === "serie-a" && initialClickStates["serie-a"]) {
      initialClickStates["serie-a"] = false;
      scrollToCurrentDay(".page.serie-a", "auto");
    }
    if (target === "premier-league" && initialClickStates["premier-league"]) {
      initialClickStates["premier-league"] = false;
      scrollToCurrentDay(".page.premier-league", "auto");
    }
    if (target === "la-liga" && initialClickStates["la-liga"]) {
      initialClickStates["la-liga"] = false;
      scrollToCurrentDay(".page.la-liga", "auto");
    }
    if (target === "bundesliga" && initialClickStates["bundesliga"]) {
      initialClickStates["bundesliga"] = false;
      scrollToCurrentDay(".page.bundesliga", "auto");
    }
    if (target === "ligue-1" && initialClickStates["ligue-1"]) {
      initialClickStates["ligue-1"] = false;
      scrollToCurrentDay(".page.ligue-1", "auto");
    }
    if (target === "champions-league" && initialClickStates["champions-league"]) {
      initialClickStates["champions-league"] = false;
      scrollToCurrentDay(".page.champions-league", "auto");
    }
  });
});


// In der Liga zwischen den Slides wechseln
const ligaPages = document.querySelectorAll('.page.liga');

ligaPages.forEach((ligaPage) => {
  const ligaSlider = ligaPage.querySelector('.slider');
  const ligaSlideButtons = ligaPage.querySelectorAll('.slide-button');

  let currentIndex = 0;

  // Buttons Steuerung
  ligaSlideButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      currentIndex = index;
      ligaSlider.style.transform = `translateX(-${index * 100}%)`; // -0%, -100%
      ligaSlideButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Touch-Swipe Funktionalität
  let startX = 0;

  ligaSlider.addEventListener('touchstart', (e) => {
    // Erste Fingerposition merken
    startX = e.touches[0].clientX;
  });

  ligaSlider.addEventListener('touchend', (e) => {
    // Letzte Fingerposition
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;  // Positive Werte = Swipe nach rechts, negative = Swipe nach links

    // Schwellenwert für das Auslösen des Swipes
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        if (currentIndex < ligaSlideButtons.length - 1) {
          currentIndex++;
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
        }
      }

      // Slider verschieben
      ligaSlider.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Active‐State für Buttons aktualisieren
      ligaSlideButtons.forEach(btn => btn.classList.remove('active'));
      ligaSlideButtons[currentIndex].classList.add('active');
    }
  });
});



// Bei klick auf den Liga Header eines Spiels wird die Liga Seite angezeigt (in matches.js bei renderMatches angewandt)
function showLigaPage (target) {
  pages.forEach(page => {
    page.classList.remove('active');
    if (page.classList.contains(target)) {
      page.classList.add('active');
    }
  });
  navbarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === "ligen") {
      link.classList.add('active');
    }
  });
  if (target === "serie-a" && initialClickStates["serie-a"]) {
    initialClickStates["serie-a"] = false;
    scrollToCurrentDay(".page.serie-a", "auto");
  }
  if (target === "premier-league" && initialClickStates["premier-league"]) {
    initialClickStates["premier-league"] = false;
    scrollToCurrentDay(".page.premier-league", "auto");
  }
  if (target === "la-liga" && initialClickStates["la-liga"]) {
    initialClickStates["la-liga"] = false;
    scrollToCurrentDay(".page.la-liga", "auto");
  }
  if (target === "bundesliga" && initialClickStates["bundesliga"]) {
    initialClickStates["bundesliga"] = false;
    scrollToCurrentDay(".page.bundesliga", "auto");
  }
  if (target === "ligue-1" && initialClickStates["ligue-1"]) {
    initialClickStates["ligue-1"] = false;
    scrollToCurrentDay(".page.ligue-1", "auto");
  }
  if (target === "champions-league" && initialClickStates["champions-league"]) {
    initialClickStates["champions-league"] = false;
    scrollToCurrentDay(".page.champions-league", "auto");
  }
};


// Aktuelle Season in der Liga Seite anzeigen
async function renderCurrentSeason (league) {
  const season = await getCurrentSeason(league);
  const seasonElement = document.querySelector(`.page.liga.${league} .heading .beschreibung .saison`);
  seasonElement.textContent = season;
};

async function getCurrentSeason (league) {
  const response = await fetch(`https://livekick-express-server.onrender.com/${league}/season`);
  const data = await response.json(); // 2024-2025
  let formattedData;
  const [year1, year2] = data.split("-");
  const shortYear1 = year1.slice(-2);
  const shortYear2 = year2.slice(-2);
  formattedData = `${shortYear1}/${shortYear2}`; // 24/25
  return formattedData;
}

function renderAllSeasons () {
  renderCurrentSeason("serie-a");
  renderCurrentSeason("premier-league");
  renderCurrentSeason("la-liga");
  renderCurrentSeason("bundesliga");
  renderCurrentSeason("ligue-1");
  renderCurrentSeason("champions-league");
}

renderAllSeasons();

setInterval(renderAllSeasons, 60000);