# Database migrations

`supabase/migrations` is the canonical executable migration directory.

- `001_initial_schema.sql` is the original foundation migration.
- Subsequent migrations are incremental and must not rewrite historical migrations.
- Production database changes must be applied through the migration history.
- `database/migrations` is legacy and must not be used for new migrations.

Before changing RLS, verify both Postgres grants and policies. Server-owned rating, trust and moderation data must never be writable from the browser using the publishable key.
