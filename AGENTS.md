## Project Summary
This is a logistics and management system built with Next.js 15, Supabase, and MySQL. It includes modules for dashboard, accounts, HR, e-commerce, and administrative tools.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Database: Supabase (PostgreSQL) & MySQL (Hostinger)
- Authentication: Supabase Auth
- Styling: Tailwind CSS
- Runtime: Node.js / Bun

## Architecture
- Flat structure: `/app`, `/components`, `/hooks`, `/lib`, `/i18n` at the root for maximum compatibility with hosting environments.
- The `src` directory has been removed to avoid duplication and build conflicts.
- Standalone output enabled for efficient deployment on Hostinger.

## User Preferences
- Deployment environment: Hostinger (Shared Hosting / Node.js).
- Prefers functional components and modern React patterns.

## Project Guidelines
- No `src` directory; keep core folders at the root.
- Use `@/*` for absolute imports.
- Maintain `standalone` build for production.

## Common Patterns
- API routes in `/app/api`.
- Client components marked with 'use client'.
- Server components for data fetching.
