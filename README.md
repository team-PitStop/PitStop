# Pit Stop

**Pit Stop is live — just open it in your browser:**

### 👉 https://pitstop-8463842bfa02.herokuapp.com

No install, no setup, nothing to download. Register a free account, or try the demo login
(`demo@pitstop.app` / `pitstop123`). Everything below is for people who want to *develop*
Pit Stop; if you just want to *use* it, the link above is all you need.

---

## What it is

A collaborative car maintenance tracker that keeps a whole household on the same page across every vehicle they own.

- **One garage for all your vehicles** — make, model, year, mileage, nickname
- **Full service history** — log every oil change and repair with date, mileage, cost, and notes
- **Upcoming maintenance** — schedule what's due next, with smart interval suggestions
- **Overdue alerts** — the dashboard flags anything past its due date or mileage
- **Share a vehicle** — invite family or roommates by email; they accept the invite and can log service too
- **Activity feed** — see who did what on a shared vehicle

Every account's data is private: collaborators only see vehicles explicitly shared with them, and only the owner can edit or delete a vehicle.

## Using it

1. **Register** at the link above (or use the demo login), then log in.
2. **Add a vehicle** from My Garage.
3. **Log services** as you do them — the vehicle's mileage stays current automatically.
4. **Schedule upcoming maintenance** and watch the dashboard for overdue alerts.
5. **Share** a vehicle by email from its garage card; the recipient accepts the invite from their dashboard.

---

## Local development

React (Vite) dev server and Spring Boot run separately in dev; in production one Spring Boot jar serves both the API and the built frontend. Locally you run your own PostgreSQL — production uses a cloud database via env vars, and Flyway builds/migrates the schema automatically on startup in both.

**Prerequisites:** Java 21+, Node 18+, PostgreSQL running locally.

```bash
psql -c "CREATE DATABASE pitstop;"   # one-time; see docs/database-setup.md for details
```

**Run the backend:**

```bash
cd backend
./mvnw spring-boot:run               # API on http://localhost:8080
```

DB credentials default to your OS username with no password; override with
`DB_USER=... DB_PASSWORD=... ./mvnw spring-boot:run`.

**Run the frontend:**

```bash
cd frontend
npm install
npm start                            # app on http://localhost:5173
```

**Tests:**

```bash
cd backend && ./mvnw test            # boots the app against your local DB
```

**Production-style build** (packages the React app inside the jar, exactly what Heroku runs):

```bash
backend/mvnw -f pom.xml -Pheroku -DskipTests clean package
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

## Configuration (production env vars)

| Var | Required | Notes |
|---|---|---|
| `SPRING_DATASOURCE_URL` | ✅ | JDBC URL of the cloud Postgres (Neon), incl. `sslmode=require&prepareThreshold=0` |
| `SPRING_DATASOURCE_USERNAME` | ✅ | Database user |
| `SPRING_DATASOURCE_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Signs login tokens; local dev falls back to a throwaway default |
| `MAVEN_CUSTOM_OPTS` | ✅ | `-Pheroku -DskipTests` — turns on the frontend-embedding build profile |

## Deployment & CI/CD

A merge into `main` **deploys to production automatically** — Heroku's GitHub integration watches `main` and rebuilds the app on every merge.

| Environment | App | URL |
|---|---|---|
| Production | `pitstop` (Heroku, eco dyno) | https://pitstop-8463842bfa02.herokuapp.com |

- `main` is protected: no direct pushes — work on a branch, open a PR, one approving review (not the author) merges it.
- Merging to `main` is deploying: the Heroku build runs the `heroku` Maven profile (builds the React app, packages it into the jar) and Flyway applies any new migrations on boot.
- Database is a free [Neon](https://neon.tech) Postgres; credentials and the JWT secret live only in Heroku config vars — no secrets in the repo.

```bash
git checkout main && git pull origin main
git checkout -b yourname/short-task-name
# ...work, commit...
git push -u origin yourname/short-task-name
# open a PR on GitHub → teammate approves → merge = deploy
```

## Architecture

A Spring Boot 3 (Java 21) REST API under `backend/` — stateless JWT auth (Spring Security + jjwt, BCrypt), JPA entities per feature package (`vehicle`, `maintenance`, `upcoming`, `activity`), and Flyway-owned schema (`ddl-auto=validate`). The React 19 + Vite frontend under `frontend/` talks to it through a single shared axios instance (`src/api.js`) — absolute URL in dev, same-origin in production. See **[docs/](docs/)** for database setup.

---

## Course

**CIS 3950: Capstone 1** — Florida International University, Summer 2026
**Instructor:** Professor Masoud Sadjadi

## Team

| Name | Role |
|---|---|
| Anxhela | Team Lead |
| Antuan | Developer |
| Daniel | Product Owner |
| Dylan | Developer |
| Miguel | Developer |

## Sprint Roadmap

| Sprint | Dates | Theme |
|---|---|---|
| 1 | May 18 – May 31 | Foundation — accounts, vehicle management |
| 2 | Jun 1 – Jun 14 | Service Logging — record and view history |
| 3 | Jun 15 – Jun 28 | Scheduling — upcoming maintenance + reminders |
| 4 | Jun 29 – Jul 12 | Collaboration — share vehicles with others |
| 5 | Jul 13 – Jul 26 | Design and Deploy — dashboard, notifications, showcase prep |

## Project Management

- **User stories & backlog:** Mingle
- **Sprint ceremonies:** Sprint Planning, Daily Scrum, Backlog Grooming, Sprint Review, Sprint Retrospective
- **Sprint length:** 2 weeks

## Final Deliverables

- Poster — July 27, 2026
- Showcase — July 31, 2026
- Final zip — August 3, 2026
