/* eslint-disable no-console */
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

// Read the MONGODB_URI from the .config file
const configFilePath = './.config';
if (!fs.existsSync(configFilePath)) {
  console.error(
    '.config file not found. Please create one with your MONGODB_URI.',
  );
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI as string;

// Connect to MongoDB
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

// Define a schema and model for your data
const schema = new mongoose.Schema({
  name: String,
  age: Number,
});

const MyModel = mongoose.model('MyModel', schema);

// Add some data to the database
const newData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

MyModel.insertMany(newData)
  .then((docs) => {
    console.log('Added data to the database:');
    console.log(docs);
  })
  .catch((err) => {
    console.error('Error adding data:', err);
  })
  .finally(() => {
    // Close the database connection
    db.close();
  });
