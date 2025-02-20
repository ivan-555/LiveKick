let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let allMatches = [];
let serieAMatches = [];
let bundesligaMatches = [];
let premierLeagueMatches = [];
let laLigaMatches = [];
let ligue1Matches = [];
let championsLeagueMatches = [];

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
function renderMatches(matchesArray, containerSelector) {
  // Erstelle ein Objekt, das alle Spiele in Datums-Arrays gruppiert
  const matchesByDate = {};
  matchesArray.forEach(match => {
    const dateKey = new Date(match.utcDate).toISOString().slice(0, 10); // "2025-02-03"
    
    // Wenn es noch keine Spiele für dieses Datum gibt, erstelle ein leeres Array
    if (!matchesByDate[dateKey]) {
      matchesByDate[dateKey] = [];
    }
    matchesByDate[dateKey].push(match); // Füge das Spiel zum Array dieses Datums hinzu
  });

  // Erstellt ein Objekt, das die gruppierten Datums nach Datum sortiert
  const sortedDates = Object.keys(matchesByDate).sort();

  // Auf das Container-Element zugreifen (z.B. ".alle-spiele" oder ".liga.serie-a")
  const container = document.querySelector(containerSelector);
  container.innerHTML = ""; // Lösche den Inhalt des Containers

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

    // Erstelle ein Div für das Datum
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("tag");
    tagDiv.innerHTML = `
      <span class="datum">${germanDate}</span>
      <div class="spiele-liste"></div>  <!-- Hier werden die Spiele hinzugefügt -->
    `;

    // Auf spieleListe zugreifen
    const spieleListe = tagDiv.querySelector(".spiele-liste");

    // "previousLeague" merken wir uns pro Datum, damit wir die Liga nur beim ersten Spiel einblenden
    let previousLeague = null;

    // Für jedes Spiel an diesem Datum
    matchesByDate[date].forEach((match) => {
      // Erstellt ein Div für das Spiel
      const spielDiv = document.createElement("div");
      spielDiv.classList.add("spiel");

      // Variablen für das Spiel
      const liveClass = match.status === "IN_PLAY" ? "live" : ""; // Wenn das Spiel läuft, füge die Klasse "live" hinzu (für CSS)
      const matchPlayState = match.status === "IN_PLAY" ? "Live" : match.status === "FINISHED" ? "Endst." : ""; // Text für den Spielstatus (Live, Endstand oder leer falls noch nicht stattgefunden)
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
        } else {
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
        } else {
          return "Serie A";
        }
      }
      const matchCompetitionName = getCompetitionName(match);
      const ligaTarget = matchCompetitionName.toLowerCase().replace(" ", "-"); // data-target Wert im nötigen format speichern (z.B. aus Champions League -> "champions-league")
      // Team-Infos mit Fallback
      const homeTeamCrest = match.homeTeam?.crest || "img/placeholder.png";
      const homeTeamName  = match.homeTeam?.shortName || "?"; // Wenn kein Name vorhanden, dann "?" (z.B. bei nicht festgelegten UCL Runden (Knockout Stage))
      const awayTeamCrest = match.awayTeam?.crest || "img/placeholder.png";
      const awayTeamName  = match.awayTeam?.shortName || "?";
      const homeGoals     = match.score?.fullTime?.home ?? "";
      const awayGoals     = match.score?.fullTime?.away ?? "";
      // Favoriten-Icon
      const isFavorite = favorites.some(fav => fav.id === match.id); // Prüfen, ob das Spiel in den Favoriten ist
      const starClass = isFavorite ? "active" : ""; // Wenn ja, füge die Klasse "active" hinzu (für CSS)

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
          <i class="fa-solid fa-star favoriten-icon ${starClass}"></i>
        </div>
      `;

      // Favoriten-Icon Funktionalität 
      const favoritenIcon = spielDiv.querySelector(".favoriten-icon");
      favoritenIcon.addEventListener("click", () => {
        const index = favorites.findIndex(fav => fav.id === match.id); // Index des Spiels in den Favoriten finden
        if (index >= 0) {
          favorites.splice(index, 1); // Index Spiel aus den Favoriten entfernen
          localStorage.setItem("favorites", JSON.stringify(favorites));
          favoritenIcon.classList.remove("active");
        } else {
          favorites.push(match);
          localStorage.setItem("favorites", JSON.stringify(favorites));
          favoritenIcon.classList.add("active");
        }
        renderAllViews();
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
}

////////////////////////////////////////////////////////////////////////////////////////
// Render Aufrufe für alle Ansichten
//////////////////////////////////////////////////////////////////////////////////////
function renderAllViews() {
  renderMatches(allMatches, ".page.alle-spiele");
  renderMatches(serieAMatches, ".page.liga.serie-a .window .slide.spiele");
  renderMatches(bundesligaMatches, ".page.liga.bundesliga .window .slide.spiele");
  renderMatches(premierLeagueMatches, ".page.liga.premier-league .window .slide.spiele");
  renderMatches(laLigaMatches, ".page.liga.la-liga .window .slide.spiele");
  renderMatches(ligue1Matches, ".page.liga.ligue-1 .window .slide.spiele");
  renderMatches(championsLeagueMatches, ".page.liga.champions-league .window .slide.spiele");
  renderMatches(favorites, ".page.favoriten");
}

async function init() {
  await fetchMatches();
  renderAllViews();
  console.log("Spiele geladen");
}
init();

setInterval(init, 60000);