# Cloudflare Workers deployment checklist

## Status

The project has been prepared on the `migration/cloudflare-workers` branch for a non-destructive migration from Next.js to Cloudflare Workers using vinext.

## Before connecting the repository

Run these commands from a local checkout or Cloudflare-compatible build environment:

```bash
npm install
npx vinext check
npm run build:vinext
```

Review every compatibility issue before production deployment.

## Required environment variables

Configure the same Supabase and authentication variables currently used by the application as Cloudflare build variables or secrets. Never commit private keys to the repository.

At minimum, verify all variables referenced through `process.env` before deployment.

## First deployment

Deploy the migration branch to a temporary `*.workers.dev` address first. Do not change the GoDaddy DNS or the `rioesports.com.br` domain until the following checks pass:

- homepage loads;
- registration and login work;
- Supabase session persistence works;
- protected profile routes work;
- Steam linking callback works;
- dynamic news routes work;
- production build succeeds.

## Rollback

Keep the existing production deployment active until the Workers deployment passes validation. The `main` branch remains independent from this migration branch.
