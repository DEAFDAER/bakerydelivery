# 🚀 Complete Guide: Deploy Bongao Bakery (Vercel Frontend + Render Backend)

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [GitHub Setup](#github-setup)
3. [Render Account Setup](#render-account-setup)
4. [Vercel Account Setup](#vercel-account-setup)
5. [Database Setup](#database-setup)
6. [Backend Deployment (Render)](#backend-deployment-render)
7. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
8. [Environment Variables](#environment-variables)
9. [Testing Deployment](#testing-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

---

## 🔧 Prerequisites

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Render account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] Git installed locally
- [ ] Your project code ready

---

## 📁 GitHub Setup

### Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to your project directory
cd C:\Users\Admin\Desktop\wasd

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Bongao Bakery project"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Repository name: `bongao-bakery`
4. Description: `Full-stack bakery management system with FastAPI backend and React frontend`
5. Set to **Public** (for free Render deployment)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### Step 3: Connect Local Repository to GitHub

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bongao-bakery.git

# Push to GitHub
git push -u origin main
```

### Step 4: Verify GitHub Setup

- Visit your repository: `https://github.com/YOUR_USERNAME/bongao-bakery`
- Confirm all files are uploaded correctly

---

## 🌐 Render Account Setup

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended for easier integration)
4. Authorize Render to access your GitHub repositories

### Step 2: Connect GitHub Repository

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `bongao-bakery` repository

---

## ⚡ Vercel Account Setup

### Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended for easier integration)
4. Authorize Vercel to access your GitHub repositories

### Step 2: Connect GitHub Repository

1. In Vercel dashboard, click **"New Project"**
2. Import your `bongao-bakery` repository
3. Configure project settings (we'll do this in the frontend deployment section)

---

## 🗄️ Database Setup

### Step 1: Create PostgreSQL Database

1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure database:
   - **Name**: `bongao-bakery-db`
   - **Database**: `bakery_db`
   - **User**: `bakery_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free tier (1GB storage)
4. Click **"Create Database"**

### Step 2: Get Database Connection String

1. Go to your database dashboard
2. Copy the **"External Database URL"**
3. Save this for later use

---

## 🔧 Backend Deployment (Render)

### Step 1: Deploy Backend Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure service:

```
Name: bongao-bakery-backend
Environment: Python 3
Region: Choose closest region
Branch: main
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT
```

### Step 2: Set Environment Variables

In your backend service settings, add these environment variables:

```
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://username:password@host:port/database
ALLOWED_ORIGINS=https://bongao-bakery-frontend.vercel.app
ENVIRONMENT=production
DEBUG=False
```

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://bongao-bakery-backend.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update Frontend API Configuration

First, update your frontend API configuration to point to your deployed backend:

```typescript
// In frontend/src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bongao-bakery-backend.onrender.com'
  : 'http://localhost:8000';
```

### Step 2: Deploy Frontend to Vercel

1. In Vercel dashboard, click **"New Project"**
2. Import your `bongao-bakery` repository
3. Configure project settings:

```
Project Name: bongao-bakery-frontend
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
```

### Step 3: Set Environment Variables

In Vercel project settings, add these environment variables:

```
REACT_APP_API_URL=https://bongao-bakery-backend.onrender.com
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Note your frontend URL: `https://bongao-bakery-frontend.vercel.app`

### Step 5: Update Backend CORS Settings

After getting your Vercel frontend URL, update your Render backend environment variables:

```
ALLOWED_ORIGINS=https://bongao-bakery-frontend.vercel.app
```

---

## 🔐 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key | `your-super-secret-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://your-frontend.onrender.com` |
| `ENVIRONMENT` | Environment type | `production` |
| `DEBUG` | Debug mode | `False` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://bongao-bakery-backend.onrender.com` |

---

## 🧪 Testing Deployment

### Step 1: Test Backend

```bash
# Test health endpoint
curl https://bongao-bakery-backend.onrender.com/health

# Test root endpoint
curl https://bongao-bakery-backend.onrender.com/

# Test API docs
curl https://bongao-bakery-backend.onrender.com/docs
```

### Step 2: Test Frontend

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test all major features
4. Check browser console for errors
5. Verify API calls are going to the correct backend URL

### Step 3: Test Database Connection

1. Try creating a new user account
2. Check if data persists after page refresh
3. Verify database operations work correctly

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Backend build fails
**Solution**: 
- Check `requirements.txt` for syntax errors
- Ensure all dependencies are listed
- Check Python version compatibility

#### 2. Database Connection Issues

**Problem**: Database connection fails
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database credentials are correct

#### 3. CORS Issues

**Problem**: Frontend can't connect to backend
**Solution**:
- Update `ALLOWED_ORIGINS` with correct Vercel frontend URL
- Check frontend `REACT_APP_API_URL` configuration
- Ensure backend URL includes `https://` protocol

#### 4. Environment Variables Not Loading

**Problem**: Environment variables not working
**Solution**:
- Restart the service after adding variables
- Check variable names match exactly
- Ensure no extra spaces in values

### Debug Commands

```bash
# Check backend logs
# Go to Render dashboard > Your service > Logs

# Test API endpoints
curl -X GET https://bongao-bakery-backend.onrender.com/api/users

# Check database connection
curl -X POST https://bongao-bakery-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass","name":"Test User"}'
```

---

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Performance**
   - Check Render dashboard for service health
   - Monitor response times
   - Watch for memory usage

2. **Update Dependencies**
   - Regularly update Python packages
   - Update React dependencies
   - Test updates in staging first

3. **Backup Database**
   - Export database regularly
   - Keep backups in secure location
   - Test restore procedures

### Scaling Considerations

1. **Upgrade Plans**
   - Monitor usage patterns
   - Upgrade when hitting limits
   - Consider caching strategies

2. **Performance Optimization**
   - Implement database indexing
   - Add caching layers
   - Optimize API responses

---

## 📞 Support

### Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

### Getting Help

1. Check Render service logs
2. Review GitHub issues
3. Check FastAPI/React documentation
4. Post questions in relevant communities

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and connected
- [ ] Render account set up
- [ ] PostgreSQL database created
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints tested
- [ ] Frontend functionality tested
- [ ] CORS configuration verified
- [ ] SSL certificates active
- [ ] Performance monitoring set up

---

## 🎉 Congratulations!

Your Bongao Bakery application is now live! 

- **Backend (Render)**: `https://bongao-bakery-backend.onrender.com`
- **Frontend (Vercel)**: `https://bongao-bakery-frontend.vercel.app`
- **API Docs**: `https://bongao-bakery-backend.onrender.com/docs`

Remember to:
- Monitor your services regularly
- Keep dependencies updated
- Backup your database
- Test new features before deploying

Happy baking! 🥖🍰
