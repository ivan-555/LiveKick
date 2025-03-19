let serieATable = [];
let bundesligaTable = [];
let premierLeagueTable = [];
let laligaTable = [];
let ligue1Table = [];
let championsLeagueTable = [];

async function fetchTable() {
    try {
        const leagues = ["serie-a", "bundesliga", "premier-league", "la-liga", "ligue-1", "champions-league"];
        serieATable = [];
        bundesligaTable = [];
        premierLeagueTable = [];
        laligaTable = [];
        ligue1Table = [];
        championsLeagueTable = [];

        for (let league of leagues) {
          const response = await fetch(`https://livekick-express-server.onrender.com/${league}/table`);
          const data = await response.json();
          const table = data.table;
          
          if (league === "serie-a") {
            serieATable.push(table);
          } else if (league === "bundesliga") {
            bundesligaTable.push(table);	
          } else if (league === "premier-league") {
            premierLeagueTable.push(table);
          } else if (league === "la-liga") {
            laligaTable.push(table);
          } else if (league === "ligue-1") {
            ligue1Table.push(table);
          } else if (league === "champions-league") {
            championsLeagueTable.push(table);
          }
        }
    } catch (error) {
        console.error(error);
    }
}

function showDetails(event) {
    // Das geklickte main-Element
    const main = event.currentTarget;

    // Das nächste Geschwisterelement (.details)
    const details = main.nextElementSibling;
    const arrow = main.querySelector("i.fa-chevron-down");

    details.classList.toggle('open');
    arrow.classList.toggle('open');
}

async function renderTable(array, containerSelektor) {  
    const container = document.querySelector(containerSelektor);
    container.innerHTML = "";

    // Wenn keine Tabelle von der API geliefert wird, wird die Tabelle ausgeblendet
    if (!array[0] || array[0].length === 0) {
        if (array === serieATable) {
            document.querySelector(".page.liga.serie-a .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.serie-a .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        } else if (array === bundesligaTable) {
            document.querySelector(".page.liga.bundesliga .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.bundesliga .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        } else if (array === premierLeagueTable) {
            document.querySelector(".page.liga.premier-league .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.premier-league .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        } else if (array === laligaTable) {
            document.querySelector(".page.liga.la-liga .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.la-liga .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        } else if (array === ligue1Table) {
            document.querySelector(".page.liga.ligue-1 .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.ligue-1 .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        } else if (array === championsLeagueTable) {
            document.querySelector(".page.liga.champions-league .window .slide.tabelle").style.display = "none";
            document.querySelector(".page.liga.champions-league .heading nav .slide-button[data-target=tabelle]").style.display = "none";
        }
        return;
    }

    function getColor(char) {
        if (char === "W") {
            return "grün";
        } else if (char === "D") {
            return "grau";
        } else if (char === "L") {
            return "rot";
        }
    }    

    array[0].forEach(rank => {
        let teamName = rank.strTeam;
        // ------- Team Namen fixen -------------
        //Serie A
        if (rank.strTeam === "Inter Milan") {
            teamName = "Inter";
        } else if (rank.strTeam === "AC Milan") {
            teamName = "Milan";
        } else if (rank.strTeam === "Parma Calcio 1913") {
            teamName = "Parma";
        }
        // Premier League
        if (rank.strTeam === "Manchester United") {
          teamName = "Man United";
        } else if (rank.strTeam === "Nottingham Forest") {
            teamName = "Nottingham";
        } else if (rank.strTeam === "Manchester City") {
            teamName= "Man City";
        }
        // Bundesliga
        if (rank.strTeam === "Bayern Munich") {
            teamName = "Bayern";
        } else if (rank.strTeam === "Eintracht Frankfurt") {
            teamName = "Frankfurt";
        } else if (rank.strTeam === "Bayer Leverkusen") {
            teamName = "Leverkusen";
        } else if (rank.strTeam === "Borussia Mönchengladbach") {
            teamName = "M'Gladbach";
        } else if (rank.strTeam === "Borussia Dortmund") {
            teamName = "Dortmund";
        } 
        // Ligue 1
        if (rank.strTeam === "Paris SG") {
            teamName = "PSG";
        } else if (rank.strTeam === "St Etienne") {
            teamName = "Saint-Etienne";
        } else if (rank.strTeam === "Stade de Reims") {
            teamName = "Reims";
        }

        let teamBadge = rank.strBadge;
        // ------- Team Badges fixen -------------
        if (teamName === "Napoli") {
            teamBadge = "img/Logos/napoli.png";
        } else if (teamName === "Juventus") {
            teamBadge = "img/Logos/juventus.png";
        }

        const form = [rank.strForm.charAt(0), rank.strForm.charAt(1), rank.strForm.charAt(2), rank.strForm.charAt(3), rank.strForm.charAt(4)];

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="main" onclick="showDetails(event)">
                <span class="rang">${rank.intRank}</span>
                <span class="team">
                    <img src="${teamBadge}">
                    ${teamName}
                </span>
                <span class="punkte">${rank.intPoints}</span>
                <span class="siege">${rank.intWin}</span>
                <span class="niederlagen">${rank.intLoss}</span>
                <span class="unentschieden">${rank.intDraw}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="details">
                <div class="gespielt">
                    <span>Gespielt:</span>
                    <span>${rank.intPlayed}</span>
                </div>
                <div class="form">
                    <span class="${getColor(form[4])}">${form[4]}</span>
                    <span class="${getColor(form[3])}">${form[3]}</span>
                    <span class="${getColor(form[2])}">${form[2]}</span>
                    <span class="${getColor(form[1])}">${form[1]}</span>
                    <span class="${getColor(form[0])}">${form[0]}</span>
                </div>
            </div>
        `;
        container.appendChild(li);      
    });
    
    if (array === championsLeagueTable) {
        const legende = document.createElement("div");
        legende.className = "legende";
        legende.innerHTML = `
            <b>Legende</b>
            <div>
                <span class="farbe grün"></span>
                <span class="bedeutung">Playoffs</span>
            </div>
            <div>
                <span class="farbe blau"></span>
                <span class="bedeutung">Qualifikationsspiele</span>
            </div>
            <div>
                <span class="farbe rot"></span>
                <span class="bedeutung">Ausschied</span>
            </div>
        `;
        container.appendChild(legende);
    } else {
        const legende = document.createElement("div");
        legende.className = "legende";
        legende.innerHTML = `
            <b>Legende</b>
            <div>
                <span class="farbe grün"></span>
                <span class="bedeutung">Champions League</span>
            </div>
            <div>
                <span class="farbe blau"></span>
                <span class="bedeutung">Europa League</span>
            </div>
            <div>
                <span class="farbe rot"></span>
                <span class="bedeutung">Abstieg</span>
            </div>
        `;
        container.appendChild(legende);
    }
}

async function init() {
    await fetchTable()
    renderTable(serieATable, ".page.liga.serie-a .window .slide.tabelle .liste");
    renderTable(bundesligaTable, ".page.liga.bundesliga .window .slide.tabelle .liste");
    renderTable(premierLeagueTable, ".page.liga.premier-league .window .slide.tabelle .liste");
    renderTable(laligaTable, ".page.liga.la-liga .window .slide.tabelle .liste");
    renderTable(ligue1Table, ".page.liga.ligue-1 .window .slide.tabelle .liste");
    renderTable(championsLeagueTable, ".page.liga.champions-league .window .slide.tabelle .liste");
}

init();

setInterval(init, 60000);
