# Database Migrations

## Folder Structure
```
database/
  migrations/
    001_create_categories.sql
    002_add_video_url.sql
    003_add_delivery_and_contact.sql
    004_add_product_columns.sql
    005_add_is_active_to_products.sql
    006_your_next_change.sql        ← next migration goes here
```

## How to Create a New Migration

1. **Create a new file** with the next number:
   ```
   database/migrations/006_describe_change.sql
   ```

2. **Write safe SQL** — use `IF NOT EXISTS` or the check pattern:
   ```sql
   -- For new tables
   CREATE TABLE IF NOT EXISTS my_table (...);

   -- For new columns (safe add)
   SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = DATABASE() AND table_name = 'my_table' AND column_name = 'my_column');
   SET @sql := IF(@exist = 0, 'ALTER TABLE my_table ADD COLUMN my_column VARCHAR(255)', 'SELECT 1');
   PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
   ```

3. **Commit & push** to GitHub

## Deployment Workflow

```
Local Dev → Git Push → Server Pull → Run SQL
```

1. ✅ Make and test changes locally
2. ✅ Create migration `.sql` file
3. ✅ `git push` to GitHub
4. ✅ `git pull` on the server
5. ✅ Run the new migration SQL in **phpMyAdmin** (Import tab → select the file)

## Rules
- **Never edit** an old migration that has already been run on the server
- **Always add new** migration files for new changes
- **Number sequentially** — `006`, `007`, `008`...
- **One concern per file** — don't mix unrelated changes
- All migrations are **idempotent** (safe to run multiple times)

## Auto-Generate Migration (Recommended)

Instead of writing SQL manually, run:
```bash
npm run db:diff
```

This will:
1. Connect to the database (using `DATABASE_URL` from `.env`)
2. Compare the live schema against `database/schema.sql`
3. Auto-generate the next numbered migration file (e.g., `006_auto_sync_20260306.sql`)

**Important:** Always keep `schema.sql` up to date as the source of truth. When you add a new table or column, add it to `schema.sql` first, then run `npm run db:diff`.
