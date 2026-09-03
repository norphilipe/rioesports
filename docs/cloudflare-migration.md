# Cloudflare Workers migration

This branch prepares RIO ESPORTS for a non-destructive migration from Next.js hosting to Cloudflare Workers using vinext.

## Current environment variables

The application requires these public runtime/build variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not commit production secrets to this repository. Configure production values in the Cloudflare Workers deployment environment.

## Migration workflow

1. Run the vinext compatibility check from a local checkout:
   `npx vinext check`
2. Initialize the Cloudflare target:
   `npx vinext init --platform=cloudflare`
3. Review generated files and compatibility output.
4. Test with `npm run dev:vinext`.
5. Build with `npm run build:vinext`.
6. Deploy only after the application has passed functional tests.

The existing `next dev` workflow should remain available until the Cloudflare deployment has been validated.

## Validation checklist

- Public homepage
- Registration and login
- Supabase session persistence
- Steam callback and account linking
- Profile pages and protected routes
- Dynamic news routes
- Environment variables in the Workers deployment
- Production callback URLs before custom-domain cutover
