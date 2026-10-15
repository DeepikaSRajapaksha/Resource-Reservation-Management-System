# Resource Reservation Management System

A web-based Resource Reservation Management System developed using Next.js, React, TypeScript, PostgreSQL, and Prisma ORM. The system allows users to view available resources and make reservations, while administrators can manage resources and monitor reservations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Requirements](#system-requirements)
- [Project Architecture](#project-architecture)
- [Clone the Repository](#1-clone-the-repository)
- [Install Dependencies](#2-install-dependencies)
- [Configure PostgreSQL](#3-configure-postgresql)
- [Configure Environment Variables](#4-configure-environment-variables)
- [Database Migration](#5-run-database-migrations)
- [Generate Prisma Client](#6-generate-prisma-client)
- [Seed the Database](#7-seed-the-database)
- [Run the Application](#8-run-the-application)
- [Access the Application](#9-access-the-application)
- [Database Management](#10-view-and-manage-the-database)
- [Useful Commands](#useful-commands)
- [Troubleshooting](#troubleshooting)

## Features

### User Features
- View available resources.
- View resource details and availability.
- Select reservation dates and times.
- Create resource reservations.
- Access the user-facing interface without requiring an admin sidebar.
- Navigate to the login interface when authentication is required.

### Administrator Features
- Admin login and logout.
- Resource management (Create, Read, Update, Delete).
- Manage resource details, categories, descriptions, locations, and images where supported.
- View and manage reservations.
- Prevent conflicting reservations for the same resource and time period.
- Manage active and inactive resources.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web application framework |
| React | User interface development |
| TypeScript | Static type checking |
| PostgreSQL | Relational database |
| Prisma ORM | Database access and schema management |
| CSS Modules | Component-specific styling |
| Node.js | JavaScript runtime |
| npm | Package and dependency management |

## System Requirements

Install the following software before running the project:

1. **Node.js** — use a version compatible with the project's `package.json`.
2. **npm** — installed with Node.js.
3. **PostgreSQL** — database server.
4. **Git** — to clone and manage the repository.
5. **Visual Studio Code** or another code editor.

Check your installations using:

```bash
node --version
npm --version
git --version
```

Check that PostgreSQL is installed and its service is running.

## Project Architecture

The application uses Next.js App Router with React components, API route handlers, Prisma ORM, and PostgreSQL.

```text
Resource-Reservation-System/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── prisma.config.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── admin/
│   │   ├── resources/
│   │   └── page.tsx
│   ├── components/
│   ├── generated/
│   └── styles/
├── public/
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

The directory structure above is illustrative. Your actual project may contain different folders or files.

## 1. Clone the Repository

Open a terminal or PowerShell window and navigate to the directory where you want to store the project.

```bash
git clone https://github.com/DeepikaSRajapaksha/Resource-Reservation-Management-System.git
```

Navigate into the cloned project directory:

```bash
cd YOUR_PROJECT_FOLDER
```

For example:

```bash
cd resource-reservation-system
```

Replace the example folder name with the actual directory created by Git.

## 2. Install Dependencies

Install all required project dependencies:

```bash
npm install
```

This command installs the packages specified in `package.json` and uses `package-lock.json` to resolve dependency versions.

Do not delete `package-lock.json` unnecessarily, because it helps maintain consistent dependency versions across environments.

## 3. Configure PostgreSQL

Make sure the PostgreSQL service is running.

### Step 1: Open PostgreSQL

You can use pgAdmin 4 or the PostgreSQL command-line tool, `psql`.

Connect using your PostgreSQL username and password.

### Step 2: Create the project database

Using pgAdmin 4:

1. Connect to your PostgreSQL server.
2. Expand **Databases**.
3. Right-click **Databases**.
4. Select **Create → Database**.
5. Enter the database name:

```text
resource_reservation_db
```

6. Save the database.

Alternatively, using `psql`:

```sql
CREATE DATABASE resource_reservation_db;
```

Use the database name consistently in your environment configuration.

## 4. Configure Environment Variables

Create a `.env` file in the project root directory if one does not already exist.

The project root is the directory containing `package.json`.

Configure your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/resource_reservation_db"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

If your PostgreSQL username, port, or database name differs, update the connection string accordingly.

**Important:**
- Never commit `.env` or real database credentials to GitHub.
- Keep `.env` in `.gitignore`.
- If `.env.example` exists, use it as a template.
- If your Prisma configuration uses a separate `prisma.config.ts` file or another environment variable, follow the existing project configuration rather than overwriting it.

## 5. Run Database Migrations

Prisma migrations create and update database tables according to the Prisma schema.

First, verify that your database connection and Prisma configuration are correct.

For a project using Prisma Migrate, run:

```bash
npx prisma migrate dev
```

If the command asks for a migration name, enter a descriptive name such as:

```text
init
```

If the repository already contains migration files, Prisma uses those migrations to create the database schema.

For a development database that has no migration history, the command may create an initial migration based on the schema.

**Do not reset or delete an existing database just to make migrations work.** Investigate migration errors before changing or removing database data.

## 6. Generate Prisma Client

Generate the Prisma Client used by the application:

```bash
npx prisma generate
```

The generated client provides typed database queries for application code.

For example, application code may use Prisma to create a resource, retrieve resources, update records, or check reservation conflicts.

If the project uses a custom Prisma generator output directory, Prisma will generate the client at the configured location.

## 7. Seed the Database

Database seeding inserts initial data required to use or test the application.

Depending on the seed script, this may include:

- An initial administrator account.
- Sample resources.
- Resource categories.
- Other initial application data.

Run the configured seed command:

```bash
npx prisma db seed
```

Make sure the repository includes a seed script and that it is configured in the project's Prisma configuration or package scripts.

If the seed command is not configured, check `package.json`, `prisma.config.ts`, and the existing seed file before adding or changing configuration.

**Administrator login:** Use the credentials defined by the seed script or printed by it, if applicable. Do not assume default credentials; verify them in the actual project. Change any initial password before deploying the application.

## Default Administrator Login Credentials

After successfully running the database migrations and seed script, use the following credentials to access the administrator panel.

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `PasswordAdmin` |

**Admin Login URL:** `http://localhost:3000/admin/login`

**Instructions:**
1. Start the application using `npm run dev`.
2. Open the administrator login page.
3. Enter the email address and password provided above.
4. Click **Login** to access the administrator dashboard.

**Note:** These credentials are intended for local development and project demonstration. Change the default password before deploying the application to a production environment.


## 8. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Open the local application in your browser:

```text
http://localhost:3000
```

Keep the terminal running while using the application.

To stop the development server, press `Ctrl + C` in the terminal.

## 9. Access the Application

| Page | URL |
|---|---|
| User home page | `http://localhost:3000` |
| Resource listing | `http://localhost:3000/resources` |
| Admin login | `http://localhost:3000/admin/login` |
| Admin dashboard | Use the dashboard route configured in the project |

The URLs above assume these routes exist in the current application. If your route names differ, use the corresponding paths from `src/app/`.

## 10. View and Manage the Database

You can inspect the database using pgAdmin 4 or Prisma Studio.

### Option A: pgAdmin 4

1. Open pgAdmin 4.
2. Connect to your PostgreSQL server.
3. Expand **Databases**.
4. Select `resource_reservation_db`.
5. Expand **Schemas → public → Tables**.
6. Right-click a table and select **View/Edit Data** to inspect records.

### Option B: Prisma Studio

Run:

```bash
npx prisma studio
```

Prisma Studio opens a browser interface for viewing and managing database records. Use the address displayed in the terminal.

## Useful Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server after a successful build |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Apply development migrations |
| `npx prisma migrate status` | Check migration status |
| `npx prisma db seed` | Run the configured seed script |
| `npx prisma studio` | Open the database browser |

Some commands depend on the scripts and Prisma version configured in the repository.

## Troubleshooting

### Database connection failed

- Confirm PostgreSQL is running.
- Check the database name, username, password, host, and port in the environment configuration.
- Verify that the database exists.
- Ensure the connection URL matches the configuration used by Prisma.

### Prisma Client is not generated

Run:

```bash
npx prisma generate
```

Check the generator configuration and generated-client import paths if the error continues.

### Migration failed

Run:

```bash
npx prisma migrate status
```

Review the error message and verify that the correct database is selected before attempting further migration changes.

### Seed command failed

Check that the seed script exists and is configured correctly. Verify that required environment variables are available and that any required tables have been created.

### Port 3000 is already in use

Run the application on another available port:

```bash
npm run dev -- --port 3001
```

Then open `http://localhost:3001`.

## Development Notes

- Keep the Prisma schema and migration history synchronized.
- Commit migration files to Git so other developers can reproduce the database schema.
- Never commit passwords, API secrets, or production credentials.
- Use a separate database for development and production.
- Test reservation conflicts and availability checks before deploying changes.

## Thank You
