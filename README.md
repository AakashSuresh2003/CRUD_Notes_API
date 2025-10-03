# CRUD Notes API

This project is a comprehensive API for managing notes with robust authentication and testing. It provides secure endpoints for creating, retrieving, updating, and deleting notes, along with user authentication and registration functionalities.

## ✨ Features

- **User Registration**: Secure user account creation with password hashing
- **User Authentication**: JWT-based login/logout system with secure cookies
- **User Session Management**: Token validation and user refetching capabilities
- **Note Management**: Full CRUD operations for notes with user isolation
- **Input Validation**: Comprehensive request validation and sanitization
- **Security**: Password hashing, JWT tokens, user data protection
- **Error Handling**: Robust error handling with proper HTTP status codes
- **Testing**: Comprehensive test suite with 81+ tests covering all functionality

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Bcrypt for password hashing
- **Validation**: Express Validator for request validation
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Development**: Nodemon for development server

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AakashSuresh2003/CRUD_Notes_API.git
   cd CRUD_Notes_API
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/crud_notes_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

   Or start the production server:
   ```bash
   npm start
   ```

## 🧪 Testing

This project includes a comprehensive test suite with 81+ tests covering all functionality.

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
- **Models**: Data validation and database operations
- **Controllers**: Business logic and error handling  
- **Middleware**: Authentication and authorization
- **Routes**: API endpoint functionality
- **Validation**: Input sanitization and validation
- **Database**: Connection and error handling
- **Security**: JWT tokens, password hashing, user isolation

For detailed test documentation, see [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md).

## 🔌 API Endpoints

### Authentication Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/register` | Register a new user | No |
| POST | `/api/user/login` | Log in and obtain authentication token | No |
| GET | `/api/user/logout` | Log out and clear authentication token | No |
| GET | `/api/user/refetch` | Fetch user data using valid token | Yes |

### Notes Routes (`/api/v1/notes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/notes` | Get all notes for authenticated user | Yes |
| GET | `/api/v1/notes/:id` | Get specific note by ID | Yes |
| POST | `/api/v1/notes` | Create a new note | Yes |
| PUT | `/api/v1/notes/:id` | Update note by ID | Yes |
| DELETE | `/api/v1/notes/:id` | Delete note by ID | Yes |

## 📖 Usage Examples

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

### 3. Create a Note
```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token_here" \
  -d '{
    "title": "My First Note",
    "description": "This is the content of my first note"
  }'
```

### 4. Get All Notes
```bash
curl -X GET http://localhost:3000/api/v1/notes \
  -H "Cookie: token=your_jwt_token_here"
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: Users can only access their own notes
- **Input Validation**: All inputs are validated and sanitized
- **Secure Cookies**: HTTP-only, secure, and SameSite cookie configuration
- **Error Handling**: Sensitive information is never exposed in error messages

## 🚀 Production Deployment

1. Set environment variables:
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_super_secure_production_secret
   JWT_EXPIRES_IN=7d
   PORT=3000
   ```

2. Install dependencies:
   ```bash
   npm ci --only=production
   ```

3. Start the application:
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
CRUD_Notes_API/
├── src/
│   ├── controller/          # Route controllers
│   │   ├── auth.controller.js
│   │   └── notes.controller.js
│   ├── DataBase/           # Database configuration
│   │   └── db.js
│   ├── middleware/         # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/            # Mongoose models
│   │   ├── user.models.js
│   │   └── notes.models.js
│   ├── router/            # Route definitions
│   │   ├── auth.router.js
│   │   └── notes.router.js
│   └── validation/        # Input validation schemas
│       └── post.validation.js
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── utils/            # Test utilities
├── .github/workflows/    # CI/CD configuration
├── index.js              # Application entry point
├── jest.config.js        # Jest configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js community for the excellent web framework
- MongoDB team for the robust database solution
- Jest team for the comprehensive testing framework
- All contributors and supporters of this project

---

**Built with ❤️ by [AakashSuresh2003](https://github.com/AakashSuresh2003)**
