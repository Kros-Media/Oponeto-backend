const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://Mateusz:Aneczka96@cluster0.xflo1s4.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = 'Oponeto';
const dbUsersName = 'Mateusz';

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Komunikacja z bazą danych uruchomiona');
    return client.db(dbName);
  } catch (error) {
    console.error(`Wystąpił błąd podczas łączenia z bazą danych: ${error.message}`);
    throw error;
  }
}

async function getCollection(collectionName) {
  const db = client.db(dbName);
  return db.collection(collectionName);
}

async function getUsersCollection() {
  const db = client.db(dbUsersName);
  return db.collection('users');
}

module.exports = { connectToDatabase, getCollection, getUsersCollection, dbName, dbUsersName };
