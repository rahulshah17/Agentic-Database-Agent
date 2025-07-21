#!/usr/bin/env ts-node

const dotenvCli = require("dotenv");
dotenvCli.config({ path: ".env.local" });

const { spawn } = require("child_process");
const fsCli = require("fs");
const pathCli = require("path");

class OrchidsCLI {
  private isProcessing = false;

  async start() {
    console.log("Database Agent CLI");
    console.log("Type 'quit' to exit\n");

    while (true) {
      const query = await this.prompt("What would you like me to do? ");
      
      if (query.toLowerCase() === 'quit') {
        console.log("Thanks!");
        break;
      }

      await this.processQuery(query);
    }
  }

  private async prompt(message: string): Promise<string> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(message, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  private async processQuery(query: string) {
    if (this.isProcessing) {
      console.log("Already processing a request. Please wait...\n");
      return;
    }

    this.isProcessing = true;
    console.log(`\n Processing: "${query}"\n`);

    try {
      // Step 1: Analyze the query
      await this.think("Analyzing your request...");
      const intent = this.analyzeIntent(query);
      console.log(`Intent detected: ${intent}\n`);

      // Step 2: Check current state
      await this.think("Checking current database state...");
      const currentState = await this.checkCurrentState();
      console.log(`Current state: ${currentState}\n`);

      // Step 3: Execute the agent
      await this.think("Executing database operations...");
      await this.runAgent(query);

      // Step 4: Verify results
      await this.think("Verifying results...");
      await this.verifyResults();

      console.log("Request completed successfully!\n");

    } catch (error) {
      console.error(`Error: ${(error as Error).message}\n`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async think(message: string) {
    console.log(`${message}`);
    await this.sleep(1000); // Simulate thinking time
  }

  private analyzeIntent(query: string): string {
    if (query.toLowerCase().includes("recently played")) {
      return "Create recently played songs table and API endpoint";
    }
    if (query.toLowerCase().includes("playlist")) {
      return "Manage playlist data";
    }
    if (query.toLowerCase().includes("user")) {
      return "User management operations";
    }
    return "General database operation";
  }

  private async checkCurrentState(): Promise<string> {
    const schemaPath = pathCli.join("db", "schema.ts");
    if (fsCli.existsSync(schemaPath)) {
      const content = fsCli.readFileSync(schemaPath, "utf8");
      const tables = content.match(/export const (\w+)/g) || [];
      return `${tables.length} tables found in schema`;
    }
    return "No schema file found";
  }

  private async runAgent(query: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const agent = spawn("npx", ["ts-node", "orchids-agent.ts", query], {
        stdio: ["pipe", "pipe", "pipe"]
      });

      agent.stdout.on("data", (data: Buffer) => {
        const output = data.toString();
        if (output.includes("Creating")) {
          console.log(" " + output.trim());
        } else if (output.includes("Running")) {
          console.log(" " + output.trim());
        } else if (output.includes("Creating API")) {
          console.log(" " + output.trim());
        } else if (output.includes("All done")) {
          console.log(" " + output.trim());
        } else {
          console.log("   " + output.trim());
        }
      });

      agent.stderr.on("data", (data: Buffer) => {
        console.error(" " + data.toString().trim());
      });

      agent.on("close", (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Agent exited with code ${code}`));
        }
      });
    });
  }

  private async verifyResults(): Promise<void> {
    // Check if API route was created
    const apiPath = pathCli.join("app", "api", "recently-played", "route.ts");
    if (fsCli.existsSync(apiPath)) {
      console.log("API route created successfully");
    }

    // Check if table exists in database
    try {
      const { execSync } = require("child_process");
      execSync("npx drizzle-kit push", { stdio: "pipe" });
      console.log("Database schema is up to date");
    } catch (error) {
      console.log("Database verification failed");
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the CLI
const cli = new OrchidsCLI();
cli.start().catch(console.error); 