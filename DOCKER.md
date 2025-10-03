# Docker Deployment Guide

This guide explains how to run the CRUD Notes API using Docker in both development and production environments.

## Prerequisites

- Docker v20.10+
- Docker Compose v2.0+
- 8GB+ RAM recommended
- 10GB+ free disk space

## Quick Start

### Development Environment

```bash
# Start development environment
./docker-run.sh start dev

# Stop development environment
./docker-run.sh stop dev

# View logs
./docker-run.sh logs dev
```

### Production Environment

```bash
# Start production environment
./docker-run.sh start prod

# Stop production environment
./docker-run.sh stop prod

# View logs
./docker-run.sh logs prod
```

## Environment Details

### Development Environment

- **API**: http://localhost:3000
- **Debug Port**: 9229 (for VS Code debugging)
- **MongoDB**: localhost:27017
- **Hot Reload**: Enabled with nodemon
- **Environment**: `.env.development`

**Services:**
- `notes-api-dev`: Node.js API with live reload
- `mongodb-dev`: MongoDB 7.0 for development

### Production Environment

- **API**: http://localhost:3000 (direct) or http://localhost:80 (via Nginx)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Nginx**: http://localhost:80, https://localhost:443
- **Environment**: `.env.production`

**Services:**
- `notes-api`: Optimized Node.js API
- `mongodb`: MongoDB 7.0 with persistent storage
- `redis`: Redis 7 for caching and sessions
- `nginx`: Nginx reverse proxy with SSL ready

## Health Monitoring

Check application health:

```bash
# Development
curl http://localhost:3000/health

# Production (direct)
curl http://localhost:3000/health

# Production (via Nginx)
curl http://localhost:80/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T16:13:32.633Z",
  "uptime": 15.07280759,
  "environment": "development|production"
}
```

## Docker Management Script

The `docker-run.sh` script provides comprehensive Docker management:

```bash
# Available commands
./docker-run.sh start [dev|prod]     # Start environment
./docker-run.sh stop [dev|prod]      # Stop environment
./docker-run.sh restart [dev|prod]   # Restart environment
./docker-run.sh logs [dev|prod]      # View logs
./docker-run.sh clean                # Clean up resources
./docker-run.sh test                 # Run tests in container
./docker-run.sh status               # Show status
./docker-run.sh help                 # Show help
```

## NPM Scripts

Alternative Docker commands via npm:

```bash
npm run compose:dev          # Start development
npm run compose:up           # Start production
npm run compose:down         # Stop all services
npm run compose:logs         # View logs
npm run compose:restart      # Restart API service
```

## Environment Variables

### Development (.env.development)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://mongodb-dev:27017/crud_notes_dev
JWT_SECRET=dev_secret_key_here
JWT_EXPIRE=24h
BCRYPT_SALT=10
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/crud_notes
JWT_SECRET=production_secret_key_here
JWT_EXPIRE=24h
BCRYPT_SALT=12
REDIS_URL=redis://redis:6379
```

## Security Features

### Production Security
- Non-root user execution (nodejs:1001)
- Read-only root filesystem
- Limited CPU and memory resources
- Security headers via Nginx
- SSL/TLS ready configuration
- Network isolation

### Development Security
- Isolated development network
- Separate database instance
- Debug port access control

## Persistent Storage

### Development
- `crud_notes_api_mongodb_dev_data`: Development database

### Production
- `crud_notes_api_mongodb_data`: Production database
- Automated backups recommended

## Debugging

### Development Debugging
1. Ensure development environment is running
2. Attach debugger to port 9229
3. Set breakpoints in your IDE

### Container Debugging
```bash
# Enter container shell
docker exec -it notes-api-dev sh          # Development
docker exec -it notes-api sh              # Production

# View container logs
docker compose -f docker-compose.dev.yml logs -f notes-api-dev
docker compose logs -f notes-api

# Check container health
docker compose ps
```

## Performance Optimization

### Production Optimizations
- Multi-stage Docker builds
- Production-only dependencies
- Alpine Linux base images
- Nginx reverse proxy
- Redis caching layer
- Health checks and auto-restart

### Resource Limits
- API: 512MB RAM, 0.5 CPU
- MongoDB: 1GB RAM, 1 CPU
- Redis: 256MB RAM, 0.25 CPU
- Nginx: 128MB RAM, 0.25 CPU

## Testing

Run tests in containerized environment:

```bash
# Run all tests
./docker-run.sh test

# Current test coverage: 90.57%
# - Overall: 90.57% (106 tests)
# - Controllers: 88.54%
# - Models: 100%
# - Routes: 88.46%
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 27017, 6379, 80, 443, 9229 are available
2. **Memory issues**: Increase Docker memory allocation to 8GB+
3. **Permission errors**: Ensure Docker daemon is running with proper permissions
4. **Network issues**: Check firewall settings and Docker network configuration

### Logs Analysis
```bash
# API logs
./docker-run.sh logs [dev|prod]

# MongoDB logs
docker compose logs mongodb
docker compose -f docker-compose.dev.yml logs mongodb-dev

# Nginx logs
docker compose logs nginx
```

### Health Check Failures
```bash
# Check container status
docker compose ps

# Restart specific service
docker compose restart notes-api

# Force recreate
docker compose up --force-recreate notes-api
```

## SSL/HTTPS Setup (Production)

The Nginx configuration supports SSL. To enable HTTPS:

1. Place SSL certificates in `./nginx/ssl/`
2. Update `nginx.conf` SSL configuration
3. Restart Nginx container

## Backup and Recovery

### Database Backup
```bash
# Backup development database
docker exec notes-mongodb-dev mongodump --out /backup

# Backup production database
docker exec notes-mongodb mongodump --out /backup
```

### Restore Database
```bash
# Restore to development
docker exec notes-mongodb-dev mongorestore /backup

# Restore to production
docker exec notes-mongodb mongorestore /backup
```

## Scaling

For production scaling:

1. Use Docker Swarm or Kubernetes
2. Implement load balancer
3. Set up MongoDB replica set
4. Configure Redis cluster
5. Monitor with application metrics

## Support

For issues and questions:
- Check container logs first
- Verify environment configuration
- Ensure all required ports are available
- Review Docker and system resource usage