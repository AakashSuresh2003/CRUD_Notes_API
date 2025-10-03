// MongoDB initialization script
db = db.getSiblingDB('notes_db');

// Create the database user
db.createUser({
  user: 'notes_user',
  pwd: 'notes_password',
  roles: [
    {
      role: 'readWrite',
      db: 'notes_db'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('notes');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.notes.createIndex({ "user_id": 1 });
db.notes.createIndex({ "createdAt": -1 });

print('Database initialized successfully!');