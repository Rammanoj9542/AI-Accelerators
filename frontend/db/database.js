const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// MongoDB connection setup
const mongoIp = process.env.mongo_ip;
const mongoPort = process.env.mongo_port;

// Constructing the MongoDB URI
const dbUri = `mongodb://${mongoIp}:${mongoPort}/`;

const client = new MongoClient(dbUri);

function getConfigData() {
    const dbPath = path.join(__dirname);
    const configPath = path.join(dbPath, 'config.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
}

const configData = getConfigData();

// Function to create the database and initialize it with predefined data
async function createDatabase() {
    try {
        if (!client.isConnected) {
            await client.connect();
        }
        const db = client.db('aiAccelerator');

        // Extract collections and data from the configuration files
        const collectionsData = [
            { collection: db.collection('userDetails'), data: configData.UsersData, key: 'userid' },
            { collection: db.collection('orgDetails'), data: configData.orgData, key: 'orgId' },
            { collection: db.collection('STTmodes'), data: configData.STTmodes, key: 'mode' },
            { collection: db.collection('STTmodelTypes'), data: configData.STTmodelTypes, key: 'modelType' },
            { collection: db.collection('STTmodelNames'), data: configData.STTmodelNames, key: 'engine' },
            { collection: db.collection('modeTypes'), data: configData.modeTypes, key: 'modeType' },
            { collection: db.collection('LLMmodelTypes'), data: configData.LLMmodelTypes, key: 'modelType' },
            { collection: db.collection('LLMmodelNames'), data: configData.LLMmodelNames, key: 'modelName' },
            { collection: db.collection('RAGmodelNames'), data: configData.RAGmodelNames, key: 'modelName' },
            { collection: db.collection('RAGdeviceTypes'), data: configData.RAGdeviceTypes, key: 'deviceType' },
            { collection: db.collection('RAGsplitterTypes'), data: configData.RAGsplitterTypes, key: 'splitterType'},
            { collection: db.collection('RAGretrievalTypes'), data: configData.RAGretrievalTypes, key: 'retrievalType'}
        ];

        await Promise.all(collectionsData.map(async ({ collection, data, key }) => {
            await checkAndInsertData(collection, data, key);
        }));

    } catch (e) {
        console.error(`Error initializing database: ${e}`);
    }
}

// Function to check and insert data into a collection if it doesn't exist
async function checkAndInsertData(collection, data, key) {
    for (let i = 0; i < data.length; i++) {
        const query = {};
        query[key] = data[i][key];
        const result = await collection.findOne(query);
        if (!result) {
            await collection.insertOne(data[i]);
        }
    }
}

async function initializeDatabase() {
    try {
        await client.connect();
        await createDatabase();
    } catch (e) {
        console.error(`Error in initializing Database: ${e}`);
    }
}

initializeDatabase();

module.exports = [initializeDatabase];