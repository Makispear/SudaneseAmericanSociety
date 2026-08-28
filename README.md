# Sudanese American Society

This repository contains the backend API for the Sudanese American Society project, along with the email service used for account verification and related notifications.

## Project structure

- `api/` - Express API server
- `email/` - email sending helper/service
- `db/` - database migration/files
- `notes.txt` - project notes and roadmap

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js 18+
- npm
- PostgreSQL 14+ (or another compatible local Postgres instance)
- A verified AWS SES email address if you want to send real emails locally

## 1) Clone the repo

```bash
git clone https://github.com/Makispear/SudaneseAmericanSociety.git
cd SudaneseAmericanSociety
```

## 2) Install dependencies

Install the API dependencies:

```bash
cd api
npm install
```

Install the email service dependencies:

```bash
cd ../email
npm install
```

## 3) Set up environment variables

Create one local `.env` file in the repository root. Both the API and email service load their environment variables from this file.

Example:

```dotenv
PORT=5000
NODE_ENV=development

DB_NAME=sudan_american_society
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD={enter_postgres_password}

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID={enter_aws_access_key}
AWS_SECRET_ACCESS_KEY={enter_aws_secret_key}
EMAIL_FROM={enter_verified_sender_email}
FRONTEND_URL=http://localhost:3000

JWT_ACCESS_SECRET={enter_access_secret}
JWT_REFRESH_SECRET={enter_refresh_secret}
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Notes:

- If you are using a local PostgreSQL database, set `DB_HOST=localhost` and `DB_PORT=5432`.
- If you are using a remote database, update the values accordingly.
- If you are not sending real emails during local development, you can still start the API, but any email-related functionality will require valid AWS SES credentials.

## 4) Create the local database

You can create the database using the PostgreSQL command line or any GUI tool such as pgAdmin, DBeaver, or another database IDE you prefer.

### Option A: Create it from the terminal

```bash
createdb sudan_american_society
```

Or with `psql`:

```bash
psql -U postgres
CREATE DATABASE sudan_american_society;
```

### Option B: Create it in a database GUI

Use pgAdmin or another database client to create a new database named:

```text
sudan_american_society
```

Then make sure the database user, password, host, and port in your `api/.env` match your local Postgres setup.

## 5) Start the API locally

You can start the API either from the terminal or by using the VS Code launch configuration.

### Option A: Start from the terminal

From the repository root:

```bash
cd api
npm run dev
```

This starts the Express app with nodemon and listens on port `5000` by default.

### Option B: Start from VS Code launch configuration

This project includes a launch file at `.vscode/launch.json` with a configuration named `API - Local Server`.

To use it:

1. Open the Run and Debug panel in VS Code.
2. Select `API - Local Server`.
3. Click the green Run button.

This launches `api/server.js` with the correct working directory and integrated terminal.

You can test the app by opening:

```bash
http://localhost:5000/
```

Expected response:

```json
{ "message": "Welcome to the Sudanese American Society API" }
```

## 6) Run the email service locally

The email helper is a Node service and can be tested via its local script:

```bash
cd email
npm run test:local
```

This executes the local email test flow configured in the package scripts.

## Useful commands

From `api/`:

```bash
npm run dev   # run with nodemon
npm start     # run without nodemon
```

From `email/`:

```bash
npm run test:local
```

## Troubleshooting

- `ECONNREFUSED` to Postgres: verify your local Postgres is running and that `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` are correct.
- `Cannot find module` errors: run `npm install` in the relevant folder.
- Email sending fails: confirm your AWS credentials and that `EMAIL_FROM` is a verified SES sender.
- Port already in use: update `PORT` in the `api/.env` file or stop the process currently using `5000`.

## Important note

Do not commit real AWS keys or database passwords to the repository. Keep secrets in your local environment or a private `.env` file that is excluded from Git.
