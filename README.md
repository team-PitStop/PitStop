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

*To be decided by the team during Sprint 1.*

- **Frontend:** TBD
- **Backend:** TBD
- **Database:** TBD
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

*Build/run instructions will be added once the tech stack is finalized.*

```bash
# Clone the repo
git clone https://github.com/team-PitStop/PitStop.git
cd PitStop

# Install dependencies
# (instructions TBD)

# Run locally
# (instructions TBD)
```

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
