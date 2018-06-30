﻿exports.newStorage = function newStorage() {

    let thisObject = {
        readData: readData,
        writeData: writeData,
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

    }

    function readData(pOrg, pRepo, pPath, saveAtCache, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pRepo = " + pRepo); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pPath = " + pPath); }

            let cacheVersion;

            if (storageData !== undefined) {

                cacheVersion = storageData.get(pOrg + '.' + pRepo + '.' + pPath);
            }

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pOrg + '.' + pRepo + '.' + pPath + " found at cache."); }

                callBackFunction(cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

                let storage = require('azure-storage');
                let connectionString;

                switch (serverConfig.environment) {

                    case "Develop": {

                        connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                        break;
                    }

                    case "Production": {

                        connectionString = serverConfig.configAndPlugins.Production.connectionString;
                        break;
                    }
                }

                let blobService = storage.createBlobService(connectionString);

                blobService.getBlobToText('aaplatform', pOrg + "/" + pRepo + "/" + pPath, onFileReceived);


                function onFileReceived(err, text, response) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pOrg = " + pOrg); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pRepo = " + pRepo); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pPath = " + pPath); }

                        if (saveAtCache === true) {

                            storageData.set(pOrg + '.' + pRepo + '.' + pPath, text);

                        }
                        
                        if (err !== null || text === null) {

                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Returning an empty JSON object string. "); }

                            callBackFunction("");
                            return;

                        }

                        callBackFunction(text);

                    } catch (err) {
                        console.log("[ERROR] Storage -> readData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction("{}");
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> readData -> err.message = " + err.message);
            callBackFunction("{}");
        }
    }

    function writeData(pOrg, pRepo, pPath, pFileContent, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pRepo = " + pRepo); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pPath = " + pPath); }

            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData ->  " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

            let storage = require('azure-storage');
            let connectionString;

            switch (serverConfig.environment) {

                case "Develop": {

                    connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                    break;
                }

                case "Production": {

                    connectionString = serverConfig.configAndPlugins.Production.connectionString;
                    break;
                }
            }

            let blobService = storage.createBlobService(connectionString);
            let blobPath = pOrg + "/" + pRepo + "/" + pPath;
            let blobText = pFileContent.toString();

            blobService.createBlockBlobFromText('aaplatform', blobPath, blobText, onFileCreated);

            function onFileCreated(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] API -> writeData -> onFileCreated -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pRepo = " + pRepo); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pPath = " + pPath); }

                    if (err !== null || text === null) {

                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> Error Received from API Library. "); }
                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> Returning an empty JSON object string. "); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] API -> writeData -> onFileCreated -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] API -> writeData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
}