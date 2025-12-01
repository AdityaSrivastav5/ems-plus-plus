# EMS++ (Employee Management System)

EMS++ is a comprehensive, multi-tenant SaaS platform designed to streamline HR, Payroll, and CRM operations for modern businesses. Built with a microservices architecture, it offers a scalable and robust solution for managing your organization's most valuable assets.

## 🚀 Features

### Core Modules
- **HR Management**: Complete employee lifecycle management, from onboarding to offboarding.
- **Attendance Tracking**: Real-time check-in/out, attendance history, and status monitoring.
- **Leave Management**: Leave request workflows, balance tracking, and approval systems.
- **Payroll Processing**: Automated payroll runs, salary structure management, and payslip generation.
- **CRM**: Lead management, deal pipelines (Kanban view), and contact directories.

### Advanced Capabilities
- **Multi-Tenancy**: Secure isolation of data for multiple organizations.
- **Role-Based Access Control (RBAC)**: Fine-grained permission management for Admins, Managers, and Employees.
- **Asset Management**: Tracking of IT assets and assignments.
- **Notifications**: Real-time alerts and updates.
- **Document Storage**: Secure management of contracts and employee documents.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (with Glassmorphism UI)
- **State/Data**: Apollo Client (GraphQL)
- **Language**: TypeScript

### Backend
- **Architecture**: Microservices (9 distinct services)
- **Gateway**: Apollo Federation / Schema Stitching
- **Runtime**: Node.js & Express
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL (via Render)
- **Caching**: Redis (via Upstash)
- **Monorepo Tool**: Turborepo

## 📂 Project Structure

```
├── apps
│   ├── gateway         # GraphQL API Gateway
│   └── web            # Next.js Frontend Application
├── packages
│   ├── config         # Shared configuration
│   ├── graphql-schema # Shared GraphQL types
│   ├── shared-lib     # Shared utilities (DB, Redis)
│   └── types          # Shared TypeScript definitions
└── services
    ├── asset-service
    ├── attendance-service
    ├── auth-service
    ├── crm-service
    ├── documents-service
    ├── employee-service
    ├── leave-service
    ├── notification-service
    ├── org-service
    ├── payroll-service
    └── rbac-service
```

## ⚡️ Quick Start

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- PostgreSQL Database
- Redis Instance

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ems-plus-plus.git
    cd ems-plus-plus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    - Copy `.env.example` to `.env` in the root (if applicable) or ensure `@ems/config` has the correct credentials.
    - Update `DATABASE_URL` and `REDIS_URL` in `packages/config/index.js` or your environment variables.

4.  **Run Locally**
    ```bash
    npm run dev
    # or
    npx turbo run dev
    ```

5.  **Access the App**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Gateway Playground: [http://localhost:4000/graphql](http://localhost:4000/graphql)

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying the backend to Render and the frontend to Vercel.

## 📄 License

This project is licensed under the MIT License.
