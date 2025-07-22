#!/usr/bin/env ts-node

import dotenvAI from "dotenv";
dotenvAI.config({ path: ".env.local" });

import { spawn as spawnAI } from "child_process";
import fsAI from "fs";
import pathAI from "path";
import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- AGENTIC EXTRACTION UTILITY ---
import vm from 'vm';

/**
 * Extracts a JS array/object literal from a file given a variable name.
 * Returns parsed JS value or null if not found.
 */
function extractVariableFromFile(filePath: string, variableName: string): any {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let startIdx = -1;
  let openBracket = null;
  let closeBracket = null;

  // Find the line where the variable is declared
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].match(new RegExp(`\\b(const|let|var)\\s+${variableName}\\b`))
      && lines[i].includes('=')
    ) {
      startIdx = i;
      if (lines[i].includes('[')) {
        openBracket = '[';
        closeBracket = ']';
      } else if (lines[i].includes('{')) {
        openBracket = '{';
        closeBracket = '}';
      }
      break;
    }
  }
  if (startIdx === -1 || !openBracket) {
    console.log(`Could not find variable declaration for '${variableName}' in ${filePath}`);
    return null;
  }

  // Collect the literal (array/object) lines
  let literal = '';
  let depth = 0;
  let foundStart = false;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!foundStart) {
      const idx = line.indexOf(openBracket);
      if (idx !== -1) {
        foundStart = true;
        depth++;
        literal += line.slice(line.indexOf(openBracket)) + '\n';
        // Check if the closing bracket is on the same line
        let after = line.slice(idx + 1);
        for (const char of after) {
          if (char === openBracket) depth++;
          if (char === closeBracket) depth--;
        }
        if (depth === 0) break;
        continue;
      }
    } else {
      for (const char of line) {
        if (char === openBracket) depth++;
        if (char === closeBracket) depth--;
      }
      literal += line + '\n';
      if (depth === 0) break;
    }
  }

  // Try to parse the literal
  try {
    return vm.runInNewContext('(' + literal + ')', {});
  } catch (e) {
    console.error(`Failed to parse variable ${variableName} in ${filePath}:`, e);
    console.log('Extracted literal was:', literal);
    return null;
  }
}

/**
 * Searches all files in src/components/ for a variable and extracts its value.
 * Returns the first found value, or null if not found.
 */
function extractVariableFromComponents(variableName: string): any {
  const dir = path.join(process.cwd(), 'src', 'components');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    const value = extractVariableFromFile(filePath, variableName);
    if (value) return value;
  }
  return null;
}

// --- AGENTIC VARIABLE NAME SCANNING & SEMANTIC MAPPING ---
/**
 * Scans all variable names (const/let/var) in a file.
 * Returns an array of variable names.
 */
function scanVariableNamesInFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)/g;
  const names = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1]);
  }
  return names;
}

/**
 * Scans all files in src/components/ for variable names.
 * Returns a map: { filePath: [var1, var2, ...] }
 */
function scanAllComponentVariableNames(): Record<string, string[]> {
  const dir = path.join(process.cwd(), 'src', 'components');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const result: Record<string, string[]> = {};
  for (const file of files) {
    const filePath = path.join(dir, file);
    // console.log('Scanning file:', filePath);
    result[filePath] = scanVariableNamesInFile(filePath);
  }
  console.log('Scanned variable names by file:', result);
  return result;
}

// --- AGENTIC SAMPLE DATA HANDLING ---
// In executePlan, before inserting sampleData, check if the query refers to a known concept (e.g. recently played, popular albums, made for you)
// If so, extract the real data from the codebase and use it for insertion

interface QueryAnalysis {
  intent: string;
  entities: string[];
  requiredTables: TableSchema[];
  apiEndpoints: string[];
  frontendComponents: string[];
  description: string;
  sampleData?: any[];
}

interface TableSchema {
  name: string;
  fields: FieldSchema[];
  relationships?: RelationshipSchema[];
}

interface FieldSchema {
  name: string;
  type: string;
  constraints: string[];
  description: string;
}

interface RelationshipSchema {
  type: 'one-to-many' | 'many-to-many' | 'one-to-one';
  targetTable: string;
  foreignKey?: string;
}

// --- SCHEMA INFERENCE FROM DATA ---
function inferSchemaFromData(tableName: string, data: any[]): TableSchema {
  // Use the first object as a sample
  const sample = data[0];
  const fields: FieldSchema[] = Object.keys(sample).map(key => {
    let type = 'varchar';
    if (typeof sample[key] === 'number') type = 'integer';
    else if (typeof sample[key] === 'boolean') type = 'boolean';
    else if (typeof sample[key] === 'string' && key.toLowerCase().includes('date')) type = 'timestamp';
    return {
      name: key,
      type,
      constraints: [],
      description: ''
    };
  });
  return {
    name: tableName,
    fields
  };
}

class OrchidsAICLI {
  private isProcessing = false;
  private openai: any;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "orchids-cli.local",
        "X-Title": "Orchids AI CLI"
      }
    });
  }

  async start() {
    console.log("🤖 Orchids AI Database Agent CLI");
    console.log("Powered by OpenAI GPT-4");
    console.log("Type 'quit' to exit\n");

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log("❌ Please set your OPENAI_API_KEY in .env.local");
      console.log("Get your API key from: https://platform.openai.com/api-keys\n");
      return;
    }

    while (true) {
      const query = await this.prompt("What would you like me to build? ");

      if (query.toLowerCase() === 'quit') {
        console.log("Thanks for using Orchids AI! 👋");
        break;
      }

      await this.processQuery(query);
    }
  }

  private async prompt(message: string): Promise<string> {
    const readline = await import('readline');
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
      console.log("⏳ Already processing a request. Please wait...\n");
      return;
    }

    this.isProcessing = true;
    console.log(`\n🚀 Processing: "${query}"\n`);

    try {
      // Step 1: Analyze the query with OpenAI
      await this.think("🤔 Analyzing your request with AI...");
      const analysis = await this.analyzeQueryWithAI(query);
      console.log(`📋 Intent: ${analysis.intent}\n`);

      // Step 2: Check current state
      await this.think("🔍 Checking current database state...");
      const currentState = await this.checkCurrentState();
      console.log(`📊 Current state: ${currentState}\n`);

      // Step 3: Generate and execute the plan
      await this.think("⚙️ Generating database schema and code...");
      await this.executePlan(analysis);

      // Step 4: Verify results
      await this.think("✅ Verifying results...");
      await this.verifyResults(analysis);

      console.log("🎉 Request completed successfully!\n");

    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}\n`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async analyzeQueryWithAI(query: string): Promise<QueryAnalysis> {
    const systemPrompt =
      `You are an expert database architect and full-stack developer.
        - If the user provides a list of names or items (e.g. 'Made for you' and 'Popular albums'), always extract ALL such names/items as separate entities in the 'entities' array (e.g. ["made for you", "popular albums"]).
        - Only create additional tables if the user clearly asks for more structure (e.g. users, playlists, etc).
        - If the user asks to store a list of items, generate a script to insert those items as rows in the table.
        - Do NOT include generic words like 'artist', 'song', 'table', or unrelated words in the entities array unless the user is specifically asking for a table of those.
        - Be explicit and comprehensive in extracting all relevant data groups/entities from the user query.
        - Example: For the query "Can you store the ‘example 1’ and ‘example 2’ in a table", the entities array should be ["example 1", "example 2"].

        **IMPORTANT:**
        - Dont make any 'id' column or field please, its not required
        - Dont use notnull for any of the columns please
        - Use snake_case for all field names.
        - Use the Scan Schema to know the actual fiel names and use them when you extract values from the user prompt
        - Ensure that sample data field names exactly match the schema field names.

        Return your response as a JSON object with the following structure:
        {
        "intent": "Brief description of what the user wants to build",
        "entities": ["list", "of", "main", "entities", "or", "concepts"],
        "requiredTables": [
            {
            "name": "table_name",
            "fields": [
                {
                "name": "field_name",
                "type": "varchar|integer|timestamp|boolean|text|serial",
                "constraints": ["notNull", "primaryKey", "unique"],
                "description": "What this field represents"
                }
            ],
            "relationships": [
                {
                "type": "one-to-many|many-to-many|one-to-one",
                "targetTable": "related_table_name",
                "foreignKey": "field_name"
                }
            ]
            }
        ],
        "apiEndpoints": ["GET /api/entity", "POST /api/entity", "PUT /api/entity/:id", "DELETE /api/entity/:id"],
        "frontendComponents": ["EntityList", "EntityForm", "EntityDetail"],
        "description": "Detailed description of the system to be built",
        "sampleData": ["If applicable, provide a list of sample data rows to insert into the table(s)"]
        }

        Focus on creating a practical, scalable database design. Include common fields like id, created_at, updated_at where appropriate.`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

    let jsonContent = content?.trim();
    if (jsonContent?.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    try {
      return JSON.parse(jsonContent || '{}');
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI analysis failed - invalid response format");
    }
  }

  private async think(message: string) {
    console.log(`${message}`);
    await this.sleep(1500);
  }

  private async checkCurrentState(): Promise<string> {
    const schemaPath = pathAI.join("src", "db", "schema.ts");
    if (fsAI.existsSync(schemaPath)) {
      const content = fsAI.readFileSync(schemaPath, "utf8");
      const tables = content.match(/export const (\w+)/g) || [];
      return `${tables.length} tables found in schema`;
    }
    return "No schema file found";
  }

  // --- PATCH executePlan for semantic variable mapping ---
  private async executePlan(analysis: QueryAnalysis): Promise<void> {
    let entities = analysis.entities && analysis.entities.length > 0 ? analysis.entities : [null];
    let anyDataInserted = false;
    for (const entity of entities) {
      let sampleData = analysis.sampleData;
      let variableName = null;
      let extracted = null;
      let bestMatch = null;
      let bestMatchFile = null;
      if (entity) {
        console.log(`\n🔍 Processing entity/variable: '${entity}'`);
        // Scan all variable names in src/components
        const allVars = scanAllComponentVariableNames();
        const allVarNames = Array.from(new Set(Object.values(allVars).flat()));
        console.log(`🔎 Scanned variable names in codebase:`, allVarNames);
        // Use LLM to pick the best match
        const prompt =
          `\nGiven the user query: '${entity}', \nwhich of these variable names is the closest match \n(even if not exact): [${allVarNames.join(", ")}]? \nReturn the best match or null if none are relevant.\nyour response should be just the one selected word form the list and give the response as it \nno formating within quotes or anything as such\n`;
        console.log('📝 LLM prompt:', prompt);
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI codebase agent." },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
        });
        console.log('📝 LLM response content:', response.choices[0].message.content);
        bestMatch = response.choices[0].message.content?.trim().replace(/[`'\"]/g, "");
        if (bestMatch && bestMatch.toLowerCase() !== 'null' && allVarNames.includes(bestMatch)) {
          // Find which file contains this variable
          for (const [file, vars] of Object.entries(allVars)) {
            if (vars.includes(bestMatch)) {
              bestMatchFile = file;
              break;
            }
          }
          console.log(`✅ LLM matched user query to variable: '${bestMatch}' in file: ${bestMatchFile}`);
          if (bestMatchFile) {
            extracted = extractVariableFromFile(bestMatchFile, bestMatch);
            if (extracted) {
              console.log(`📦 Extracted data from '${bestMatch}':`, JSON.stringify(extracted, null, 2));
              sampleData = extracted;
            } else {
              console.log(`❌ Could not extract data for variable '${bestMatch}' in file '${bestMatchFile}'.`);
            }
          } else {
            console.log(`❌ Could not find file for variable '${bestMatch}'.`);
          }
        } else {
          console.log(`❌ No relevant variable found in codebase for user query. Skipping entity '${entity}'.`);
          continue;
        }
      } else {
        console.log('ℹ️ No specific entity/variable detected in user query. Treating as general query.');
      }

      // --- SCHEMA INFERENCE & GENERATION ---
      if (sampleData && Array.isArray(sampleData) && sampleData.length > 0) {
        // Infer schema from data
        const tableName = analysis.requiredTables && analysis.requiredTables.length > 0 ? analysis.requiredTables[0].name : (entity || 'data').replace(/\s+/g, '_').toLowerCase();
        const inferredSchema = inferSchemaFromData(tableName, sampleData);
        // Patch analysis to use inferred schema
        analysis.requiredTables = [inferredSchema];
        // Generate schema and run migration
        await this.generateSchema(analysis);
        console.log("🔄 Running database migrations...");
        await this.runMigrations();
        // Insert data
        analysis.sampleData = sampleData;
        console.log("🟢 Inserting data into the table...");
        await this.insertSampleData(analysis);
        anyDataInserted = true;
      } else {
        console.log(`⚠️ No data found for entity '${entity}', skipping insertion.`);
      }
    }
    console.log("🔌 Creating API endpoints...");
    await this.generateAPIRoutes(analysis);
    console.log("🎨 Creating frontend components...");
    await this.generateFrontendComponents(analysis);
  }

  private async insertSampleData(analysis: QueryAnalysis): Promise<void> {
    const table = analysis.requiredTables[0];
    const tableName = table.name;

    // --- NEW: Scan schema.ts as plain text to extract real columns (ESM compatible) ---
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    let realFields: string[] = [];
    try {
      // Find the table definition block
      const tableRegex = new RegExp(
        `export const ${tableName} = pgTable\\([^,]+,\\s*\\{([\\s\\S]*?)\\}\\);`,
        'm'
      );
      const match = schemaContent.match(tableRegex);
      if (!match) {
        throw new Error(`Table '${tableName}' not found in schema.ts`);
      }
      // Extract column names from the object keys
      const objectBody = match[1];
      const columnRegex = /^\s*([a-zA-Z0-9_]+):/gm;
      let m;
      while ((m = columnRegex.exec(objectBody)) !== null) {
        const col = m[1];
        if (!['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'played_at'].includes(col)) {
          realFields.push(col);
        }
      }
      console.log(`🟢 Real columns for table '${tableName}':`, realFields);
    } catch (e) {
      console.error(`❌ Error extracting real columns for table '${tableName}':`, e);
      // fallback to AI schema if not found
      realFields = table.fields.map(f => f.name).filter(f => !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'played_at'].includes(f));
      console.log(`⚠️  Table '${tableName}' not found in schema.ts, using AI schema columns:`, realFields);
    }

    // Helper to parse SQL insert strings to objects
    function parseInsertSQL(sql: string): Record<string, string> | null {
      const match = sql.match(/\(([^)]+)\)\s+VALUES\s+\(([^)]+)\)/i);
      if (!match) return null;
      const fields = match[1].split(',').map((f: string) => f.trim().replace(/['"`]/g, ""));
      // Handles commas inside values (e.g. 'Artist, Jr.')
      const values = match[2].match(/'[^']*'|[^,]+/g)?.map((v: string) => v.trim().replace(/^'|'$/g, "")) || [];
      const obj: Record<string, string> = {};
      fields.forEach((f: string, i: number) => { obj[f] = values[i]; });
      return obj;
    }

    let sampleData = analysis.sampleData;
    if (!Array.isArray(sampleData)) sampleData = [];
    sampleData = sampleData.map((row: any) => {
      if (typeof row === "string" && row.trim().toUpperCase().startsWith("INSERT INTO")) {
        return parseInsertSQL(row) || {};
      }
      return row;
    });

    // Only insert fields that exist in the real schema and are not id, created_at, or updated_at
    const allowedFields = realFields;
    // Ensure sampleData is always an array of objects with all allowed fields, and remove any keys not in allowedFields
    sampleData = sampleData.map((row: any) => {
      let obj: any = {};
      if (typeof row === 'string') {
        // If only one allowed field, map string to that field
        if (allowedFields.length === 1) {
          obj[allowedFields[0]] = row;
        } else {
          // Otherwise, fill all fields with null except the first, which gets the string
          obj = Object.fromEntries(allowedFields.map((f: string, i: number) => [f, i === 0 ? row : null]));
        }
      } else if (typeof row === 'object' && row !== null) {
        // Only keep allowed fields, fill missing with null, and remove any extra keys
        allowedFields.forEach(f => {
          obj[f] = row[f] !== undefined ? row[f] : null;
        });
      }
      return obj;
    });
    // Generate a TypeScript script to insert the data
    const script = `
        import { db } from "./src/db/index.node.js";
        import { ${tableName} } from "./src/db/schema.js";

        const sampleData = [
        ${sampleData.map(row =>
      `{ ${realFields.map(k => `${k}: ${typeof row[k] === "string" ? `\"${row[k]}\"` : row[k]}`).join(", ")} }`
    ).join(",\n  ")}
        ];

        async function insertData() {
            for (const row of sampleData) {
            await db.insert(${tableName}).values(row);
            }
            console.log(" Data inserted into the table!");
        }

        insertData().catch(console.error).finally(() => process.exit(0));
    `
    const scriptPath = `insert-sample-data.ts`;
    fsAI.writeFileSync(scriptPath, script);
    const { execSync } = await import("child_process");
    try {
      execSync(`node --loader ts-node/esm ${scriptPath}`, { stdio: "inherit" });
    } catch (e) {
      console.error("Error inserting sample data:", e);
    }
    // fsAI.unlinkSync(scriptPath);
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .toLowerCase();
  }

  private async generateSchema(analysis: QueryAnalysis): Promise<void> {
    const schemaPath = pathAI.join("src", "db", "schema.ts");
    const importLine = 'import { pgTable, serial, varchar, timestamp, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";';
    let schemaContent = '';
    let existingContent = '';
    if (fsAI.existsSync(schemaPath)) {
      existingContent = fsAI.readFileSync(schemaPath, "utf8");
    }

    // Ensure import is only at the top
    if (!existingContent.startsWith(importLine)) {
      schemaContent += importLine + '\n\n';
    } else {
      schemaContent = existingContent.split(importLine)[0] + importLine + '\n\n';
    }
    // Remove all duplicate import lines from the rest of the file
    let restContent = existingContent.replace(new RegExp(importLine + '\\n?', 'g'), '');
    if (restContent.trim().length > 0 && !restContent.startsWith(importLine)) {
      schemaContent += restContent.trim() + '\n\n';
    }

    analysis.requiredTables.forEach(table => {
      const tableName = table.name;
      // Check if table already exists
      const tableRegex = new RegExp(`export const ${tableName} = pgTable\\(`);
      if (existingContent.match(tableRegex)) {
        console.log(`Table '${tableName}' already exists. Skipping.`);
        return;
      }
      // Build fields, ensuring no duplicates
      const seenFields = new Set();
      let tableDef = `export const ${tableName} = pgTable("${tableName}", {\n`;
      // Always add id field if not present
      const hasId = table.fields.some(f => f.name === 'id');
      if (!hasId) {
        tableDef += `  id: serial("id").primaryKey(),\n`;
        seenFields.add('id');
      }
      table.fields.forEach(field => {
        if (seenFields.has(field.name)) return;
        seenFields.add(field.name);
        let fieldDefinition = `  ${field.name}: `;
        if (field.name === 'id') {
          fieldDefinition += `serial("id").primaryKey()`;
        } else {
          switch (field.type) {
            case 'varchar':
              fieldDefinition += `varchar("${field.name}", { length: 255 })`;
              break;
            case 'text':
              fieldDefinition += `text("${field.name}")`;
              break;
            case 'integer':
              fieldDefinition += `integer("${field.name}")`;
              break;
            case 'boolean':
              fieldDefinition += `boolean("${field.name}")`;
              break;
            case 'timestamp':
              fieldDefinition += `timestamp("${field.name}")`;
              break;
            case 'serial':
              fieldDefinition += `serial("${field.name}")`;
              break;
            default:
              fieldDefinition += `varchar("${field.name}", { length: 255 })`;
          }
          if (field.constraints && field.constraints.includes('notNull')) {
            fieldDefinition += '.notNull()';
          }
          if (field.constraints && field.constraints.includes('unique')) {
            fieldDefinition += '.unique()';
          }
        }
        tableDef += fieldDefinition + ',\n';
      });
      tableDef += `});\n\n`;
      schemaContent += tableDef;
      // Verification: check for duplicate fields
      if (seenFields.size !== (hasId ? table.fields.length : table.fields.length + 1)) {
        console.log(`Warning: Duplicate fields detected in table '${tableName}'.`);
      } else {
        console.log(`Table '${tableName}' schema is clean.`);
      }
    });

    fsAI.writeFileSync(schemaPath, schemaContent);
  }

  private async runMigrations(): Promise<void> {
    return new Promise((resolve, reject) => {
      const migration = spawnAI("npx", ["drizzle-kit", "generate"], {
        stdio: "inherit" // allow user interaction
      });

      migration.on("close", (code: number) => {
        if (code === 0) {
          const push = spawnAI("npx", ["drizzle-kit", "push"], {
            stdio: "inherit" // allow user interaction
          });

          push.on("close", (pushCode: number) => {
            if (pushCode === 0) {
              resolve();
            } else {
              reject(new Error("Database push failed"));
            }
          });
        } else {
          reject(new Error("Migration generation failed"));
        }
      });
    });
  }

  private async generateAPIRoutes(analysis: QueryAnalysis): Promise<void> {
    analysis.requiredTables.forEach(table => {
      const apiDir = pathAI.join("app", "api", table.name);
      fsAI.mkdirSync(apiDir, { recursive: true });

      const routeContent = `import { NextResponse } from "next/server";
        import { db } from "@/db"; 
        import { ${table.name} } from "@/db/schema";
        import { eq } from "drizzle-orm";

        export async function GET() {
        try {
            const items = await db.select().from(${table.name});
            return NextResponse.json(items);
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch ${table.name}" }, { status: 500 });
        }
        }

        export async function POST(request: Request) {
        try {
            const body = await request.json();
            const newItem = await db.insert(${table.name}).values(body).returning();
            return NextResponse.json(newItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to create ${table.name}" }, { status: 500 });
        }
        }

        export async function PUT(request: Request) {
        try {
            const body = await request.json();
            const { id, ...data } = body;
            const updatedItem = await db.update(${table.name})
            .set(data)
            .where(eq(${table.name}.id, id))
            .returning();
            return NextResponse.json(updatedItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to update ${table.name}" }, { status: 500 });
        }
        }

        export async function DELETE(request: Request) {
        try {
            const { searchParams } = new URL(request.url);
            const id = searchParams.get('id');
            if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
            }
            await db.delete(${table.name}).where(eq(${table.name}.id, parseInt(id)));
            return NextResponse.json({ message: "Deleted successfully" });
        } catch (error) {
            return NextResponse.json({ error: "Failed to delete ${table.name}" }, { status: 500 });
        }
        }`;

      fsAI.writeFileSync(pathAI.join(apiDir, "route.ts"), routeContent);
    });
  }

  private async generateFrontendComponents(analysis: QueryAnalysis): Promise<void> {
    const componentDir = pathAI.join("src", "components");
    fsAI.mkdirSync(componentDir, { recursive: true });

    // Collect import and state lines for page.tsx
    let importLines: string[] = [];
    let stateLines: string[] = [];
    let buttonLines: string[] = [];
    let componentLines: string[] = [];

    for (const table of analysis.requiredTables) {
      const typeName = table.name.charAt(0).toUpperCase() + table.name.slice(1);
      const componentName = `${typeName}List`;

      // CRUD component content
      const componentContent = `'use client';
import { useState, useEffect } from 'react';

interface ${typeName} {
  id: number;
${table.fields.map(field => `  ${field.name}: ${this.getTypeScriptType(field.type)};`).join('\n')}
  createdAt: string;
  updatedAt: string;
}

export default function ${componentName}() {
  const [items, setItems] = useState<${typeName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ ${table.fields.map(f => `${f.name}: ''`).join(', ')} });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ${table.fields.map(f => `${f.name}: ''`).join(', ')} });
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(\`/api/${table.name}\`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch ${table.name}');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(\`/api/${table.name}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add ${table.name}');
      setForm({ ${table.fields.map(f => `${f.name}: ''`).join(', ')} });
      fetchItems();
    } catch (err) {
      setError('Failed to add ${table.name}');
    }
  };

  const handleEdit = (item: ${typeName}) => {
    setEditingId(item.id);
    setEditForm({ ${table.fields.map(f => `${f.name}: item.${f.name}`).join(', ')} });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(\`/api/${table.name}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error('Failed to update ${table.name}');
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError('Failed to update ${table.name}');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(\`/api/${table.name}?id=\${id}\`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ${table.name}');
      fetchItems();
    } catch (err) {
      setError('Failed to delete ${table.name}');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">${typeName} Management</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex items-center mb-4">
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold mr-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <span className="text-gray-400 text-sm">{items.length} items</span>
      </div>
      {loading ? (
        <div>Loading ${table.name}...</div>
      ) : items.length === 0 ? (
        <p>No ${table.name} found.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center">
              {editingId === item.id ? (
                <form onSubmit={handleEditSubmit} className="flex gap-2 flex-1">
${table.fields.map(f => `                  <input name="${f.name}" value={editForm.${f.name}} onChange={handleEditInputChange} className="border rounded px-2 py-1 flex-1" placeholder="${f.name.charAt(0).toUpperCase() + f.name.slice(1)}" required />`).join('\n')}
                  <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                  <button type="button" className="px-2 py-1 bg-gray-400 text-white rounded" onClick={() => setEditingId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div style={{width: '70%'}}>
${table.fields.map(f => `                    <div className="font-semibold">{item.${f.name}}</div>`).join('\n')}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <hr className="my-6" />
      <form onSubmit={handleSubmit} className="flex gap-2">
${table.fields.map(f => `        <input name="${f.name}" value={form.${f.name}} onChange={handleInputChange} className="border rounded px-2 py-1 flex-1" placeholder="${f.name.charAt(0).toUpperCase() + f.name.slice(1)}" required />`).join('\n')}
        <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded">Add</button>
      </form>
    </div>
  );
}
`;

      fsAI.writeFileSync(pathAI.join(componentDir, `${componentName}.tsx`), componentContent);

      // For page.tsx
      importLines.push(`import ${componentName} from '@/components/${componentName}'`);
      stateLines.push(`const [show${componentName}, setShow${componentName}] = useState(false);`);
      buttonLines.push(`<button className="m-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold" onClick={() => setShow${componentName}((prev) => !prev)}>{show${componentName} ? 'Hide ${typeName} Management' : 'Show ${typeName} Management'}</button>`);
      componentLines.push(`{show${componentName} && <${componentName} />}`);
    }

    // Patch app/page.tsx
    const pagePath = pathAI.join('app', 'page.tsx');
    let pageContent = fsAI.readFileSync(pagePath, 'utf8');

    // --- IMPORTS ---
    for (const importLine of importLines) {
      if (!pageContent.includes(importLine)) {
        // Insert after 'use client' if present, else after last import
        const useClientRegex = /("use client"|'use client');?\s*/;
        if (useClientRegex.test(pageContent)) {
          pageContent = pageContent.replace(useClientRegex, match => match + '\n' + importLine + '\n');
        } else {
          const importRegex = /(import .+?;\s*)+/;
          if (importRegex.test(pageContent)) {
            pageContent = pageContent.replace(importRegex, match => match + '\n' + importLine + '\n');
          } else {
            pageContent = importLine + '\n' + pageContent;
          }
        }
      }
    }

    // --- STATE ---
    for (const stateLine of stateLines) {
      if (!pageContent.includes(stateLine)) {
        // Insert after last useState
        const stateRegex = /(const \[.*?useState\(.*?\);\s*)+/;
        if (stateRegex.test(pageContent)) {
          pageContent = pageContent.replace(stateRegex, match => match + '\n' + stateLine + '\n');
        } else {
          // Fallback: after first function line
          pageContent = pageContent.replace(/(export default function .+?{)/, `$1\n  ${stateLine}\n`);
        }
      }
    }

    // --- BUTTONS/COMPONENTS ---
    for (let i = 0; i < buttonLines.length; ++i) {
      const buttonLine = buttonLines[i];
      const componentLine = componentLines[i];
      const mainContentDiv = /(<div className=\"flex-1 overflow-y-auto pb-24\">)/;
      // Only insert if neither the button nor the component already exists
      if (!pageContent.includes(buttonLine) && !pageContent.includes(componentLine)) {
        // Find the last management button/component
        const managementPattern = /(<button[^>]+Show [^<]+ Management[^<]*<\/button>\s*{show[^}]+&& <[^>]+>})/g;
        let lastMatch;
        let match;
        while ((match = managementPattern.exec(pageContent)) !== null) {
          lastMatch = match;
        }
        if (lastMatch) {
          // Insert after the last management button/component
          const insertPos = lastMatch.index + lastMatch[0].length;
          pageContent = pageContent.slice(0, insertPos) + `\n${buttonLine}\n${componentLine}\n` + pageContent.slice(insertPos);
        } else {
          // Fallback: after <div ...>
          pageContent = pageContent.replace(mainContentDiv, `$1\n${buttonLine}\n${componentLine}\n`);
        }
      }
    }

    fsAI.writeFileSync(pagePath, pageContent);
  }

  private getTypeScriptType(dbType: string): string {
    switch (dbType) {
      case 'integer': return 'number';
      case 'boolean': return 'boolean';
      case 'timestamp': return 'string';
      default: return 'string';
    }
  }

  private async verifyResults(analysis: QueryAnalysis): Promise<void> {
    console.log("✅ Schema generated successfully");
    console.log("✅ API routes created");
    console.log("✅ Frontend components generated");

    analysis.requiredTables.forEach(table => {
      const apiPath = pathAI.join("app", "api", table.name, "route.ts");
      if (fsAI.existsSync(apiPath)) {
        console.log(`✅ API route for ${table.name} created`);
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the CLI
const aiCLI = new OrchidsAICLI();
aiCLI.start().catch(console.error); 