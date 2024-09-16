import { useState, useRef } from 'react';
import Input from "./Input";
import configData from "../constants/config.json";

export default function RAG() {
    // Set up state variables for each form step
    const [addRAGModelState, setAddRAGModelState] = useState({
        APIKey: '',
        modelName: '',
        deviceType: ''
    });

    const [updateRAGModelState, setUpdateRAGModelState] = useState({
        APIKey: '',
        modelId: '',
        modelName: '',
        deviceType: ''
    });

    const [viewRAGModelsState, setViewRAGModelsState] = useState({
        APIKey: ''
    });

    const [addRAGConfigState, setAddRAGConfigState] = useState({
        APIKey: '',
        splitterType: '',
        chunkSize: '',
        chunkOverlap: ''
    });

    const [updateRAGConfigState, setUpdateRAGConfigState] = useState({
        clientApiKey: '',
        configId: '',
        splitterType: '',
        chunkSize: '',
        chunkOverlap: ''
    });

    const [viewRAGConfigsState, setViewRAGConfigsState] = useState({
        APIKey: ''
    });
    const [ingestDeployState, setIngestDeployState] = useState({
        tagName: '',
        clientApiKey: '',
        modelId: '',
        ingestId: ''
    })
    const [updateIngestDeployState, setUpdateIngestDeployState] = useState({
        oldTagName: '',
        newTagName: '',
        deployId: '',
        modelId: '',
        ingestId: ''
    })
    const [viewRAGIngestDeployState, setViewRAGIngestDeployState] = useState({
        APIKey: ''
    })
    const [addRAGretrievalState, setAddRAGretrievalState] = useState({
        clientApiKey: '',
        retrievalType: '',
        retrievalTech: '',
        kValue: '',
        fetchK: '',
        chainType: '',
        llmModelId: '',
        llmPromptId: '',
        history: '',
        sourceDocument: '',
        deviceType: ''
    });
    const [viewRAGretrievalConfigState, setViewRAGretrievalConfigState] = useState({
        APIKey: ''
    })
    const [updateRAGretrievalConfigState, setUpdateRAGretrievalConfigState] = useState({
        clientApiKey: '',
        retrievalType: '',
        retrievalTech: '',
        kValue: '',
        fetchK: '',
        chainType: '',
        llmModelId: '',
        llmPromptId: '',
        history: '',
        sourceDocument: '',
        deviceType: '',
        retrievalId: ''
    })
    const [addRAGretrievalDeployState, setAddRAGretrievalDeployState] = useState({
        tagName:'',
        clientApiKey: '',
        persistDirectory: '',
        retrievalId:''
    });
    const [viewRAGretrievalDeployState,setViewRAGretrievalDeployState] = useState({
        APIKey:''
    });
    const [uploadRAGIngestFile, setUploadRAGIngestFile] = useState({
        clientApiKey: '',
        deployId: '',
        path: '',
    });

    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });
    const [buttonsShow, setButtonsShow] = useState(true);
    const [retrievalButtons, setRetrievalButtons] = useState(false);
    const [ingestButtons, setIngestButtons] = useState(false);
    const [divNumber, setDivNumber] = useState(0); // State to track the form number
    const [menuNumber, setMenuNumber] = useState(0); // State to track the menu/options number
    const [numFields, setNumFields] = useState(1); // State to keep track of the number of fields
    const [fieldsData, setFieldsData] = useState([]); // State to store key-value pairs

    const [APIKeys, setAPIKeys] = useState([]);
    const [ModelNames, setModelNames] = useState([]);
    const [DeviceTypes, setDeviceTypes] = useState([]);
    const [splitterTypes, setSplitterTypes] = useState([])
    const [ModelIDs, setModelIDs] = useState([]);
    const [configIDs, setConfigIDs] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [configsData, setConfigsData] = useState([]);
    const [modelIdInfo, setModelIdInfo] = useState({});
    const [retrievalTypes, setRetrievalTypes] = useState([]);
    const [retrievalTech, setRetrievalTech] = useState([]);
    const [chainTypes, setChainTypes] = useState([]);
    const [privateModelIds, setPrivateModelIds] = useState([]);
    const [promptIds, setPromptIds] = useState([]);
    const [modelIdData, setModelIdData] = useState({});
    const [promptIdData, setPromptIdData] = useState({});
    const [IngestIdInfo, setIngestIdInfo] = useState({});
    const [ingestDeployData, setIngestDeployData] = useState([]);
    const [ingestDeployIdInfo, setIngestDeployIdInfo] = useState({});
    const [retrievalConfigData, setRetrievalConfigData] = useState([]);
    const [presistDirPaths,setPresistDirPaths] = useState([]);
    const [presistDirInfo,setPresistDirInfo] = useState({});
    const [retrievalIds,setRetrievalIds] = useState([]);
    const [retrievalIdInfo,setRetrievalIdInfo]=useState({});
    const [retrievalDeployData,setRetrievalDeployData]= useState([]);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const inputRef = useRef(null);


    const [text, setText] = useState('Ingest');
    const [loading, setLoading] = useState(false);

    // Event handlers for handling form input changes
    const handleChange1 = (e) => setAddRAGModelState({ ...addRAGModelState, [e.target.name]: e.target.value });
    const handleChange2 = (e) => {
        setUpdateRAGModelState({ ...updateRAGModelState, [e.target.name]: e.target.value });

    };
    const handleChange3 = (e) => {
        setViewRAGModelsState({ ...viewRAGModelsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullModelDetails(e.target.value);
        }
    }
    const handleChange4 = (e) => {
        setAddRAGConfigState({ ...addRAGConfigState, [e.target.name]: e.target.value });
    };

    const handleChange5 = (e) => {
        setUpdateRAGConfigState({ ...updateRAGConfigState, [e.target.name]: e.target.value });
    };

    const handleChange6 = (e) => {
        setViewRAGConfigsState({ ...viewRAGConfigsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullConfigDetails(e.target.value);
        }
    };
    const handleChange7 = (e) => {
        const { id, value, } = e.target
        setIngestDeployState({ ...ingestDeployState, [id]: value });
        if (id === 'clientApiKey') {
            getFullModelDetails(value);
            getFullConfigDetails(value)
        }
        else if (id === 'modelId') {
            getModelIdInfo(ingestDeployState.clientApiKey, value)
        }
        else if (id === 'ingestId') {
            getIngestIdInfo(ingestDeployState.clientApiKey, value)
        }
    };
    const handleChange8 = (e) => {
        const { id, value, } = e.target
        setUpdateIngestDeployState({ ...updateIngestDeployState, [id]: value });
        if (id === 'clientApiKey') {
            getFullModelDetails(value);
            getFullConfigDetails(value);
        }
        else if (id === 'modelId') {
            getModelIdInfo(updateIngestDeployState.clientApiKey, value)
        }
        else if (id === 'ingestId') {
            getIngestIdInfo(updateIngestDeployState.clientApiKey, value)
        }
    };

    const handleChange9 = async (e) => {
        const { id, value } = e.target
        setViewRAGIngestDeployState({ [id]: value })
        getFullIngestDeployDetails(value);
    }
    const handleChange10 = async (e) => {
        const { id, value } = e.target
        setAddRAGretrievalState({ ...addRAGretrievalState, [id]: value })
        if (id === 'clientApiKey') {
            getRetrievalTypes()
        }
        else if (id === 'retrievalType') {
            if (value === 'generalRetrieval') {
                getRetrievalTechs(value)
            }
            else {
                getRetrievalChainTypes(value)
                getDeviceTypes();
                getModelIds(addRAGretrievalState.clientApiKey);
                getpromptIds(addRAGretrievalState.clientApiKey);
            }
        }
        else if (id === 'llmModelId') {
            getLLMModelinfo(addRAGretrievalState.clientApiKey, value);
        } else if (id === 'llmPromptId') {
            getLLMpromptIdInfo(addRAGretrievalState.clientApiKey, value)
        }
    }
    const handleChange11 = async (e) => {
        const { id, value } = e.target
        setUpdateRAGretrievalConfigState({ ...updateRAGretrievalConfigState, [id]: value })
        if (id === 'clientApiKey') {
            getRetrievalTypes()
        }
        else if (id === 'retrievalType') {
            if (value === 'generalRetrieval') {
                getRetrievalTechs(value)
            }
            else {
                getRetrievalChainTypes(value)
                getDeviceTypes();
                getModelIds(updateRAGretrievalConfigState.clientApiKey);
                getpromptIds(updateRAGretrievalConfigState.clientApiKey);
            }
        }
        else if (id === 'llmModelId') {
            getLLMModelinfo(updateRAGretrievalConfigState.clientApiKey, value);
        } else if (id === 'llmPromptId') {
            getLLMpromptIdInfo(updateRAGretrievalConfigState.clientApiKey, value);
        }
    }
    const handleChange12 = async (e) => {
        const { id, value } = e.target
        setViewRAGretrievalConfigState({ [id]: value })
        getFullRetrievalConfigDetails(value);
    }
    const handleChange13 = async (e) => {
        const { id, value } = e.target;
        setAddRAGretrievalDeployState({ ...addRAGretrievalDeployState, [id]: value });
        if (id === 'clientApiKey') {
            getPresistDirePaths(value);
            getRetrievalIds(value);
        }
        else if (id === 'persistDirectory'){
            getPresistDirInfo(addRAGretrievalDeployState.clientApiKey, value);
        }
        else if( id === 'retrievalId'){
            getRetrievalIdInfo(addRAGretrievalDeployState.clientApiKey,value)
        }
    }
    const handleChange15=(e)=>{
        const {id,value} = e.target;
        setViewRAGretrievalDeployState({...viewRAGretrievalDeployState,[id]: value});
        getFullRetrievalDeployDetails(value);
    }
    const handleChange16 = (e) => {
        const { id, value, } = e.target
        setUploadRAGIngestFile({ ...uploadRAGIngestFile, [id]: value });
        if (id === 'clientApiKey') {
            getFullIngestDeployDetails(value)
        }
        else if (id === 'deployId') {
            getIngestDeployIdInfo(uploadRAGIngestFile.clientApiKey, value)
        }
        else if (id === 'file') {
            setSelectedFiles(e.target.files[0]);
        }
    };

    const handleChangeKeyValue = (event, index, field) => {
        const { value } = event.target;
        setFieldsData((prevFieldsData) => {
            const updatedFieldsData = { ...prevFieldsData };
            if (!updatedFieldsData[index]) {
                updatedFieldsData[index] = {};
            }
            updatedFieldsData[index][field] = value;
            return updatedFieldsData;
        });
    }
    // Function to handle flash messages
    const handleFlashMessage = (text, success, time) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), time);
    };

    // Function to get API Keys
    async function getclientAPIKeys() {
        try {
            const response = await fetch("/clientApiKeys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAPIKeys(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching keys:", error);
        }
    }

    async function getModelNames() {
        try {
            const response = await fetch("/rag/getModelNames", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                setModelNames(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model names:", error);
        }
    }

    async function getDeviceTypes() {
        try {
            const response = await fetch("/rag/getDeviceTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeviceTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching device types:", error);
        }
    }

    // Function to get model IDs
    async function getClientModelIDs(clientApiKey) {
        try {
            const response = await fetch("/rag/getModelIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setModelIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model IDs:", error);
        }
    };

    // Function to get model IDs
    async function getSplitterTypes() {
        try {
            const response = await fetch("/rag/getSplitterTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSplitterTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model IDs:", error);
        }
    };

    // Function to get config IDs
    async function getClientConfigIDs(clientApiKey) {
        try {
            const response = await fetch("/rag/getConfigIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setConfigIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config IDs:", error);
        }
    };

    // Function to add new model
    const handleNewModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addRAGModelState.APIKey || !addRAGModelState.modelName || !addRAGModelState.deviceType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model name and device type
        var apikey = addRAGModelState.APIKey;
        var selectedModelName = addRAGModelState.modelName;
        var selectedDeviceType = addRAGModelState.deviceType;

        // Send data to server.js using fetch
        fetch("/rag/addNewModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelName: selectedModelName,
                deviceType: selectedDeviceType
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Could not add model. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding key and model id:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    // Function to update existing model
    const handleUpdateModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateRAGModelState.APIKey || !updateRAGModelState.modelName || !updateRAGModelState.deviceType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID, model name and device type
        var apikey = updateRAGModelState.APIKey;
        var modelId = updateRAGModelState.modelId;
        var selectedModelName = updateRAGModelState.modelName;
        var selectedDeviceType = updateRAGModelState.deviceType;
        // Send data to server.js using fetch
        fetch("/rag/updateModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelId: modelId,
                modelName: selectedModelName,
                deviceType: selectedDeviceType
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Model couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating model:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(3);
            });
    }

    // Function to get all models data
    async function getFullModelDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getFullModelDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model details:", error);
        }
    };

    // Function to add new config
    const handleNewConfigButton = async (e) => {
        e.preventDefault();
        if (addRAGConfigState.splitterType === 'MarkdownHeaderTextSplitter') {
            if (!addRAGConfigState.APIKey || !addRAGConfigState.splitterType) {
                handleFlashMessage("Please select all required fields.", false, 2000);
                return;
            }
            var formattedFieldsData = {};
            Object.keys(fieldsData).forEach((index) => {
                const key = fieldsData[index].key;
                const value = fieldsData[index].value;
                formattedFieldsData[key] = value;
            });
            const apikey = addRAGConfigState.APIKey;
            const splitterType = addRAGConfigState.splitterType;
            const header = formattedFieldsData
            var data = {
                clientApiKey: apikey,
                splitterType: splitterType,
                header: header
            }
        }
        // Check if required fields are selected
        else {
            if (!addRAGConfigState.APIKey || !addRAGConfigState.splitterType || !addRAGConfigState.chunkOverlap || !addRAGConfigState.chunkSize) {
                handleFlashMessage("Please select all required fields.", false, 2000);
                return;
            }
            // Retrieve selected API key, chunk size and overlap
            var apikey = addRAGConfigState.APIKey;
            var splitterType = addRAGConfigState.splitterType;
            var enteredSize = Number(addRAGConfigState.chunkSize);
            var enteredOverlap = Number(addRAGConfigState.chunkOverlap);
            var data = {
                clientApiKey: apikey,
                splitterType: splitterType,
                chunkSize: enteredSize,
                chunkOverlap: enteredOverlap,
            }
        }
        // Send data to server.js using fetch
        fetch("/rag/addNewConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ document: data }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage(" Ingest Config added successfully", true, 2000);
                    resetForms();
                    setDivNumber(6)
                } else if (response.status === 400) {
                    handleFlashMessage(" Ingest Config couldnt be added. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding Ingest config:", error);
            })
    }

    // Function to update existing config
    const handleUpdateConfigButton = async (e) => {
        e.preventDefault();
        if (updateRAGConfigState.splitterType === 'MarkdownHeaderTextSplitter') {
            if (!updateRAGConfigState.clientApiKey || !updateRAGConfigState.splitterType) {
                handleFlashMessage("Please select all required fields.", false, 2000);
                return;
            }
            const formattedFieldsData = {};
            Object.keys(fieldsData).forEach((index) => {
                const key = fieldsData[index].key;
                const value = fieldsData[index].value;
                formattedFieldsData[key] = value;
            });

            var data = {
                clientApiKey: updateRAGConfigState.clientApiKey,
                ingestId: updateRAGConfigState.ingestId,
                splitterType: updateRAGConfigState.splitterType,
                header: formattedFieldsData
            }
        }
        // Check if required fields are selected
        else {
            if (!updateRAGConfigState.clientApiKey || !updateRAGConfigState.splitterType || !updateRAGConfigState.chunkOverlap || !updateRAGConfigState.chunkSize) {
                handleFlashMessage("Please select all required fields.", false, 2000);
                return;
            }
            // Retrieve selected API key, chunk size and overlap
            var data = {
                clientApiKey: updateRAGConfigState.clientApiKey,
                ingestId: updateRAGConfigState.ingestId,
                splitterType: updateRAGConfigState.splitterType,
                chunkSize: Number(updateRAGConfigState.chunkSize),
                chunkOverlap: Number(updateRAGConfigState.chunkOverlap)
            }
        }
        // Send data to server.js using fetch
        fetch("/rag/updateConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ document: data }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Ingest Config updated successfully", true, 2000);
                    resetForms();
                } else if (response.status === 400) {
                    handleFlashMessage("Ingest Config couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating Config:", error);
            })
    }

    // Function to get all configs data
    async function getFullConfigDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getFullConfigDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setConfigsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config details:", error);
        }
    };

    // Function to get all models data
    async function getModelIdInfo(clientApiKey, modelId) {
        try {
            const response = await fetch("/rag/getModelIdInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    modelId: modelId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelIdInfo(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model Id Info:", error);
        }
    };

    // Function to get all models data
    async function getIngestIdInfo(clientApiKey, ingestId) {
        try {
            const response = await fetch("/rag/getIngestIdInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    ingestId: ingestId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIngestIdInfo(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Ingest Id Info:", error);
        }
    };
    // Function to get all Rag Deploy data
    async function getFullIngestDeployDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getIngestDeployDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIngestDeployData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Ingest Deploy Details:", error);
        }
    };
    // Function to get Deploy Id Info
    async function getIngestDeployIdInfo(clientApiKey, deployId) {
        try {
            const response = await fetch("/rag/getIngestDeployIdInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    deployId: deployId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIngestDeployIdInfo(data);
                getModelIdInfo(clientApiKey, data.modelId)
                getIngestIdInfo(clientApiKey, data.ingestId)

            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Ingest Deploy Id Info:", error);
        }
    };
    // Function to get Rag retrieval types
    async function getRetrievalTypes() {
        try {
            const response = await fetch("/rag/getRetrievalTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRetrievalTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Retrieval Types:", error);
        }
    };
    // Function to get Rag retrieval types
    async function getRetrievalTechs(retrievalType) {
        try {
            const response = await fetch("/rag/getRetrievalTechs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    retrievalType: retrievalType
                })
            });
            if (response.ok) {
                const data = await response.json();
                setRetrievalTech(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Retrieval Techniques:", error);
        }
    };
    // Function to get Rag retrieval Chain types
    async function getRetrievalChainTypes(retrievalType) {
        try {
            const response = await fetch("/rag/getRetrievalChainTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    retrievalType: retrievalType
                })
            });
            if (response.ok) {
                const data = await response.json();
                setChainTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Retrieval Chain Types:", error);
        }
    };
    // Function to get LLM modelIds for Rag Retrieval
    async function getModelIds(clientApiKey) {
        try {
            const response = await fetch("/rag/getModelIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                })
            });
            if (response.ok) {
                const data = await response.json();
                setPrivateModelIds(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model Ids:", error);
        }
    };
    // Function to get promptIds for Rag Retrieval
    async function getpromptIds(clientApiKey) {
        try {
            const response = await fetch("/rag/getPromptIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                })
            });
            if (response.ok) {
                const data = await response.json();
                setPromptIds(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching prompt Ids :", error);
        }
    };
    // Function to get LLM ModelId Info
    async function getLLMModelinfo(clientApiKey, modelId) {
        try {
            const response = await fetch("/llm/getLLMDeployModelInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    modelId: modelId
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setModelIdData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching LLM Deploy Model Info:", error);
        }
    };
    // Function to get LLM ModelId Info
    async function getLLMpromptIdInfo(clientApiKey, promptId) {
        try {
            const response = await fetch("/llm/getLLMDeployPromptInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    promptId: promptId
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setPromptIdData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching LLM Prompt Id Info:", error);
        }
    };
    // Function to get all Rag retrieval Config data
    async function getFullRetrievalConfigDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getRetrievalConfigDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRetrievalConfigData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Retrieval Config Details:", error);
        }
    };
    // Function to get Presist Directory Paths
    async function getPresistDirePaths(clientApiKey) {
        try {
            const response = await fetch("/rag/getPresistDirPaths", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPresistDirPaths(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Presist Directory Paths:", error);
        }
    };
    // Function to get Presist Directory Paths
    async function getPresistDirInfo(clientApiKey, presistDir) {
        try {
            const response = await fetch("/rag/getPresistDirInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    presistDir : presistDir
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPresistDirInfo(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Presist Directory Path Info:", error);
        }
    };
    // Function to get all Rag retrieval Ids
    async function getRetrievalIds(clientApiKey) {
        try {
            const response = await fetch("/rag/getRetrievalIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRetrievalIds(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Rag Retrieval Ids:", error);
        }
    };
    // Function to get all Rag retrieval Ids
    async function getRetrievalIdInfo(clientApiKey, retrievalId) {
        try {
            const response = await fetch("/rag/getRetrievalIdInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    retrievalId: retrievalId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRetrievalIdInfo(data);
                getLLMModelinfo(clientApiKey, data.llmModelId);
                getLLMpromptIdInfo(clientApiKey, data.llmPromptId)

            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Rag Retrieval Id Info:", error);
        }
    };
    // Function to get all Rag retrieval Deploy Configs
    async function getFullRetrievalDeployDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getRetrievalDeployDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRetrievalDeployData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Retrieval Deploy Details:", error);
        }
    };
    // Function to reset the forms to its initial state
    const resetForms = () => {
        setAddRAGModelState({
            APIKey: '',
            modelName: '',
            deviceType: ''
        });
        setUpdateRAGModelState({
            APIKey: '',
            modelId: '',
            modelName: '',
            deviceType: ''
        });
        setViewRAGModelsState({
            APIKey: ''
        });
        setAddRAGConfigState({
            APIKey: '',
            splitterType: '',
            chunkSize: '',
            chunkOverlap: ''
        });
        setUpdateRAGConfigState({
            clientApiKey: '',
            configId: '',
            splitterType: '',
            chunkSize: '',
            chunkOverlap: ''
        });
        setViewRAGConfigsState({
            APIKey: ''
        });
        setFieldsData([]);
        setNumFields(1);
        setIngestIdInfo({});
        setModelIdInfo({});
        setIngestDeployState({
            tagName: '',
            clientApiKey: '',
            modelId: '',
            ingestId: ''
        });
        setViewRAGIngestDeployState({
            APIKey: ''
        })
        setUpdateIngestDeployState({
            oldTagName: '',
            newTagName: '',
            clientApiKey: '',
            deployId: '',
            modelId: '',
            ingestId: ''
        })
        setUploadRAGIngestFile({
            clientApiKey: '',
            deployId: '',
            path: ''
        })
        setSelectedFiles(null);
        setAddRAGretrievalState({
            clientApiKey: '',
            retrievalType: '',
            retrievalTech: '',
            kValue: '',
            fetchK: '',
            chainType: '',
            llmModelId: '',
            llmPromptId: '',
            history: '',
            sourceDocument: '',
            deviceType: ''
        });
        setPrivateModelIds([]);
        setPromptIds([]);
        setModelIdData({});
        setPromptIdData({});
        setViewRAGretrievalConfigState({
            APIKeys: ''
        });
        setUpdateRAGretrievalConfigState({
            clientApiKey: '',
            retrievalType: '',
            retrievalTech: '',
            kValue: '',
            fetchK: '',
            chainType: '',
            llmModelId: '',
            history: '',
            sourceDocument: '',
            deviceType: '',
            retrievalId: ''
        });
        setAddRAGretrievalDeployState({
            tagName:'',
            clientApiKey:'',
            persistDirectory:'',
            retrievalId:''
        })
    };

    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10";

    const fixedInputClass = "rounded-md appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"

    const disable = { cursor: 'not-allowed', background: 'grey' };

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleEmbeddingButton = () => {
        setButtonsShow(false);
        setIngestButtons(false);
        setRetrievalButtons(false);
        setMenuNumber(1);
        setDivNumber(3);
        getclientAPIKeys();
        getModelNames();
        getDeviceTypes();
        resetForms();
    };

    const handleIngestConfigButton = () => {
        setButtonsShow(false);
        setIngestButtons(true);
        setRetrievalButtons(false);
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const handleRetrievalButton = () => {
        setButtonsShow(false);
        setIngestButtons(false);
        setRetrievalButtons(true);
        getclientAPIKeys();
        setMenuNumber(4);
        setDivNumber(12)
        resetForms()
    }

    const handleIngestButton = () => {
        setButtonsShow(false);
        setIngestButtons(false);
        setRetrievalButtons(false);
        getclientAPIKeys();
        setMenuNumber(0);
        setDivNumber(16);
        resetForms();
    }
    const IngestConfigButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };
    const IngestDeployButton = () => {
        setMenuNumber(3);
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };
    const retrievalConfigButton = () => {
        setMenuNumber(4);
        setDivNumber(12);
        getclientAPIKeys();
        resetForms();
    };
    const retrievalDeployButton = () => {
        setMenuNumber(5);
        setDivNumber(15);
        getclientAPIKeys();
        resetForms();
    };
    const handleBackButton = () => {
        setButtonsShow(true);
        setDivNumber(0);
        setMenuNumber(0);
        resetForms();
    }
    const showAddRAGModelForm = () => {
        setDivNumber(1);
        getclientAPIKeys();
        resetForms();
    };

    const viewAllRAGModels = () => {
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const showAddRAGConfigsForm = () => {
        setDivNumber(4);
        getclientAPIKeys();
        getSplitterTypes();
        resetForms();
    };

    const ViewAllRAGConfigs = () => {
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };
    const showAddRAGDeployForm = () => {
        setDivNumber(7);
        getclientAPIKeys();
        resetForms();
    };
    const ViewAllRAGDeploy = () => {
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };
    const showAddRAGretrievalForm = () => {
        setDivNumber(10);
        getclientAPIKeys();
        resetForms();
    }
    const ViewAllRAGretrieval = () => {
        setDivNumber(12);
        getclientAPIKeys();
        resetForms();
    };
    const showAddRAGretrievalDeployForm = () => {
        setDivNumber(13);
        getclientAPIKeys();
        resetForms();
    }
    const ViewAllRAGretrievalDeploy = () => {
        setDivNumber(15);
        getclientAPIKeys();
        resetForms();
    };
    const uploadIngestFile = () => {
        setDivNumber(16);
        getclientAPIKeys();
        resetForms();
    };

    // Update the click handler for model IDs
    const handleModelClick = async (APIKey, modelId, modelName, deviceType) => {
        setDivNumber(2);

        await getClientModelIDs(APIKey);

        setUpdateRAGModelState({
            APIKey: APIKey,
            modelId: modelId,
            modelName: modelName,
            deviceType: deviceType
        });
    };

    // Update the click handler for config IDs
    const handleConfigClick = async (APIKey, document) => {
        setDivNumber(5);
        document.clientApiKey = APIKey;
        await getClientConfigIDs(APIKey);
        await getSplitterTypes();
        setUpdateRAGConfigState(document);

        // Extract key-value pairs from InputData and convert them to an array of objects
        if (document.splitterType === 'MarkdownHeaderTextSplitter') {
            const extractedFieldsData = Object.entries(document.header).map(([key, value]) => ({ key, value }));
            // Set the state with the extracted key-value pairs
            setNumFields(extractedFieldsData.length);
            setFieldsData(extractedFieldsData);
        }
    }
    //function to add New Ingest Deploy Config 
    const handleAddIngestDeploy = async (e) => {
        e.preventDefault()
        if (!ingestDeployState.tagName || !ingestDeployState.clientApiKey || !ingestDeployState.modelId || !ingestDeployState.ingestId) {
            console.warn(' Please select all fields');
            handleFlashMessage("Please select all fields", false, 2000);
            return
        }
        const data = ingestDeployState;
        fetch("/rag/addIngestDeploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: data
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("New Ingest Deploy added successfully", true, 2000);
                    resetForms();
                } else if (response.status === 409) {
                    handleFlashMessage("Tag Name is Already Exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding New Ingest Deploy:", error);
            })
    };
    // Update the click handler for config IDs
    const handleIngestDeployClick = async (APIKey, document) => {
        setDivNumber(8);
        await getFullModelDetails(APIKey);
        await getFullConfigDetails(APIKey);
        await getIngestIdInfo(APIKey, document.ingestId);
        await getModelIdInfo(APIKey, document.modelId);

        setUpdateIngestDeployState({
            oldTagName: document.tagName,
            newTagName: document.tagName,
            clientApiKey: APIKey,
            deployId: document.deployId,
            modelId: document.modelId,
            ingestId: document.ingestId,
        });
    }
    // function to update the existing Ingest Deploy config
    const handleUpdateIngestDeploy = async (e) => {
        e.preventDefault()
        if (!updateIngestDeployState.newTagName || !updateIngestDeployState.clientApiKey || !updateIngestDeployState.modelId || !updateIngestDeployState.ingestId) {
            console.warn(' Please select all fields');
            handleFlashMessage("Please select all fields", false, 2000);
            return
        }
        const data = updateIngestDeployState;
        fetch("/rag/UpdateIngestDeploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: data
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Existing Ingest Deploy Config Updated successfully", true, 2000);
                    resetForms();
                    setDivNumber(9);
                } else if (response.status === 409) {
                    handleFlashMessage("Tag Name is Already Exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error Updating Ingest Deploy Config:", error);
            })
    };
    // function to update the existing Ingest Deploy config
    const handleNewRetrievalConfigButton = async (e) => {
        e.preventDefault()
        if (addRAGretrievalState.retrievalType === 'generalRetrieval') {
            if (addRAGretrievalState.retrievalTech === 'similarity_search') {
                if (!addRAGretrievalState.clientApiKey || !addRAGretrievalState.retrievalType || !addRAGretrievalState.retrievalTech || !addRAGretrievalState.kValue) {
                    console.warn(' Please select all fields');
                    handleFlashMessage("Please select all fields", false, 2000);
                    return
                }
                var data = {
                    clientApiKey: addRAGretrievalState.clientApiKey,
                    retrievalType: addRAGretrievalState.retrievalType,
                    retrievalTech: addRAGretrievalState.retrievalTech,
                    kValue: Number(addRAGretrievalState.kValue)
                };
            }
            else if (addRAGretrievalState.retrievalTech === 'max_marginal_relevance_search') {
                if (!addRAGretrievalState.clientApiKey || !addRAGretrievalState.retrievalType || !addRAGretrievalState.retrievalTech || !addRAGretrievalState.kValue || !addRAGretrievalState.fetchK) {
                    console.warn(' Please select all fields');
                    handleFlashMessage("Please select all fields", false, 2000);
                    return
                }
                var data = {
                    clientApiKey: addRAGretrievalState.clientApiKey,
                    retrievalType: addRAGretrievalState.retrievalType,
                    retrievalTech: addRAGretrievalState.retrievalTech,
                    kValue: Number(addRAGretrievalState.kValue),
                    fetchK: Number(addRAGretrievalState.fetchK)
                };
            }
        } else {
            if (!addRAGretrievalState.clientApiKey || !addRAGretrievalState.retrievalType || !addRAGretrievalState.chainType || !addRAGretrievalState.llmModelId || !addRAGretrievalState.llmPromptId || !addRAGretrievalState.history || !addRAGretrievalState.sourceDocument || !addRAGretrievalState.deviceType) {
                console.warn(' Please select all fields');
                handleFlashMessage("Please select all fields", false, 2000);
                return
            }
            var data = {
                clientApiKey: addRAGretrievalState.clientApiKey,
                retrievalType: addRAGretrievalState.retrievalType,
                chainType: addRAGretrievalState.chainType,
                llmModelId: addRAGretrievalState.llmModelId,
                llmPromptId: addRAGretrievalState.llmPromptId,
                history: addRAGretrievalState.history,
                sourceDocument: addRAGretrievalState.sourceDocument,
                deviceType: addRAGretrievalState.deviceType
            };
        }
        fetch("/rag/addRAGretrievalConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: data
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("RAG Retrieval Config added successfully", true, 2000);
                    resetForms();
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 2000);
                }
            })
            .catch((error) => {
                console.error("Error adding RAG retrieval Config:", error);
            })
    };
    // Update the click handler for config IDs
    const handleRetrievalConfigClick = async (APIKey, document) => {
        setDivNumber(11);
        await getRetrievalTypes();
        if (document.retrievalType === 'generalRetrieval') {
            await getRetrievalTechs(document.retrievalType);
        }
        else {
            await getModelIds(APIKey);
            await getpromptIds(APIKey);
            await getLLMModelinfo(APIKey, document.llmModelId);
            await getLLMpromptIdInfo(APIKey, document.llmPromptId);
            await getRetrievalChainTypes(document.retrievalType);
            await getDeviceTypes();
        }
        document.clientApiKey = APIKey;
        setUpdateRAGretrievalConfigState(document);
    }
    // function to update the existing Ingest Deploy config
    const handleUpdateRetrievalConfigButton = async (e) => {
        e.preventDefault()
        if (updateRAGretrievalConfigState.retrievalType === 'generalRetrieval') {
            if (updateRAGretrievalConfigState.retrievalTech === 'similarity_search') {
                if (!updateRAGretrievalConfigState.clientApiKey || !updateRAGretrievalConfigState.retrievalType || !updateRAGretrievalConfigState.retrievalTech || !updateRAGretrievalConfigState.kValue) {
                    console.warn(' Please select all fields');
                    handleFlashMessage("Please select all fields", false, 2000);
                    return
                }
                var data = {
                    retrievalId: updateRAGretrievalConfigState.retrievalId,
                    clientApiKey: updateRAGretrievalConfigState.clientApiKey,
                    retrievalType: updateRAGretrievalConfigState.retrievalType,
                    retrievalTech: updateRAGretrievalConfigState.retrievalTech,
                    kValue: Number(updateRAGretrievalConfigState.kValue)
                };
            }
            else if (updateRAGretrievalConfigState.retrievalTech === 'max_marginal_relevance_search') {
                if (!updateRAGretrievalConfigState.clientApiKey || !updateRAGretrievalConfigState.retrievalType || !updateRAGretrievalConfigState.retrievalTech || !updateRAGretrievalConfigState.kValue || !updateRAGretrievalConfigState.fetchK) {
                    console.warn(' Please select all fields');
                    handleFlashMessage("Please select all fields", false, 2000);
                    return
                }
                var data = {
                    retrievalId: updateRAGretrievalConfigState.retrievalId,
                    clientApiKey: updateRAGretrievalConfigState.clientApiKey,
                    retrievalType: updateRAGretrievalConfigState.retrievalType,
                    retrievalTech: updateRAGretrievalConfigState.retrievalTech,
                    kValue: Number(updateRAGretrievalConfigState.kValue),
                    fetchK: Number(updateRAGretrievalConfigState.fetchK)
                };
            }
        } else {
            if (!updateRAGretrievalConfigState.clientApiKey || !updateRAGretrievalConfigState.retrievalType || !updateRAGretrievalConfigState.chainType || !updateRAGretrievalConfigState.llmPromptId || !updateRAGretrievalConfigState.llmModelId || !updateRAGretrievalConfigState.history || !updateRAGretrievalConfigState.sourceDocument || !updateRAGretrievalConfigState.deviceType) {
                console.warn(' Please select all fields');
                handleFlashMessage("Please select all fields", false, 2000);
                return
            }
            var data = {
                retrievalId: updateRAGretrievalConfigState.retrievalId,
                clientApiKey: updateRAGretrievalConfigState.clientApiKey,
                retrievalType: updateRAGretrievalConfigState.retrievalType,
                chainType: updateRAGretrievalConfigState.chainType,
                llmModelId: updateRAGretrievalConfigState.llmModelId,
                llmPromptId: updateRAGretrievalConfigState.llmPromptId,
                history: updateRAGretrievalConfigState.history,
                sourceDocument: updateRAGretrievalConfigState.sourceDocument,
                deviceType: updateRAGretrievalConfigState.deviceType
            };
        }
        fetch("/rag/updateRAGretrievalConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: data
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("RAG Retrieval Config updated successfully", true, 2000);
                    resetForms();
                    setDivNumber(12);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 2000);
                }
            })
            .catch((error) => {
                console.error("Error updating RAG retrieval Config:", error);
            })
    };
     //function to add New Retrieval Deploy Config 
     const handleNewRetrievalDeployButton = async (e) => {
        e.preventDefault()
        if (!addRAGretrievalDeployState.tagName || !addRAGretrievalDeployState.clientApiKey || !addRAGretrievalDeployState.persistDirectory || !addRAGretrievalDeployState.retrievalId) {
            console.warn(' Please select all fields');
            handleFlashMessage("Please select all fields", false, 2000);
            return
        }
        const data = addRAGretrievalDeployState;
        data.embeddingModelId = presistDirInfo.modelId
        fetch("/rag/addRetrievalDeploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: data
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("New Retrieval Deploy added successfully", true, 2000);
                    resetForms();
                } else if (response.status === 409) {
                    handleFlashMessage("Tag Name is Already Exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding New Retrieval Deploy:", error);
            })
    };
    const handleFileUpload = async (e) => {
        e.preventDefault()
        if (!uploadRAGIngestFile.clientApiKey || !uploadRAGIngestFile.deployId || !uploadRAGIngestFile.path) {
            console.warn(' Please select all fields');
            handleFlashMessage("Please select all fields", false, 2000);
            return
        }
        setLoading(true)
        const formData = new FormData();
        formData.append('files', selectedFiles);
        try {
            // Step 1 - File(s) Upload
            const response = await fetch("/rag/uploadFileToWorkingDir", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                handleFlashMessage("File Uploaded Successful!", true, 3000);
                await handleFileIngest();
                // await moveFile();
            } else {
                handleFlashMessage("Failed to Upload File", false, 3000);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            handleFlashMessage(`Error uploading files: ${error}`, false, 3000);
        }
    };

    const handleFileIngest = async () => {
        const data = uploadRAGIngestFile
        setText('Ingesting....')
        try {
            // Step 2 - File(s) Ingest
            const response = await fetch('/rag/ingestFile', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: data
                }),
            });
            if (response.ok) {
                await moveFile();
                await addPresistDirPath();
                handleFlashMessage("File ingest successful!", true, 3000);
                setLoading(false)
                setText('Ingest')
                resetForms();
                inputRef.current.value = '';
            } else {
                console.error('File ingest failed.');
                handleFlashMessage("File ingest failed. Please try again", false, 3000);
                removeFile()
                setLoading(false)
                setText('Ingest')
            }
        } catch (error) {
            console.error('Error ingesting files:', error);
            handleFlashMessage(`Error ingesting files: ${error}`, false, 3000);
            removeFile()
        }
    };
    const moveFile = async () => {
        try {
            // Step 1 - File(s) Upload
            const response = await fetch("/rag/moveFile", {
                method: "POST",
            });

            if (response.ok) {
                await removeFile();
            } else {
                console.error("Failed to moved File To archive Directory!");
            }
        } catch (error) {
            console.error('Error moving files To archive Directory:', error);
        }
    };
    const removeFile = async () => {
        try {
            // Step 1 - File(s) Upload
            const response = await fetch("/rag/removeFile", {
                method: "POST",
            });

            if (response.ok) {
                console.info("File deleted Successful in working Directory!");
            } else {
                console.error("Failed to delete File in working Directory!");
            }
        } catch (error) {
            console.error('Error deleting files in working Directory:', error);
        }
    };
    const addPresistDirPath = async () => {
        const path = uploadRAGIngestFile.path;
        const clientApiKey = uploadRAGIngestFile.clientApiKey;
        const modelId = ingestDeployIdInfo.modelId;
        try {
            // Step 1 - File(s) Upload
            const response = await fetch("/rag/addPresistDirPath", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Path: path,
                    clientApiKey:clientApiKey,
                    modelId: modelId
                })
            });
            if (response.ok) {
                console.info("persist direcotry added Successful!");
            } else if (response.status === 409) {
                console.error("Path is Already Exists");
            } else {
                console.error("Failed to add persist direcotry.");
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };
    return (
        <div style={{ width: '100%' }}>
            <div>
                {buttonsShow && (<div className="flex justify-between items-center mt-4">
                    <button
                        onClick={handleEmbeddingButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '100px' }}>
                        Embedding Model
                    </button>
                    <button
                        onClick={handleIngestConfigButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '100px' }}>
                        Ingest
                    </button>
                    <button
                        onClick={handleRetrievalButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '100px' }}>
                        Retrieval
                    </button>
                    <button
                        onClick={handleIngestButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '100px' }}>
                        Ingest Files
                    </button>
                </div>
                )}
                {!buttonsShow && ingestButtons && (<div className="flex justify-between items-center mt-4">
                    <button
                        onClick={IngestConfigButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '200px' }}>
                        Config
                    </button>
                    <button
                        onClick={IngestDeployButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '200px' }}>
                        Deploy
                    </button>
                </div>
                )}
                {!buttonsShow && retrievalButtons && (<div className="flex justify-between items-center mt-4">
                    <button
                        onClick={retrievalConfigButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '200px' }}>
                        Config
                    </button>
                    <button
                        onClick={retrievalDeployButton}
                        className={buttonClass}
                        style={{ height: '40px', minWidth: '200px' }}>
                        Deploy
                    </button>
                </div>
                )}
            </div>

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Models Menu */}
            {menuNumber === 1 && (
                <div id='RAGModels' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGModelForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button >
                    <button
                        onClick={viewAllRAGModels}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Configs Menu */}
            {menuNumber === 2 && (
                <div id='RAGConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGConfigsForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllRAGConfigs}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                    {/* <button
                        onClick={uploadIngestFile}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Ingest file
                    </button> */}
                </div>
            )}
            {menuNumber === 3 && (
                <div id='RAGConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGDeployForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllRAGDeploy}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}
            {menuNumber === 4 && (
                <div id='RAGConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGretrievalForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllRAGretrieval}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}
            {menuNumber === 5 && (
                <div id='RAGConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGretrievalDeployForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllRAGretrievalDeploy}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* New Model div */}
            <div style={{ minHeight: '300px' }}>
                {divNumber === 1 && (
                    <div>
                        <h1 style={h1Style}>Add New Embedding Model</h1>

                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-2">
                                    <select
                                        id="APIKey"
                                        name="APIKey"
                                        value={addRAGModelState.APIKey}
                                        onChange={handleChange1}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="modelName"
                                        name="modelName"
                                        value={addRAGModelState.modelName}
                                        onChange={handleChange1}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select Model Name</option>
                                        {ModelNames.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="deviceType"
                                        name="deviceType"
                                        value={addRAGModelState.deviceType}
                                        onChange={handleChange1}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select Device Type</option>
                                        {DeviceTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className={submitButtonClass} onClick={handleNewModelButton}>Add</button>
                        </form>
                    </div>
                )}

                {/* Update Existing Model div */}
                {divNumber === 2 && (
                    <div>
                        <h1 style={h1Style}>Update Embedding Model Details - {updateRAGModelState.modelId}</h1>

                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="APIKey"
                                        name="APIKey"
                                        value={updateRAGModelState.APIKey}
                                        onChange={handleChange2}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="modelName"
                                        name="modelName"
                                        value={updateRAGModelState.modelName}
                                        onChange={handleChange2}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select Model Name</option>
                                        {ModelNames.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="deviceType"
                                        name="deviceType"
                                        value={updateRAGModelState.deviceType}
                                        onChange={handleChange2}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select Device Type</option>
                                        {DeviceTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className={submitButtonClass} onClick={handleUpdateModelButton}>Update</button>
                        </form>
                    </div>
                )}

                {/* View All Models div */}
                {divNumber === 3 && (
                    <div>
                        <h1 style={h1Style}>All Embedding Models</h1>

                        <form className="mt-6 space-y-6">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={viewRAGModelsState.APIKey}
                                    onChange={handleChange3}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {viewRAGModelsState.APIKey && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                        <tr>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Name</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Device Type</th>
                                        </tr>
                                    </thead>
                                    {/* Table body with models data */}
                                    <tbody>
                                        {modelsData.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                            </tr>
                                        ) : (
                                            modelsData.map((model, index) => (
                                                <tr key={index}>
                                                    <td
                                                        style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => handleModelClick(viewRAGModelsState.APIKey, model.modelId, model.modelName, model.deviceType)}
                                                    >
                                                        {model.modelId}
                                                    </td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelName}</td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.deviceType}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* New Config div */}
                {divNumber === 4 && (
                    <div>
                        <h1 style={h1Style}>Add New Ingest Config</h1>

                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="APIKey"
                                        name="APIKey"
                                        value={addRAGConfigState.APIKey}
                                        onChange={handleChange4}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="splitterType"
                                        name="splitterType"
                                        value={addRAGConfigState.splitterType}
                                        onChange={handleChange4}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Splitter Type</option>
                                        {splitterTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {addRAGConfigState.splitterType !== '' && addRAGConfigState.splitterType !== 'MarkdownHeaderTextSplitter' && (<div><div className="mb-4">
                                    <Input
                                        id="chunkSize"
                                        name="chunkSize"
                                        key="chunkSize"
                                        handleChange={handleChange4}
                                        value={addRAGConfigState.chunkSize}
                                        type="number"
                                        isRequired="true"
                                        placeholder="Enter Chunk Size"
                                    />
                                </div>
                                    <div className="mb-4">
                                        <Input
                                            id="chunkOverlap"
                                            name="chunkOverlap"
                                            key="chunkOverlap"
                                            handleChange={handleChange4}
                                            value={addRAGConfigState.chunkOverlap}
                                            type="number"
                                            isRequired="true"
                                            placeholder="Enter Chunk Overlap"
                                        />
                                    </div> </div>)}
                                {addRAGConfigState.splitterType === 'MarkdownHeaderTextSplitter' && (<div className="mb-4">
                                    <div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {[...Array(numFields)].map((_, index) => (
                                                <div key={index}>
                                                    <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`key-${index}`}
                                                                name={`key-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                                value={fieldsData[index] ? fieldsData[index].key : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Key"
                                                            />
                                                        </div>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`value-${index}`}
                                                                name={`value-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                                value={fieldsData[index] ? fieldsData[index].value : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setNumFields(numFields + 1)}
                                                className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                                Add Fields
                                            </button>
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                            <button className={submitButtonClass} onClick={handleNewConfigButton}>Add</button>
                        </form>
                    </div>
                )}

                {/* Update Existing Config div */}
                {divNumber === 5 && (
                    <div>
                        <h1 style={h1Style}>Update Ingest Config Details - {updateRAGConfigState.configId}</h1>

                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="apikey"
                                        name="apikey"
                                        value={updateRAGConfigState.clientApiKey}
                                        onChange={handleChange5}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="splitterType"
                                        name="splitterType"
                                        value={updateRAGConfigState.splitterType}
                                        onChange={handleChange5}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Splitter Type</option>
                                        {splitterTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {updateRAGConfigState.splitterType !== '' && updateRAGConfigState.splitterType !== 'MarkdownHeaderTextSplitter' && (<div><div className="mb-4">
                                    <Input
                                        id="chunkSize"
                                        name="chunkSize"
                                        key="chunkSize"
                                        handleChange={handleChange5}
                                        value={updateRAGConfigState.chunkSize}
                                        type="number"
                                        isRequired="true"
                                        placeholder="Enter Chunk Size"
                                    />
                                </div>
                                    <div className="mb-4">
                                        <Input
                                            id="chunkOverlap"
                                            name="chunkOverlap"
                                            key="chunkOverlap"
                                            handleChange={handleChange5}
                                            value={updateRAGConfigState.chunkOverlap}
                                            type="number"
                                            isRequired="true"
                                            placeholder="Enter Chunk Overlap"
                                        />
                                    </div> </div>)}
                                {updateRAGConfigState.splitterType === 'MarkdownHeaderTextSplitter' && (<div className="mb-4">
                                    <div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {[...Array(numFields)].map((_, index) => (
                                                <div key={index}>
                                                    <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`key-${index}`}
                                                                name={`key-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                                value={fieldsData[index] ? fieldsData[index].key : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Key"
                                                            />
                                                        </div>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`value-${index}`}
                                                                name={`value-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                                value={fieldsData[index] ? fieldsData[index].value : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setNumFields(numFields + 1)}
                                                className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                                Add Fields
                                            </button>
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                            <button className={submitButtonClass} onClick={handleUpdateConfigButton}>Update</button>
                        </form>
                    </div>
                )}

                {/* View All Configs div */}
                {divNumber === 6 && (
                    <div>
                        <h1 style={h1Style}>All Ingest Configs</h1>

                        <form className="mt-6 space-y-6">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={viewRAGConfigsState.APIKey}
                                    onChange={handleChange6}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {viewRAGConfigsState.APIKey && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                        <tr>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Config ID</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Splitter Type</th>
                                        </tr>
                                    </thead>
                                    {/* Table body with configs data */}
                                    <tbody>
                                        {configsData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                            </tr>
                                        ) : (
                                            configsData.map((config, index) => (
                                                <tr key={index}>
                                                    <td
                                                        style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => handleConfigClick(viewRAGConfigsState.APIKey, config)}
                                                    >
                                                        {config.ingestId}
                                                    </td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.splitterType}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {divNumber === 7 && (
                    <div>
                        <h1 style={h1Style}>Add New Ingest Deploy</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <input
                                        id='tagName'
                                        name='tagName'
                                        type="text"
                                        onChange={handleChange7}
                                        value={ingestDeployState.tagName}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required
                                        placeholder="Tag Name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={ingestDeployState.clientApiKey}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="modelId"
                                        name="modelId"
                                        value={ingestDeployState.modelId}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Embedding Model ID</option>
                                        {modelsData.map((model) => (
                                            <option key={model.modelId} value={model.modelId}>
                                                {model.modelId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {ingestDeployState.modelId !== '' && (<div>
                                    <div className="mb-2">
                                        <input
                                            type='text'
                                            value={modelIdInfo.modelName}
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <input
                                            type='text'
                                            value={modelIdInfo.deviceType}
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full" />
                                    </div>
                                </div>
                                )}
                                <div className="mb-4">
                                    <select
                                        id="ingestId"
                                        name="ingestId"
                                        value={ingestDeployState.ingestId}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Ingest ID</option>
                                        {configsData.map((config) => (
                                            <option key={config.ingestId} value={config.ingestId}>
                                                {config.ingestId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {ingestDeployState.ingestId !== '' && (<div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={IngestIdInfo.splitterType}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled
                                        />
                                    </div>
                                    {IngestIdInfo.splitterType !== '' && IngestIdInfo.splitterType !== 'MarkdownHeaderTextSplitter' && (<div><div className="mb-4">
                                        <input
                                            value={IngestIdInfo.chunkSize}
                                            type="number"
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter Chunk Size"
                                        />
                                    </div>
                                        <div className="mb-4">
                                            <input
                                                value={IngestIdInfo.chunkOverlap}
                                                type="number"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Chunk Overlap"
                                            />
                                        </div> </div>)}
                                    {IngestIdInfo.splitterType === 'MarkdownHeaderTextSplitter' && (<div className="mb-4">
                                        <div>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {Object.entries(IngestIdInfo.header).map((element) => (
                                                    <div key={element[0]}>
                                                        <div id={`keyValueFields-${element[0]}`} style={{ display: 'flex', gap: '1rem' }}>
                                                            <div className="mb-2" style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={element[0]}
                                                                    className="mt-1 p-2 border rounded-md w-full"
                                                                    disabled
                                                                    placeholder="Key"
                                                                />
                                                            </div>
                                                            <div className="mb-2" style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={element[1]}
                                                                    className="mt-1 p-2 border rounded-md w-full"
                                                                    disabled
                                                                    placeholder="Value"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>)}
                                </div>
                                )}
                            </div>
                            <button className={submitButtonClass} onClick={handleAddIngestDeploy}> Upload </button>
                        </form>
                    </div>
                )}

                {divNumber === 8 && (
                    <div>
                        <h1 style={h1Style}>Updating Existing Ingest Deploy - {updateIngestDeployState.deployId}</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <input
                                        id='newTagName'
                                        name='newTagName'
                                        type="text"
                                        onChange={handleChange8}
                                        value={updateIngestDeployState.newTagName}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required
                                        placeholder="Tag Name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={updateIngestDeployState.clientApiKey}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="modelId"
                                        name="modelId"
                                        value={updateIngestDeployState.modelId}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Embedding Model ID</option>
                                        {modelsData.map((model) => (
                                            <option key={model.modelId} value={model.modelId}>
                                                {model.modelId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {updateIngestDeployState.modelId !== '' && (<div>
                                    <div className="mb-2">
                                        <input
                                            type='text'
                                            value={modelIdInfo.modelName}
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full" />
                                    </div>
                                    <div className="mb-2">
                                        <input
                                            type='text'
                                            value={modelIdInfo.deviceType}
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full" />
                                    </div>
                                </div>
                                )}
                                <div className="mb-4">
                                    <select
                                        id="ingestId"
                                        name="ingestId"
                                        value={updateIngestDeployState.ingestId}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Ingest ID</option>
                                        {configsData.map((config) => (
                                            <option key={config.ingestId} value={config.ingestId}>
                                                {config.ingestId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {updateIngestDeployState.ingestId !== '' && (<div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={IngestIdInfo.splitterType}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled
                                        />
                                    </div>
                                    {IngestIdInfo.splitterType !== '' && IngestIdInfo.splitterType !== 'MarkdownHeaderTextSplitter' && (<div><div className="mb-4">
                                        <input
                                            value={IngestIdInfo.chunkSize}
                                            type="number"
                                            disabled
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter Chunk Size"
                                        />
                                    </div>
                                        <div className="mb-4">
                                            <input
                                                value={IngestIdInfo.chunkOverlap}
                                                type="number"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Chunk Overlap"
                                            />
                                        </div> </div>)}
                                    {IngestIdInfo.splitterType === 'MarkdownHeaderTextSplitter' && (<div className="mb-4">
                                        <div>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {Object.entries(IngestIdInfo.header).map((element) => (
                                                    <div key={element[0]}>
                                                        <div id={`keyValueFields-${element[0]}`} style={{ display: 'flex', gap: '1rem' }}>
                                                            <div className="mb-2" style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={element[0]}
                                                                    className="mt-1 p-2 border rounded-md w-full"
                                                                    disabled
                                                                    placeholder="Key"
                                                                />
                                                            </div>
                                                            <div className="mb-2" style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={element[1]}
                                                                    className="mt-1 p-2 border rounded-md w-full"
                                                                    disabled
                                                                    placeholder="Value"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>)}
                                </div>
                                )}
                            </div>
                            <button className={submitButtonClass} onClick={handleUpdateIngestDeploy}> Update </button>
                        </form>
                    </div>
                )}
                {divNumber === 9 && (
                    <div>
                        <h1 style={h1Style}>All Ingest Deploy Configs</h1>

                        <form className="mt-6 space-y-6">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={viewRAGIngestDeployState.APIKey}
                                    onChange={handleChange9}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {viewRAGIngestDeployState.APIKey && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                        <tr>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Tag Name</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Deploy Id</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Id</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Ingest Id</th>

                                        </tr>
                                    </thead>
                                    {/* Table body with configs data */}
                                    <tbody>
                                        {ingestDeployData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                            </tr>
                                        ) : (
                                            ingestDeployData.map((config, index) => (
                                                <tr key={index}>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.tagName}</td>

                                                    <td
                                                        style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => handleIngestDeployClick(viewRAGIngestDeployState.APIKey, config)}
                                                    >
                                                        {config.deployId}
                                                    </td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.modelId}</td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.ingestId}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {divNumber === 10 && (
                    <div>
                        <h1 style={h1Style}>Add New Retrieval Config</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={addRAGretrievalState.clientApiKey}
                                        onChange={handleChange10}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="retrievalType"
                                        name="retrievalType"
                                        value={addRAGretrievalState.retrievalType}
                                        onChange={handleChange10}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Retrieval Type</option>
                                        {retrievalTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {addRAGretrievalState.retrievalType === 'generalRetrieval' && (<div>
                                    <div className='mb-4'><select
                                        id="retrievalTech"
                                        name="retrievalTech"
                                        value={addRAGretrievalState.retrievalTech}
                                        onChange={handleChange10}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Retrieval Technique</option>
                                        {retrievalTech.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                    {addRAGretrievalState.retrievalTech !== '' && (<div className="mb-2" >
                                        <input
                                            id='kValue'
                                            name='kValue'
                                            type="text"
                                            onChange={handleChange10}
                                            value={addRAGretrievalState.kValue}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required
                                            placeholder="K Value"
                                        />
                                    </div>)}
                                    {addRAGretrievalState.retrievalTech === 'max_marginal_relevance_search' && (<div className="mb-2" >
                                        <input
                                            id='fetchK'
                                            name='fetchK'
                                            type="text"
                                            onChange={handleChange10}
                                            value={addRAGretrievalState.fetchK}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required
                                            placeholder="fetch K Value"
                                        />
                                    </div>)}
                                </div>)}
                                {addRAGretrievalState.retrievalType === 'QAretrieval' && (<div>
                                    <div className="mb-4">
                                        <select
                                            id="chainType"
                                            name="chainType"
                                            value={addRAGretrievalState.chainType}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Chain Type</option>
                                            {chainTypes.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="llmModelId"
                                            name="llmModelId"
                                            value={addRAGretrievalState.llmModelId}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select LLM Model ID</option>
                                            {privateModelIds.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {addRAGretrievalState.llmModelId && (<div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.mode}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Mode"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.modelType}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Model Type"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.modelName}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Model Name"
                                            />
                                        </div></div>)}
                                    <div className="mb-4">
                                        <select
                                            id="llmPromptId"
                                            name="llmPromptId"
                                            value={addRAGretrievalState.llmPromptId}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select LLM Prompt ID</option>
                                            {promptIds.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {addRAGretrievalState.llmPromptId && (
                                        <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                            <textarea
                                                value={promptIdData.systemMessage}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder=" System Message"
                                                disabled
                                            />
                                        </div>)}
                                    <div className="mb-4">
                                        <select
                                            id="history"
                                            name="history"
                                            value={addRAGretrievalState.history}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select History</option>
                                            <option key={true} value={true} >True </option>
                                            <option key={false} value={false} >False </option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="sourceDocument"
                                            name="sourceDocument"
                                            value={addRAGretrievalState.sourceDocument}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Source Document</option>
                                            <option key={true} value={true} >True </option>
                                            <option key={false} value={false} >False </option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="deviceType"
                                            name="deviceType"
                                            value={addRAGretrievalState.deviceType}
                                            onChange={handleChange10}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Device Type</option>
                                            {DeviceTypes.map((device) => (
                                                <option key={device} value={device}>
                                                    {device}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                )}
                            </div>
                            <button className={submitButtonClass} onClick={handleNewRetrievalConfigButton}>Add</button>
                        </form>
                    </div>
                )}
                {divNumber === 11 && (
                    <div>
                        <h1 style={h1Style}>Update Retrieval Config of {updateRAGretrievalConfigState.retrievalId}</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={updateRAGretrievalConfigState.clientApiKey}
                                        onChange={handleChange11}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value=''>Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="retrievalType"
                                        name="retrievalType"
                                        value={updateRAGretrievalConfigState.retrievalType}
                                        onChange={handleChange11}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value=''>Select Retrieval Type</option>
                                        {retrievalTypes.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {updateRAGretrievalConfigState.retrievalType === 'generalRetrieval' && (<div>
                                    <div className='mb-4'><select
                                        id="retrievalTech"
                                        name="retrievalTech"
                                        value={updateRAGretrievalConfigState.retrievalTech}
                                        onChange={handleChange11}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Retrieval Technique</option>
                                        {retrievalTech.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                    {updateRAGretrievalConfigState.retrievalTech !== '' && (<div className="mb-2" >
                                        <input
                                            id='kValue'
                                            name='kValue'
                                            type="text"
                                            onChange={handleChange11}
                                            value={updateRAGretrievalConfigState.kValue}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required
                                            placeholder="K Value"
                                        />
                                    </div>)}
                                    {updateRAGretrievalConfigState.retrievalTech === 'max_marginal_relevance_search' && (<div className="mb-2" >
                                        <input
                                            id='fetchK'
                                            name='fetchK'
                                            type="text"
                                            onChange={handleChange11}
                                            value={updateRAGretrievalConfigState.fetchK}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required
                                            placeholder="fetch K Value"
                                        />
                                    </div>)}
                                </div>)}
                                {updateRAGretrievalConfigState.retrievalType === 'QAretrieval' && (<div>
                                    <div className="mb-4">
                                        <select
                                            id="chainType"
                                            name="chainType"
                                            value={updateRAGretrievalConfigState.chainType}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Chain Type</option>
                                            {chainTypes.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="llmModelId"
                                            name="llmModelId"
                                            value={updateRAGretrievalConfigState.llmModelId}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select LLM Model ID</option>
                                            {privateModelIds.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {updateRAGretrievalConfigState.llmModelId && (
                                        <div>
                                            <div className="mb-4">
                                                <input
                                                    value={modelIdData.mode}
                                                    type="text"
                                                    disabled
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    placeholder="Enter Mode"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <input
                                                    value={modelIdData.modelType}
                                                    type="text"
                                                    disabled
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    placeholder="Enter Model Type"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <input
                                                    value={modelIdData.modelName}
                                                    type="text"
                                                    disabled
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    placeholder="Enter Model Name"
                                                />
                                            </div>
                                        </div>)}
                                    <div className="mb-4">
                                        <select
                                            id="llmPromptId"
                                            name="llmPromptId"
                                            value={updateRAGretrievalConfigState.llmPromptId}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select LLM Prompt ID</option>
                                            {promptIds.map((data) => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {updateRAGretrievalConfigState.llmPromptId && (
                                        <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                            <textarea
                                                value={promptIdData.systemMessage}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder=" System Message"
                                                disabled
                                            />
                                        </div>)}
                                    <div className="mb-4">
                                        <select
                                            id="history"
                                            name="history"
                                            value={updateRAGretrievalConfigState.history}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select History</option>
                                            <option key={true} value={true} >True </option>
                                            <option key={false} value={false} >False </option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="sourceDocument"
                                            name="sourceDocument"
                                            value={updateRAGretrievalConfigState.sourceDocument}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Source Document</option>
                                            <option key={true} value={true} >True </option>
                                            <option key={false} value={false} >False </option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <select
                                            id="deviceType"
                                            name="deviceType"
                                            value={updateRAGretrievalConfigState.deviceType}
                                            onChange={handleChange11}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Device Type</option>
                                            {DeviceTypes.map((device) => (
                                                <option key={device} value={device}>
                                                    {device}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                )}
                            </div>
                            <button className={submitButtonClass} onClick={handleUpdateRetrievalConfigButton}>Update</button>
                        </form>
                    </div>
                )}
                {divNumber === 12 && (
                    <div>
                        <h1 style={h1Style}>All Ingest Deploy Configs</h1>

                        <form className="mt-6 space-y-6">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={viewRAGretrievalConfigState.APIKey}
                                    onChange={handleChange12}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {viewRAGretrievalConfigState.APIKey && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                        <tr>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Retrieval ID</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Retrieval Type </th>
                                        </tr>
                                    </thead>
                                    {/* Table body with configs data */}
                                    <tbody>
                                        {retrievalConfigData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                            </tr>
                                        ) : (
                                            retrievalConfigData.map((config, index) => (
                                                <tr key={index}>
                                                    <td
                                                        style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => handleRetrievalConfigClick(viewRAGretrievalConfigState.APIKey, config)}
                                                    >
                                                        {config.retrievalId}
                                                    </td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.retrievalType}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {divNumber === 13 && (
                    <div>
                        <h1 style={h1Style}>Add New Retrieval Deployment</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-4">
                                    <input
                                        id='tagName'
                                        name='tagName'
                                        type="text"
                                        onChange={handleChange13}
                                        value={addRAGretrievalDeployState.tagName}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required
                                        placeholder="Tag Name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={addRAGretrievalDeployState.clientApiKey}
                                        onChange={handleChange13}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="persistDirectory"
                                        name="persistDirectory"
                                        value={addRAGretrievalDeployState.persistDirectory}
                                        onChange={handleChange13}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Presist Directory Path</option>
                                        {presistDirPaths.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {addRAGretrievalDeployState.persistDirectory !== '' && (<div>
                                    <div className='mb-4'>
                                        <input
                                            type="text"
                                            value={presistDirInfo.modelId}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" Embedding Model ID"
                                            disabled
                                        />
                                    </div>
                                    <div className='mb-4'>
                                        <input
                                            type="text"
                                            value={presistDirInfo.modelName}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" Model Name"
                                            disabled
                                        />
                                    </div>
                                </div>
                                )}
                                <div className="mb-4">
                                    <select
                                        id="retrievalId"
                                        name="retrievalId"
                                        value={addRAGretrievalDeployState.retrievalId}
                                        onChange={handleChange13}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Retrieval ID</option>
                                        {retrievalIds.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {addRAGretrievalDeployState.retrievalId !== '' && (<div>
                                    <div className="mb-4">
                                    <input
                                        type='text'
                                        value={retrievalIdInfo.retrievalType}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        disabled/>
                                </div>
                                {retrievalIdInfo.retrievalType === 'generalRetrieval' && (<div>
                                    <div className='mb-4'><input
                                        type='text'
                                        value={retrievalIdInfo.retrievalTech}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        disabled/>
                                    </div>
                                    {retrievalIdInfo.retrievalTech !== '' && (<div className="mb-2" >
                                        <input
                                            type="text"
                                            value={retrievalIdInfo.kValue}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled
                                            placeholder="K Value"
                                        />
                                    </div>)}
                                    {retrievalIdInfo.retrievalTech === 'max_marginal_relevance_search' && (<div className="mb-2" >
                                        <input
                                            type="text"
                                            value={retrievalIdInfo.fetchK}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled
                                            placeholder="fetch K Value"
                                        />
                                    </div>)}
                                </div>)}
                                {retrievalIdInfo.retrievalType === 'QAretrieval' && (<div>
                                    <div className="mb-4">
                                        <input
                                            type='type'
                                            value={retrievalIdInfo.chainType}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled/>
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={retrievalIdInfo.llmModelId}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled/>
                                    </div>
                                    {retrievalIdInfo.llmModelId && (<div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.mode}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Mode"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.modelType}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Model Type"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                value={modelIdData.modelName}
                                                type="text"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Model Name"
                                            />
                                        </div></div>)}
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={retrievalIdInfo.llmPromptId}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled/>
                                    </div>
                                    {retrievalIdInfo.llmPromptId && (
                                        <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                            <textarea
                                                value={promptIdData.systemMessage}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder=" System Message"
                                                disabled
                                            />
                                        </div>)}
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={retrievalIdInfo.history}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled/>
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={retrievalIdInfo.sourceDocument}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled/>
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={retrievalIdInfo.deviceType}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            disabled />
                                    </div>
                                </div>
                                )}
                            </div>
                                )}
                            </div>
                            <button className={submitButtonClass} onClick={handleNewRetrievalDeployButton}>Add</button>
                        </form>
                    </div>
                )}
                {divNumber === 15 && (
                    <div>
                        <h1 style={h1Style}>All Retrieval Deploy Configs</h1>

                        <form className="mt-6 space-y-6">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={viewRAGretrievalDeployState.APIKey}
                                    onChange={handleChange15}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {viewRAGretrievalDeployState.APIKey && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                        <tr>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Deploy ID</th>
                                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Tag Name </th>
                                        </tr>
                                    </thead>
                                    {/* Table body with configs data */}
                                    <tbody>
                                        {retrievalDeployData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                            </tr>
                                        ) : (
                                            retrievalDeployData.map((config, index) => (
                                                <tr key={index}>
                                                    <td
                                                        style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => "handleRetrievalConfigClick(viewRAGretrievalConfigState.APIKey, config)"}
                                                    >
                                                        {config.deployId}
                                                    </td>
                                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.tagName}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {divNumber === 16 && (
                    <div>
                        <h1 style={h1Style}>Ingest Files</h1>
                        <form className="mt-6 space-y-6">
                            <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                                <div className="mb-4">
                                    <select
                                        id="clientApiKey"
                                        name="clientApiKey"
                                        value={uploadRAGIngestFile.clientApiKey}
                                        onChange={handleChange16}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        id="deployId"
                                        name="deployId"
                                        value={uploadRAGIngestFile.deployId}
                                        onChange={handleChange16}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Deploy ID</option>
                                        {ingestDeployData.map((config) => (
                                            <option key={config.deployId} value={config.deployId}>
                                                {config.deployId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {uploadRAGIngestFile.deployId !== '' && (<div className="mb-4">
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={ingestDeployIdInfo.tagName}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Tag Name"
                                            disabled />
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={ingestDeployIdInfo.modelId}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Model Id"
                                            disabled />
                                    </div>
                                    {ingestDeployIdInfo.modelId !== '' && (<div>
                                        <div className="mb-2">
                                            <input
                                                type='text'
                                                value={modelIdInfo.modelName}
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Model Name"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                type='text'
                                                value={modelIdInfo.deviceType}
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Device Type"
                                            />
                                        </div>
                                    </div>
                                    )}
                                    <div className="mb-4">
                                        <input
                                            type='text'
                                            value={ingestDeployIdInfo.ingestId}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Ingest Id"
                                            disabled />

                                    </div>
                                    {ingestDeployIdInfo.ingestId !== '' && (<div>
                                        <div className="mb-4">
                                            <input
                                                type='text'
                                                value={IngestIdInfo.splitterType}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Splitter Type"
                                                disabled />
                                        </div>
                                        {IngestIdInfo.splitterType !== '' && IngestIdInfo.splitterType !== 'MarkdownHeaderTextSplitter' && (<div><div className="mb-4">
                                            <input
                                                value={IngestIdInfo.chunkSize}
                                                type="number"
                                                disabled
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder="Enter Chunk Size"
                                            />
                                        </div>
                                            <div className="mb-4">
                                                <input
                                                    value={IngestIdInfo.chunkOverlap}
                                                    type="number"
                                                    disabled
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    placeholder="Enter Chunk Overlap"
                                                />
                                            </div> </div>)}
                                        {IngestIdInfo.splitterType === 'MarkdownHeaderTextSplitter' && (<div className="mb-4">
                                            <div>
                                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                    {Object.entries(IngestIdInfo.header).map((element) => (
                                                        <div key={element[0]}>
                                                            <div id={`keyValueFields-${element[0]}`} style={{ display: 'flex', gap: '1rem' }}>
                                                                <div className="mb-2" style={{ flex: 1 }}>
                                                                    <input
                                                                        type="text"
                                                                        value={element[0]}
                                                                        className="mt-1 p-2 border rounded-md w-full"
                                                                        disabled
                                                                        placeholder="Key"
                                                                    />
                                                                </div>
                                                                <div className="mb-2" style={{ flex: 1 }}>
                                                                    <input
                                                                        type="text"
                                                                        value={element[1]}
                                                                        className="mt-1 p-2 border rounded-md w-full"
                                                                        disabled
                                                                        placeholder="Value"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>)}
                                    </div>
                                    )}
                                </div>
                                )}
                                <div className="mb-4" >
                                    <Input
                                        id="path"
                                        name="path"
                                        type="text"
                                        value={uploadRAGIngestFile.path}
                                        handleChange={handleChange16}
                                        isRequired={true}
                                        placeholder=' Enter Persist Directory Path'
                                    />
                                </div>
                                <div className='mb-4'>
                                    <input
                                        id='file'
                                        type="file"
                                        ref={inputRef}
                                        className={fixedInputClass}
                                        onChange={handleChange16}
                                        required
                                    />
                                </div>
                            </div>
                            <button disabled={loading} style={loading ? disable : null} className={submitButtonClass} onClick={handleFileUpload}> {text} </button>
                        </form>
                    </div>
                )}
            </div>
            {!buttonsShow && (<div>
                <button
                    onClick={handleBackButton}
                    className={buttonClass}
                    style={{ height: '40px', minWidth: '100px', marginTop: '10px' }}>
                    Back
                </button>
            </div>
            )}
        </div >
    )
}