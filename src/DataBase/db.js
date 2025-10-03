const mongoose = require("mongoose");

const ConnectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined");
        }
        
        console.log("Connecting to MongoDB...");
        mongoose.set('strictQuery', false);
        
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`Database connected: ${connect.connection.host}`);
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};

module.exports = ConnectDB;
