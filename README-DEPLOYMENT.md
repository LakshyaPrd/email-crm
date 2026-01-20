# See README-DEPLOYMENT.md in artifacts for deployment guide

# Hostinger VPS Deployment - Quick Reference

## Quick Deploy
```bash
cd /opt
git clone YOUR_REPO_URL indeed-crm
cd indeed-crm
chmod +x deploy.sh
sudo ./deploy.sh
```

## Important Files
- `docker-compose.yml` - Main deployment config
- `deploy.sh` - Automated deployment script
- `.env.production` - Environment template
- `nginx/nginx.conf` - Reverse proxy config
- `backend/Dockerfile` - Backend container
- `frontend-next/Dockerfile` - Frontend container

## Before Deployment
1. Upload `credentials.json` (Google OAuth)
2. Edit `.env` file with your values
3. Point domain DNS to VPS IP
4. Run `deploy.sh`

## After Deployment
- CRM URL: https://yourdomain.com
- Logs: `docker-compose logs -f`
- Restart: `docker-compose restart`

See walkthrough.md artifact for complete guide.
