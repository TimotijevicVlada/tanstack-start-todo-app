# Database Setup Guide

## Step-by-Step Instructions to Connect PostgreSQL Database

### Step 1: Start PostgreSQL with Docker

1. Make sure Docker Desktop is running on your computer
2. Open a terminal in your project directory
3. Run this command to start PostgreSQL:

```bash
docker-compose up -d
```

This will:

- Download the PostgreSQL 16 image (if not already downloaded)
- Start a PostgreSQL container named `test-app-postgres`
- Create a database named `testapp`
- Expose PostgreSQL on port 5432

**To verify it's running:**

```bash
docker ps
```

You should see a container named `test-app-postgres` running.

### Step 2: Create Environment File

1. Create a file named `.env` in the root of your project (same folder as `package.json`)
2. Add this line to the file:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testapp
```

**Note:** The format is: `postgresql://username:password@host:port/database`

### Step 3: Generate Database Migrations

Run this command to generate migration files based on your schema:

```bash
npm run db:generate
```

This will create migration files in the `./drizzle` folder.

### Step 4: Apply Migrations to Database

Run this command to create the tables in your database:

```bash
npm run db:migrate
```

This will execute the migrations and create the `todos` table in your database.

### Step 5: Verify Connection (Optional)

You can use Drizzle Studio to visually see your database:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:4983` where you can view and edit your database.

### Step 6: Test Your Application

1. Start your development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:3000/demo/drizzle` in your browser
3. Try adding a todo - if it works, your database is connected! 🎉

---

## Useful Commands

- **Start database:** `docker-compose up -d`
- **Stop database:** `docker-compose down`
- **View database logs:** `docker-compose logs postgres`
- **Stop and remove database (deletes data):** `docker-compose down -v`
- **Generate migrations:** `npm run db:generate`
- **Apply migrations:** `npm run db:migrate`
- **Push schema changes (alternative to migrations):** `npm run db:push`
- **Open Drizzle Studio:** `npm run db:studio`

---

## Troubleshooting

**Problem:** Can't connect to database

- Make sure Docker Desktop is running
- Check if the container is running: `docker ps`
- Verify the DATABASE_URL in your `.env` file matches the docker-compose settings

**Problem:** Port 5432 already in use

- Another PostgreSQL instance might be running
- Change the port in `docker-compose.yml` (e.g., `"5433:5432"`) and update `.env` accordingly

**Problem:** Migration errors

- Make sure the database container is running
- Check that your `.env` file exists and has the correct DATABASE_URL
