# House Expense Tracker

A collaborative household finance tracker. Log income, set up spending
sections (Rent, Loans, Groceries…), record expenses, and watch dashboards show
how much budget is left — shared across everyone in your household.

Built with **Next.js 14 (App Router)**, **Supabase** (Postgres + Auth + RLS),
**Tailwind CSS**, and **Recharts**.

## Features

- 🔐 Email/password auth (Supabase)
- 🏠 Houses with a shareable join code — invite family to collaborate
- 👥 Multiple members per house, multiple houses per user
- 💰 Income entries and manual expense logging
- 🗂️ Custom sections with monthly budgets (fixed commitments vs. variable spending)
- 📊 Dashboard: income, spent, remaining, budget-vs-actual bars, spending donut
- 📅 Month-by-month navigation

## Setup

### 1. Create a Supabase project

- Go to [supabase.com](https://supabase.com) → **New project**.
- Once it's ready, open **SQL Editor → New query**, paste the contents of
  [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates
  all tables, security policies, and helper functions.
- (Optional, recommended for local testing) **Authentication → Providers → Email**
  → turn **off** "Confirm email" so you can sign in immediately without checking
  your inbox.

### 2. Configure environment variables

Copy the example file and fill in values from **Supabase → Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, and create your first house.

## How collaboration works

1. Create a house — you become its **owner**.
2. Open **House & Members** and copy the 6-character **join code**.
3. Share it. Anyone who signs up and enters the code joins your house and can
   see and add income/expenses. Row-Level Security ensures users only ever see
   data for houses they belong to.

## Deploying to Vercel

1. Push this folder to a Git repo.
2. Import it in [Vercel](https://vercel.com), add the two `NEXT_PUBLIC_SUPABASE_*`
   environment variables, and deploy.
3. In Supabase → **Authentication → URL Configuration**, add your Vercel URL to
   the allowed redirect/site URLs.

## Project structure

```
src/
  app/
    (auth)/          login, signup, auth server actions
    (app)/           authenticated shell + pages
      dashboard/     overview, charts, budget bars
      transactions/  log & list expenses
      income/        log & list income
      categories/    manage sections + budgets
      house/         members, join code, house settings
      actions.ts     data mutations (server actions)
  components/        UI + client form components
  lib/
    supabase/        browser / server / middleware clients
    house.ts         active-house resolution
    format.ts        money & month helpers
supabase/schema.sql  full database schema + RLS
```
