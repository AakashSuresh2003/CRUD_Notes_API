const mongoose = require("mongoose");

const ConnectDB = async () => {
    try {
        console.log("MongoDB URI:", process.env.MONGODB_URI); 
        mongoose.set('strictQuery', false);
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected ${connect.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = ConnectDB;
