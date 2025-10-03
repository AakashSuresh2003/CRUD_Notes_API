#!/bin/bash

# CRUD Notes API Docker Quick Start Script
# This script helps you quickly set up and run the dockerized application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker service."
        exit 1
    fi
    
    # Check for Docker Compose (v2 syntax)
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please ensure Docker Desktop or Docker Compose is installed."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ "$1" = "dev" ]; then
        if [ ! -f .env.development ]; then
            print_warning ".env.development file not found. Creating from template..."
            cp .env.example .env.development
            # Update for development
            sed -i.bak 's/your-development-jwt-secret-key-change-this/dev-jwt-secret-key-12345/g' .env.development
            sed -i.bak 's/your-development-cookie-secret-key-change-this/dev-cookie-secret-key-12345/g' .env.development
            rm .env.development.bak 2>/dev/null || true
        fi
    else
        if [ ! -f .env.production ]; then
            print_warning ".env.production file not found. Creating from template..."
            cp .env.example .env.production
            print_warning "Please update .env.production file with your secure production values!"
        fi
    fi
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your configuration!"
    fi
    
    print_success "Environment setup complete"
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    if [ "$1" = "dev" ]; then
        docker compose -f docker-compose.dev.yml build
    else
        docker compose build
    fi
    
    print_success "Docker images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    if [ "$1" = "dev" ]; then
        print_status "Starting development environment..."
        docker compose -f docker-compose.dev.yml up -d
        print_success "Development environment started!"
        print_status "API available at: http://localhost:3000"
        print_status "Debug port available at: 9229"
        print_status "MongoDB available at: localhost:27017"
    else
        print_status "Starting production environment..."
        docker compose up -d
        print_success "Production environment started!"
        print_status "API available at: http://localhost:3000"
        print_status "MongoDB available at: localhost:27017"
        print_status "Redis available at: localhost:6379"
        print_status "Nginx available at: http://localhost:80"
    fi
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker compose ps
    
    echo ""
    print_status "Health check:"
    sleep 5 # Wait for services to be ready
    
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "API is healthy!"
        curl -s http://localhost:3000/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/health
    else
        print_warning "API health check failed. Services might still be starting..."
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing application logs (Ctrl+C to exit):"
    docker compose logs -f notes-api
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ "$1" = "dev" ]; then
        docker compose -f docker-compose.dev.yml down
    else
        docker compose down
    fi
    
    print_success "Services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v
        docker system prune -f
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests in container..."
    
    if [ "$1" = "dev" ]; then
        docker compose -f docker-compose.dev.yml exec notes-api-dev npm test
    else
        docker compose exec notes-api npm test
    fi
}

# Function to show help
show_help() {
    echo "CRUD Notes API Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [dev]     Start the application (dev for development mode)"
    echo "  stop [dev]      Stop the application"
    echo "  restart [dev]   Restart the application"
    echo "  status          Show container status and health"
    echo "  logs            Show application logs"
    echo "  test [dev]      Run tests in container"
    echo "  build [dev]     Build Docker images"
    echo "  cleanup         Remove all containers and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start        # Start production environment"
    echo "  $0 start dev    # Start development environment"
    echo "  $0 logs         # Show logs"
    echo "  $0 test dev     # Run tests in development container"
}

# Main script logic
main() {
    case "$1" in
        "start")
            check_docker
            setup_environment
            build_images "$2"
            start_services "$2"
            show_status
            ;;
        "stop")
            stop_services "$2"
            ;;
        "restart")
            stop_services "$2"
            check_docker
            start_services "$2"
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "test")
            run_tests "$2"
            ;;
        "build")
            check_docker
            build_images "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            print_error "No command specified"
            show_help
            exit 1
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"