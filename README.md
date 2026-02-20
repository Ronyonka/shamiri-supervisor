# Shamiri Supervisor Copilot

![Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/next.js-14.1-000000.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)
![Prisma](https://img.shields.io/badge/prisma-5.10-green.svg)

**AI-powered session review and quality assurance platform for Shamiri Fellows.**

The Supervisor Copilot helps clinical supervisors efficiently review therapy sessions by providing automated transcripts, AI-generated quality insights, risk detection, and a streamlined validation workflow.

## Features

- 🤖 **Automated Analysis**: AI-driven evaluation of session transcripts for protocol adherence and facilitation quality.
- 🚩 **Risk Detection**: Automatic highlighting of risk markers (self-harm, abuse) for immediate supervisor attention.
- 📊 **Quality Scoring**: Quantitative metrics for Content Coverage, Facilitation Quality, and Protocol Safety.
- 📝 **Review Workflow**: Dedicated interface for supervisors to validate AI findings and provide feedback.
- 🔒 **Secure Access**: Role-based access control for supervisors.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js 18+
- PostgreSQL
- OpenAI API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ronyonka/shamiri-supervisor.git
    cd shamiri-supervisor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Setup

1.  **Create your environment file**
    Copy the example configuration:
    ```bash
    cp .env.example .env
    ```

2.  **Configure environment variables**
    Open `.env` and fill in the following values:

    ```bash
    # Database connection string (PostgreSQL)
    DATABASE_URL="postgresql://user:password@localhost:5432/shamiri_db?schema=public"

    # OpenAI API Key for Transcript Analysis
    OPENAI_API_KEY="sk-..."

    # NextAuth Configuration
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="supersecret_dev_key" # Can be any random string for development
    ```

### Database Setup

1.  **Run Migrations**
    Apply the Prisma schema to your local database:
    ```bash
    npx prisma migrate dev
    ```

2.  **Seed the Database**
    Populate the database with mock supervisors, fellows, groups, and sessions:
    ```bash
    npx prisma db seed
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The application uses a secure login system restricted to seeded supervisors.

**User Credentials (Mock Data):**

| Role | Email | Password |
| :--- | :--- | :--- |
| **Supervisor** | `amara@shamiri.co` | `shamiri123` |

> **Note:** There is no public registration. Supervisors must be pre-provisioned in the database.

## AI Analysis Engine

The application includes an internal API to trigger and retrieve session analysis.

### Trigger Analysis
To analyze a specific session (ensure the session exists and has a transcript):

```http
POST /api/sessions/[session-id]/analyze
```

### Retrieve Results
To get the analysis results for a session:

```http
GET /api/sessions/[session-id]/analysis
```

## Session Status Workflow

Sessions move through four states. AI flags sessions for review; only supervisors set the final verdict.

| Status               | Badge  | Meaning                                      |
| :------------------- | :----- | :------------------------------------------- |
| **Missing Analysis** | Grey   | AI analysis has not run yet.                 |
| **Flagged for Review** | Blue | AI analyzed; awaiting supervisor review.      |
| **Safe**             | Green  | Supervisor confirmed safe (human-verified).  |
| **Risk**             | Red    | Supervisor confirmed risk (human-verified).  |

> **Key principle:** AI flags, humans decide. Status can change if a supervisor submits a new review.
> 
> For the full lifecycle, decision matrix, and edge cases, see [docs/status-workflow.md](docs/status-workflow.md).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js v4
- **UI**: Tailwind CSS, shadcn/ui
- **AI**: OpenAI API

