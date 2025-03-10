// Zwischen den Seiten wechseln
const navbarLinks = document.querySelectorAll('.navbar span');
const pages = document.querySelectorAll('.page');
const navbarHighlight = document.querySelector('.navbar .highlight');

let initialClickStates = {
  // alle-spiele scrollToCurrentDay wird beim laden der Seite aufgerufen (api.js)
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

  ligaSlideButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      ligaSlider.style.transform = `translateX(-${index * 100}%)`;

      ligaSlideButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
});


// Bei klick auf den Liga Header eines Spiels wird die Liga Seite angezeigt (in api.js bei render angewandt)
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