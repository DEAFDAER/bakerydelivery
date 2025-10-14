# Deployment Guide for Render

This guide will help you deploy the Bongao Bakery application on Render with the backend and frontend deployed separately.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A Neo4j Aura database (already configured)
3. Your GitHub repository (optional, but recommended)

## Part 1: Deploy Backend to Render

### Step 1: Create a New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository or use "Public Git Repository"
   - If using public repo: Enter your repo URL
   - Select the `backend` directory as the root

### Step 2: Configure Backend Service

Fill in the following settings:

- **Name**: `bongao-bakery-backend` (or your preferred name)
- **Region**: Choose closest to your location
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
NEO4J_URI=your-neo4j-uri
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j
SECRET_KEY=your-secret-key-here
FRONTEND_URL=https://your-frontend-app.onrender.com
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

**Important Notes:**
- Replace `your-neo4j-uri`, `your-neo4j-password` with your actual Neo4j Aura credentials
- Replace `SECRET_KEY` with a secure random string (you can generate one using: `openssl rand -hex 32`)
- You'll update `FRONTEND_URL` after deploying the frontend

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the deployment to complete (this may take a few minutes)
3. Once deployed, copy your backend URL (e.g., `https://bongao-bakery-backend.onrender.com`)

### Step 5: Test Backend

Visit your backend URL and add `/docs` to access the API documentation:
- Example: `https://bongao-bakery-backend.onrender.com/docs`

## Part 2: Deploy Frontend to Render

### Step 1: Create a Static Site

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
   - Select the `frontend` directory as the root

### Step 2: Configure Frontend Service

Fill in the following settings:

- **Name**: `bongao-bakery-frontend` (or your preferred name)
- **Region**: Choose the same as backend
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### Step 3: Add Environment Variables

Click **"Advanced"** and add this environment variable:

```
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

Replace `your-backend-app.onrender.com` with your actual backend URL from Step 4 above.

### Step 4: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for the deployment to complete
3. Once deployed, copy your frontend URL (e.g., `https://bongao-bakery-frontend.onrender.com`)

## Part 3: Update CORS Configuration

### Update Backend Environment Variable

1. Go back to your backend service on Render
2. Go to **"Environment"** tab
3. Update the `FRONTEND_URL` variable with your actual frontend URL
4. Save changes - this will trigger a redeployment

## Part 4: Verify Deployment

1. Visit your frontend URL
2. Try logging in with your admin account:
   - Username: `gab1`
   - Password: `12345678`
3. Test creating products, orders, etc.

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Verify `FRONTEND_URL` is set correctly in backend environment variables
- Check that both deployments are using HTTPS (not HTTP)
- Redeploy the backend after updating environment variables

### Database Connection Issues

- Verify your Neo4j Aura instance is running (not paused)
- Check that `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD` are correct
- Ensure your Neo4j Aura instance allows connections from Render's IP addresses

### Build Failures

**Backend:**
- Check the build logs in Render dashboard
- Verify all dependencies are listed in `requirements.txt`

**Frontend:**
- Verify `package.json` has all dependencies
- Check that build command is correct: `npm run build`
- Ensure `REACT_APP_API_URL` is set in environment variables

### Free Tier Limitations

Render's free tier:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for production use

## Local Development After Deployment

To continue local development:

1. **Backend**: Keep using `http://localhost:8000`
2. **Frontend**: Create `.env.local` file:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## Additional Configuration

### Custom Domain (Optional)

1. Go to your Render service
2. Click **"Settings"** → **"Custom Domain"**
3. Follow instructions to add your domain
4. Update `FRONTEND_URL` in backend environment variables

### Environment-Specific Configuration

For multiple environments (staging, production):
- Create separate Render services
- Use different environment variables for each
- Use branch-based deployments

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify all environment variables are set correctly
3. Check Neo4j Aura database is running
4. Review browser console for frontend errors
