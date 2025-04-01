let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let allMatches = [];
let serieAMatches = [];
let bundesligaMatches = [];
let premierLeagueMatches = [];
let laLigaMatches = [];
let ligue1Matches = [];
let championsLeagueMatches = [];
let favoriteIconAnimationState = {};

const daysState = {
  "alle-spiele":        { past: 5, future: 15 },
  "serie-a":            { past: 5, future: 15 },
  "la-liga":            { past: 5, future: 15 },
  "premier-league":     { past: 5, future: 15 },
  "bundesliga":         { past: 5, future: 15 },
  "ligue-1":            { past: 5, future: 15 },
  "champions-league":   { past: 5, future: 15 },
};

// Funktion um die Spiele nach Zeitraum zu filtern
function getVisibleMatches(matchesArray, leagueKey) {
  // Bei Favoriten, soll kein Filter angewendet werden
  if (leagueKey === "favoriten") {
    return matchesArray;
  }

  const { past, future } = daysState[leagueKey]; 

  // "Heute" auf 00:00 Uhr setzen
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Minimales Datum: (heute - daysPast)
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - past);

  // Maximales Datum: (heute + daysFuture)
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + future);

  // filtern
  return matchesArray.filter(match => {
    const matchDate = new Date(match.utcDate);
    return matchDate >= minDate && matchDate <= maxDate;
  });
}

// Funktion um zum aktuellen Tag zu scrollen
function scrollToCurrentDay(containerSelector, behavior = "auto") {
  const page = document.querySelector(containerSelector);
  const currentDay = page.querySelector(".tag.current");
  if (currentDay) {
    currentDay.scrollIntoView({ behavior, block: "start" });
  }
}

// Funktion, die die Sichtbarkeit des "show-current-day" Buttons steuert
function updateShowCurrentDayButtonVisibility(container) {
  const currentDay = container.querySelector(".tag.current");
  if (!currentDay) return;
  const button = container.querySelector(".show-current-day");
  if (!button) return;
  const buttonArrow = container.querySelector(".show-current-day i");
  if (!buttonArrow) return;
  
  // Berechne die Positionen mit getBoundingClientRect()
  const containerRect = container.getBoundingClientRect();
  const currentRect = currentDay.getBoundingClientRect();
  const distance = currentRect.top - containerRect.top;
  
  // Pfeil: wenn currentDay oberhalb (distance < 0) → Pfeil nach oben, sonst nach unten
  if (distance < 0) {
    buttonArrow.classList.add("up");
    buttonArrow.classList.remove("down");
  } else {
    buttonArrow.classList.add("down");
    buttonArrow.classList.remove("up");
  }
  
  // Button sichtbar, wenn die absolute Differenz einen Threshold überschreitet
  if (Math.abs(distance) > 500) {
    button.classList.add("visible");
  } else {
    button.classList.remove("visible");
  }
}
// Scroll Event Listener für die Sichtbarkeit des "show-current-day" Buttons
function initShowCurrentDayButtonVisibility(containerSelector, threshold = 500) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.addEventListener("scroll", () => {
    updateShowCurrentDayButtonVisibility(container);
  });
  
  // initialer Aufruf
  updateShowCurrentDayButtonVisibility(container);
}
function initShowCurrentDayButtonVisibilityAll() {
  initShowCurrentDayButtonVisibility(".page.alle-spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.serie-a .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.bundesliga .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.la-liga .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.premier-league .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.ligue-1 .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.liga.champions-league .slide.spiele .spiele-anzeige", 500);
  initShowCurrentDayButtonVisibility(".page.favoriten .spiele-anzeige", 500);
}


////////////////////////////////////////////////////////////////////////////////////////
// Hauptfunktion zum Daten fetchen
//////////////////////////////////////////////////////////////////////////////////////
async function fetchMatches() {
  // Arrays zurücksetzen
  allMatches = [];
  serieAMatches = [];
  bundesligaMatches = [];
  premierLeagueMatches = [];
  laLigaMatches = [];
  ligue1Matches = [];
  championsLeagueMatches = [];
  try {
    const leagues = ["serie-a", "bundesliga", "premier-league", "la-liga", "ligue-1", "champions-league"];
    
    // Für jede Liga die Spiele abrufen
    for (let league of leagues) {
      const response = await fetch(`https://livekick-express-server.onrender.com/${league}/matches`);
      const data = await response.json();
      
      const matches = data.matches ?? []; // Aus data werden die Spiele geholt (oder ein leeres Array)
      allMatches.push(...matches); // Die Spiele in allMatches speichern

      // Je nach Liga die Spiele in die entsprechende Liga-Liste speichern
      if (league === "serie-a") {
        serieAMatches.push(...matches);
      } else if (league === "bundesliga") {
        bundesligaMatches.push(...matches);
      } else if (league === "premier-league") {
        premierLeagueMatches.push(...matches);
      } else if (league === "la-liga") {
        laLigaMatches.push(...matches);
      } else if (league === "ligue-1") {
        ligue1Matches.push(...matches);
      } else if (league === "champions-league") {
        championsLeagueMatches.push(...matches);
      }

      // Favoriten im local Storage aktualisieren, weil Spieldaten geändert wurden
      favorites = favorites.map(oldFav => {
        const updated = allMatches.find(m => m.id === oldFav.id);
        return updated || oldFav;
      });
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Spiele:", error);
  }
}


////////////////////////////////////////////////////////////////////////////////////////
// Funktion zum Erstellen der Spiele
//////////////////////////////////////////////////////////////////////////////////////
function renderMatches(matchesArray, containerSelector, leagueKey) {
  // Nur die "sichtbaren" Spiele aus dem Gesamtarray holen
  let visibleMatches = null;
  visibleMatches = getVisibleMatches(matchesArray, leagueKey);

  // Erstellt ein Objekt, das alle Spiele in Datums-Arrays gruppiert
  const matchesByDate = {};
  visibleMatches.forEach(match => {
    const dateKey = new Date(match.utcDate).toISOString().slice(0, 10); // "2025-02-03"
    // Wenn es noch keine Spiele für dieses Datum gibt, erstelle ein leeres Array
    if (!matchesByDate[dateKey]) {
      matchesByDate[dateKey] = [];
    }
    matchesByDate[dateKey].push(match); // Fügt das Spiel zum Array dieses Datums hinzu
  });

  // Erstellt ein Objekt, das die gruppierten Datums nach Datum sortiert
  const sortedDates = Object.keys(matchesByDate).sort();

  // Bestimme nächstes Datum
  const todayIso = new Date().toISOString().slice(0,10);
  let upcomingDate = sortedDates.find(dateStr => dateStr >= todayIso);
  if (!upcomingDate && sortedDates.length > 0) {
    upcomingDate = sortedDates[sortedDates.length - 1];
  }

  // Auf das Container-Element zugreifen
  const container = document.querySelector(containerSelector);

  // Zustand des Buttons sichern, falls er existiert
  let previousButtonState = null;
  const existingButton = container.querySelector(".show-current-day");
  if (existingButton) {
    previousButtonState = {
      visible: existingButton.classList.contains("visible"),
      arrowUp: existingButton.querySelector("i").classList.contains("up")
    };
  }

  container.innerHTML = ""; // Reset des Inhalts

  // Wenn keine Favoriten hinzugefügt wurden, zeige eine Nachricht an
  if (leagueKey === "favoriten") {
    if (favorites.length === 0) {
      const noFavoritesMessage = document.createElement("p");
      noFavoritesMessage.classList.add("no-favorites-message");
      noFavoritesMessage.textContent = "Noch keine Favoriten hinzugefügt";
      container.appendChild(noFavoritesMessage);
    }
  }

  // Load Past Button erstellen
  const loadPastButton = document.createElement("button");
  loadPastButton.classList.add("load-past");
  loadPastButton.textContent = "Frühere Spiele laden";
  container.appendChild(loadPastButton);
  loadPastButton.addEventListener("click", () => {
    // Scroll-Position merken
    const oldScrollHeight = container.scrollHeight;
    const oldScrollTop = container.scrollTop;

    daysState[leagueKey].past += 10;
    renderMatches(matchesArray, containerSelector, leagueKey);

    // Scroll-Position wiederherstellen
    const newScrollHeight = container.scrollHeight;
    container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
  });

  // Show Current Day Button erstellen
  const showCurrentDayButton = document.createElement("button");
  showCurrentDayButton.classList.add("show-current-day");
  showCurrentDayButton.innerHTML = `<i class="fa-solid fa-chevron-down"></i>Zum aktuellen Tag`;
  // Übernimm den vorherigen Zustand, falls vorhanden
  if (previousButtonState) {
    if (previousButtonState.visible) {
      showCurrentDayButton.classList.add("visible");
    }
    const arrow = showCurrentDayButton.querySelector("i");
    if (previousButtonState.arrowUp) {
      arrow.classList.add("up");
    } else {
      arrow.classList.add("down");
    }
  }
  container.appendChild(showCurrentDayButton);
  showCurrentDayButton.addEventListener("click", () => {
    scrollToCurrentDay(containerSelector, "smooth");
  });

  // Für jedes Datum-Array:
  sortedDates.forEach(date => {
    // Sortiere die Spiele innerhalb dieses Datums-Arrays nach Uhrzeit
    matchesByDate[date].sort((a, b) => {
      return new Date(a.utcDate) - new Date(b.utcDate);
    });

    // Datum formatieren
    function formatCustomDate(utcDate) {
      // Date-Objekt erzeugen
      const dateObj = new Date(utcDate);
    
      let weekday = dateObj.toLocaleDateString("de-DE", { weekday: "short" });
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString("de-DE", { month: "long" });
    
      // Prüfen, ob das Datum heute, gestern oder morgen ist
      const now = new Date(); 
      now.setHours(0, 0, 0, 0);
      dateObj.setHours(0, 0, 0, 0);
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays === 0) {
        // Heute
        weekday = "Heute";
      } else if (diffDays === 1) {
        // Morgen
        weekday = "Morgen";
      } else if (diffDays === -1) {
        // Gestern
        weekday = "Gestern";
      }
    
      // End-String zusammensetzen
      return `${weekday} ${day} ${month}`;
    }    
    const germanDate = formatCustomDate(date);


    // Uhrzeit formatieren
    function formatTime(utcDate) {
      const date = new Date(utcDate);
      return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    // Erstellt ein Div für das Datum
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("tag");

    // Falls das Datum das 'upcomingDate' ist klasse "current" hinzufügen (für show-current Button)
    if (date === upcomingDate) {
      tagDiv.classList.add("current");
    }

    tagDiv.innerHTML = `
      <span class="datum">${germanDate}</span>
      <div class="spiele-liste"></div>
    `;

    // Auf spieleListe eines Tages zugreifen
    const spieleListe = tagDiv.querySelector(".spiele-liste");

    // "previousLeague" merken wir uns pro Datum, damit wir die Liga nur beim ersten Spiel einblenden
    let previousLeague = null;

    // Für jedes Spiel an diesem Datum
    matchesByDate[date].forEach((match) => {
      // Erstellt ein Div für das Spiel
      const spielDiv = document.createElement("div");
      spielDiv.classList.add("spiel");

      // Variablen für das Spiel
      const matchStatus = match.status;
      const isLive = matchStatus === "IN_PLAY" || matchStatus === "PAUSED";
      const liveClass = isLive ? "live" : ""; // Wenn das Spiel läuft, füge die Klasse "live" hinzu (für CSS)
      let matchPlayState = "";
      if (matchStatus === "IN_PLAY") {
        matchPlayState = "Live";
      } else if (matchStatus === "PAUSED") {
        matchPlayState = "Pause"; 
      } else if (matchStatus === "FINISHED") {
        matchPlayState = "Endst.";
      }
      // Eigenes Logo pro Liga
      function getCompetitionLogo(match) {
        if (match.competition.name === "Bundesliga") {
          return "img/Ligen/bundesliga-logo.avif";
        } else if (match.competition.name === "Premier League") {
          return "img/Ligen/premier-league-logo.png";
        } else if (match.competition.name === "Primera Division") {
          return "img/Ligen/la-liga-logo.png";
        } else if (match.competition.name === "Ligue 1") {
          return "img/Ligen/ligue-1-logo.png";
        } else if (match.competition.name === "UEFA Champions League") {
          return "img/Ligen/champions-league-logo.png";
        } else if (match.competition.name === "Serie A") {
          return "img/Ligen/serie-a-logo.png";
        }
      }
      const matchCompetitionlogo = getCompetitionLogo(match);
      // Eigener Name pro Liga
      function getCompetitionName(match) {
        if (match.competition.name === "Bundesliga") {
          return "Bundesliga";
        } else if (match.competition.name === "Premier League") {
          return "Premier League";
        } else if (match.competition.name === "Primera Division") {
          return "La Liga";
        } else if (match.competition.name === "Ligue 1") {
          return "Ligue 1";
        } else if (match.competition.name === "UEFA Champions League") {
          return "Champions League";
        } else if (match.competition.name === "Serie A"){
          return "Serie A";
        }
      }
      const matchCompetitionName = getCompetitionName(match);
      const ligaTarget = matchCompetitionName.toLowerCase().replace(" ", "-"); // data-target Wert im nötigen format speichern (z.B. aus Champions League -> "champions-league")
      // Team-Infos mit Fallback
      let homeTeamName  = match.homeTeam?.shortName || "?"; // Wenn kein Name vorhanden, dann "?" (z.B. bei nicht festgelegten UCL Runden (Knockout Stage))
      let awayTeamName  = match.awayTeam?.shortName || "?"
      // ------- Team Namen fixen -------------
      // Serie A
      if (match.awayTeam.shortName === "Como 1907") {
        awayTeamName = "Como";
      } else if (match.homeTeam.shortName === "Como 1907") {
        homeTeamName = "Como ";
      }
      if (match.awayTeam.shortName === "Venezia FC") {
        awayTeamName = "Venezia";
      } else if (match.homeTeam.shortName === "Venezia FC") {
        homeTeamName = "Venezia";
      }
      // La Liga
      if (match.awayTeam.shortName === "Barça") {
        awayTeamName = "Barcelona";
      } else if (match.homeTeam.shortName === "Barça") {
        homeTeamName = "Barcelona";
      }
      if (match.awayTeam.shortName === "Athletic") {
        awayTeamName = "Athletic Bilbao";
      } else if (match.homeTeam.shortName === "Athletic") {
        homeTeamName = "Athletic Bilbao";
      }
      if (match.awayTeam.shortName === "Atleti") {
        awayTeamName = "Atletico Madrid";
      } else if (match.homeTeam.shortName === "Atleti") {
        homeTeamName = "Atletico Madrid";
      }
      // Ligue 1
      if (match.awayTeam.shortName === "Olympique Lyon") {
        awayTeamName = "Lyon";
      } else if (match.homeTeam.shortName === "Olympique Lyon") {
        homeTeamName = "Lyon";
      }
      if (match.awayTeam.shortName === "Stade de Reims") {
        awayTeamName = "Reims";
      } else if (match.homeTeam.shortName === "Stade de Reims") {
        homeTeamName = "Reims";
      }
      if (match.awayTeam.shortName === "Angers SCO") {
        awayTeamName = "Angers";
      } else if (match.homeTeam.shortName === "Angers SCO") {
        homeTeamName = "Angers";
      }
      let homeTeamCrest = match.homeTeam?.crest || "img/Logos/placeholder.png"; // Wenn kein Logo vorhanden, dann placeholder (z.B. bei nicht festgelegten UCL Runden (Knockout Stage)
      let awayTeamCrest = match.awayTeam?.crest || "img/Logos/placeholder.png";
      // ------- Team Crest fixen -------------
      if (homeTeamName === "Juventus") {
        homeTeamCrest = "img/Logos/juventus.png";
      } else if (awayTeamName === "Juventus") {
        awayTeamCrest = "img/Logos/juventus.png";
      }
      if (homeTeamName === "Nottingham") {
        homeTeamCrest = "img/Logos/nottingham.png";
      } else if (awayTeamName === "Nottingham") {
        awayTeamCrest = "img/Logos/nottingham.png";
      }
      if (homeTeamName === "Venezia") {
        homeTeamCrest = "img/Logos/venezia.png";
      } else if (awayTeamName === "Venezia") {
        awayTeamCrest = "img/Logos/venezia.png";
      }
      const homeGoals     = match.score?.fullTime?.home ?? "";
      const awayGoals     = match.score?.fullTime?.away ?? "";
      // Favoriten-Icon
      const isFavorite = favorites.some(fav => fav.id === match.id); // Prüfen, ob das Spiel in den Favoriten ist
      const starClass = isFavorite ? "active" : ""; // Wenn ja, füge die Klasse "active" hinzu (für CSS)
      const animatedClass = favoriteIconAnimationState[match.id] ? "animated" : ""; // Wenn das Spiel gerade hinzugefügt wurde, füge die Klasse "animated" hinzu (für CSS)

      // HTML-Inhalt für das Spiel
      spielDiv.innerHTML = `
        <div class="liga" onclick="showLigaPage('${ligaTarget}')">
          <img src="${matchCompetitionlogo}" alt="Logo">
          <span>${matchCompetitionName}</span>
        </div>
        <div class="wrapper">
          <div class="zeit">
            <span>${formatTime(match.utcDate)}</span>
            <span class="ticker ${liveClass}">${matchPlayState}</span>
          </div>
          <div class="teams">
            <div class="team">
              <div class="name">
                <img src="${homeTeamCrest}" alt="">
                <span>${homeTeamName}</span>
              </div>
              <span class="tore ${liveClass}">${homeGoals}</span>
            </div>
            <div class="team">
              <div class="name">
                <img src="${awayTeamCrest}" alt="">
                <span>${awayTeamName}</span>
              </div>
              <span class="tore ${liveClass}">${awayGoals}</span>
            </div>
          </div>
          <i class="fa-solid fa-star favoriten-icon ${starClass} ${animatedClass}"></i>
        </div>
      `;

      // Favoriten-Icon Funktionalität 
      const favoritenIcon = spielDiv.querySelector(".favoriten-icon");
      favoritenIcon.addEventListener("click", () => {
        const index = favorites.findIndex(fav => fav.id === match.id); // Index des Spiels in den Favoriten finden
        if (index >= 0) {
          // Index Spiel aus den Favoriten entfernen
          favorites.splice(index, 1);
          localStorage.setItem("favorites", JSON.stringify(favorites));
        } else {
          // Index Spiel zu den Favoriten hinzufügen
          favorites.push(match);
          localStorage.setItem("favorites", JSON.stringify(favorites));
          favoriteIconAnimationState[match.id] = true;
          // Nach 300ms (Dauer der Animation) den Zustand wieder entfernen und neu rendern
          setTimeout(() => {
            delete favoriteIconAnimationState[match.id];
            // Rerendern der relevanten Bereiche, damit das Icon ohne "animated" Klasse erscheint:
            renderFavoriten();
            renderAlleSpiele();
            if (match.competition.name === "Bundesliga") {
              renderBundesliga();
            } else if (match.competition.name === "Premier League") {
              renderPremierLeague();
            } else if (match.competition.name === "Primera Division") {
              renderLaLiga();
            } else if (match.competition.name === "Ligue 1") {
              renderLigue1();
            } else if (match.competition.name === "UEFA Champions League") {
              renderChampionsLeague();
            } else if (match.competition.name === "Serie A") {
              renderSerieA();
            }
          }, 300);
        }
        // Direkt nach dem Klick alle relevanten Bereiche neu rendern,
        // damit der aktive Status (active) korrekt gesetzt wird
        renderFavoriten();
        renderAlleSpiele();
        if (match.competition.name === "Bundesliga") {
          renderBundesliga();
        } else if (match.competition.name === "Premier League") {
          renderPremierLeague();
        } else if (match.competition.name === "Primera Division") {
          renderLaLiga();
        } else if (match.competition.name === "Ligue 1") {
          renderLigue1();
        } else if (match.competition.name === "UEFA Champions League") {
          renderChampionsLeague();
        } else if (match.competition.name === "Serie A") {
          renderSerieA();
        }
      });

      // Liga nur bei erstem Spiel in diesem Datum einblenden
      const currentLeagueName = match.competition?.name || "";
      if (currentLeagueName === previousLeague) {
        spielDiv.querySelector(".liga").style.display = "none";
      } else {
        spielDiv.querySelector(".liga").style.display = "grid";
      }
      previousLeague = currentLeagueName; // Liga Name des aktuellen Spiels wird zu previousLeague für das nächste Spiel

      // Das Spiel zur spieleListe hinzufügen
      spieleListe.appendChild(spielDiv);
    });

    // Das tagDiv zur Seite hinzufügen
    container.appendChild(tagDiv);
  });

  // Load Future Button erstellen (nach den Tagen)
  const loadFutureButton = document.createElement("button");
  loadFutureButton.classList.add("load-future");
  loadFutureButton.textContent = "Spätere Spiele laden";
  container.appendChild(loadFutureButton);
  loadFutureButton.addEventListener("click", () => {
    daysState[leagueKey].future += 10;
    renderMatches(matchesArray, containerSelector, leagueKey);
  });

  // load Past/Future Buttons ausblenden wenn keine Spiele mehr vorhanden sind
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Zählt alle verfügbaren Matches in der Vergangenheit und Zukunft
  const availablePast = matchesArray.filter(match => new Date(match.utcDate) < now);
  const availableFuture = matchesArray.filter(match => new Date(match.utcDate) > now);
  // Zählt, wie viele der sichtbaren Matches in der Vergangenheit bzw. Zukunft liegen
  const visiblePast = visibleMatches.filter(match => new Date(match.utcDate) < now);
  const visibleFuture = visibleMatches.filter(match => new Date(match.utcDate) > now);
  if (visiblePast.length >= availablePast.length) {
    loadPastButton.style.display = "none";
  } else {
    loadPastButton.style.display = "block";
  }
  if (visibleFuture.length >= availableFuture.length) {
    loadFutureButton.style.display = "none";
  } else {
    loadFutureButton.style.display = "block";
  }

  // Sichtbarkeit des show-current-day Button aktualisieren
  requestAnimationFrame(() => {
    const container = document.querySelector(containerSelector);
    if (container) {
      updateShowCurrentDayButtonVisibility(container);
    }
  });
}

////////////////////////////////////////////////////////////////////////////////////////
// Render Aufrufe für alle Ansichten
//////////////////////////////////////////////////////////////////////////////////////
function renderAlleSpiele() {
  renderMatches(allMatches, ".page.alle-spiele .spiele-anzeige", "alle-spiele");
}
function renderSerieA() {
  renderMatches(serieAMatches, ".page.liga.serie-a .slide.spiele .spiele-anzeige", "serie-a");
}
function renderLaLiga() {
  renderMatches(laLigaMatches, ".page.liga.la-liga .slide.spiele .spiele-anzeige", "la-liga");
}
function renderPremierLeague() {
  renderMatches(premierLeagueMatches, ".page.liga.premier-league .slide.spiele .spiele-anzeige", "premier-league");
}
function renderBundesliga() {
  renderMatches(bundesligaMatches, ".page.liga.bundesliga .slide.spiele .spiele-anzeige", "bundesliga");
}
function renderLigue1() {
  renderMatches(ligue1Matches, ".page.liga.ligue-1 .slide.spiele .spiele-anzeige", "ligue-1");
}
function renderChampionsLeague() {
  renderMatches(championsLeagueMatches, ".page.liga.champions-league .slide.spiele .spiele-anzeige", "champions-league");
}
function renderFavoriten() {
  renderMatches(favorites, ".page.favoriten .spiele-anzeige", "favoriten");
}


////////////////////////////////////////////////////////////////////////////////////////
let firstLoop = true;

async function init() {
  await fetchMatches();
  renderAlleSpiele();
  renderSerieA();
  renderBundesliga();
  renderPremierLeague();
  renderLaLiga();
  renderLigue1();
  renderChampionsLeague();
  renderFavoriten();
  initShowCurrentDayButtonVisibilityAll();
  if (firstLoop) {
    firstLoop = false;
    scrollToCurrentDay(".page.alle-spiele .spiele-anzeige", "auto");
  }
  const preloader = document.querySelector("#preloader");
  preloader.style.display = "none";
}
init();

setInterval(init, 60000);