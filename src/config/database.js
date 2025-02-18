const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://bijukgeorge86:zhpiPGXBLqWHvO9j@nodemongodblearn.f2rz0.mongodb.net/devTinder"
    );
};

module.exports = connectDB;
