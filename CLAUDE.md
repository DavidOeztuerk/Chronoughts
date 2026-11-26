# Chronoughts - Projekt Übersicht

## Projektbeschreibung
Chronoughts ist eine Web-Anwendung zur chronologischen Verwaltung und Organisation von Gedanken. Die Anwendung fungiert als digitales Gedankentagebuch mit erweiterten Such- und Organisationsfunktionen.

## Technologie-Stack

### Backend
- **Framework**: ASP.NET Core (.NET)
- **Datenbank**: SQL Server (Microsoft SQL Server 2022)
- **ORM**: Entity Framework Core
- **API-Stil**: RESTful API
- **Port**: 5001 (lokal), 80 (Docker Container)

### Frontend
- **Framework**: React mit TypeScript
- **Build-Tool**: Vite
- **Port**: 3000 (über NGINX)
- **Status**: Grundgerüst vorhanden, noch nicht implementiert

### Infrastruktur
- **Container**: Docker & Docker Compose
- **Reverse Proxy**: NGINX
- **Services**:
  - `frontend`: React-Anwendung
  - `api`: .NET Backend API
  - `nginx`: Reverse Proxy
  - `db`: SQL Server Datenbank

## Projektstruktur

```
Chronoughts/
├── src/
│   ├── backend/
│   │   └── Chronoughts.Api/        # .NET Core API
│   │       ├── Models/              # Datenmodelle (Thought, User)
│   │       ├── Services/            # Business Logic
│   │       ├── Data/                # DbContext & Repositories
│   │       ├── Contracts/           # Request/Response DTOs
│   │       └── Extensions/          # API Endpoints & Erweiterungen
│   └── frontend/                    # React Anwendung
│       ├── src/
│       │   ├── api/                 # API Client
│       │   └── App.tsx              # Hauptkomponente (noch Standard-Template)
│       └── package.json
├── docker-compose.yml               # Container-Orchestrierung
└── nginx.conf                       # Proxy-Konfiguration

```

## Datenmodell

### Thought (Hauptentität)
- `Id`: Guid (von BaseEntity)
- `Title`: string? - Titel des Gedankens
- `Content`: string? - Inhalt/Text
- `Timestamp`: DateTime - Zeitstempel (Standard: UTC Now)
- `Category`: string? - Kategorie
- `Notes`: string? - Zusätzliche Notizen
- `Tags`: ICollection<string> - Tags zur Organisation
- `CreatedAt`, `UpdatedAt`: DateTime (von BaseEntity)

## API Endpoints
Die API nutzt Minimal APIs mit folgenden Hauptendpoints:
- Thoughts CRUD Operationen
- Suche nach Tags
- Suche nach Kategorien
- Volltextsuche

## Wichtige Befehle

### Backend entwickeln
```bash
cd src/backend/Chronoughts.Api
dotnet restore
dotnet build
dotnet run
```

### Frontend entwickeln
```bash
cd src/frontend
npm install
npm run dev
```

### Docker starten
```bash
docker-compose up --build
```

### Datenbank-Migrationen
```bash
cd src/backend/Chronoughts.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

## Entwicklungshinweise

### Code-Konventionen
- **Backend**: C# Naming Conventions, Async/Await Pattern
- **Frontend**: TypeScript, funktionale React-Komponenten
- **API**: RESTful Prinzipien, Request/Response DTOs
- **Datenbank**: Code-First Ansatz mit EF Core

### Aktuelle TODOs
- Frontend-Implementierung (App.tsx ist noch Template)
- UI für Gedankenverwaltung erstellen
- API-Integration im Frontend vervollständigen
- Authentifizierung/Autorisierung implementieren
- Tests hinzufügen

### Sicherheitshinweise
- Datenbank-Passwort in docker-compose.yml sollte für Produktion geändert werden
- CORS-Konfiguration prüfen
- Keine Secrets im Code committen

## Ports & URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- SQL Server: localhost:1433
- Datenbank: ChronoughtsDb
- DB User: sa
- DB Password: YourStrong!Password (nur Development!)

## Fehlerbehebung
- Bei Docker-Problemen: `docker-compose down -v` und neu starten
- Bei DB-Verbindungsproblemen: Connection String in appsettings.json prüfen
- Bei Frontend-Build-Fehlern: node_modules löschen und `npm install` neu ausführen