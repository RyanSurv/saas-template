This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites

Create a .env file (based on the .env.example file) and fill in your keys/secrets for Clerk and Stripe

Create a dev.db file in the Prisma folder (prisma/dev.db) or utilize a different database and update the environment variable

## Getting Started

First, Run npm install.

Next, Run npm run db:push.

Then, Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies

This template uses the following libraries to create an incredibly easy developer experience to create a SaaS product;

Clerk - Authentication

Stripe - Payments

Shadcn/ui - Component library

Prisma - TypeScript ORM
