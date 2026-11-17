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

De API draait nu op `http://localhost:3000`. Probeer het uit:

```bash
curl http://localhost:3000/crypto
```

> **Windows PowerShell:** gebruik `curl.exe` in plaats van `curl`. In PowerShell is `curl` een alias voor `Invoke-WebRequest`.

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

### GET /crypto

Geeft de top 10 coins op marktkapitalisatie.

```bash
curl http://localhost:3000/crypto
```

```json
[
  { "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 },
  { "symbol": "ETH", "name": "Ethereum", "price": 1800, "change": -1.2 }
]
```

`price` is in US-dollars, `change` is de procentuele verandering over de afgelopen 24 uur.

### GET /crypto/{symbol}

```bash
curl http://localhost:3000/crypto/btc
```

```json
{ "symbol": "BTC", "name": "Bitcoin", "price": 27000, "change": 2.3 }
```

Het symbool is niet hoofdlettergevoelig. Een onbekend symbool geeft `404`.

### POST /crypto

Voegt een coin toe aan de watchlist. `symbol` is verplicht, `note` is optioneel.

```bash
curl -X POST http://localhost:3000/crypto \
  -H "Content-Type: application/json" \
  -d '{"symbol": "btc", "note": "lang vasthouden"}'
```

```json
{ "symbol": "BTC", "note": "lang vasthouden" }
```

### GET /watchlist

```bash
curl http://localhost:3000/watchlist
```

```json
[
  { "symbol": "BTC", "note": "lang vasthouden" }
]
```

### PUT /crypto/{symbol}

Past de notitie van een coin in de watchlist aan. `note` is verplicht en moet een tekst zijn.

```bash
curl -X PUT http://localhost:3000/crypto/btc \
  -H "Content-Type: application/json" \
  -d '{"note": "verkopen boven 70000"}'
```

```json
{ "symbol": "BTC", "note": "verkopen boven 70000" }
```

### DELETE /crypto/{symbol}

```bash
curl -X DELETE http://localhost:3000/crypto/btc
```

Geeft `204 No Content` zonder body.

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
├── tests/
│   ├── crypto.test.js
│   └── watchlist.test.js
├── reports/           # Testrapporten per release
├── package.json
└── README.md
```

## Releases

| Versie | Inhoud | Testrapport |
|---|---|---|
| v0.1.0 | `GET /crypto`, `GET /crypto/{symbol}` | [test-report-v0.1.0.json](reports/test-report-v0.1.0.json) |
| v0.2.0 | Watchlist: `POST`, `GET /watchlist`, `PUT`, `DELETE` | [test-report-v0.2.0.json](reports/test-report-v0.2.0.json) |

## Beperkingen

- De watchlist staat in het geheugen en is leeg na een herstart van de server.
- De API gebruikt de publieke CoinGecko-route zonder API-key. Die heeft een strenge rate limit; bij te veel verzoeken geeft de API een `502`.
- Prijzen zijn alleen beschikbaar in US-dollars.

## Databron

Prijsdata is afkomstig van [CoinGecko](https://www.coingecko.com).

## Auteur

[JOUW NAAM] — schoolopdracht REST API