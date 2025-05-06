const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure the database name is included in the connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@e-commerce-computer-sel.8dllrse.mongodb.net/computer-selling';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 