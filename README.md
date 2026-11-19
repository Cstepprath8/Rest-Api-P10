<h1 align="center">Crypto Price API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/versie-v0.4.0-blue" alt="versie v0.4.0">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white" alt="Jest">
  <img src="https://img.shields.io/badge/methode-TDD-8A2BE2" alt="testdriven development">
  <img src="https://img.shields.io/badge/data-CoinGecko-8DC63F" alt="data van CoinGecko">
</p>

<p align="center">
  <a href="#overzicht">Overzicht</a> |
  <a href="#snel-starten">Snel starten</a> |
  <a href="#testpagina">Testpagina</a> |
  <a href="#api-referentie">API</a> |
  <a href="#testen">Testen</a> |
  <a href="#projectstructuur">Structuur</a> |
  <a href="#releases">Releases</a>
</p>

---

## Overzicht

Een kleine REST API die actuele cryptocurrency-prijzen levert en waarmee je een eigen watchlist met favoriete coins bijhoudt. De prijsdata komt live van de publieke [CoinGecko API](https://www.coingecko.com/en/api). Het project is gebouwd met Node.js en Express volgens testdriven development (TDD) en bevat een ingebouwde testpagina in de browser.

### Functionaliteit

- Lijst van de populairste coins met symbool, naam, prijs (USD) en 24-uurs verandering
- Actuele prijs van één specifieke coin op basis van het symbool
- Watchlist met favoriete coins: toevoegen, bekijken, notitie aanpassen en verwijderen
- Duidelijke foutmeldingen met passende HTTP-statuscodes
- Testpagina waar je alle endpoints uitprobeert, kant-en-klare curl- en PowerShell-commando’s kopieert en alle tests kunt uitvoeren
- Automatisch testrapport met datum en tijd bij elke git commit

### Technologie

| Onderdeel | Keuze |
|---|---|
| Runtime | Node.js 18 of nieuwer |
| Framework | Express 5 |
| Tests | Jest en Supertest |
| Git-hooks | Husky |
| Externe data | CoinGecko API (zonder API-key) |
| Frontend (testpagina) | Eén HTML-bestand met vanilla JavaScript, zonder build-stap |

## Snel starten

Vereisten: [Node.js](https://nodejs.org) 18 of nieuwer (de ingebouwde `fetch` wordt gebruikt) en Git.

```bash
git clone <URL-VAN-DEZE-REPOSITORY>
cd <MAPNAAM>
npm install
npm start
```

De API draait nu op `http://localhost:3000`. Er is geen configuratie of API-key nodig.

Controleer of alles werkt:

```bash
npm test
```

## Testpagina

Open `http://localhost:3000` in je browser. De pagina wordt door de API zelf getoond en biedt:

- **Uitproberen:** vul de velden in, klik op *Uitproberen* en zie direct de statuscode, een tabel en het JSON-antwoord.
- **Kopieerbare commando’s:** onder elk endpoint staat het bijbehorende commando voor curl (macOS, Linux, Git Bash) of PowerShell (Windows). De commando’s passen zich aan op wat je invult.
- **Tests uitvoeren:** onderaan staat een knop die alle tests van het project draait en per test laat zien of hij geslaagd is.
- **Uitleg:** per endpoint een korte omschrijving en onderaan een overzicht van alle statuscodes.

Handige volgorde om de watchlist te proberen: `POST`, `GET /watchlist`, `PUT`, `DELETE`.

## API-referentie

Alle responses zijn JSON. Verzoeken met een body moeten de header `Content-Type: application/json` meesturen.

| Methode | Endpoint | Omschrijving | Succes |
|---|---|---|---|
| GET | `/crypto` | Lijst van populaire coins (top 10 op marktkapitalisatie) | 200 |
| GET | `/crypto/{symbol}` | Prijs van één coin | 200 |
| GET | `/watchlist` | Bekijk de watchlist | 200 |
| POST | `/crypto` | Voeg een coin toe aan de watchlist | 201 |
| PUT | `/crypto/{symbol}` | Pas de notitie van een watchlist-coin aan | 200 |
| DELETE | `/crypto/{symbol}` | Verwijder een coin uit de watchlist | 204 |
| POST | `/tests/run` | Voer alle tests uit en geef het resultaat terug (niet beschikbaar in productie) | 200 |

### Request- en responsevoorbeelden

**GET /crypto** — `price` is in US-dollars, `change` is de procentuele verandering over de afgelopen 24 uur.

```json
[
  { "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 },
  { "symbol": "ETH", "name": "Ethereum", "price": 1800, "change": -1.2 }
]
```

**GET /crypto/{symbol}** — het symbool is niet hoofdlettergevoelig (`btc` en `BTC` werken beide).

```json
{ "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 }
```

**POST /crypto** — `symbol` is verplicht, `note` is optioneel. De coin moet bij CoinGecko bekend zijn.

```json
// Request body
{ "symbol": "btc", "note": "lang vasthouden" }

// Response (201)
{ "symbol": "BTC", "note": "lang vasthouden" }
```

**GET /watchlist**

```json
[
  { "symbol": "BTC", "note": "lang vasthouden" }
]
```

**PUT /crypto/{symbol}** — `note` is verplicht en moet een tekst zijn. De coin moet in de watchlist staan.

```json
// Request body
{ "note": "verkopen boven 70000" }

// Response (200)
{ "symbol": "BTC", "note": "verkopen boven 70000" }
```

**DELETE /crypto/{symbol}** — geeft `204 No Content` zonder body.

**POST /tests/run** — draait de volledige testsuite en geeft een samenvatting terug.

```json
{
  "date": "2026-11-19T13:32:05.000Z",
  "passed": 28,
  "failed": 0,
  "total": 28,
  "durationMs": 971,
  "tests": [
    { "suite": "crypto.test.js", "name": "GET /crypto returns a list of coins", "status": "passed" }
  ]
}
```

### Voorbeeldverzoeken

Start de server met `npm start` en open een tweede terminal.

**macOS, Linux en Git Bash** (curl):

```bash
curl http://localhost:3000/crypto
curl http://localhost:3000/crypto/btc
curl -X POST http://localhost:3000/crypto -H "Content-Type: application/json" -d '{"symbol":"btc","note":"lang vasthouden"}'
curl http://localhost:3000/watchlist
curl -X PUT http://localhost:3000/crypto/btc -H "Content-Type: application/json" -d '{"note":"verkopen boven 70000"}'
curl -X DELETE http://localhost:3000/crypto/btc -i
```

**Windows PowerShell** (`Invoke-RestMethod`):

```powershell
Invoke-RestMethod http://localhost:3000/crypto | ConvertTo-Json
Invoke-RestMethod http://localhost:3000/crypto/btc | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/crypto -ContentType "application/json" -Body '{"symbol":"btc","note":"lang vasthouden"}'
Invoke-RestMethod http://localhost:3000/watchlist | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri http://localhost:3000/crypto/btc -ContentType "application/json" -Body '{"note":"verkopen boven 70000"}'
Invoke-RestMethod -Method Delete -Uri http://localhost:3000/crypto/btc
```

> In Windows PowerShell is `curl` een alias voor `Invoke-WebRequest`, waardoor de curl-opties (`-X`, `-H`, `-d`) niet werken. Gebruik daarom `Invoke-RestMethod`, `curl.exe` (voor verzoeken zonder JSON-body) of [Postman](https://www.postman.com): kies de methode, vul de URL in en plak bij **Body > raw > JSON** de JSON uit de voorbeelden.

### Foutafhandeling

Fouten hebben altijd dezelfde vorm: `{ "error": "omschrijving" }`.

| Code | Betekenis | Voorbeeld |
|---|---|---|
| 400 | Ongeldige invoer | `POST /crypto` zonder `symbol`, of `PUT` zonder `note` |
| 403 | Niet toegestaan | `POST /tests/run` terwijl de server in productie draait |
| 404 | Niet gevonden | Coin onbekend bij CoinGecko, of niet aanwezig in de watchlist |
| 409 | Conflict | Coin staat al in de watchlist |
| 500 | Interne fout | De testrun kon niet worden uitgevoerd |
| 502 | Externe bron niet beschikbaar | CoinGecko geeft een fout of een rate limit |

## Testen

### Aanpak

Het project is ontwikkeld volgens testdriven development: eerst een falende test (rood), daarna de minimale code om de test te laten slagen (groen). Elke stap is als aparte commit terug te zien in de git-geschiedenis.

De tests mocken de CoinGecko-client en het netwerk, zodat ze snel en betrouwbaar zijn en geen internetverbinding of rate limit nodig hebben.

```bash
npm test
```

### Overzicht van de tests

| Bestand | Wat wordt getest | Tests |
|---|---|---|
| `tests/crypto.test.js` | `GET /crypto`, `GET /crypto/{symbol}` en de 502-foutafhandeling | 5 |
| `tests/watchlist.test.js` | `POST`, `GET /watchlist`, `PUT` en `DELETE`, inclusief 400-, 404- en 409-gevallen | 10 |
| `tests/coingecko.test.js` | De CoinGecko-client: omzetting van velden, foutafhandeling en opzoeken op symbool | 4 |
| `tests/ui.test.js` | Het serveren van de testpagina | 1 |
| `tests/testrunner.test.js` | Samenvatting, Markdown-rapport en bestandsnaam met datum van de testrunner | 5 |
| `tests/runner-api.test.js` | `POST /tests/run`: resultaat, interne fout en blokkade in productie | 3 |
| | **Totaal** | **28** |

### Tests uitvoeren via de testpagina

Open `http://localhost:3000` en klik onderaan op **Tests uitvoeren**. De server draait dan de volledige testsuite in een apart proces en toont het aantal geslaagde en gefaalde tests, met de uitkomst per test. Meerdere gelijktijdige verzoeken delen dezelfde testrun.

Deze functie is bedoeld voor lokaal gebruik en is uitgeschakeld (`403`) wanneer de omgevingsvariabele `NODE_ENV` op `production` staat.

### Automatische testrapporten bij elke commit

Bij elke `git commit` voert een [Husky](https://typicode.github.io/husky/)-hook (`.husky/pre-commit`) alle tests uit en maakt een leesbaar rapport met datum en tijd in de map [`reports/commits/`](reports/commits/). Het rapport wordt automatisch aan dezelfde commit toegevoegd en staat dus na een `git push` direct op GitHub.

```
reports/commits/test-report-2026-11-19_14-32-05.md
```

Elk rapport bevat de datum en tijd, de branch, het totaalresultaat en een tabel met alle tests en hun status.

- **De hook blokkeert een commit nooit.** Bij TDD is een commit met een falende test (de rode stap) normaal. Het rapport legt zo vast dat de test op dat moment faalde, en het volgende rapport laat zien dat hij slaagt.
- **De hook staat na `npm install` aan.** Het `prepare`-script in `package.json` activeert Husky automatisch.

### Testrapporten per release

Bij elke release hoort daarnaast een testrapport in de map [`reports/`](reports/), gemaakt met:

```bash
npx jest --json --outputFile=reports/test-report-vX.Y.Z.json
```

### Aantekening over de ontwikkelvolgorde

De CoinGecko-client (`src/coingecko.js`) is in v0.1.0 geschreven vóór de bijbehorende tests. Die tests zijn in v0.3.1 aangevuld, samen met tests voor de 502-foutafhandeling. Vanaf v0.2.0 (watchlist), voor de testpagina in v0.3.0 en voor de testrunner in v0.4.0 is test-first gewerkt.

## Projectstructuur

```
.
├── .husky/
│   └── pre-commit          # Voert tests uit en maakt een rapport per commit
├── scripts/
│   └── test-report.js      # Schrijft het rapport naar reports/commits/
├── src/
│   ├── app.js              # Express-routes en middleware
│   ├── coingecko.js        # Client voor de CoinGecko API
│   ├── watchlist.js        # Watchlist in het geheugen
│   ├── testrunner.js       # Voert Jest uit en maakt samenvatting en rapport
│   └── server.js           # Startpunt van de server
├── public/
│   └── index.html          # Testpagina met uitleg en kopieerbare commando’s
├── tests/
│   ├── crypto.test.js
│   ├── watchlist.test.js
│   ├── coingecko.test.js
│   ├── ui.test.js
│   ├── testrunner.test.js
│   └── runner-api.test.js
├── reports/
│   ├── commits/            # Automatisch rapport per commit, met datum en tijd
│   └── test-report-v*.json # Testrapport per release
├── package.json
└── README.md
```

De opbouw is bewust klein en gelaagd: `app.js` bevat alleen routes en validatie, `coingecko.js` regelt de communicatie met de externe API, `watchlist.js` beheert de opgeslagen coins en `testrunner.js` draait de tests. Daardoor is elke laag los te testen.

## Releases

| Versie | Inhoud | Tests | Testrapport |
|---|---|---|---|
| v0.1.0 | `GET /crypto`, `GET /crypto/{symbol}` | 3 | [test-report-v0.1.0.json](reports/test-report-v0.1.0.json) |
| v0.2.0 | Watchlist: `POST`, `GET /watchlist`, `PUT`, `DELETE` | 13 | [test-report-v0.2.0.json](reports/test-report-v0.2.0.json) |
| v0.3.0 | Testpagina in de browser (`GET /`) | 14 | [test-report-v0.3.0.json](reports/test-report-v0.3.0.json) |
| v0.3.1 | Tests voor de CoinGecko-client en de 502-foutafhandeling, overzichtelijkere testpagina | 20 | [test-report-v0.3.1.json](reports/test-report-v0.3.1.json) |
| v0.4.0 | Tests uitvoeren via de testpagina, automatisch testrapport met datum bij elke commit | 28 | [test-report-v0.4.0.json](reports/test-report-v0.4.0.json) |

## Beperkingen

- **Geen persistentie:** de watchlist staat in het geheugen en is leeg na een herstart van de server.
- **Geen gebruikers:** er is één gedeelde watchlist voor alle verzoeken.
- **Rate limit:** de API gebruikt de publieke CoinGecko-route zonder API-key. Die heeft een strenge rate limit; bij te veel verzoeken antwoordt de API met een `502`.
- **Alleen USD:** prijzen zijn alleen beschikbaar in US-dollars.
- **Vaste poort:** de server draait op poort 3000.
- **Testrunner:** de server luistert op alle netwerkinterfaces en `POST /tests/run` heeft geen inlog. Gebruik de server daarom niet op een openbaar netwerk, of zet `NODE_ENV=production` om de testrunner uit te schakelen.
- **Veel rapporten:** door een rapport per commit groeit de map `reports/commits/` met het aantal commits.

## Databron

Prijsdata is afkomstig van [CoinGecko](https://www.coingecko.com).

## Auteur

[JOUW NAAM] — schoolopdracht REST API