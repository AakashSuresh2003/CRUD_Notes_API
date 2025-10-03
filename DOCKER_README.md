# Docker Setup for CRUD Notes API

This document provides comprehensive instructions for running the CRUD Notes API using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

## 🚀 Quick Start

### Production Environment

1. **Clone and prepare the environment:**
```bash
git clone <repository-url>
cd CRUD_Notes_API
cp .env.example .env
```

2. **Update environment variables in `.env`:**
```bash
# Edit .env file with production values
JWT_SECRET=your-super-secure-jwt-secret-for-production
COOKIE_SECRET=your-super-secure-cookie-secret-for-production
```

3. **Build and run the application:**
```bash
docker-compose up -d
```

4. **Verify the deployment:**
```bash
# Check container status
docker-compose ps

# Check application health
curl http://localhost:3000/health

# View logs
docker-compose logs -f notes-api
```

### Development Environment

1. **Run development setup:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Access development features:**
- API: http://localhost:3000
- Debug port: 9229 (for Node.js debugging)
- Hot reload enabled
- Development logs

## 🏗️ Architecture

### Services

1. **notes-api** - Main Node.js application
   - Port: 3000
   - Health check: `/health`
   - Auto-restart enabled

2. **mongodb** - MongoDB database
   - Port: 27017
   - Persistent data storage
   - Authentication enabled
   - Automatic initialization

3. **redis** (Optional) - Session storage
   - Port: 6379
   - Memory-based caching

4. **nginx** (Optional) - Reverse proxy
   - Port: 80/443
   - Load balancing
   - SSL termination
   - Security headers

### Network

- All services communicate through `notes-network`
- Internal DNS resolution enabled
- Isolated from external networks

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Application port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `COOKIE_SECRET` | Cookie signing secret | Required |

### MongoDB Configuration

- **Database:** `notes_db`
- **Admin User:** `admin` / `password123`
- **App User:** `notes_user` / `notes_password`
- **Indexes:** Automatically created for performance

## 📊 Monitoring & Health Checks

### Application Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Container Health Checks

All services include health checks:
- **API:** HTTP endpoint verification
- **MongoDB:** Database ping test
- **Redis:** Connection test
- **Nginx:** Service availability

### Monitoring Commands

```bash
# View all container status
docker-compose ps

# Monitor logs
docker-compose logs -f

# Monitor specific service
docker-compose logs -f notes-api

# Check resource usage
docker stats

# Inspect container details
docker inspect notes-api
```

## 🔒 Security Features

### Application Security
- Non-root user execution
- Secure cookie configuration
- JWT token validation
- Input sanitization
- CORS protection

### Network Security
- Internal network isolation
- Security headers via Nginx
- SSL/TLS support ready
- Rate limiting capable

### Data Security
- MongoDB authentication
- Encrypted connections
- Environment variable isolation
- Persistent volume security

## 🛠️ Development Workflow

### Local Development

1. **Start development environment:**
```bash
docker-compose -f docker-compose.dev.yml up
```

2. **Access development tools:**
- Code changes auto-reload
- Debug port available (9229)
- Development logs enabled
- Hot module replacement

3. **Run tests in container:**
```bash
docker-compose exec notes-api-dev npm test
docker-compose exec notes-api-dev npm run test:coverage
```

### Debugging

1. **Attach debugger to port 9229**
2. **Use VS Code Docker extension**
3. **Execute commands in container:**
```bash
docker-compose exec notes-api bash
```

## 🚀 Deployment

### Production Deployment

1. **Prepare production environment:**
```bash
# Create production .env
cp .env.example .env.production

# Update with production values
vim .env.production
```

2. **Deploy with production compose:**
```bash
docker-compose -f docker-compose.yml up -d
```

3. **Setup SSL (Optional):**
```bash
# Add SSL certificates to ./ssl/ directory
# Update nginx configuration for HTTPS
```

### Scaling

Scale specific services:
```bash
# Scale API instances
docker-compose up -d --scale notes-api=3

# Scale with load balancer
docker-compose up -d --scale notes-api=3 nginx
```

### Updates and Rollbacks

```bash
# Update application
docker-compose build notes-api
docker-compose up -d notes-api

# Rollback if needed
docker-compose down
docker-compose up -d
```

## 🧹 Maintenance

### Backup Database
```bash
# Create backup
docker-compose exec mongodb mongodump --host localhost --port 27017 --authenticationDatabase admin -u admin -p password123 --out /tmp/backup

# Copy backup from container
docker cp notes-mongodb:/tmp/backup ./backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./backup notes-mongodb:/tmp/restore

# Restore database
docker-compose exec mongodb mongorestore --host localhost --port 27017 --authenticationDatabase admin -u admin -p password123 /tmp/restore
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (⚠️ Data loss!)
docker-compose down -v

# Clean up images
docker system prune -f
```

## 📈 Performance Optimization

### Resource Limits
```yaml
# Add to docker-compose.yml
services:
  notes-api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

### Caching
- Redis for session storage
- Nginx for static content
- Database query optimization

### Load Testing
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API performance
ab -n 1000 -c 10 http://localhost:3000/api/v1/notes
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Check what's using the port
lsof -i :3000

# Kill process or change port in .env
```

2. **Database connection failed:**
```bash
# Check MongoDB container
docker-compose logs mongodb

# Verify connection string
docker-compose exec notes-api env | grep MONGODB_URI
```

3. **Container won't start:**
```bash
# Check container logs
docker-compose logs notes-api

# Verify Dockerfile syntax
docker build -t test .
```

### Debug Commands

```bash
# Enter container shell
docker-compose exec notes-api sh

# Check environment variables
docker-compose exec notes-api printenv

# Test database connection
docker-compose exec notes-api node -e "console.log('Testing DB connection...')"

# Check file permissions
docker-compose exec notes-api ls -la
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

---

## 🎯 Summary

Your CRUD Notes API is now fully dockerized with:

✅ **Production-ready containers**
✅ **Development environment**
✅ **Health checks and monitoring**
✅ **Security best practices**
✅ **Scalability support**
✅ **Comprehensive documentation**

The application is ready for deployment in any Docker-compatible environment!