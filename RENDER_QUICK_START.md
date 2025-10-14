# Render Deployment Quick Reference

## Backend Service Configuration

```
Service Type: Web Service
Runtime: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables (Backend)
```
NEO4J_URI=<your-neo4j-aura-uri>
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-password>
NEO4J_DATABASE=neo4j
SECRET_KEY=<generate-with: openssl rand -hex 32>
FRONTEND_URL=<will-update-after-frontend-deploy>
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

---

## Frontend Service Configuration

```
Service Type: Static Site
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
```

### Environment Variables (Frontend)
```
REACT_APP_API_URL=<your-backend-url>
```

---

## Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Updated FRONTEND_URL in backend environment
- [ ] Tested login functionality
- [ ] Verified API calls work (check browser console)
- [ ] Created admin account (if needed)

---

## URLs After Deployment

**Backend API Docs**: `https://your-backend-app.onrender.com/docs`
**Frontend App**: `https://your-frontend-app.onrender.com`

---

## Common Issues

**CORS Error**: Update FRONTEND_URL in backend environment variables
**Database Error**: Check Neo4j Aura is running, verify credentials
**Build Failed**: Check logs in Render dashboard
**Slow First Load**: Free tier spins down - upgrade for production
