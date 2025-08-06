# Database Migration Guide

## Lipsync Presets Migration

To fix the 400 Bad Request error when saving lipsync presets, you need to run the database migration to add the `voice_name` column.

### Option 1: Run Migration via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `lipsync_presets_migration.sql`
4. Execute the migration

### Option 2: Run Migration via Command Line

If you have access to the database via psql:

```bash
psql -h your-db-host -U your-username -d your-database -f database/lipsync_presets_migration.sql
```

### Option 3: Manual Migration

Run these SQL commands in your database:

```sql
-- Add voice_name column to existing lipsync_presets table
ALTER TABLE lipsync_presets 
ADD COLUMN IF NOT EXISTS voice_name TEXT;

-- Add index for voice_name column
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_voice_name ON lipsync_presets(voice_name);

-- Add comment for the new column
COMMENT ON COLUMN lipsync_presets.voice_name IS 'Name of the selected voice (for ElevenLabs voices when upload_flag is false)';
```

### Verification

After running the migration, you can verify it worked by running:

```sql
-- Check if the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lipsync_presets' AND column_name = 'voice_name';

-- Check if the index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'lipsync_presets' AND indexname = 'idx_lipsync_presets_voice_name';
```

### Troubleshooting

If you still get a 400 error after running the migration:

1. Check the browser console for the detailed error message
2. Verify the column was added successfully
3. Make sure your Supabase RLS policies allow INSERT operations
4. Check that the user has the necessary permissions

### Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove the index
DROP INDEX IF EXISTS idx_lipsync_presets_voice_name;

-- Remove the column
ALTER TABLE lipsync_presets DROP COLUMN IF EXISTS voice_name;
``` 