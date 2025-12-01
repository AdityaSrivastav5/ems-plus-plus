# Deployment Guide

This guide outlines the steps to deploy the EMS++ platform. The backend microservices will be deployed on **Render**, and the frontend will be deployed on **Vercel**.

## Prerequisites

- GitHub Repository with the project code.
- Account on [Render](https://render.com).
- Account on [Vercel](https://vercel.com).
- **MongoDB Atlas** account (free tier available).
- Redis Instance (can be provisioned on Upstash).

## Part 1: Database Setup

### MongoDB Atlas
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2.  Create a database user with a password.
3.  Whitelist your IP address (or use `0.0.0.0/0` for development).
4.  Get your **Connection String** (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/ems?retryWrites=true&w=majority`).
5.  Note this connection string as `MONGODB_URI`.

### Redis (Upstash)
1.  Go to [Upstash](https://upstash.com) and create a Redis database.
2.  Note the `REDIS_URL`.

## Part 2: Backend Deployment (Render)

Since we have a monorepo with multiple services, we will deploy each service as a separate Web Service on Render.

### Deploying Services
For **EACH** service (`gateway`, `auth-service`, `employee-service`, etc.), follow these steps:

1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: e.g., `ems-gateway`, `ems-employee-service`.
4.  **Root Directory**:
    - For Gateway: `apps/gateway`
    - For Services: `services/employee-service` (change accordingly)
5.  **Environment**: `Node`
6.  **Build Command**: `npm install`
7.  **Start Command**: `node index.js`
8.  **Environment Variables**:
    - `NODE_ENV`: `production`
    - `MONGODB_URI`: Your MongoDB Atlas connection string.
    - `REDIS_URL`: Your Redis connection string.
    - `PORT`: `10000` (Render default) or match your config.

### Service URLs
Once deployed, note the URL for each service (e.g., `https://ems-gateway.onrender.com`).

## Part 3: Frontend Deployment (Vercel)

1.  Go to the Vercel Dashboard and click **Add New...** -> **Project**.
2.  Import your GitHub repository.
3.  **Framework Preset**: Next.js.
4.  **Root Directory**: Click `Edit` and select `apps/web`.
5.  **Environment Variables**:
    - `NEXT_PUBLIC_GRAPHQL_URL`: The URL of your deployed Gateway (e.g., `https://ems-gateway.onrender.com/graphql`).
6.  Click **Deploy**.

## Part 4: Final Configuration

1.  **Gateway Configuration**: Ensure your Gateway knows where the downstream services are. You might need to update your Gateway code to accept service URLs via environment variables if it currently hardcodes `localhost`.
2.  **CORS**: Ensure your Gateway allows CORS requests from your Vercel frontend domain.

## Troubleshooting

- **Build Failures**: Check the logs. Ensure all shared packages (`@ems/config`, etc.) are accessible.
- **Connection Errors**: Verify `MONGODB_URI` and `REDIS_URL` are correct and accessible from the Render region.
- **MongoDB Connection**: Ensure your IP is whitelisted in MongoDB Atlas, or use `0.0.0.0/0` for all IPs (not recommended for production).
