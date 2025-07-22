# Agentic-Database-Agent
An Agentic Database Agent to handle the end-to-end process of Natural Query to creation of a table with schema and perfrom CRUD operations by creating API's and Next.js frontend components

## Tech Stack
Next.js - Frontend
Node.js - Backend
PostgreSQL - Database layer
Drizzle - TypeScript ORM

## Getting Started

First, run the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Then, Spin up the CLI using the following command:

```
node --loader ts-node/esm orchids-agent-cli.ts
```

## My Database Agent Workflow
Using OpenAI API (GPT-4o-mini) it parses the user prompt to analyse user Intent \
Check the status of the Postgres database currently \
Scans the codebase and searches for variables names extracted from the user prompt \
List all the files and variable names found and uses OpenAI API again for semantic matching between user query entity and list of variables \
If match found proceeds, else treats it as a general query and processes it respectively \
Retrieves the schema required and the related data \
If schema isn’t present, generates the schema \
Creates a table in PostgreSQL using the schema designed in .ts file \
Uses Drizzle for SQL migrations, Generation of data in the table \
Creates the CRUD APIs (Get, Push, Put, Delete) and stores them \
Creates a frontend .ts file with all the necessary functions and displays it on the home screen, with basic UI, delivering complete functionality via great UX by enabling the CRUD operations to the end user from the UI \
Can see real-time data updates in the database table (PgAdmin) \


## Testcases to run

Testcase 1: \
Can you store the recently played songs in a table \

Testcase 2: \
Can you store the ‘Made for you’ and ‘Popular albums’ in a table \

Bonus Testcase 3 (General Query): \
Can you add the song ‘Waka Waka’ to the table name 'songs', it was sung by ‘Shakira’ \
Can you add the song ‘Temperature’ to the table name 'songs', it was sung by ‘Sean Paul’ \

Bonus Testcase 4 (Changing the database schema): \
Can you store the ‘Popular albums’ in a table \

Bonus Testcase 5 (Robustness in user prompt - schema matching): \
Can you add the song ‘Highest in the room’ to the songs table, having an address as ‘1234 Main Drive Road’ \


