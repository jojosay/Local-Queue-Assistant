
# Local Queue Assistant (Firebase Studio Project)

This is a Next.js application for managing local queues, built with React, ShadCN UI, Tailwind CSS, and Genkit for AI features.

To get started, take a look at `src/app/page.tsx`.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js), or [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

## Environment Variables

This project uses environment variables for configuration, especially for AI services and database connections.

1.  Create a `.env` file in the root of the project if it doesn't already exist. You can copy `.env.example` if one is provided, or create it from scratch.
2.  Add the following variables:

    ```env
    # For Genkit and Google AI features (e.g., voice announcements)
    # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE

    # Placeholder for PostgreSQL connection (currently not fully integrated, app uses localStorage)
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
    ```

    -   **`GOOGLE_API_KEY`**: This is required for the Genkit AI flows (like voice announcements) to work.
    -   **`DATABASE_URL`**: This is a placeholder for future PostgreSQL integration. The application currently uses browser `localStorage` for data persistence.

## Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the project directory:
    ```bash
    cd your-project-name
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
    (or `yarn install` or `pnpm install`)

## Running the Development Servers

For full functionality, including AI features, you'll need to run two development servers concurrently in separate terminal windows:

1.  **Next.js Web Application Server**:
    This server handles the frontend and Next.js backend logic.
    ```bash
    npm run dev
    ```
    By default, this will start the application on `http://localhost:9002`.

2.  **Genkit AI Flows Server**:
    This server runs your Genkit flows, making them available for the Next.js app to call.
    ```bash
    npm run genkit:dev
    ```
    This will typically start the Genkit development UI and flow server on `http://localhost:4000` (Genkit UI) and expose flows on port `3400` or as configured. The `src/ai/dev.ts` file loads your defined flows.

    You can also use `npm run genkit:watch` to have Genkit automatically restart when flow files change.

Once both servers are running, you can access the web application in your browser at `http://localhost:9002`.

## Data Persistence

-   Currently, the application primarily uses the browser's `localStorage` for data (offices, counters, users, queue tickets). This means data is specific to your browser and will be lost if you clear your browser's site data.
-   The `DATABASE_URL` in the `.env` file is a placeholder for a planned transition to PostgreSQL for more robust data storage.

---

Happy coding!
