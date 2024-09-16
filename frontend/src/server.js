const express = require('express');
const cors = require('cors');
const session = require('express-session');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');
const AES = require('crypto-js/aes');
const encUtf8 = require('crypto-js/enc-utf8');
const path = require('path');
const fs = require('fs');
const app = express();
const xss = require('xss');
const winston = require('winston');
const fileUpload = require('express-fileupload');

const configData = require('./constants/config.json');
const AIServicesIp = process.env.AIServicesIp;
const AIServerPort = process.env.AIServerPort;
const RAG_API_URL = `http://${AIServicesIp}:${AIServerPort}`;

// Import database functions
require('../db/database');
const [authenticateUser, createUser, getUserData, validateEmailandSendOTP] = require('../db/authenticate');
const [addClientApiKeys, getClientApiKeys, getClientApiKeysData, addOrg, getOrgIds, updateOrg, getFullOrgsData, updateAdmin, getFullAdminsData, addDeployment, getDeploymentIds, updateDeployment, getDeploymentDetails] = require('../db/utils');
const [getSttModes, getSttModelsTypes, addSttModel, getSttModelDetails, getSttModelInfo, getSTTModelNames, getSTTEngines, addSttConfig, getSttConfigDetails, getSttModelIds, updateSttModel, getSttConfigIds, updateSttConfig, getSttConfigInfo, addSttDeployId, getSttDeployDetails, updateSttDeploy] = require('../db/stt');
const [getLLMModeTypes, getModels, getLLMModelNames, getEngines, addLlmModel, getLlmModelDetails, getLlmModelIds, updateLlmModel, addPrompt, getLlmPromptsData, getLlmPromptIds, updatePrompt, addLLMinferanceParams, getLLMInferanceIdsInfo, updateLLMinferanceParams, getLLMDeployModelInfo, getLLMDeployPromptInfo, addLLMDeployment, getLLMDeployIdsInfo, updateLLMDeployIdInfo] = require('../db/llm');
const [getRAGModelNames, getRAGDeviceTypes, getRagModelIds, addRagModel, getRAGSplitterTypes, updateRagModel, getRagModelDetails, addRagConfig, getRagConfigIds, updateRagConfig, getRagConfigDetails, getRagModelIdInfo, getRagIngestIdInfo, addIngestDeploy, getIngestDeployDetails, updateIngestDeploy, getIngestDeployIdInfo, getRAGretrievalTypes, getRAGretrievalTechs, getRAGretrievalChainTypes, getModelIds, getPromptIds, addRetrievalConfig, getRetrievalConfigDetails, updateRetrievalConfig, addPresistDirPath, getPresistDirPaths, getPresistDirPathInfo, getModelIdInfo, getRetrievalIds, getRetrievalIdInfo, addRetrievalDeploy, getRetrievalDeployDetails] = require('../db/rag')

// Define encryption key and initialization vector
const key = "kojsnhfitonhsuth";
const iv = "odbshirnkofgfffs";

const currentDir = __dirname;
const parentDir = path.join(currentDir, '..', '..');

// Upload files path
const preingestDir = path.join(parentDir, "preingest");
const postingestDir = path.join(parentDir, "postingest");
const archiveDir = path.join(parentDir,'archive');
const workingDir = path.join(currentDir,'..','..','data','workingDir')

// Create the uploads directories if it does not exist
if (!fs.existsSync(preingestDir)) {
    fs.mkdirSync(preingestDir);
}

if (!fs.existsSync(postingestDir)) {
    fs.mkdirSync(postingestDir);
}
// Create the upload directory ifit does not exist
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
}
// Create the upload directory ifit does not exist
if (!fs.existsSync(workingDir)) {
    fs.mkdirSync(workingDir);
}

// Logging
const logdir = path.join(parentDir, "logs");
const log_frontenddir = path.join(logdir, "frontend");

// Create the log and frontend log directory if they does not exist
if (!fs.existsSync(logdir)) {
    fs.mkdirSync(logdir);
}

if (!fs.existsSync(log_frontenddir)) {
    fs.mkdirSync(log_frontenddir);
}

// Create an empty log file with the current date if it does not exist
const logFileName = `${moment().format('DD-MM-YYYY')}.txt`;
const logFilePath = path.join(log_frontenddir, logFileName);

if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ''); // Create an empty log file
}

// Configure winston logger
const logger = winston.createLogger({
    level: 'info', // Default level
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss', // Specify the timestamp format
        }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] - ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: logFilePath,
            level: 'info',
        }), // Log to file with 'info' level
        new winston.transports.Console({
            level: 'debug',
        }), // Log to console with 'debug' level
    ],
});

// Serve static files from the 'build' directory
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Configure session middleware
app.use(
    session({
        secret: crypto.randomBytes(32).toString('hex'), // Replace with your own secret key
        resave: false,
        saveUninitialized: false,
    })
);
app.use(bodyParser.json());
app.use(cors());

// Use express-fileupload middleware
app.use(fileUpload());

// Handle user login
app.post('/login', async (req, res) => {
    const encryptedUsername = req.body.username;
    const encryptedPassword = req.body.password;
    const userTimezone = req.body.userTimezone;

    const username = AES.decrypt(encryptedUsername, key, { iv: encUtf8.parse(iv) }).toString(encUtf8);
    const password = AES.decrypt(encryptedPassword, key, { iv: encUtf8.parse(iv) }).toString(encUtf8);

    logger.info(`${username} - Login request received.`);
    try {
        const isUserAuthenticated = await authenticateUser(username, password);

        if (isUserAuthenticated) {
            req.session.username = xss(username);
            req.session.userid = xss(isUserAuthenticated.userid);
            req.session.role = xss(isUserAuthenticated.role);
            req.session.access_token = xss(isUserAuthenticated.access_token);
            req.session.refresh_token = xss(isUserAuthenticated.refresh_token);
            req.session.organisation = xss(isUserAuthenticated.organisation);
            req.session.userTimezone = userTimezone;

            logger.info(`${username} - Logged in successfully.`);
            res.status(200).json({ message: 'Authentication successful', role: isUserAuthenticated.role });
        } else {
            logger.info(`${username} - Login request failed due to invalid credentials.`);
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`Internal server error while logging in: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to check for a valid token
function tokenRequired(req, res, next) {
    const token = req.session.access_token;

    if (!token) {
        console.error("Token is missing.");
        return res.redirect('/');
    }

    // Debugging the token format and content
    SECRET_KEY = 'your_secret_key';

    try {
        const data = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
        const userId = data.userId; // Retrieve 'userId' from the token payload
        req.userId = userId; // Attach 'userId' to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error("Token has expired.");
            return res.redirect('/');
        } else {
            console.error("Token is invalid.");
            return res.redirect('/');
        }
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/userhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const user_role = req.session.role;
    if (user_role != "user") {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/adminhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const user_role = req.session.role;
    if (user_role != "admin") {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/superadminhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
    const user_role = req.session.role;
    if (user_role != "superadmin") {
        return res.redirect("/");
    }
});

app.get('/passwordreset', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/stt', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/llm', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/rag', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/account', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Route for initiating the password reset process
app.post('/reset_password', async (req, res) => {
    const email = xss(req.body.email);
    logger.info(`Reset password request received from ${email}`);

    try {
        const validateEmailandSendOTPResult = await validateEmailandSendOTP(email);

        if (validateEmailandSendOTPResult.exists) {
            logger.info(`OTP sent successfully to ${email}`);
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            logger.info(`Failed to send OTP to ${email}: ${validateEmailandSendOTPResult.message}`);
            res.status(404).json({ message: validateEmailandSendOTPResult.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`Internal server error while sending OTP: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to retrieve user details based on the username stored in the session
app.post('/get_user_details', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Requested for user details received.`);

    try {
        // Make a POST request to the backend route
        const response = await getUserData(username);

        if (response.exists) {
            logger.info(`${username} - User data retrieved successfully.`);
            res.status(200).json(response.data);
        } else {
            logger.error(`${username} - Failed to retrieve user data: ${response.message}`);
            res.status(404).json({ message: response.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`${username} - Internal server error while fetching user details: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user registration
app.post('/register', tokenRequired, async (req, res) => {
    const { username } = req.session;

    try {
        // Extract form data or JSON data from the frontend (adjust as needed)
        const details = {
            userid: '',
            firstname: xss(req.body.firstname),
            lastname: xss(req.body.lastname),
            username: xss(req.body.username.toLowerCase()),
            password: xss(req.body.password),
            email: xss(req.body.email_address),
            number: xss(req.body.contactnumber),
            role: '',
            tempOTP: '',
            tempOTPtimestamp: '',
            OTPattempts: '',
            OTPlocked: false,
            OTPlockedtill: '',
            organisation: ''
        };

        if (req.session.role === "superadmin") {
            details.role = "admin";
            details.organisation = xss(req.body.organisation);
        } else if (req.session.role === "admin") {
            details.role = "user";
            details.organisation = req.session.organisation;
        }

        logger.info(`${username} - Registration request received for ${details.username}`);
        const data = { details: details };

        // Send the data as JSON to the database
        const createUserResult = await createUser(data);

        if (createUserResult.created) {
            logger.info(`${username} - User ${details.username} registered successfully.`);
            res.status(200).json({ userid: createUserResult.userid, message: createUserResult.message });
        } else {
            logger.info(`${username} - Failed to create user: ${createUserResult.message}`);
            res.status(400).json({ message: createUserResult.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`${username} - Internal server error while registering user: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user logout
app.get('/logout', (req, res) => {
    const { username } = req.session;

    req.session.destroy(err => {
        if (err) {
            console.error('Error while logging out:', err);
            logger.error(`${username} - Error while logging out: ${err}`);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Return a success message indicating logout
        logger.info(`${username} - Logged out successfully.`);
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Route for generating a client API key during user registration
app.post('/generateclientApiKeyWhileRegistration', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const userid = xss(req.body.userid);
    logger.info(`${username} - Generating client API key during registration.`);

    try {
        const isKeyAdded = await addClientApiKeys(userid);
        if (isKeyAdded) {
            logger.info(`${username} - Client API key created successfully.`);
            res.status(200).json({ message: "Key created successfully" });
        } else if (!isKeyAdded) {
            logger.info(`${username} - Key could not be added.`);
            res.status(400);
            return;
        }
    } catch (e) {
        console.error(`Error generating key: ${e}`);
        logger.error(`${loggedInUser} - Error generating key: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for generating a new client API key
app.post('/generateNewClientApiKey', tokenRequired, async (req, res) => {
    const { userid, username } = req.session;
    logger.info(`${username} - Generating new client API key.`);

    try {
        const isKeyAdded = await addClientApiKeys(userid);
        if (isKeyAdded) {
            logger.info(`${username} - New client API key created successfully.`);
            res.status(200).json({ message: "Key created successfully" });
        } else if (!isKeyAdded) {
            logger.info(`${username} - Key could not be added.`);
            res.status(400);
            return;
        }
    } catch (e) {
        console.error(`Error generating key: ${e}`);
        logger.error(`${username} - Error generating API key: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for fetching client API keys
app.post('/clientApiKeys', tokenRequired, async (req, res) => {
    const { userid, username } = req.session;
    logger.info(`${username} - Fetching client API keys.`);

    try {
        const clientApiKeys = await getClientApiKeys(userid);
        logger.info(`${username} - Client API keys fetched successfully.`);
        res.status(200).json(clientApiKeys);
    } catch (e) {
        console.error(`Error fetching keys: ${e}`);
        logger.error(`${username} - Error fetching API keys: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Convert UTC timestamp to user's local time
const convertTimestampToLocal = (timestamp, timezone) => {
    return momentTimezone.unix(timestamp).tz(timezone).format('DD-MM-YYYY HH:mm:ss');
};

// Route to fetch client API keys data
app.post('/clientApiKeysData', tokenRequired, async (req, res) => {
    const { userid, username, userTimezone } = req.session;
    logger.info(`${username} - Fetching client API keys data.`);

    try {
        const clientApiKeysData = await getClientApiKeysData(userid);
        logger.info(`${username} - Client API keys data fetched successfully.`);

        // Convert each timestamp to local time
        clientApiKeysData.forEach((keyData) => {
            keyData.timestamp = convertTimestampToLocal(keyData.timestamp, userTimezone);
        });

        res.status(200).json(clientApiKeysData);
    } catch (e) {
        console.error(`Error fetching keys: ${e}`);
        logger.error(`${username} - Error fetching keys: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/addOrg', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const orgName = xss(req.body.orgName.toLowerCase());
    const orgAddress = xss(req.body.orgAddress);
    const dbURI = xss(req.body.dbURI);
    logger.info(`${username} - Adding a new organisation.`);

    try {
        const isOrgAdded = await addOrg(orgName, orgAddress, dbURI);
        if (isOrgAdded) {
            logger.info(`${username} - New org added successfully.`);
            res.status(200).json({ message: "Org added successfully" });
        } else if (!isOrgAdded) {
            logger.info(`${username} - Org could not be added.`);
            res.status(400).json({ error: "Org already exists" });
        }
    } catch (e) {
        console.error(`Error adding new Org model: ${e}`);
        logger.error(`${username} - Error adding new Org: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getOrgIds', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching Org IDs.`);

    try {
        const orgIds = await getOrgIds();
        logger.info(`${username} - Org IDs fetched successfully.`);
        res.status(200).json(orgIds);
    } catch (e) {
        console.error(`Error fetching Org IDs: ${e}`);
        logger.error(`${username} - Error fetching Org IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/updateOrg', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const orgId = xss(req.body.orgId);
    const orgName = xss(req.body.orgName.toLowerCase());
    const orgAddress = xss(req.body.orgAddress);
    const dbURI = xss(req.body.dbURI);
    logger.info(`${username} - Updating an organisation.`);

    try {
        const isOrgUpdated = await updateOrg(orgId, orgName, orgAddress, dbURI);
        if (isOrgUpdated) {
            logger.info(`${username} - Org updated successfully.`);
            res.status(200).json({ message: "Org updated successfully" });
        } else if (!isOrgUpdated) {
            logger.info(`${username} - Org could not be updated.`);
            res.status(400).json({ error: "Org already exists" });
        }
    } catch (e) {
        console.error(`Error updated Org: ${e}`);
        logger.error(`${username} - Error updated Org: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getFullOrgsData', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching full orgs data.`);

    try {
        const fullOrgsData = await getFullOrgsData();
        logger.info(`${username} - Full orgs data fetched successfully.`);
        res.status(200).json(fullOrgsData);
    } catch (e) {
        console.error(`Error fetching full orgs data: ${e}`);
        logger.error(`${username} - Error fetching full orgs data: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/updateAdmin', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const selectedUsername = xss(req.body.username);
    const selectedOrg = xss(req.body.organisation);
    logger.info(`${username} - Updating an admin.`);

    try {
        const isAdminUpdated = await updateAdmin(selectedUsername, selectedOrg);
        if (isAdminUpdated) {
            logger.info(`${username} - Admin updated successfully.`);
            res.status(200).json({ message: "Admin updated successfully" });
        } else if (!isAdminUpdated) {
            logger.info(`${username} - Admin could not be updated.`);
            res.status(400).json({ error: "Admin already exists" });
        }
    } catch (e) {
        console.error(`Error updated Admin: ${e}`);
        logger.error(`${username} - Error updated Admin: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getFullAdminsData', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching full admins data.`);

    try {
        const fullAdminsData = await getFullAdminsData();
        logger.info(`${username} - Full admins data fetched successfully.`);
        res.status(200).json(fullAdminsData);
    } catch (e) {
        console.error(`Error fetching full admins data: ${e}`);
        logger.error(`${username} - Error fetching full admins data: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - STT Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the available modes for STT
app.post('/stt/getModes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching available STT modes.`);

    try {
        const modesList = await getSttModes();
        logger.info(`${username} - Available STT modes fetched successfully.`);
        res.json(modesList);
    } catch (error) {
        logger.error(`${username} - Error fetching available STT modes: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the models for STT transcribe
app.post('/stt/getTranscribeModelTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching STT transcribe model types.`);

    try {
        const modelsList = await getSttModelsTypes();
        logger.info(`${username} - STT transcribe model types fetched successfully.`);
        res.status(200).json(modelsList);
    } catch (error) {
        logger.error(`${username} - Error fetching STT transcribe model types: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get speech-to-text model IDs
app.post('/stt/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching STT model IDs.`);

    try {
        const modelIds = await getSttModelIds(organisation, clientApiKey);
        logger.info(`${username} - STT model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching STT model IDs: ${e}`);
        logger.error(`${username} - Error fetching STT model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get speech-to-text configuration IDs
app.post('/stt/getConfigIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching STT config IDs.`);

    try {
        const configIds = await getSttConfigIds(organisation, clientApiKey);
        logger.info(`${username} - STT config IDs fetched successfully.`);
        res.status(200).json(configIds);
    } catch (e) {
        console.error(`Error fetching STT config IDs: ${e}`);
        logger.error(`${username} - Error fetching STT config IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new speech-to-text model
app.post('/stt/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelType = xss(req.body.modelType);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    logger.info(`${username} - Adding a new STT model.`);

    try {
        const isModelAdded = await addSttModel(organisation, apikey, modelType, modelName, engine);
        if (isModelAdded) {
            logger.info(`${username} - New STT model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - STT Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new STT model: ${e}`);
        logger.error(`${username} - Error adding new STT model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing speech-to-text model
app.post('/stt/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelid = xss(req.body.modelid);
    const modelType = xss(req.body.modelType);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    logger.info(`${username} - Updating an STT model.`);

    try {
        const isModelUpdated = await updateSttModel(organisation, apikey, modelid, modelType, modelName, engine);
        if (isModelUpdated) {
            logger.info(`${username} - STT model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - STT Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating STT model: ${e}`);
        logger.error(`${username} - Error updating STT model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a speech-to-text model
app.post('/stt/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full STT model details.`);

    try {
        const STTModelDetails = await getSttModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full STT model details fetched successfully.`);
        res.status(200).json(STTModelDetails);
    } catch (e) {
        console.error(`Error fetching model details: ${e}`);
        logger.error(`${username} - Error fetching full STT model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a speech-to-text model by using ModelID
app.post('/stt/getSttModelInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const modelId = xss(req.body.modelId);
    logger.info(`${username} - Fetching full STT model info.`);

    try {
        const STTModelInfo = await getSttModelInfo(organisation, clientApiKey, modelId);
        logger.info(`${username} - Full STT model info fetched successfully.`);
        res.status(200).json(STTModelInfo[0]);
    } catch (e) {
        console.error(`Error fetching model info: ${e}`);
        logger.error(`${username} - Error fetching full STT model info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get the names of STT models
app.post('/stt/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelType = xss(req.body.modelType);
    logger.info(`${username} - Fetching names of STT models for modelType: ${modelType}.`);

    try {
        const modelNameList = await getSTTModelNames(modelType);
        logger.info(`${username} - Names of STT models fetched successfully for modelType: ${modelType}.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching names of STT models: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the engines for a particular language model
app.post('/stt/getEngines', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelType = xss(req.body.modelType)
    const modelName = xss(req.body.modelName);
    logger.info(`${username} - Fetching engines for STT model: ${modelName}.`);

    try {
        const engineList = await getSTTEngines(modelType, modelName);
        logger.info(`${username} - Engines fetched successfully for STT model: ${modelName}.`);
        res.json(engineList);
    } catch (error) {
        logger.error(`${username} - Error fetching engines for STT model ${modelName}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to add a new speech-to-text configuration
app.post('/stt/addNewConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const mode = xss(req.body.mode);
    logger.info(`${username} - Adding a new STT config.`);

    try {
        const isConfigAdded = await addSttConfig(organisation, apikey, mode);
        if (isConfigAdded) {
            logger.info(`${username} - New STT config added successfully.`);
            res.status(200).json({ message: "Config added successfully" });
        } else if (!isConfigAdded) {
            logger.info(`${username} - Config could not be added.`);
            res.status(400).json({ error: "Config could not be added" });
        }
    } catch (e) {
        console.error(`Error adding new config: ${e}`);
        logger.info(`${username} - Error adding new STT config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing speech-to-text configuration
app.post('/stt/updateConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const sttid = xss(req.body.sttid);
    const mode = xss(req.body.mode);
    logger.info(`${username} - Updating an existing STT configuration.`);

    try {
        const isConfigUpdated = await updateSttConfig(organisation, apikey, sttid, mode);
        if (isConfigUpdated) {
            logger.info(`${username} - STT configuration updated successfully.`);
            res.status(200).json({ message: "Config updated successfully" });
        } else if (!isConfigUpdated) {
            logger.info(`${username} - STT Config could not be updated.`);
            res.status(400).json({ error: "Config could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating config: ${e}`);
        logger.error(`${username} - Error updating STT config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a speech-to-text configuration              
app.post('/stt/getFullConfigDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full STT config details.`);

    try {
        const STTConfigDetails = await getSttConfigDetails(organisation, clientApiKey);
        logger.info(`${username} - Full STT config details fetched successfully.`);
        res.status(200).json(STTConfigDetails);
    } catch (e) {
        console.error(`Error fetching config details: ${e}`);
        logger.error(`${username} - Error fetching Full STT config details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get info of a speech-to-text configuration  using apiKey         
app.post('/stt/getSttConfigInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const sttId = xss(req.body.sttId)
    logger.info(`${username} - Fetching STT config info.`);

    try {
        const STTConfigInfo = await getSttConfigInfo(organisation, clientApiKey, sttId);
        logger.info(`${username} - STT config info fetched successfully.`);
        res.status(200).json(STTConfigInfo[0]);
    } catch (e) {
        console.error(`Error fetching config info: ${e}`);
        logger.error(`${username} - Error fetching STT config info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for adding a new stt Deploy config data
app.post('/stt/addNewDeployId', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const tagName = xss(req.body.tagName);
    const apikey = xss(req.body.apikey);
    const sttId = xss(req.body.sttId);
    const modelId = xss(req.body.modelId);
    logger.info(`${username} - Adding a new stt deploye data .`);

    try {
        const isDeployIdAdded = await addSttDeployId(organisation, tagName, apikey, sttId, modelId);
        if (isDeployIdAdded) {
            logger.info(`${username} - New STT Deploy ID added successfully.`);
            res.status(200).json({ message: "Deploy ID added successfully" });
        } else if (!isDeployIdAdded) {
            logger.info(`${username} - Tag Name alredy exisits..`);
            res.status(409).json({ message: 'Tag Name already exists.' })
        }
    } catch (e) {
        console.error(`Error adding new Deploy ID: ${e}`);
        logger.error(`${username} - Error adding new STT Deploy ID: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get speech-to-text configuration IDs
app.post('/stt/getDeployIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching STT Deploy IDs.`);

    try {
        const configIds = await getSttDeployDetails(organisation, clientApiKey);
        logger.info(`${username} - STT Deploy IDs fetched successfully.`);
        res.status(200).json(configIds);
    } catch (e) {
        console.error(`Error fetching STT Deploy IDs: ${e}`);
        logger.error(`${username} - Error fetching STT Deploy IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing speech-to-text configuration
app.post('/stt/updateDeploy', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const oldTagName = xss(req.body.oldTagName);
    const newTagName = xss(req.body.newTagName);
    const apiKey = xss(req.body.apiKey);
    const deployId = xss(req.body.deployId);
    const modelId = xss(req.body.modelId);
    const sttid = xss(req.body.sttId);
    logger.info(`${username} - Updating an existing STT Deploy Details.`);

    try {
        const isConfigUpdated = await updateSttDeploy(organisation, oldTagName, newTagName, apiKey, deployId, modelId, sttid);
        if (isConfigUpdated === 200) {
            logger.info(`${username} - STT Deploy Details updated successfully.`);
            res.status(200).json({ message: "Deploy Details updated successfully" });
        } else if (isConfigUpdated === 409) {
            logger.info(`${username} - Tag Name already exists.`);
            res.status(409).json({ message: "Tag Name already exists." });
        } else {
            logger.info(`${username} - Error updating STT Deploy Details `);
            res.status(500).json({ message: "Error updating STT Deploy Details" });
        }
    } catch (e) {
        console.error(`Error updating Deploy Details: ${e}`);
        logger.error(`${username} - Error updating STT Deploy Details : ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - LLM Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the IDs of language model models
app.post('/llm/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching LLM model IDs.`);

    try {
        const modelIds = await getLlmModelIds(organisation, clientApiKey);
        logger.info(`${username} - LLM model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching LLM model IDs: ${e}`);
        logger.error(`${username} - Error fetching LLM model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get the available modes for language model
app.post('/llm/getModes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching available LLM model modes.`);

    try {
        const modeTypesList = await getLLMModeTypes();
        logger.info(`${username} - Available LLM model modes fetched successfully.`);
        res.json(modeTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching available LLM model modes: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the models of a particular mode for language model
app.post('/llm/getModels', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const mode = xss(req.body.mode);
    logger.info(`${username} - Fetching LLM models for mode: ${mode}.`);

    try {
        const modelList = await getModels(mode);
        logger.info(`${username} - LLM models fetched successfully for mode: ${mode}.`);
        res.status(200).json(modelList);
    } catch (error) {
        logger.error(`${username} - Error fetching LLM models for mode ${mode}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the names of LLM models
app.post('/llm/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const model = xss(req.body.model);
    logger.info(`${username} - Fetching names of LLM models for model: ${model}.`);

    try {
        const modelNameList = await getLLMModelNames(model);
        logger.info(`${username} - Names of LLM models fetched successfully for model: ${model}.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching names of LLM model names: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the engines for a particular language model
app.post('/llm/getEngines', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelName = xss(req.body.modelName);
    logger.info(`${username} - Fetching engines for LLM model: ${modelName}.`);

    try {
        const engineList = await getEngines(modelName);
        logger.info(`${username} - Engines fetched successfully for LLM model: ${modelName}.`);
        res.json(engineList);
    } catch (error) {
        logger.error(`${username} - Error fetching engines for LLM model ${modelName}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route for adding a new language model
app.post('/llm/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const mode = xss(req.body.mode);
    const model = xss(req.body.model);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    const cloudAPIKey = xss(req.body.cloudAPIKey);
    logger.info(`${username} - Adding a new LLM model.`);

    try {
        const isModelAdded = await addLlmModel(organisation, apikey, mode, model, modelName, engine, cloudAPIKey);
        if (isModelAdded) {
            logger.info(`${username} - New LLM model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - LLM Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new model: ${e}`);
        logger.error(`${username} - Error adding new LLM model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating an existing language model
app.post('/llm/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelid = xss(req.body.modelid);
    const mode = xss(req.body.mode);
    const model = xss(req.body.model);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    const cloudAPIKey = xss(req.body.cloudAPIKey);
    logger.info(`${username} - Updating an existing LLM model.`);

    try {
        const isModelUpdated = await updateLlmModel(organisation, apikey, modelid, mode, model, modelName, engine, cloudAPIKey);
        if (isModelUpdated) {
            logger.info(`${username} - LLM model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - LLM Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating model: ${e}`);
        logger.error(`${username} - Error updating LLM model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for getting the full details of a language model (LLM) with the specified client API key
app.post('/llm/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full details of LLM models.`);

    try {
        const LLMModelDetails = await getLlmModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full details of LLM models fetched successfully.`);
        res.status(200).json(LLMModelDetails);
    } catch (e) {
        console.error(`Error fetching LLM model details: ${e}`);
        logger.error(`${username} - Error fetching LLM model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for adding a prompt to a language model
app.post('/llm/addPrompt', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    let json_data = req.body;
    logger.info(`${username} - Adding a new LLM prompt.`);

    try {
        const addPromptResult = await addPrompt(organisation, json_data);
        if (addPromptResult) {
            logger.info(`${username} - New LLM prompt added successfully.`);
            res.status(200).json({ message: "Prompt added successfully" });
        } else if (!addPromptResult) {
            logger.info(`${username} - LLM Prompt could not be added.`);
            res.status(400).json({ error: "Prompt could not be added" });
        }
    } catch (error) {
        logger.error(`${username} - Error adding new LLM prompt: ${error}`);
        res.status(500).json({ message: "An error occurred", error: error.toString() });
    }
});

// Route for getting the full data of prompts associated with a language model (LLM) using the specified client API key
app.post('/llm/getFullPromptsData', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full details of LLM model prompts.`);

    try {
        const LLMPromptsData = await getLlmPromptsData(organisation, clientApiKey);
        logger.info(`${username} - Full details of LLM model prompts fetched successfully.`);
        res.status(200).json(LLMPromptsData);
    } catch (e) {
        console.error(`Error fetching prompt details: ${e}`);
        logger.error(`${username} - Error fetching LLM prompt details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for getting the prompt IDs associated with a language model (LLM) using the specified client API key
app.post('/llm/getPromptIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching LLM model prompt IDs.`);

    try {
        const promptIds = await getLlmPromptIds(organisation, clientApiKey);
        logger.info(`${username} - LLM model prompt IDs fetched successfully.`);
        res.status(200).json(promptIds);
    } catch (e) {
        console.error(`Error fetching prompts: ${e}`);
        logger.error(`${username} - Error fetching LLM prompts: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating a prompt of a language model (LLM) with the provided JSON data
app.post('/llm/updatePrompt', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const json_data = req.body;
    logger.info(`${username} - Updating an existing LLM model prompt.`);

    try {
        const isPromptUpdated = await updatePrompt(organisation, json_data);
        if (isPromptUpdated) {
            logger.info(`${username} - Existing LLM model prompt updated successfully.`);
            res.status(200).json({ message: "Prompt Updated Successfully" });
        } else if (!isPromptUpdated) {
            logger.info(`${username} - LLM Prompt could not be updated.`);
            res.status(400).json({ error: "Prompt could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating prompt: ${e}`);
        logger.error(`${username} - Error updating LLM prompt: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for  LLM Deployment Model Id Info
app.post('/llm/getLLMDeployModelInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const json_data = req.body;
    logger.info(`${username} - fetching an existing LLM Model Info.`);

    try {
        const isDeployModelInfo = await getLLMDeployModelInfo(organisation, json_data);
        if (isDeployModelInfo) {
            logger.info(`${username} - fetching LLM model Info successfully.`);
            res.status(200).json(isDeployModelInfo[0]);
        } else if (!isDeployModelInfo) {
            logger.info(`${username} - LLM Model Info could not be Feteched.`);
            res.status(400).json({ error: "LLM Model Info could not be Feteched." });
        }
    } catch (e) {
        console.error(`Error Fetching Model Info: ${e}`);
        logger.error(`${username} - Error Fetching Model Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for  LLM Deployment Prompt Id Info
app.post('/llm/getLLMDeployPromptInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const json_data = req.body;
    logger.info(`${username} - fetching an existing LLM Prompt Info.`);

    try {
        const isDeployPromptInfo = await getLLMDeployPromptInfo(organisation, json_data);
        if (isDeployPromptInfo) {
            logger.info(`${username} - fetching LLM model Info successfully.`);
            res.status(200).json(isDeployPromptInfo[0]);
        } else if (!isDeployPromptInfo) {
            logger.info(`${username} - LLM Prompt Info could not be Feteched.`);
            res.status(400).json({ error: "LLM Prompt Info could not be Feteched." });
        }
    } catch (e) {
        console.error(`Error Fetching Model Info: ${e}`);
        logger.error(`${username} - Error Fetching Model Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for adding a new LLM Inferance Parameters
app.post('/addLLMinferanceParams', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const documnet = req.body.data
    logger.info(`${username} - Adding a new LLM Inferance Parameters.`);
    try {
        const InferanceParams = await addLLMinferanceParams(organisation,documnet);
        if (InferanceParams === 200) {
            logger.info(`${username} - New LLM Inferance Parameters added successfully.`);
            res.status(200).json({ message: "LLM Inferance Parameters added successfully" });
        } else if(InferanceParams === 404) {
            logger.info(`${username} - LLM Inferance Parameters Name alerady exists.`);
            res.status(404).json({ error: `LLM Inferance Parameters Name alerady exists.` });
        }else{
            logger.info(`${username} -Error While Adding LLM Inferance Parameters.`);
            res.status(500).json({ error: `Error While Adding LLM Inferance Parameters.` });
        }
    } catch (e) {
        console.error(`Error adding new LLM Inferance Parameters: ${e}`);
        logger.error(`${username} - Error adding new LLM Inferance Parameters: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
}
);
// Route for  LLM Inferance Ids Info
app.post('/getLLMInferanceIdsInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = req.body.clientApiKey;
    logger.info(`${username} - fetching LLM Inferance Ids Info.`);

    try {
        const inferanceIdsInfo = await getLLMInferanceIdsInfo(organisation, clientApiKey);
        if (inferanceIdsInfo) {
            logger.info(`${username} -  LLM Inferance IDs Info fetched successfully.`);
            res.status(200).json(inferanceIdsInfo);
        } else {
            logger.info(`${username} - LLM InferanceIds Info could not be Feteched.`);
            res.status(400).json({ error: "LLM INferanceIds Info could not be Feteched." });
        }
    } catch (e) {
        console.error(`Error Fetching InferanceIds Info: ${e}`);
        logger.error(`${username} - Error Fetching InferanceIds Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route for updating a LLM Inferance Parameters
app.post('/updateLLMinferanceParams', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const documnet = req.body.data
    logger.info(`${username} - updating a new LLM Inferance Parameters.`);
    try {
        const InferanceParams = await updateLLMinferanceParams(organisation,documnet);
        if (InferanceParams === 200) {
            logger.info(`${username} - New LLM Inferance Parameters updated successfully.`);
            res.status(200).json({ message: "LLM Inferance Parameters updated successfully" });
        } else if(InferanceParams === 404) {
            logger.info(`${username} - LLM Inferance Parameters Name alerady exists.`);
            res.status(404).json({ error: `LLM Inferance Parameters Name alerady exists.` });
        }else{
            logger.info(`${username} -Error While updating LLM Inferance Parameters.`);
            res.status(500).json({ error: `Error While updating LLM Inferance Parameters.` });
        }
    } catch (e) {
        console.error(`Error updating new LLM Inferance Parameters: ${e}`);
        logger.error(`${username} - Error updating new LLM Inferance Parameters: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
}
);
// Route for adding a new LLM deployment
app.post('/addLLMDeployment', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const tagName = xss(req.body.tag)
    const apikey = xss(req.body.apikey);
    const llmModelID = xss(req.body.llmModelID);
    const llmPromptID = xss(req.body.llmPromptID);
    logger.info(`${username} - Adding a new LLM deployment.`);
    try {
        const isLLMDeploymentAdded = await addLLMDeployment(organisation,tagName, apikey, llmModelID, llmPromptID);
        if (isLLMDeploymentAdded) {
            logger.info(`${username} - New LLM deployment added successfully.`);
            res.status(200).json({ message: "LLM Deployment added successfully" });
        } else {
            logger.info(`${username} - LLM deployment Tag Name alerady exists.`);
            res.status(404).json({ error: `LLM deployment  Tag Name alerady exists.` });
        }
    } catch (e) {
        console.error(`Error adding new LLM deployment: ${e}`);
        logger.error(`${username} - Error adding new LLM deployment: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
}
);

// Route for  LLM Deployment Ids Info
app.post('/getLLMDeployIdsInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = req.body.clientApiKey;
    logger.info(`${username} - fetching LLM Deploy Ids Info.`);

    try {
        const isDeployIdsInfo = await getLLMDeployIdsInfo(organisation, clientApiKey);
        if (isDeployIdsInfo) {
            logger.info(`${username} - fetching LLM Deploy IDs Info successfully.`);
            res.status(200).json(isDeployIdsInfo);
        } else if (!isDeployIdsInfo) {
            logger.info(`${username} - LLM DeployIds Info could not be Feteched.`);
            res.status(400).json({ error: "LLM DeployIds Info could not be Feteched." });
        }
    } catch (e) {
        console.error(`Error Fetching DeployIds Info: ${e}`);
        logger.error(`${username} - Error Fetching DeployIds Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for Update LLM Deployment Id Info
app.post('/updateLLMDeployIdInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const oldTagName = xss(req.body.oldTagName)
    const newTagName = xss(req.body.newTagName)
    const clientApiKey = xss(req.body.apiKey)
    const deployId = xss(req.body.deployId)
    const modelId = xss(req.body.modelId)
    const promptId = xss(req.body.promptId)
    logger.info(`${username} - fetching LLM Deploy Ids Info.`);

    try {
        const isUpdateDeployIdInfo = await updateLLMDeployIdInfo(organisation, oldTagName, newTagName, clientApiKey, deployId, modelId, promptId);
        if (isUpdateDeployIdInfo === 200) {
            logger.info(`${username} - Updating LLM Deploy ID Info successfully.`);
            res.status(200).json({});
        } else if (isUpdateDeployIdInfo === 409) {
            logger.info(`${username} - Tag Name already exists.`);
            res.status(409).json({ error: "Tag Name already exists" });
        }else {
            logger.info(`${username} - Internal Server Error.`);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (e) {
        console.error(`Error Updating DeployId Info: ${e}`);
        logger.error(`${username} - Error Updating DeployId Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - RAG Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the names of RAG models
app.post('/rag/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching names of RAG models.`);

    try {
        const modelNameList = await getRAGModelNames();
        logger.info(`${username} - Names of RAG models fetched successfully.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching model names of RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get device types for RAG models
app.post('/rag/getDeviceTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching device types for RAG models.`);

    try {
        const deviceTypesList = await getRAGDeviceTypes();
        logger.info(`${username} - Device types for RAG models fetched successfully.`);
        res.json(deviceTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching device types for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get Splitter types for RAG models
app.post('/rag/getSplitterTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching Splitter types for RAG models.`);

    try {
        const splitterTypesList = await getRAGSplitterTypes();
        logger.info(`${username} - Splitter types for RAG models fetched successfully.`);
        res.json(splitterTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching Splitter types for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get RAG model IDs
app.post('/rag/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching RAG model IDs.`);

    try {
        const modelIds = await getModelIds(organisation, clientApiKey);
        logger.info(`${username} - RAG model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching RAG model IDs: ${e}`);
        logger.error(`${username} - Error fetching RAG model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get RAG configuration IDs
app.post('/rag/getConfigIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching RAG config IDs.`);

    try {
        const configIds = await getRagConfigIds(organisation, clientApiKey);
        logger.info(`${username} - RAG config IDs fetched successfully.`);
        res.status(200).json(configIds);
    } catch (e) {
        console.error(`Error fetching RAG config IDs: ${e}`);
        logger.error(`${username} - Error fetching RAG config IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new RAG model
app.post('/rag/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelName = xss(req.body.modelName);
    const deviceType = xss(req.body.deviceType);
    logger.info(`${username} - Adding a new RAG model.`);

    try {
        const isModelAdded = await addRagModel(organisation, apikey, modelName, deviceType);
        if (isModelAdded) {
            logger.info(`${username} - New RAG model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - RAG Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new RAG model: ${e}`);
        logger.error(`${username} - Error adding new RAG model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating an existing RAG model
app.post('/rag/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelId = xss(req.body.modelId);
    const modelName = xss(req.body.modelName);
    const deviceType = xss(req.body.deviceType);
    logger.info(`${username} - Updating an existing RAG model.`);

    try {
        const isModelUpdated = await updateRagModel(organisation, apikey, modelId, modelName, deviceType);
        if (isModelUpdated) {
            logger.info(`${username} - RAG model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - RAG Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating model: ${e}`);
        logger.error(`${username} - Error updating RAG model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of RAG models
app.post('/rag/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full RAG model details.`);

    try {
        const RAGModelDetails = await getRagModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full RAG model details fetched successfully.`);
        res.status(200).json(RAGModelDetails);
    } catch (e) {
        console.error(`Error fetching model details: ${e}`);
        logger.error(`${username} - Error fetching full RAG model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new RAG configuration
app.post('/rag/addNewConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const document = req.body.document;
    logger.info(`${username} - Adding a new RAG Ingest Config.`);

    try {
        const isConfigAdded = await addRagConfig(organisation, document);
        if (isConfigAdded) {
            logger.info(`${username} - New RAG Ingest Config added successfully.`);
            res.status(200).json({ message: "Ingest Config added successfully" });
        } else if (!isConfigAdded) {
            logger.info(`${username} - Ingest Config could not be added.`);
            res.status(400).json({ error: "Ingest Config could not be added" });
        }
    } catch (e) {
        console.error(`Error adding new Ingest Config: ${e}`);
        logger.info(`${username} - Error adding new RAG Ingest Config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing RAG configuration
app.post('/rag/updateConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const document = req.body.document
    logger.info(`${username} - Updating an existing RAG Ingest configuration.`);

    try {
        const isConfigUpdated = await updateRagConfig(organisation, document);
        if (isConfigUpdated) {
            logger.info(`${username} - RAG Ingest configuration updated successfully.`);
            res.status(200).json({ message: "Ingest Config updated successfully" });
        } else if (!isConfigUpdated) {
            logger.info(`${username} - RAG Ingest Config could not be updated.`);
            res.status(400).json({ error: "Ingest Config could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating Ingest Config: ${e}`);
        logger.error(`${username} - Error updating RAG Ingest Config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a RAG configuration
app.post('/rag/getFullConfigDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full RAG config details.`);

    try {
        const RAGConfigDetails = await getRagConfigDetails(organisation, clientApiKey);
        logger.info(`${username} - Full RAG config details fetched successfully.`);
        res.status(200).json(RAGConfigDetails);
    } catch (e) {
        console.error(`Error fetching config details: ${e}`);
        logger.error(`${username} - Error fetching Full RAG config details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get Info of RAG model Id
app.post('/rag/getModelIdInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const modelId = xss(req.body.modelId);
    logger.info(`${username} - Fetching RAG model ID Info.`);

    try {
        const RAGModelIdInfo = await getRagModelIdInfo(organisation, clientApiKey, modelId);
        logger.info(`${username} - RAG model ID Info fetched successfully.`);
        res.status(200).json(RAGModelIdInfo);
    } catch (e) {
        console.error(`Error fetching model Id info: ${e}`);
        logger.error(`${username} - Error fetching  RAG model ID Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get Info of RAG model Id
app.post('/rag/getIngestIdInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const ingestId = xss(req.body.ingestId);
    logger.info(`${username} - Fetching RAG Ingest ID Info.`);

    try {
        const RAGIngestIdInfo = await getRagIngestIdInfo(organisation, clientApiKey, ingestId);
        logger.info(`${username} - RAG Ingest ID Info fetched successfully.`);
        res.status(200).json(RAGIngestIdInfo);
    } catch (e) {
        console.error(`Error fetching model Id info: ${e}`);
        logger.error(`${username} - Error fetching  RAG Ingest ID Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to add a new RAG model
app.post('/rag/addIngestDeploy', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const data = req.body.data
    logger.info(`${username} - Adding a new RAG Ingest Deploy Config.`);

    try {
        const IngestDeployAdded = await addIngestDeploy(organisation, data);
        if (IngestDeployAdded === 200) {
            logger.info(`${username} - New RAG Ingest Deploy added successfully.`);
            res.status(200).json({ message: "Ingest Deploy added successfully" });
        } else if (IngestDeployAdded === 409) {
            logger.info(`${username} - Tag Name Already Exists.`); 
            res.status(409).json({ error: "Tag Name Already Exists" });
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error adding new RAG Ingest Deploy: ${e}`);
        logger.error(`${username} - Error adding new RAG Ingest Deploy: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the Ingest Deploy Details using ClientAPIKey
app.post('/rag/getIngestDeployDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    logger.info(`${username} - Fetching Ingest Deploy Details.`);

    try {
        const DeployData = await getIngestDeployDetails(organisation, ApiKey);
        if (DeployData) {
            logger.info(`${username} - Ingest Deploy Details fetched successfully.`);
            res.status(200).json(DeployData);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Ingest Deploy Details: ${e}`);
        logger.error(`${username} - Error Fetching Ingest Deploy Details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to Update Existing RAG Ingest Deploy Config
app.post('/rag/updateIngestDeploy', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const data = req.body.data
    logger.info(`${username} - Updating a RAG Ingest Deploy Config.`);

    try {
        const IngestDeployUpdated = await updateIngestDeploy(organisation, data);
        if (IngestDeployUpdated === 200) {
            logger.info(`${username} - RAG Ingest Deploy updated successfully.`);
            res.status(200).json({ message: "Ingest Deploy Updated Successfully" });
        } else if (IngestDeployUpdated === 409) {
            logger.info(`${username} - Tag Name Already Exists.`); 
            res.status(409).json({ error: "Tag Name Already Exists" });
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Updating Ingest Deploy Config: ${e}`);
        logger.error(`${username} - Error Updating RAG Ingest Deploy Config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the Ingest Deploy Id Info using ClientAPIKey and deployId
app.post('/rag/getIngestDeployIdInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey =xss(req.body.clientApiKey);
    const deployId =xss(req.body.deployId);
    logger.info(`${username} - Fetching Ingest Deploy Id Info.`);

    try {
        const DeployIdInfo = await getIngestDeployIdInfo(organisation, ApiKey, deployId);
        if (DeployIdInfo) {
            logger.info(`${username} - Ingest Deploy Id Info fetched successfully.`);
            res.status(200).json(DeployIdInfo);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Ingest Deploy Id Info : ${e}`);
        logger.error(`${username} - Error Fetching Ingest Deploy Id Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get retrieval types for RAG models
app.post('/rag/getRetrievalTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching Retrieval types for RAG retrieval config.`);

    try {
        const retrievalTypesList = await getRAGretrievalTypes();
        logger.info(`${username} - Retrieval types for RAG Retrieval fetched successfully.`);
        res.json(retrievalTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching Retrieval types for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});
// Route to get retrieval techniques for RAG models
app.post('/rag/getRetrievalTechs', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const retrievalType =req.body.retrievalType;
    logger.info(`${username} - Fetching Retrieval techniques for RAG retrieval config.`);
    try {
        const retrievalTechsList = await getRAGretrievalTechs(retrievalType);
        logger.info(`${username} - Retrieval techniques for RAG Retrieval fetched successfully.`);
        res.json(retrievalTechsList);
    } catch (error) {
        logger.error(`${username} - Error fetching Retrieval techniques for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});
// Route to get RAG retrieval chain types
app.post('/rag/getRetrievalChainTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const retrievalType =req.body.retrievalType;
    logger.info(`${username} - Fetching Retrieval chains types for RAG retrieval config.`);
    try {
        const retrievalChainsList = await getRAGretrievalChainTypes(retrievalType);
        logger.info(`${username} - Retrieval chain types for RAG fetched successfully.`);
        res.json(retrievalChainsList);
    } catch (error) {
        logger.error(`${username} - Error fetching Retrieval chain types for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});
// Route to get prompt ids of QAretrieval for Rag Retrieval Config
app.post('/rag/getPromptIds', tokenRequired, async (req, res) => {
    const { organisation, username } = req.session;
    const clientApiKey =req.body.clientApiKey;
    logger.info(`${username} - Fetching Prompt Ids of QAretrival for RAG retrieval config.`);
    try {
        const promptIds = await getPromptIds(organisation, clientApiKey);
        logger.info(`${username} - prompt Ids of QAretrival for RAG fetched successfully.`);
        res.json(promptIds);
    } catch (error) {
        logger.error(`${username} - Error fetching prompt Ids of QAretrival for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});
// Route to add a new RAG Retrieval config
app.post('/rag/addRAGretrievalConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const data = req.body.data
    logger.info(`${username} - Adding a new RAG Retrieval config.`);

    try {
        const retrievalConfigAdded = await addRetrievalConfig(organisation, data);
        if (retrievalConfigAdded) {
            logger.info(`${username} - New RAG Retrieval Config added successfully.`);
            res.status(200).json({ message: "Retrieval Config added successfully" });
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error adding new RAG Retrieval Config: ${e}`);
        logger.error(`${username} - Error adding new RAG Retrieval Config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the retrieval Config Details using ClientAPIKey
app.post('/rag/getRetrievalConfigDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    logger.info(`${username} - Fetching Retrieval Config Details.`);

    try {
        const configData = await getRetrievalConfigDetails(organisation, ApiKey);
        if (configData) {
            logger.info(`${username} - Retrieval Config Details fetched successfully.`);
            res.status(200).json(configData);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Retrieval Config Details: ${e}`);
        logger.error(`${username} - Error Fetching Retrieval Config Details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to update existing RAG Retrieval config
app.post('/rag/updateRAGretrievalConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const data = req.body.data
    logger.info(`${username} - Adding a new RAG Retrieval config.`);

    try {
        const isRetrievalConfigUpdated = await updateRetrievalConfig(organisation, data);
        if (isRetrievalConfigUpdated) {
            logger.info(`${username} - RAG Retrieval Config updated successfully.`);
            res.status(200).json({ message: "Retrieval Config updated successfully" });
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error updating  RAG Retrieval Config: ${e}`);
        logger.error(`${username} - Error updating  RAG Retrieval Config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the Presist Directory Paths using ClientAPIKey
app.post('/rag/getPresistDirPaths', tokenRequired, async (req, res) => {
    const { username, userid , organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    logger.info(`${username} - Fetching Presist Directory Paths.`);

    try {
        const presistDirs = await getPresistDirPaths(organisation, ApiKey, userid);
        if (presistDirs) {
            logger.info(`${username} - Presist Directory Paths fetched successfully.`);
            res.status(200).json(presistDirs);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Presist Directory Paths: ${e}`);
        logger.error(`${username} - Error Fetching Presist Directory Paths: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the Presist Directory Paths using ClientAPIKey
app.post('/rag/getPresistDirInfo', tokenRequired, async (req, res) => {
    const { username, userid , organisation } = req.session;
    const ApiKey = req.body.clientApiKey;
    const presistDir = req.body.presistDir;
    logger.info(`${username} - Fetching Presist Directory Path Info.`);

    try {
        const modelId = await getPresistDirPathInfo(organisation, ApiKey, userid, presistDir);
        const modelName = await getModelIdInfo(organisation, ApiKey, modelId );
        const presistDirInfo = {modelId:modelId, modelName:modelName}
        if (presistDirInfo) {
            logger.info(`${username} - Presist Directory Path Info fetched successfully.`);
            res.status(200).json(presistDirInfo);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Presist Directory Path Info: ${e}`);
        logger.error(`${username} - Error Fetching Presist Directory Path Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get all Retrieval Ids using ClientAPIKey
app.post('/rag/getRetrievalIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    logger.info(`${username} - Fetching RAG Retrieval Ids.`);

    try {
        const RetrievalIds = await getRetrievalIds(organisation, ApiKey);
        if (RetrievalIds) {
            logger.info(`${username} - RAG Retrieval Ids fetched successfully.`);
            res.status(200).json(RetrievalIds);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching RAG Retrieval Ids: ${e}`);
        logger.error(`${username} - Error Fetching RAG Retrieval Ids: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get Retrieval Id Info using ClientAPIKey and Retrieval Id
app.post('/rag/getRetrievalIdInfo', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    const retrievalId = req.body.retrievalId
    logger.info(`${username} - Fetching RAG Retrieval Ids.`);

    try {
        const RetrievalIdInfo = await getRetrievalIdInfo(organisation, ApiKey, retrievalId);
        if (RetrievalIdInfo) {
            logger.info(`${username} - RAG Retrieval Id Info fetched successfully.`);
            res.status(200).json(RetrievalIdInfo);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching RAG Retrieval Id Info: ${e}`);
        logger.error(`${username} - Error Fetching RAG Retrieval Id Info: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to add a new RAG Retrieval Deploy config
app.post('/rag/addRetrievalDeploy', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const data = req.body.data
    logger.info(`${username} - Adding a new RAG Retrieval Deploy Config.`);

    try {
        const RetrievalDeployAdded = await addRetrievalDeploy(organisation, data);
        if (RetrievalDeployAdded === 200) {
            logger.info(`${username} - New RAG Retrieval Deploy added successfully.`);
            res.status(200).json({ message: "Retrieval Deploy added successfully" });
        } else if (RetrievalDeployAdded === 409) {
            logger.info(`${username} - Tag Name Already Exists.`); 
            res.status(409).json({ error: "Tag Name Already Exists" });
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error adding new RAG Retrieval Deploy: ${e}`);
        logger.error(`${username} - Error adding new RAG Retrieval Deploy: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to get the Retrieval Deploy Details using ClientAPIKey
app.post('/rag/getRetrievalDeployDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const ApiKey = req.body.clientApiKey
    logger.info(`${username} - Fetching Retrieval Deploy Details.`);

    try {
        const DeployData = await getRetrievalDeployDetails(organisation, ApiKey);
        if (DeployData) {
            logger.info(`${username} - Retrieval Deploy Details fetched successfully.`);
            res.status(200).json(DeployData);
        }else{
            logger.info(`${username} - Internal Server Error.`); 
            res.status(500).json({ error: " Internal Server error" });
        }
    } catch (e) {
        console.error(`Error Fetching Retrieval Deploy Details: ${e}`);
        logger.error(`${username} - Error Fetching Retrieval Deploy Details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});
// Route to upload the ingest file in user directory.
app.post('/rag/uploadFileToWorkingDir', tokenRequired, (req, res) => {
    if (!req.files || (Array.isArray(req.files.files) && req.files.files.length === 0)) {
        return res.status(400).send('No files were uploaded.');
    }

    const uploadedFiles = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const { username,userid } = req.session;

    const userWorkingDir = path.join(workingDir,`${userid}`);
    if (!fs.existsSync(userWorkingDir)) {
        fs.mkdirSync(userWorkingDir);
        logger.info(`${username} - Created preingest directory for ${userid}.`);
    }

    // Handle each file
    for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        const uploadPath = path.join(userWorkingDir, uploadedFile.name);

        uploadedFile.mv(uploadPath, (err) => {
            if (err) {
                logger.error(`${username} - Error uploading files: ${err}`);
                return res.status(500).send(err);
            }
        });
    }
    res.status(200).send('Files uploaded successfully to working directory!');
    logger.info(`${username} - Uploaded file(s) to working directory`);
});
// route to ingest the uploaded file.
app.post('/rag/ingestFile', tokenRequired, async (req, res) => {
    const { userid, username } = req.session;
    const clientApiKey = xss(req.body.data.clientApiKey);
    const deployId = xss(req.body.data.deployId);
    const sourceDirectory = path.join(workingDir,`${userid}`)
    const Path = xss(req.body.data.path);
    const persistDirectory =path.join(`${userid}`,Path)

    const data = {
        clientApiKey : clientApiKey,
        deployId : deployId,
        sourceDirectory : sourceDirectory,
        persistDirectory : persistDirectory,
        userId : userid
    }
    try {
        const apiResponse = await axios.post(RAG_API_URL + '/accelerator/server',data);
        if (apiResponse.status === 200) {
            logger.info(`${username} - File Ingestion successful`);
            return res.status(200).json({ message: 'File Ingestion successful' });
        } else {
            logger.error(`${username} - Error Ingesting file: `);
            return res.status(apiResponse.status).json({ message: 'Failed to ingest' });
        }
    } catch (error) {
        logger.error(`${username} - Error Ingesting file: ${error.message}`);
        res.status(500).end();
    }
});
app.post('/rag/moveFile', tokenRequired, (req, res) => {
    const { username,userid } = req.session;
    const userWorkingDir =path.join(workingDir,`${userid}`);
    const userArchiveDir = path.join(archiveDir, `${userid}`);
    if (!fs.existsSync(userArchiveDir)) {
        fs.mkdirSync(userArchiveDir);
        logger.info(`${username} - Created archive directory for ${userid}.`);
    }
    fs.readdir(userWorkingDir,(err,files)=>{
        if(err){
            logger.error(`${username} - Error reading working directory : ${err}`);
            return res.status(500).send(err);
        }
        files.forEach((file)=>{
            const userWorkingFileDir = path.join(userWorkingDir,file);
            const userArchiveFileDir = path.join(userArchiveDir,file);
            fs.copyFile(userWorkingFileDir,userArchiveFileDir,(err)=>{
                if(err){
                logger.error(`${username} - Error moving file from working diectory to archive directory: ${err}`);
                return res.status(500).send(err);
                }
            }); 
        });
    });
    res.status(200).send('files moved successfully!');
    logger.info(`${username} - Moved files(s) to Archive directory`)
});
// Route to delete the file in the working directory after file ingest.
app.post('/rag/removeFile', tokenRequired, (req, res) => {
    const { username,userid } = req.session;
    const userWorkingDir =path.join(workingDir,`${userid}`)

    fs.readdir(userWorkingDir,(err,files)=>{
        if(err){
            logger.error(`${username} - Error reading working directory : ${err}`);
            return res.status(500).send(err);
        }
        files.forEach((file)=>{
            const filePath = path.join(userWorkingDir,file);
            fs.unlink(filePath,(err)=>{
                if(err){
                logger.error(`${username} - Error deleting file in working diectory : ${err}`);
                return res.status(500).send(err);
                }
            }); 
        });
    });
    res.status(200).send('File deleted successfully in working directory!');
    logger.info(`${username} - deleted file(s) in working Directory`);
});
// route to ingest the uploaded file.
app.post('/rag/addPresistDirPath', tokenRequired, async (req, res) => {
    const { userid, username,organisation } = req.session;
    const Path = req.body.Path
    const persistDirectory =path.join(`${userid}`,Path)
    const modelId = req.body.modelId
    const clientApiKey = req.body.clientApiKey;
    const document = {
        persistDirectory : persistDirectory,
        clientApiKey:clientApiKey,
        modelId : modelId,
        ingestedBy: userid
    }
    try {
        const isPathAdded = await addPresistDirPath(organisation, document);
        if(isPathAdded === 200){
        logger.info(`${username} -presist directory path for RAG Retrieval added successfully.`);
        res.status(200).json({ message: "presist directory added Successfully" });
        }
        else if (isPathAdded === 409){
            logger.info(`${username} - Path already Exists.`);
            res.status(409).json({ message: " Path already Exists..." });
        }
    } catch (error) {
        logger.error(`${username} - Error adding presist directory path for RAG Retrieval: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - Deployment Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get deployment IDs
app.post('/getDeploymentIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const type = xss(req.body.type);
    logger.info(`${username} - Fetching deployment IDs.`);

    try {
        const deploymentIds = await getDeploymentIds(organisation, clientApiKey, type);
        logger.info(`${username} - Deployment IDs fetched successfully.`);
        res.status(200).json(deploymentIds);
    } catch (e) {
        console.error(`Error fetching ${type} deployment IDs: ${e}`);
        logger.error(`${username} - Error fetching ${type} deployment IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating a new deployment
app.post('/updateDeployment', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const type = xss(req.body.type);
    logger.info(`${username} - Updating a ${type} deployment.`);

    if (type === 'llm') {
        const deploymentID = xss(req.body.deploymentID)
        const llmModelID = xss(req.body.llmModelID);
        const llmPromptID = xss(req.body.llmPromptID);
        const ragConfigID = xss(req.body.ragConfigID);

        try {
            const isDeploymentUpdated = await updateDeployment(organisation, apikey, type, deploymentID, llmModelID, llmPromptID, ragConfigID);
            if (isDeploymentUpdated) {
                logger.info(`${username} - New ${type} deployment added successfully.`);
                res.status(200).json({ message: "Deployment added successfully" });
            } else if (!isDeploymentUpdated) {
                logger.info(`${username} - ${type} deployment could not be updated.`);
                res.status(400).json({ error: `${type} deployment could not be updated.` });
            }
        } catch (e) {
            console.error(`Error updating deployment: ${e}`);
            logger.error(`${username} - Error updating ${type} deployment: ${e}`);
            res.status(500).json({ error: e.toString() });
        }
    }
});

// Route for getting deployment details
app.post('/getFullDeploymentDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const type = xss(req.body.type);
    logger.info(`${username} - Fetching full deployment details.`);

    try {
        const DeploymentDetails = await getDeploymentDetails(organisation, apikey, type);
        logger.info(`${username} - Full deployment details fetched successfully.`);
        res.status(200).json(DeploymentDetails);
    } catch (e) {
        console.error(`Error fetching deployment details: ${e}`);
        logger.error(`${username} - Error fetching full deployment details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});