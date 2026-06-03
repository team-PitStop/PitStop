# Database Setup (PostgreSQL)

New to databases or working on a team? Start here. This guide gets the PitStop
database running on your computer, step by step. You can copy/paste every command.

## The big idea (read this first)

A **database** is just an organized place to store the app's data (users, etc.) —
think of it as a smart filing cabinet.

Here's how we use it as a team:

- **Everyone gets their own database, on their own laptop.** There is *no* shared
  database while we develop. Your data is yours alone, and it's safe to break, wipe,
  or experiment with — you can't mess up anyone else's work.
- **The one thing we *do* share is the layout** — which "drawers and folders" exist
  in the cabinet (the tables and their columns). This layout is called the **schema**,
  and it lives in our code repo. A tool called **Flyway** reads it and builds the
  cabinet for you automatically when you start the app. You never build tables by hand.

So the whole setup is just three moves:

> **TL;DR:** install Postgres **17** → start it → run `createdb pitstop` → run the
> backend. The tables build themselves on first run.

New words like *schema*, *Flyway*, and *migration* are explained as you go, and there's
a [glossary](#glossary-plain-english) at the bottom.

> **About the commands below:** anything in a gray box is typed into your **terminal**
> (Terminal on macOS, PowerShell on Windows) and run by pressing Enter. Run them one
> line at a time.

---

## 1. Install PostgreSQL 17

Postgres is the database program itself. **Use version 17** so everyone on the team is
running the same thing (different versions can behave differently — matching avoids
"works on my machine" surprises).

### macOS (Homebrew)

```bash
brew install postgresql@17
brew services start postgresql@17   # starts it now + automatically on every login
```

If `psql`/`initdb` already point at a different version (e.g. an old `libpq`), make 17
the active one:

```bash
brew unlink libpq            # only if you have a conflicting libpq
brew link --overwrite --force postgresql@17
```

Check it worked:

```bash
postgres --version           # should say 17.x
```

### Windows

Download the PostgreSQL **17** installer from
<https://www.postgresql.org/download/windows/> and run it. During install:

- keep the default port **5432**, and
- **remember the password** you set for the `postgres` user — you'll need it in step 4.

> **Stack Builder:** When the installer finishes, Stack Builder opens automatically.
> Close it or click Cancel — none of the add-ons it offers are needed for this project.
> Spring Boot pulls the PostgreSQL driver in automatically via `pom.xml`.

### Linux (Debian/Ubuntu)

```bash
sudo apt install postgresql-17
sudo systemctl enable --now postgresql
```

### Verify Postgres is running

After installation, run this in your terminal:

```bash
pg_isready
```

You should see `localhost:5432 - accepting connections`. This confirms PostgreSQL is
running — it does **not** mean the `pitstop` database exists yet. You still need to
create it in the next step.

---

## 2. Create the (empty) database

This makes a new, empty database named `pitstop` — an empty filing cabinet with no
drawers yet. The app adds the drawers for you later.

```bash
createdb pitstop
```

**Windows alternative (pgAdmin):** If you prefer the GUI, open pgAdmin → expand
**Servers → PostgreSQL → Databases** → right-click **Databases** → **Create →
Database...** → set the name to `pitstop` → click **Save**.

> The database name must match exactly what's in `application.properties` —
> `spring.datasource.url=jdbc:postgresql://localhost:5432/pitstop`. If the names
> don't match, the app will fail to connect.

That's the whole step. Optionally, check you can connect to it:

```bash
psql pitstop -c "\dt"   # "\dt" = list tables. It'll be empty until step 5.
```

---

## 3. How the tables get created (Flyway + migrations)

**You do not create tables by hand.** When you start the backend, a tool called
**Flyway** sets up the database for you. Here's what's happening behind the scenes:

- In the repo there's a folder of numbered SQL files at
  `backend/src/main/resources/db/migration/` — for example
  `V1__create_users_table.sql`, `V2__...`, and so on. Each file is one change to the
  database layout. These files are called **migrations**.
- On startup, Flyway runs any migrations that haven't run yet, **in number order**, and
  keeps a checklist of which ones it has already done. Because everyone runs the same
  numbered files, everyone ends up with an identical layout. (Think of it like IKEA
  instructions: follow steps 1, 2, 3… in order and everyone builds the same shelf.)

**The two rules that keep the team in sync:**

- ✅ **To change the layout, add a *new*, higher-numbered file** (`V2__...`, `V3__...`).
  Never rename the numbers.
- ❌ **Never edit a migration that has already run.** Flyway notices the change and
  refuses to start, because now your history doesn't match everyone else's. Old steps
  are "locked"; new changes always go in a new file.

There's also a safety net: the app is set to
`spring.jpa.hibernate.ddl-auto=validate`. In plain terms, on startup the app
*double-checks* that the Java code and the actual database tables agree. If they don't
line up, the app refuses to start. **That's on purpose** — it catches mistakes early
rather than letting bad data through. So if you see a "schema validation" error, it's
the safety net doing its job (see Troubleshooting).

---

## 4. Connection settings (username & password)

The backend looks for the database at `jdbc:postgresql://localhost:5432/pitstop`
(that's just an address: the `pitstop` database, on your own machine, on port 5432).

Whether you need to do anything here depends on your OS:

- **macOS / Linux (Homebrew/apt):** nothing to do. The install creates a database user
  named after your computer login, with no password and local access already trusted, so
  it just works.
- **Windows (or any custom setup):** the installer always creates a superuser named
  `postgres` — so `DB_USER=postgres` is always correct on Windows. The password is
  whatever you set during installation in step 1. Tell the backend those credentials by
  setting two **environment variables** before starting it.

  The cleanest way on Windows is to save them permanently so you never have to type
  them again: search **"Environment Variables"** in the Start menu → **Edit the system
  environment variables** → **Environment Variables...** → under **User variables**,
  add `DB_USER` (value: `postgres`) and `DB_PASSWORD` (value: your password). Do not
  include quotes — just the plain value. Restart your terminal and IDE after saving.

  Or set them for just the current session:

  ```bash
  # macOS/Linux
  export DB_USER=postgres
  export DB_PASSWORD=your_password

  # Windows (PowerShell)
  $env:DB_USER="postgres"
  $env:DB_PASSWORD="your_password"
  ```

**Before starting the backend, verify the variables are visible from inside the
`backend` folder:**

```bash
# macOS/Linux
echo $DB_USER
echo $DB_PASSWORD

# Windows (PowerShell)
echo $env:DB_USER
echo $env:DB_PASSWORD
```

If either prints blank, the variables aren't set in this session. Re-set them, then
check again. If you're running from **VS Code or IntelliJ**, the IDE must have launched
*after* the system environment variables were saved — a full IDE restart is required,
or add the variables directly to your run configuration (VS Code: `launch.json` `env`
block; IntelliJ: **Edit Configurations → Environment variables**).

A ready-made test account is created automatically the first time you run the app, so
you can log in right away:

```
email:    test@pitstop.com
password: password123
```

---

## 5. Run the backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw spring-boot:run
```

(`cd backend` means "move into the backend folder" first.) On the first run, watch the
startup logs — you should see Flyway create the tables and the test user get added.
That confirms everything connected correctly.

---

## Troubleshooting

Don't panic — these are the common first-time hiccups and their fixes.

| Problem | What it means | Fix |
| --- | --- | --- |
| `connection refused` on port 5432 | Postgres isn't running. | Start it. macOS: `brew services start postgresql@17`. |
| `database "pitstop" does not exist` | You skipped step 2. | Run `createdb pitstop`. |
| `role "..." does not exist` / auth fails | The app's username/password is wrong. | Set `DB_USER` / `DB_PASSWORD` (see step 4). |
| App won't boot, complains about **schema validation** | Your local tables don't match the code (out-of-date or a changed migration). | Easiest reset — **dev only, this wipes your local data** (which is fine, it's disposable): `dropdb pitstop && createdb pitstop`, then start the backend again. |
| `psql` is the wrong version | An older Postgres is taking priority. | macOS: `brew link --overwrite --force postgresql@17`. |

Still stuck? Copy the error message and ask the team — that's exactly what the chat is
for.

---

## Glossary (plain English)

- **Database** — an organized place to store the app's data. The "filing cabinet."
- **PostgreSQL / Postgres** — the specific database program we use.
- **Schema** — the *layout* of the database: which tables exist and what columns they
  have. The cabinet's drawers and labels. Shared by the team via code.
- **Table** — one collection of records, like a spreadsheet (e.g. a `users` table).
- **Migration** — one numbered file describing a single change to the layout. Runs in
  order; we only ever add new ones.
- **Flyway** — the tool that reads the migration files and builds/updates your tables
  automatically when the app starts.
- **Hibernate / `ddl-auto=validate`** — a safety check that makes sure the app's code
  and your actual tables agree on startup, and stops the app if they don't.
- **Environment variable** — a setting (like a username or password) you give your
  terminal so the app can read it, instead of writing it into the code.
- **Port 5432** — the default "door number" Postgres listens on. The app knocks here.
