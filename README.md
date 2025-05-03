# MedMinder Plus

## Table of Contents
- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name

MedMinder Plus

## Project Description

MedMinder Plus is a modern, AI-powered medication management application that transforms medication adherence through personalized engagement. It offers an intuitive interface for users to register, manage their medications, receive personalized reminders, and access educational information about their medications. The application leverages cutting-edge technologies to ensure a seamless and engaging experience.

## Tech Stack

- **Next.js** v14.0.0
- **React** v19.0.0
- **TypeScript** v5
- **Tailwind CSS** v4.0.0
- **Shadcn/ui**
- **Supabase** (PostgreSQL database with authentication and realtime features)
- **OpenAI API** (for AI-powered interactions and personalization)
- **Langchain.js** (for AI application development)
- **Vercel** (edge-optimized hosting)
- **Node.js** v22.14.0
- **Jest** (unit and integration testing framework)
- **React Testing Library** (component testing utilities)
- **Cypress/Playwright** (E2E testing framework)

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MedMinder-Plus
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy the example file to create your local configuration:
     ```bash
     cp .env.example .env.local
     ```
   - Update the values in `.env.local` as needed.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Runs the application in development mode.
- `npm run build` - Builds the application for production.
- `npm run start` - Runs the built production application.
- `npm run test` - Runs unit and integration tests with Jest.
- `npm run test:e2e` - Runs E2E tests with Cypress or Playwright.
- Additional scripts (e.g., linting, testing) may be defined in the project's package configuration.

## Project Scope

- **User Management:** Simple user registration and profile setup.
- **Medication Management:** Efficient tracking and management of medications.
- **AI-Powered Reminders:** Personalized reminders powered by AI.
- **Educational Content:** Access to information and education about medications.
- **Scalability:** Built using modern frameworks and best practices to support future enhancements and scalability.

## Project Status

This project is currently in **active development**, with ongoing improvements and feature additions.

## License

This project is licensed under the **MIT License**.

