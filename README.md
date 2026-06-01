# Pit Stop

A collaborative car maintenance tracker that helps users and their team log service history, schedule upcoming maintenance, and share vehicles with family or roommates.

---

## About

Most people have no idea when their oil was last changed or when their next service is due — and when multiple people share a car, it's even worse. Pit Stop keeps the whole household on the same page across every vehicle they own.

**Key features:**
- Manage multiple vehicles in one garage
- Log service history with date, mileage, cost, and notes
- Schedule upcoming maintenance with smart interval suggestions
- Get reminded about overdue or upcoming service
- Share vehicles with family or roommates and see everyone's activity

---

## Course

**CIS 3950: Capstone 1** — Florida International University, Summer 2026
**Instructor:** Professor Masoud Sadjadi

---

## Team

| Name | Role |
|---|---|
| Anxhela | Team Lead |
| Antuan | Developer |
| Daniel | Product Owner |
| Dylan | Developer |
| Miguel | Developer |

---

## Tech Stack

- **Frontend:** React 19 + Vite, React Router v7, Axios
- **Backend:** Java 21, Spring Boot 3, Spring Security (stateless JWT)
- **Database:** PostgreSQL 17, Flyway migrations
- **Auth:** JWT (jjwt 0.12), BCrypt password hashing
- **Hosting:** TBD

---

## Sprint Roadmap

| Sprint | Dates | Theme |
|---|---|---|
| 1 | May 18 – May 31 | Foundation — accounts, vehicle management |
| 2 | Jun 1 – Jun 14 | Service Logging — record and view history |
| 3 | Jun 15 – Jun 28 | Scheduling — upcoming maintenance + reminders |
| 4 | Jun 29 – Jul 12 | Collaboration — share vehicles with others |
| 5 | Jul 13 – Jul 26 | Polish — dashboard, notifications, showcase prep |

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+ and npm
- PostgreSQL 17 running locally

### Database setup

```bash
psql -c "CREATE DATABASE pitstop;"
```

See `docs/database-setup.md` for full setup instructions (user permissions, teammates' environments).

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. Flyway runs migrations automatically on startup.

To override the default DB credentials or JWT secret:

```bash
DB_USER=myuser DB_PASSWORD=mypass JWT_SECRET=my-secret ./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:5173`.

### Running the full app

Start the backend first, then the frontend. Register an account at `/register`, then log in at `/login`.

---

## Team Workflow

`main` is protected — **no one pushes to it directly**. All work happens on a
branch and merges into `main` through a Pull Request with one approval.

```bash
# 1. Start from the latest main
git checkout main
git pull origin main

# 2. Create a branch for your task
git checkout -b yourname/short-task-name

# 3. Work, then commit and push the branch
git add .
git commit -m "Describe what you did"
git push -u origin yourname/short-task-name

# 4. Open a Pull Request on GitHub.
#    A teammate reviews and approves it, then it merges into main.

# 5. If main moved while you worked, refresh your branch before merging:
git checkout main && git pull origin main
git checkout yourname/short-task-name
git merge main
```

**Rules**
- One approving review (from someone other than the author) is required to merge.
- Never force-push or delete `main`.
- Always `git pull origin main` before starting something new.

---

## Project Management

- **User stories & backlog:** Mingle
- **Sprint ceremonies:** Sprint Planning, Daily Scrum, Backlog Grooming, Sprint Review, Sprint Retrospective
- **Sprint length:** 2 weeks

---

## Final Deliverables

- Poster — July 27, 2026
- Showcase — July 31, 2026
- Final zip — August 3, 2026
