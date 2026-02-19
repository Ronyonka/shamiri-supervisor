This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

This project uses [Prisma](https://www.prisma.io/) with PostgreSQL. The schema defines models for the Shamiri Supervisor Copilot, including `Supervisor`, `Fellow`, `Group`, `Session`, `Transcript`, `AIAnalysis`, and `SupervisorReview`.

### key Commands

1.  **Configure Environment**:
    Ensure your `.env` file has the correct `DATABASE_URL`.

2.  **Apply Migrations**:
    Run the following to apply schema changes to your database:
    ```bash
    npx prisma migrate dev
    ```

3.  **Seed the Database**:
    Populate the database with sample data (supervisors, fellows, groups, sessions, transcripts):
    ```bash
    npx prisma db seed
    ```

4.  **Generate Client**:
    If you modify `prisma/schema.prisma`, update the generated client:
    ```bash
    npx prisma generate
    ```

5.  **View Data**:
    Use Prisma Studio to view and edit data in your browser:
    ```bash
    npx prisma studio
    ```

6.  **Verify Setup**:
    Check if your database is in sync and your schema is valid:
    ```bash
    npx prisma migrate status
    npx prisma validate
    ```

### Prisma Client
A singleton PrismaClient instance is exported from `src/lib/prisma.ts` to prevent multiple connections during development hot-reloading.

## AI Analysis Engine

The application includes an AI-powered engine to analyze therapy session transcripts.

### Setup

1.  **OpenAI API Key**:
    Add your OpenAI API key to `.env`:
    ```bash
    OPENAI_API_KEY=sk-...
    ```

### Usage

1.  **Analyze a Session**:
    Send a POST request to trigger analysis for a specific session:
    ```bash
    POST /api/sessions/[session-id]/analyze
    ```

2.  **Retrieve Analysis**:
    Get the analysis results:
    ```bash
    GET /api/sessions/[session-id]/analysis
    ```
