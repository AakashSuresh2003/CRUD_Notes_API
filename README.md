# Notes API

This project is an API for managing notes. It provides endpoints for creating, retrieving, updating, and deleting notes, as well as user authentication and registration functionalities.

## Features

- User Registration: Allows users to sign up for an account.
- User Login: Enables registered users to log in and obtain an authentication token.
- User Logout: Allows users to log out and invalidate their authentication token.
- Note Management: Provides CRUD (Create, Read, Update, Delete) operations for managing notes.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Express Validator for request validation

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/AakashSuresh2003/CRUD_Notes_API.git
   ```

2. Install dependencies:

   ```
   cd Notes_API
   npm install
   npm install express jsonwebtoken dotenv cookie-parser express-validator mongoose
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```
   PORT=3000
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=<your-desired-expire-time>
   ```

4. Start the server:

   ```
   npm start
   ```

## API Endpoints

### Authentication

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in and obtain an authentication token.
- `GET /auth/logout`: Log out and invalidate the authentication token.
- `GET /auth/refetch`: Fetch user data using a valid authentication token.

### Notes

- `GET /notes`: Get all notes.
- `GET /notes/:id`: Get a specific note by ID.
- `POST /notes`: Create a new note.
- `PUT /notes/:id`: Update a note by ID.
- `DELETE /notes/:id`: Delete a note by ID.

## Usage

1. Register a new user using the `/auth/register` endpoint.
2. Log in using the `/auth/login` endpoint to obtain an authentication token.
3. Use the obtained token to access protected endpoints (e.g., create, read, update, delete notes).
4. Log out using the `/auth/logout` endpoint to invalidate the authentication token.
