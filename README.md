# ITAuditor (MVP)

## Project Description

ITAuditor is a minimal viable product aimed at automating and summarizing IT audit processes. It allows users to create, edit, and review audit orders. The application collects detailed audit protocols (ranging from 1000 to 10,000 characters) and leverages AI to generate a bullet-point summary, highlighting key findings efficiently. Users can edit the audit details before final approval, after which the audit transitions into a read-only mode. Additionally, the system provides basic user authentication to manage audit data.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication)
- **AI Integration:** Openrouter.ai for generating audit summaries
- **CI/CD & Hosting:** GitHub Actions & DigitalOcean
- **Other:** Node.js (v22.14.0 as specified in .nvmrc)

## Getting Started Locally

### Prerequisites

- Node.js v22.14.0
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repository.git
   ```
2. Navigate to the project directory:
   ```bash
   cd your-repository
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Astro development server with:

```bash
npm run dev
```

Then, open your browser and navigate to `http://localhost:3000` to view the project.

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Runs the production build locally.
- `npm run astro` - Executes Astro CLI commands.
- `npm run lint` - Lints the code using ESLint.
- `npm run lint:fix` - Lints and automatically fixes issues.
- `npm run format` - Formats the code using Prettier.

## Project Scope

This MVP includes the following key features:

- **Audit Creation:** Users can create new audit orders by entering detailed audit protocols.
- **Audit Editing:** Audits can be edited prior to final approval.
- **AI-Powered Summaries:** Automatic generation of bullet-point audit summaries using integrated AI services.
- **Read-Only Mode:** Audits become non-editable upon approval.
- **User Authentication:** Basic login and registration functionalities to associate audits with user accounts.
- **Audit Management:** Capabilities to list, view, and delete audits (where applicable).

## Project Status

This project is currently in the MVP stage and is under active development. It is designed to streamline IT audit processes and deliver immediate value through automation and a user-friendly interface.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
