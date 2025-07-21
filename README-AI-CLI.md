# 🤖 Orchids AI Database Agent CLI

A powerful CLI tool that uses OpenAI GPT-4 to automatically generate database schemas, API routes, and frontend components based on natural language descriptions.

## 🚀 Features

- **AI-Powered Analysis**: Uses OpenAI GPT-4 to understand your requirements
- **Dynamic Schema Generation**: Creates database tables and relationships automatically
- **API Route Generation**: Generates REST API endpoints with CRUD operations
- **Frontend Component Generation**: Creates React components for your data
- **Database Migrations**: Automatically runs Drizzle migrations
- **TypeScript Support**: Full TypeScript support with proper type generation

## 📋 Prerequisites

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Node.js & npm**: Make sure you have Node.js installed
3. **Database**: PostgreSQL database (configured in your project)

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install openai --legacy-peer-deps
   ```

2. **Configure Environment**:
   Create or update `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_database_url_here
   ```

3. **Run the AI CLI**:
   ```bash
   npx ts-node orchids-ai-cli.ts
   ```

## 💡 Usage Examples

### Example 1: Blog System
```
What would you like me to build? Create a blog with posts, comments, and user profiles
```

This will generate:
- `users` table with profile fields
- `posts` table with content and author relationship
- `comments` table with post and user relationships
- API routes: `/api/users`, `/api/posts`, `/api/comments`
- React components: `UserList`, `PostList`, `CommentList`

### Example 2: E-commerce Store
```
What would you like me to build? Build an e-commerce store with products, orders, and inventory
```

This will generate:
- `products` table with name, price, description
- `orders` table with customer and order details
- `order_items` table for order-product relationships
- `inventory` table for stock management
- Full CRUD API endpoints
- Frontend components for all entities

### Example 3: Task Management
```
What would you like me to build? Make a task management app with projects, tasks, and team members
```

This will generate:
- `projects` table
- `tasks` table with project relationships
- `team_members` table
- `project_members` junction table
- Complete API and frontend components

## 🔧 How It Works

1. **Query Analysis**: Your natural language query is analyzed by GPT-4
2. **Schema Planning**: AI generates a comprehensive database schema plan
3. **Code Generation**: Automatically creates:
   - Database schema definitions
   - API route handlers
   - React components
   - TypeScript interfaces
4. **Migration**: Runs database migrations to create tables
5. **Verification**: Checks that all components were created successfully

## 📁 Generated Files

The CLI creates the following structure:

```
db/
  schema.ts          # Database schema definitions

app/api/
  [entity]/          # API routes for each entity
    route.ts         # CRUD operations

src/components/
  [Entity]List.tsx   # React components for each entity
```

## 🎯 Supported Query Types

- **Entity Creation**: "Create a [entity] system"
- **Relationship Management**: "Build a [system] with [entities] and [relationships]"
- **Business Logic**: "Make a [business] app with [features]"
- **Complex Systems**: Multi-entity systems with relationships

## 🚨 Important Notes

- **API Key Required**: You must have a valid OpenAI API key
- **Database Setup**: Ensure your database is properly configured
- **Cost Management**: Each query uses OpenAI API credits
- **Validation**: Always review generated code before production use

## 🔄 Updating Existing Systems

The CLI can add new tables and components to existing systems. It will:
- Append new schema definitions to existing `schema.ts`
- Create new API routes without affecting existing ones
- Generate new components alongside existing ones

## 🆘 Troubleshooting

- **API Key Error**: Make sure your OpenAI API key is set in `.env.local`
- **Database Errors**: Check your database connection and permissions
- **Migration Failures**: Ensure Drizzle is properly configured
- **Component Errors**: Check that all required dependencies are installed

## 🎉 Ready to Build!

Start the CLI and describe what you want to build in natural language. The AI will handle the rest!

```bash
npx ts-node orchids-ai-cli.ts
``` 