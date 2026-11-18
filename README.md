# Crypto Price API

Een kleine REST API die actuele cryptocurrency-prijzen levert en waarmee je een eigen watchlist met favoriete coins bijhoudt. De prijsdata komt van de publieke [CoinGecko API](https://www.coingecko.com/en/api). De API is gebouwd met Node.js en Express, volgens testdriven development (TDD).

## Inhoudsopgave

- [Functionaliteit](#functionaliteit)
- [Technologie](#technologie)
- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [API-referentie](#api-referentie)
- [Testen](#testen)
- [Projectstructuur](#projectstructuur)
- [Releases](#releases)
- [Beperkingen](#beperkingen)
- [Databron](#databron)

## Functionaliteit

- Lijst van de populairste coins met naam, symbool, prijs (USD) en 24-uurs verandering
- Actuele prijs van één specifieke coin op basis van het symbool
- Watchlist met favoriete coins: toevoegen, bekijken, notitie aanpassen en verwijderen
- Ingebouwde testpagina in de browser: endpoints uitproberen en curl- en PowerShell-commando’s kopiëren

## Technologie

| Onderdeel | Keuze |
|---|---|
| Runtime | Node.js 18 of nieuwer |
| Framework | Express 5 |
| Tests | Jest en Supertest |
| Externe data | CoinGecko API (zonder API-key) |

## Installatie

Vereisten: [Node.js](https://nodejs.org) 18 of nieuwer (de ingebouwde `fetch` wordt gebruikt) en Git.

```bash
git clone <URL-VAN-DEZE-REPOSITORY>
cd <MAPNAAM>
npm install
```

## Gebruik

Start de server:

```bash
npm start
```

De API draait nu op `http://localhost:3000`. Open die link in je browser voor de **testpagina**: daar probeer je elk endpoint uit en kopieer je kant-en-klare commando’s. Of probeer het in de terminal:

```bash
curl http://localhost:3000/crypto
```

> **Windows PowerShell:** zie [Voorbeeldverzoeken](#voorbeeldverzoeken) voor commando's die in PowerShell werken.

## API-referentie

Alle responses zijn JSON. Fouten hebben de vorm `{"error": "omschrijving"}`.

| Methode | Endpoint | Omschrijving | Succes |
|---|---|---|---|
| GET | `/crypto` | Lijst van populaire coins | 200 |
| GET | `/crypto/{symbol}` | Prijs van één coin | 200 |
| GET | `/watchlist` | Bekijk de watchlist | 200 |
| POST | `/crypto` | Voeg een coin toe aan de watchlist | 201 |
| PUT | `/crypto/{symbol}` | Pas de notitie van een watchlist-coin aan | 200 |
| DELETE | `/crypto/{symbol}` | Verwijder een coin uit de watchlist | 204 |

### Voorbeeldverzoeken

Start eerst de server met `npm start` en open een **tweede** terminal.

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

> In Windows PowerShell is `curl` een alias voor `Invoke-WebRequest` en werken de curl-opties (`-X`, `-H`, `-d`) niet. Het quoten van JSON met `curl.exe` is bovendien foutgevoelig. Gebruik daarom `Invoke-RestMethod` zoals hierboven, of [Postman](https://www.postman.com): kies de methode, vul de URL in en plak bij **Body > raw > JSON** de JSON uit de voorbeelden.

### Voorbeeldresponses

**GET /crypto** geeft de top 10 coins op marktkapitalisatie. `price` is in US-dollars, `change` is de procentuele verandering over de afgelopen 24 uur.

```json
[
  { "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 },
  { "symbol": "ETH", "name": "Ethereum", "price": 1800, "change": -1.2 }
]
```

**GET /crypto/{symbol}** werkt niet hoofdlettergevoelig. Een onbekend symbool geeft `404`.

```json
{ "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 }
```

**POST /crypto** verwacht een body met `symbol` (verplicht) en `note` (optioneel).

```json
{ "symbol": "BTC", "note": "lang vasthouden" }
```

**GET /watchlist**

```json
[
  { "symbol": "BTC", "note": "lang vasthouden" }
]
```

**PUT /crypto/{symbol}** past de notitie aan. `note` is verplicht en moet een tekst zijn.

```json
{ "symbol": "BTC", "note": "verkopen boven 70000" }
```

**DELETE /crypto/{symbol}** geeft `204 No Content` zonder body.

### Foutcodes

| Code | Betekenis |
|---|---|
| 400 | Ongeldige invoer (bijvoorbeeld ontbrekend `symbol` of `note`) |
| 404 | Coin onbekend bij CoinGecko, of niet aanwezig in de watchlist |
| 409 | Coin staat al in de watchlist |
| 502 | CoinGecko is niet bereikbaar of geeft een fout terug |

## Testen

Het project is ontwikkeld met testdriven development: eerst een falende test (rood), daarna de code die de test laat slagen (groen). In de git-geschiedenis is dit terug te zien.

```bash
npm test
```

De tests mocken de CoinGecko-client, zodat ze snel en betrouwbaar zijn en geen internetverbinding of rate limit nodig hebben.

### Testrapporten

Voor elke release is een testrapport gemaakt in de map [`reports/`](reports/):

```bash
npx jest --json --outputFile=reports/test-report-vX.Y.Z.json
```

## Projectstructuur

```
.
├── src/
│   ├── app.js         # Express-routes
│   ├── coingecko.js   # Client voor de CoinGecko API
│   ├── watchlist.js   # Watchlist in het geheugen
│   └── server.js      # Startpunt van de server
├── public/
│   └── index.html     # Testpagina met uitleg en kopieerbare commando’s
├── tests/
│   ├── crypto.test.js
│   ├── watchlist.test.js
│   └── ui.test.js
├── reports/           # Testrapporten per release
├── package.json
└── README.md
```

## Releases

| Versie | Inhoud | Testrapport |
|---|---|---|
| v0.1.0 | `GET /crypto`, `GET /crypto/{symbol}` | [test-report-v0.1.0.json](reports/test-report-v0.1.0.json) |
| v0.2.0 | Watchlist: `POST`, `GET /watchlist`, `PUT`, `DELETE` | [test-report-v0.2.0.json](reports/test-report-v0.2.0.json) |
| v0.3.0 | Testpagina in de browser (`GET /`) | [test-report-v0.3.0.json](reports/test-report-v0.3.0.json) |

## Beperkingen

- De watchlist staat in het geheugen en is leeg na een herstart van de server.
- De API gebruikt de publieke CoinGecko-route zonder API-key. Die heeft een strenge rate limit; bij te veel verzoeken geeft de API een `502`.
- Prijzen zijn alleen beschikbaar in US-dollars.

## Databron

Prijsdata is afkomstig van [CoinGecko](https://www.coingecko.com).

## Auteur

[JOUW NAAM] — schoolopdracht REST API