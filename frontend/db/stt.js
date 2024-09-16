const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const yaml = require('js-yaml');

// MongoDB connection setup
const mongoIp = process.env.mongo_ip;
const mongoPort = process.env.mongo_port;

// Constructing the MongoDB URI
const dbUri = `mongodb://${mongoIp}:${mongoPort}/`;

const client = new MongoClient(dbUri);


// Function to generate a random ID for various purposes
function generateID(length) {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - STT Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Function to get STT modes
async function getSttModes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modesCollection = db.collection("STTmodes");
        const modesCursor = modesCollection.find({}, { projection: { _id: 0 } });
        const modes = await modesCursor.toArray();
        const modesList = modes.map(mode => mode.mode);
        return modesList;
    } catch (e) {
        console.error(`Error in getModes: ${e}`);
        return [];
    }
}

// Function to get STT models types
async function getSttModelsTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelTypesCollection = db.collection("STTmodelTypes");
        const modelTypessCursor = modelTypesCollection.find({}, { projection: { _id: 0 } });
        const modelTypess = await modelTypessCursor.toArray();
        const modelTypessList = modelTypess.map(model => model.modelType);
        return modelTypessList;
    } catch (e) {
        console.error(`Error in getModels: ${e}`);
        return [];
    }
}

// Function to get model names 
async function getSTTModelNames(modelType) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelNameCollection = db.collection("STTmodelNames");
        const modelNamesCursor = modelNameCollection.find({ modelType: modelType }, { projection: { _id: 0, engine: 0 } });
        const modelNames = await modelNamesCursor.toArray();
        const modelNameList = modelNames.map(model => model.modelName);
        return modelNameList;
    } catch (e) {
        console.error(`Error in getSTTModelNames: ${e}`);
        return [];
    }
}

// Function to get engines based on model name
async function getSTTEngines(modelType, modelName) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const engineCollection = db.collection("STTmodelNames");
        const engineCursor = engineCollection.find({ modelType: modelType, modelName: modelName }, { projection: { _id: 0, modelType: 0, modelName: 0 } });
        const engines = await engineCursor.toArray();
        const engineList = engines.map(engine => engine.engine);
        return engineList;
    } catch (e) {
        console.error(`Error in getEngines: ${e}`);
        return [];
    }
}

// Function to add STT model to the database
async function getSttModelIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("STTModels");
        const existingModelIdsCursor = STTModels.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, modelName: 0 } });
        const existingModelIds = await existingModelIdsCursor.toArray();
        const modelIds = existingModelIds.map(model => model.modelId);
        return modelIds;
    } catch (e) {
        console.error(`Error Fetching STT 'ModelIds' table: ${e}`);
    }
}

// Function to retrieve STT configuration IDs for a specific client API key
async function getSttConfigIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("STTConfigs");
        const existingConfigIdsCursor = STTConfigs.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, modelName: 0 } });
        const existingConfigIds = await existingConfigIdsCursor.toArray();
        const configIds = existingConfigIds.map(config => config.sttId);
        return configIds;
    } catch (e) {
        console.error(`Error Fetching STT 'ModelIds' table: ${e}`);
    }
}

// Function to add STT model to the database
async function addSttModel(organisation, clientApiKey, modelType, modelName, engine) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("STTModels");

        let isModelIdNew = false;
        let modelId;

        do {
            modelId = generateID(4);
            isModelIdNew = await STTModels.findOne({ clientApiKey: clientApiKey, modelId: modelId });
        } while (isModelIdNew);

        const timestamp = moment.utc().unix();
        const STTModelsData = { clientApiKey: clientApiKey, modelId: modelId, modelType: modelType, modelName: modelName, engine: engine, timestamp: timestamp };
        await STTModels.insertOne(STTModelsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'STTModels' table: ${e}`);
        return false;
    }
}


// Function to update an existing STT model in the database
async function updateSttModel(organisation, clientApiKey, modelId, modelType, modelName, engine) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("STTModels");
        const timestamp = moment.utc().unix();
        await STTModels.updateOne(
            { clientApiKey: clientApiKey, modelId: modelId },
            { $set: { modelType: `${modelType}`, modelName: `${modelName}`, engine: `${engine}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating STT Model : ${e}`);
        return false;
    }
}

// Function to retrieve STT model details for a specific client API key
async function getSttModelDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("STTModels");
        const modelDetailsCursor = await STTModels.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

async function getSttModelInfo(organisation, clientApiKey, ModelID) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("STTModels");
        const modelDetailsCursor = await STTModels.find({ clientApiKey: clientApiKey, modelId: ModelID }, { projection: { _id: 0, modelType: 1, modelName: 1, timestamp: 1 } })
            .sort({ timestamp: -1 })
            .toArray() // Sort by timestamp in descending order
        return modelDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

// Function to add STT configuration to the database
async function addSttConfig(organisation, clientApiKey, mode) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("STTConfigs");

        let isConfigNew = false;
        let sttid;

        do {
            sttid = generateID(4);
            isConfigNew = await STTConfigs.findOne({ clientApiKey: clientApiKey, sttId: sttid });
        } while (isConfigNew);

        const timestamp = moment.utc().unix();
        const STTConfigsData = { clientApiKey: clientApiKey, sttId: sttid, mode: mode, timestamp: timestamp };
        await STTConfigs.insertOne(STTConfigsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'STTModels' table: ${e}`);
        return false;
    }
}

// Function to update an existing STT configuration in the database
async function updateSttConfig(organisation, clientApiKey, sttid, mode) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("STTConfigs");
        const timestamp = moment.utc().unix();
        await STTConfigs.updateOne(
            { clientApiKey: clientApiKey, sttId: sttid },
            { $set: { mode: `${mode}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating STT Config : ${e}`);
        return false;
    }
}

// Function to retrieve STT configuration details for a specific client API key
async function getSttConfigDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("STTConfigs");
        const configDetailsCursor = await STTConfigs.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return configDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Config Details : ${e}`);
    }
}

// Function to retrieve STT configuration info for a specific client API key and stt Id
async function getSttConfigInfo(organisation, clientApiKey, sttId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("STTConfigs");
        const configInfoCursor = await STTConfigs.find({ clientApiKey: clientApiKey, sttId: sttId }, { projection: { _id: 0, mode: 1, timestamp: 1 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return configInfoCursor;
    } catch (e) {
        console.error(`Error fetching Config info : ${e}`);
    }
}

async function addSttDeployId(organisation, tagName, clientApiKey, sttId, modelId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        let isDeployIdNew = false;
        let deployId;
        const isTagName = await deploymentConfig.findOne({clientApiKey: clientApiKey, tagName: tagName });

        if (isTagName) {
            return false
        } else {
            do {
                deployId = generateID(4);
                isDeployIdNew = await deploymentConfig.findOne({ clientApiKey: clientApiKey, deployId: deployId });
            } while (isDeployIdNew);

            const timestamp = moment.utc().unix();
            const STTDeployData = { tagName: tagName, clientApiKey: clientApiKey, deployId: deployId, modelId: modelId, sttId: sttId, serviceApi: '5005/stt/server', service: 'STT', timestamp: timestamp };
            await deploymentConfig.insertOne(STTDeployData);
            return true;
        }
    } catch (e) {
        console.error(`Error adding into 'deploy config' table: ${e}`);
        return false;
    }
}

// Function to retrieve STT Deploy details for a specific client API key
async function getSttDeployDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const DeploymentConfig = db.collection("DeploymentConfig");
        const deployDetailsCursor = await DeploymentConfig.find({ clientApiKey: clientApiKey, service: 'STT' }, { projection: { _id: 0, tagName:1, deployId: 1, modelId: 1, sttId: 1, timestamp: 1 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return deployDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Deploy Details : ${e}`);
    }
}
// Function to update an existing STT Deploy ID Details in the database
async function updateSttDeploy(organisation, oldTagName, newTagName, clientApiKey, deployId, modelId, sttid ) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTConfigs = db.collection("DeploymentConfig");
        const timestamp = moment.utc().unix();

        if (newTagName !== oldTagName) {
            const isTagName = await STTConfigs.findOne({clientApiKey: clientApiKey, service: 'STT', tagName: newTagName });
            if(isTagName){
                return 409
            }
        }
        await STTConfigs.updateOne(
            { clientApiKey: clientApiKey, deployId: deployId, service: 'STT' },
            { $set: { tagName:`${newTagName}`,modelId: `${modelId}`,sttid:`${sttid}`, timestamp: timestamp } }
        );
        return 200;
    } catch (e) {
        console.error(`Error Updating STT Deploy Details : ${e}`);
        return 500;
    }
}
module.exports = [getSttModes, getSttModelsTypes, addSttModel, getSttModelDetails, getSttModelInfo, getSTTModelNames, getSTTEngines, addSttConfig, getSttConfigDetails, getSttModelIds, updateSttModel, getSttConfigIds, updateSttConfig, getSttConfigInfo, addSttDeployId, getSttDeployDetails,updateSttDeploy];