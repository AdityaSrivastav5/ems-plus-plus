# Complete Deployment Guide for EMS++

This comprehensive guide will walk you through deploying all 11 backend services on Render and the frontend on Vercel.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Configuration](#post-deployment-configuration)

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with your code pushed to a repository
- ✅ [Render](https://render.com) account (free tier available)
- ✅ [Vercel](https://vercel.com) account (free tier available)
- ✅ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
- ✅ [Upstash](https://upstash.com) account for Redis (free tier available)

---

## Database Setup

### Step 1: MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

2. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `emsadmin` (or your choice)
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Whitelist IP Addresses**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **Note**: For production, restrict to specific IPs
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string:
     ```
     mongodb+srv://emsadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://emsadmin:yourpassword@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority`
   - **Save this as your `MONGODB_URI`**

### Step 2: Redis Setup (Upstash)

1. **Create Redis Database**
   - Go to [Upstash Console](https://console.upstash.com)
   - Click "Create Database"
   - Name: `ems-redis`
   - Type: Regional
   - Region: Choose closest to your Render region
   - Click "Create"

2. **Get Connection String**
   - Click on your database
   - Copy the "Redis URL" (starts with `redis://`)
   - **Save this as your `REDIS_URL`**

---

## Backend Deployment (Render)

You need to deploy **11 services** individually. Here's the complete list with ports:

| Service | Port | Root Directory |
|---------|------|----------------|
| Gateway | 4000 | `apps/gateway` |
| Auth Service | 4001 | `services/auth-service` |
| RBAC Service | 4002 | `services/rbac-service` |
| Org Service | 4003 | `services/org-service` |
| Employee Service | 4004 | `services/employee-service` |
| Attendance Service | 4005 | `services/attendance-service` |
| Leave Service | 4006 | `services/leave-service` |
| CRM Service | 4007 | `services/crm-service` |
| Payroll Service | 4008 | `services/payroll-service` |
| Asset Service | 4009 | `services/asset-service` |
| Notification Service | 4010 | `services/notification-service` |
| Documents Service | 4011 | `services/documents-service` |

### Deployment Steps (Repeat for Each Service)

#### 1. Gateway Service (Example - Repeat for all)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Click "Connect" next to your `ems-plus-plus` repo

2. **Configure Service**
   - **Name**: `ems-gateway`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave **BLANK** (or set to `.`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run install:gateway`
   - **Start Command**: `cd apps/gateway && node index.js`
   - **Instance Type**: Free
   
   > ⚠️ **Important**: Leave Root Directory blank to ensure shared packages are accessible!

3. **Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://adityasrivastav863:iamaditya05@cluster0.svxvssj.mongodb.net/?appName=Cluster0
   REDIS_URL=redis://default:AZSKAAIncDI5MDBkY2M3NTdmNzc0NmQwOTUxZWZkZjBjNDM4NDhjMHAyMzgwMjY@stable-guppy-38026.upstash.io:6379
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note the service URL: `https://ems-gateway.onrender.com`

#### 2. Service-Specific Build Commands

For each service, use these exact commands:

| Service | Build Command | Start Command |
|---------|---------------|---------------|
| Gateway | `npm install && npm run install:gateway` | `cd apps/gateway && node index.js` |
| Auth | `npm install && npm run install:auth` | `cd services/auth-service && node index.js` |
| RBAC | `npm install && npm run install:rbac` | `cd services/rbac-service && node index.js` |
| Org | `npm install && npm run install:org` | `cd services/org-service && node index.js` |
| Employee | `npm install && npm run install:employee` | `cd services/employee-service && node index.js` |
| Attendance | `npm install && npm run install:attendance` | `cd services/attendance-service && node index.js` |
| Leave | `npm install && npm run install:leave` | `cd services/leave-service && node index.js` |
| CRM | `npm install && npm run install:crm` | `cd services/crm-service && node index.js` |
| Payroll | `npm install && npm run install:payroll` | `cd services/payroll-service && node index.js` |
| Asset | `npm install && npm run install:asset` | `cd services/asset-service && node index.js` |
| Notification | `npm install && npm run install:notification` | `cd services/notification-service && node index.js` |
| Documents | `npm install && npm run install:documents` | `cd services/documents-service && node index.js` |

**Remember**: Leave **Root Directory BLANK** for all services!

**Complete Environment Variables for All Services:**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://emsadmin:yourpassword@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
REDIS_URL=redis://default:yourredispassword@region.upstash.io:6379
```

### Service URLs After Deployment

After deploying all services, you'll have these URLs:
```
Gateway:        https://ems-gateway.onrender.com
Auth:           https://ems-auth-service.onrender.com
RBAC:           https://ems-rbac-service.onrender.com
Org:            https://ems-org-service.onrender.com
Employee:       https://ems-employee-service.onrender.com
Attendance:     https://ems-attendance-service.onrender.com
Leave:          https://ems-leave-service.onrender.com
CRM:            https://ems-crm-service.onrender.com
Payroll:        https://ems-payroll-service.onrender.com
Asset:          https://ems-asset-service.onrender.com
Notification:   https://ems-notification-service.onrender.com
Documents:      https://ems-documents-service.onrender.com
```

---

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Click "Import" next to your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click "Edit" → Select `apps/web`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

3. **Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_GRAPHQL_URL=https://ems-gateway.onrender.com/graphql
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

---

## Post-Deployment Configuration

### 1. Enable CORS on Gateway

Update `apps/gateway/index.js` to allow CORS from your Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://your-project.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

Redeploy the gateway service.

### 2. Test Your Deployment

1. **Test Gateway**
   - Visit: `https://ems-gateway.onrender.com/graphql`
   - You should see the GraphQL Playground

2. **Test Frontend**
   - Visit: `https://your-project.vercel.app`
   - Try logging in (mock auth)
   - Navigate through different pages

### 3. Monitor Services

- **Render**: Check logs in the Render dashboard for each service
- **Vercel**: Check deployment logs and runtime logs
- **MongoDB Atlas**: Monitor database connections in the Atlas dashboard

---

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check logs in Render dashboard
   - Verify `MONGODB_URI` is correct
   - Ensure `node_modules` is in `.gitignore`

2. **Frontend Can't Connect to Backend**
   - Verify `NEXT_PUBLIC_GRAPHQL_URL` is correct
   - Check CORS settings on gateway
   - Ensure gateway service is running

3. **MongoDB Connection Failed**
   - Verify IP whitelist includes `0.0.0.0/0`
   - Check username/password in connection string
   - Ensure database name is included in URI

4. **Build Failures**
   - Check that `Root Directory` is set correctly
   - Verify `package.json` exists in the root directory
   - Check build logs for specific errors

---

## Environment Variables Summary

### Backend Services (All 11)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ems?retryWrites=true&w=majority
REDIS_URL=redis://default:password@region.upstash.io:6379
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_GRAPHQL_URL=https://ems-gateway.onrender.com/graphql
```

---

## Cost Breakdown (Free Tier)

- **Render**: Free tier includes 750 hours/month (enough for 1-2 services always on)
- **MongoDB Atlas**: Free M0 cluster (512MB storage)
- **Upstash Redis**: Free tier (10,000 commands/day)
- **Vercel**: Free tier (unlimited deployments)

**Note**: With 11 services on Render free tier, services will sleep after 15 minutes of inactivity. Consider upgrading to paid plans for production use.

---

## Next Steps

1. ✅ Set up custom domain on Vercel
2. ✅ Configure environment-specific variables
3. ✅ Set up monitoring and alerts
4. ✅ Implement proper authentication (replace mock auth)
5. ✅ Add database migrations
6. ✅ Set up CI/CD pipelines

---

## Support

If you encounter issues:
- Check service logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas IP whitelist is configured
- Test each service individually using GraphQL Playground

Good luck with your deployment! 🚀
