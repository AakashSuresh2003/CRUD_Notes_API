# CRUD Notes API - Test Documentation

## 📁 Test Structure

```
tests/
├── unit/                          # Unit tests for individual components
│   ├── user.model.test.js        # User model validation & database operations
│   ├── notes.model.test.js       # Notes model validation & database operations
│   ├── authMiddleware.test.js    # Authentication middleware tests
│   ├── validation.test.js        # Input validation schema tests
│   └── database.test.js          # Database connection tests
├── integration/                   # Integration tests for API endpoints
│   ├── auth.routes.test.js       # Authentication routes testing
│   └── notes.routes.test.js      # Notes CRUD routes testing
└── utils/                         # Test utilities and helpers
    ├── setup.js                  # Jest setup with MongoDB Memory Server
    └── helpers.js                # Test helper functions

Additional files:
├── jest.config.js                # Jest configuration
├── run-tests.js                  # Custom test runner script
└── test-api.js                   # API health check script
```

## 🧪 Test Categories

### Unit Tests (42 tests)

#### 1. User Model Tests (14 tests)
- **Validation Tests (11 tests)**:
  - ✅ Valid user creation
  - ✅ Required field validation (username, fullName, email, password)
  - ✅ Email format validation
  - ✅ Username length constraints (3-30 characters)
  - ✅ Password minimum length (6 characters)
  - ✅ Field trimming and email lowercase conversion

- **Database Operations (3 tests)**:
  - ✅ User saving with timestamps
  - ✅ Unique username constraint
  - ✅ Unique email constraint

#### 2. Notes Model Tests (13 tests)
- **Validation Tests (10 tests)**:
  - ✅ Valid note creation
  - ✅ Required field validation (user_id, title, description)
  - ✅ Title length constraints (5-100 characters)
  - ✅ Description length constraints (5-500 characters)
  - ✅ Field trimming
  - ✅ ObjectId validation for user_id

- **Database Operations (3 tests)**:
  - ✅ Note saving with user reference
  - ✅ User population in queries
  - ✅ Multiple notes per user support

#### 3. Auth Middleware Tests (7 tests)
- ✅ Valid token authentication
- ✅ Missing token handling
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Wrong signature handling
- ✅ Malformed token handling
- ✅ Empty token handling

#### 4. Validation Schema Tests (4 tests)
- ✅ Title validation rules
- ✅ Description validation rules
- ✅ Error message accuracy
- ✅ Schema export verification

#### 5. Database Connection Tests (4 tests)
- ✅ Successful connection
- ✅ Missing URI handling
- ✅ Connection error handling
- ✅ Mongoose configuration

### Integration Tests (39+ tests)

#### 1. Authentication Routes Tests (16 tests)

**POST /api/user/register**:
- ✅ Successful user registration
- ✅ Missing field validation
- ✅ Duplicate username handling
- ✅ Duplicate email handling
- ✅ Database error handling

**POST /api/user/login**:
- ✅ Username/password login
- ✅ Email/password login
- ✅ Missing credentials handling
- ✅ Invalid user handling
- ✅ Wrong password handling
- ✅ Secure cookie configuration

**GET /api/user/logout**:
- ✅ Successful logout
- ✅ Cookie clearing

**GET /api/user/refetch**:
- ✅ Valid token user fetch
- ✅ Missing token handling
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Deleted user handling

#### 2. Notes Routes Tests (23 tests)

**GET /api/v1/notes**:
- ✅ Fetch all user notes
- ✅ Empty notes array
- ✅ User isolation (only own notes)
- ✅ Unauthorized access protection

**GET /api/v1/notes/:id**:
- ✅ Fetch specific note
- ✅ Non-existent note handling
- ✅ Other user's note protection
- ✅ Unauthorized access protection

**POST /api/v1/notes**:
- ✅ Create new note
- ✅ Missing title validation
- ✅ Missing description validation
- ✅ Validation error handling
- ✅ Unauthorized access protection

**PUT /api/v1/notes/:id**:
- ✅ Update existing note
- ✅ Non-existent note handling
- ✅ Other user's note protection
- ✅ Unauthorized access protection

**DELETE /api/v1/notes/:id**:
- ✅ Delete existing note
- ✅ Non-existent note handling
- ✅ Other user's note protection
- ✅ Unauthorized access protection

## 🔧 Test Configuration

### Jest Configuration
- **Environment**: Node.js
- **Test Timeout**: 30 seconds
- **Database**: MongoDB Memory Server (in-memory)
- **Workers**: 1 (serial execution to avoid conflicts)
- **Coverage**: Enabled for `src/` directory

### Test Environment Variables
```env
NODE_ENV=test
JWT_SECRET=test_secret_for_testing
JWT_EXPIRES_IN=1h
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### With Coverage Report
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Custom Test Runner
```bash
node run-tests.js
```

## 🛠️ Test Utilities

### Helper Functions
- `generateTestUser()` - Creates test user data
- `generateTestNote()` - Creates test note data
- `createTestUser()` - Saves test user to database
- `createTestNote()` - Saves test note to database
- `generateAuthToken()` - Creates JWT tokens for testing
- `loginUser()` - Simulates user login flow
- `testMissingField()` - Tests missing field validation
- `testUnauthorized()` - Tests unauthorized access

### Test Database
- Uses MongoDB Memory Server for isolation
- Automatic cleanup after each test
- No external database dependencies
- Fast test execution

## 📊 Test Coverage

The test suite provides comprehensive coverage of:
- ✅ **Models**: Data validation and database operations
- ✅ **Controllers**: Business logic and error handling  
- ✅ **Middleware**: Authentication and authorization
- ✅ **Routes**: API endpoint functionality
- ✅ **Validation**: Input sanitization and validation
- ✅ **Database**: Connection and error handling
- ✅ **Security**: JWT tokens, password hashing, user isolation

## 🔒 Security Testing

### Authentication & Authorization
- ✅ JWT token validation
- ✅ Token expiration handling
- ✅ Invalid token protection
- ✅ Missing token protection
- ✅ User session management

### Data Protection
- ✅ User data isolation
- ✅ Password hashing verification
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (via Mongoose)
- ✅ Cross-user data access prevention

## 🐛 Error Handling Testing

### Model Validation Errors
- ✅ Missing required fields
- ✅ Invalid data formats
- ✅ Length constraints
- ✅ Unique constraint violations

### API Error Responses
- ✅ 400 Bad Request (validation errors)
- ✅ 401 Unauthorized (authentication errors)
- ✅ 404 Not Found (resource not found)
- ✅ 409 Conflict (duplicate resources)
- ✅ 500 Internal Server Error (server errors)

### Database Error Handling
- ✅ Connection failures
- ✅ Query errors
- ✅ Constraint violations
- ✅ Timeout handling

## 📈 Performance Considerations

- Tests run in parallel where possible
- In-memory database for speed
- Minimal test data creation
- Efficient cleanup procedures
- Isolated test environments

## 🎯 Best Practices Implemented

1. **Test Isolation**: Each test is independent
2. **Data Cleanup**: Automatic cleanup after each test
3. **Realistic Data**: Tests use realistic test data
4. **Error Scenarios**: Comprehensive error testing
5. **Security Focus**: Authentication and authorization testing
6. **Documentation**: Well-documented test purposes
7. **Maintainability**: Modular test structure with helpers

## 🔄 Continuous Testing

The test suite is designed to be run:
- ✅ Before every commit
- ✅ In CI/CD pipelines
- ✅ During development (watch mode)
- ✅ Before deployments
- ✅ For regression testing

This comprehensive test suite ensures your CRUD Notes API is robust, secure, and reliable! 🎉