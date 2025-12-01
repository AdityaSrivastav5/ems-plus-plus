# Deployment Guide

This guide outlines the steps to deploy the EMS++ platform. The backend microservices will be deployed on **Render**, and the frontend will be deployed on **Vercel**.

## Prerequisites

- GitHub Repository with the project code.
- Account on [Render](https://render.com).
- Account on [Vercel](https://vercel.com).
- PostgreSQL Database (can be provisioned on Render).
- Redis Instance (can be provisioned on Upstash).

## Part 1: Backend Deployment (Render)

Since we have a monorepo with multiple services, we will deploy each service as a separate Web Service on Render.

### 1. Database & Redis
- **PostgreSQL**: Create a new PostgreSQL database on Render. Note the `Internal Database URL`.
- **Redis**: Create a Redis database on Upstash (or Render). Note the `REDIS_URL`.

### 2. Deploying Services
For **EACH** service (`gateway`, `auth-service`, `employee-service`, etc.), follow these steps:

1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: e.g., `ems-gateway`, `ems-auth-service`.
4.  **Root Directory**:
    - For Gateway: `apps/gateway`
    - For Services: `services/auth-service` (change accordingly)
5.  **Environment**: `Node`
6.  **Build Command**: `npm install` (or `npm install && npm run build` if you have a build step)
    - *Note*: In a Turborepo, you might need to run `npm install` in the root. Render supports monorepos; ensure you specify the Root Directory correctly.
7.  **Start Command**: `node index.js`
8.  **Environment Variables**:
    - `NODE_ENV`: `production`
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `REDIS_URL`: Your Redis connection string.
    - `PORT`: `10000` (Render default) or match your config.
    - *Crucial*: For the **Gateway**, you need to provide the URLs of all other deployed services as env vars (e.g., `AUTH_SERVICE_URL`, `EMPLOYEE_SERVICE_URL`) so it can stitch the schemas. You will need to update `apps/gateway/index.js` to read these from env vars instead of localhost if it's not already doing so.

### 3. Service URLs
Once deployed, note the URL for each service (e.g., `https://ems-gateway.onrender.com`).

## Part 2: Frontend Deployment (Vercel)

1.  Go to the Vercel Dashboard and click **Add New...** -> **Project**.
2.  Import your GitHub repository.
3.  **Framework Preset**: Next.js.
4.  **Root Directory**: Click `Edit` and select `apps/web`.
5.  **Environment Variables**:
    - `NEXT_PUBLIC_GRAPHQL_URL`: The URL of your deployed Gateway (e.g., `https://ems-gateway.onrender.com/graphql`).
6.  Click **Deploy**.

## Part 3: Final Configuration

1.  **Gateway Configuration**: Ensure your Gateway knows where the downstream services are. You might need to update your Gateway code to accept service URLs via environment variables if it currently hardcodes `localhost`.
    - *Example Update*:
      ```javascript
      const services = [
        { name: "auth", url: process.env.AUTH_SERVICE_URL || "http://localhost:4001/graphql" },
        // ...
      ];
      ```
2.  **CORS**: Ensure your Gateway allows CORS requests from your Vercel frontend domain.

## Troubleshooting

- **Build Failures**: Check the logs. Ensure all shared packages (`@ems/config`, etc.) are accessible. Turborepo usually handles this, but ensure `npm install` runs at the root level if needed.
- **Connection Errors**: Verify `DATABASE_URL` and `REDIS_URL` are correct and accessible from the Render region.
