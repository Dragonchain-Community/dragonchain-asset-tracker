'use strict'

const dcsdk = require("dragonchain-sdk");

const config = require('./config');

const helper = {        
    getCustodiansByType: async (client, options) => {    
        try {
            const custodianTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@custodian_type:${options.type}`,
                limit: 999999
            });

            if (custodianTransactions.response.results)
            {
                return custodianTransactions.response.results.map(result => {return result.payload.response.custodian});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully (smart contract vs API, etc.)
            throw exception;
        }
    },

    getCurrentCustodianObject: async (client, options) => {       
        try {
            const custodianObjectResponse = await client.getSmartContractObject({key:`custodian-${options.custodianId}`})

            const responseObj = JSON.parse(custodianObjectResponse.response);
            
            if (responseObj.error)
                throw responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCurrentAssetObject: async (client, options) => {
        // If user passed a contract ID, use that, otherwise pull from the smart contract's environment variables (must be running inside a contract for that to work) //
        const contractId = typeof options.contractId !== "undefined" ? options.contractId : process.env.SMART_CONTRACT_ID;

        try {
            const assetObjectResponse = await client.getSmartContractObject({key:`asset-${options.assetId}`})

            const responseObj = JSON.parse(assetObjectResponse.response);
            
            if (responseObj.error)
                throw responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    }
}

module.exports = async (input, callback) => {    
    // Parse the request //
    let inputObj = JSON.parse(input);

    // This is where we do stuff //
    try {
        const client = await dcsdk.createClient();

        if (inputObj.payload.method == "create_custodian")
        {
            const inCustodian = inputObj.payload.parameters.custodian;
            const inCustodianExternalData = typeof inputObj.payload.parameters.custodian.external_data !== "undefined" ? inputObj.payload.parameters.custodian.external_data : undefined;
            const inAuthentication = inputObj.payload.authentication;

            // Authenticated custodian is only optional when creating the single authority custodian for the contract //
            const authenticatedCustodian = typeof inputObj.payload.authentication !== "undefined" ? await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId}) : null;

            if (inCustodian.type == "authority" && authenticatedCustodian == null)
            {
                // Be sure there isn't already an authority record //
                const custodians = await helper.getCustodiansByType(client, {type:"authority"})

                if (custodians.length > 0)                
                    throw "An authority record already exists for this contract instance.";                
            } else {
                if (authenticatedCustodian.type != "authority")
                    throw "Only the authority custodian may create additional custodians.";
            }

            let responseObj = {
                "custodian": {
                    "id": inputObj.header.txn_id,                    
                    "type": inCustodian.type
                }
            }

            if (inCustodianExternalData)
            {
                responseObj.custodian_external_data = {
                    "id": inputObj.header.txn_id,
                    "custodianId": inputObj.header.txn_id,                    
                    "external_data": inCustodianExternalData
                }
            }

            const custodianKey = `custodian-${inputObj.header.txn_id}`;

            callback(undefined, 
                {
                    "response": responseObj,
                    [custodianKey]: {
                        "id": inputObj.header.txn_id,                        
                        "type": inCustodian.type,
                        "current_external_data": typeof responseObj.custodian_external_data.external_data !== "undefined" ? responseObj.custodian_external_data.external_data : null,
                        "assets": []
                    }
                }
            );
        
        } else if (inputObj.payload.method == "create_asset_group")
        {
            const inAssetGroup = inputObj.payload.parameters.asset_group;
            
            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});

            if (authenticatedCustodian.type != "authority")
                throw "Only the authority custodian may create asset groups.";

            callback(undefined, 
                {
                    "response": {
                        "asset_group": {
                            "id": inputObj.header.txn_id,
                            "custodianId": authenticatedCustodian.id,
                            "name": inAssetGroup.name,
                            "description": inAssetGroup.description
                        }
                    }
                }
            );

        } else if (inputObj.payload.method == "create_asset")
        {
            const inAsset = inputObj.payload.parameters.asset;
            const inAssetExternalData = typeof inputObj.payload.parameters.asset.external_data !== "undefined" ? inputObj.payload.parameters.asset.external_data : undefined;
            const inAssetTransferAuthorization = typeof inputObj.payload.parameters.asset_transfer_authorization !== "undefined" ? inputObj.payload.parameters.asset_transfer_authorization : undefined;

            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});
            
            if (authenticatedCustodian.type != "authority")
                throw "Only the authority custodian may create assets.";

            let responseObj = {                
                "asset": {
                    "id": inputObj.header.txn_id,
                    "custodianId": authenticatedCustodian.id,
                    "assetGroupId": typeof inAsset.assetGroupId !== "undefined" ? inAsset.assetGroupId : null
                },
                "asset_transfer": {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "assetTransferAuthorizationId": null,
                    "fromCustodianId": null,
                    "toCustodianId": authenticatedCustodian.id
                }
            }

            if (inAssetExternalData)
            {
                responseObj.asset_external_data = {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "external_data": inAssetExternalData
                }
            }

            if (inAssetTransferAuthorization)
            {
                responseObj.asset_transfer_authorization = {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "fromCustodianId": authenticatedCustodian.id,
                    "toCustodianId": inAssetTransferAuthorization.toCustodianId
                }
            }

            // Update the custodian object to be written to heap //
            const custodianKey = `custodian-${authenticatedCustodian.id}`;

            authenticatedCustodian.assets.push(responseObj.asset.id);

            // Create the asset object to be written to heap //
            const assetKey = `asset-${inputObj.header.txn_id}`;

            let asset = {
                "id": responseObj.asset.id,
                "custodianId": responseObj.asset.custodianId,
                "assetGroupId": responseObj.asset.assetGroupId
            }

            asset.last_transfer = responseObj.asset_transfer;

            asset.current_transfer_authorization = typeof responseObj.asset_transfer_authorization !== "undefined" ? responseObj.asset_transfer_authorization : null;

            asset.current_external_data = typeof responseObj.asset_external_data !== "undefined" ? responseObj.asset_external_data.external_data : null;

            // All done - run callback with response and latest custodian and asset object versions //
            callback(undefined, 
                {
                    "response": responseObj,
                    [custodianKey]: authenticatedCustodian,
                    [assetKey]: asset
                }
            );

        } else if (inputObj.payload.method == "set_asset_external_data")
        {
            const inAssetExternalData = inputObj.payload.parameters.asset_external_data;

            let asset = await helper.getCurrentAssetObject(client, {assetId: inAssetExternalData.assetId});

            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});

            // Only the owner of the asset may adjust its external data //
            if (authenticatedCustodian.id != asset.custodianId)
                throw "Only an asset's creator may set its external data.";

            let responseObj = {
                "asset_external_data": {
                    "id": inputObj.header.txn_id,
                    "assetId": asset.id,
                    "external_data": inAssetExternalData.external_data
                }
            };

            asset.current_external_data = responseObj.asset_external_data.external_data;

            const assetKey = `asset-${asset.id}`;

            callback(undefined, 
                {
                    "response": responseObj,
                    [assetKey]: asset
                }
            );      

        } else if (inputObj.payload.method == "set_custodian_external_data")
        {
            const inCustodianExternalData = inputObj.payload.parameters.custodian_external_data;

            let custodian = await helper.getCurrentCustodianObject(client, {custodianId: inCustodianExternalData.custodianId});

            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});

            // Only the owner of the custodian may adjust its external data //
            if (authenticatedCustodian.id != custodian.Id && authenticatedCustodian.type != "authority")
                throw "Only the authority or the custodian may set its external data.";

            let responseObj = {
                "custodian_external_data": {
                    "id": inputObj.header.txn_id,
                    "custodianId": custodian.id,
                    "external_data": inCustodianExternalData.external_data
                }
            };

            custodian.current_external_data = responseObj.custodian_external_data.external_data;

            const custodianKey = `custodian-${custodian.id}`;

            callback(undefined, 
                {
                    "response": responseObj,
                    [custodianKey]: custodian
                }
            );            
        } else if (inputObj.payload.method == "authorize_asset_transfer")
        {            
            const inAssetTransferAuthorization = inputObj.payload.parameters.asset_transfer_authorization;

            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});
            
            let asset = await helper.getCurrentAssetObject(client, {assetId: inAssetTransferAuthorization.assetId});

            // The from custodian can only be the current holder of the asset //
            let fromCustodian = await helper.getCurrentCustodianObject(client, {custodianId: asset.last_transfer.toCustodianId});

            let toCustodian = typeof inAssetTransferAuthorization.toCustodianId !== "undefined" ? await helper.getCurrentCustodianObject(client, {custodianId: inAssetTransferAuthorization.toCustodianId}) : undefined;
            
            if (authenticatedCustodian.id != fromCustodian.id)
                throw "Only the current custodian of an asset may authorize its transfer.";

            if (asset.currentTransferAuthorization != null)
                throw "Only one asset transfer authorization may be active at a time.";

            let responseObj = {
                "asset_transfer_authorization": {
                    "id": inputObj.header.txn_id,
                    "assetId": asset.id,
                    "fromCustodianId": fromCustodian.id,
                    "toCustodianId": typeof toCustodian !== "undefined" ? toCustodian.id : null
                }
            };

            asset.current_transfer_authorization = responseObj.asset_transfer_authorization;

            const assetKey = `asset-${asset.id}`;

            callback(undefined, 
                {
                    "response": responseObj,
                    [assetKey]: asset
                }
            );            
        } else if (inputObj.payload.method == "accept_asset_transfer")
        {            
            const inAssetTransfer = inputObj.payload.parameters.asset_transfer;

            const inAuthentication = inputObj.payload.authentication;

            const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: inAuthentication.custodianId});

            let asset = await helper.getCurrentAssetObject(client, {assetId: inAssetTransfer.assetId});            
            let toCustodian = await helper.getCurrentCustodianObject(client, {custodianId: authenticatedCustodian.id});

            if (asset.current_transfer_authorization == null)
                throw "That asset is not authorized for transfer. Please contact the asset's current custodian.";

            if (asset.current_transfer_authorization.toCustodianId != null && asset.current_transfer_authorization.toCustodianId != toCustodian.id)
                throw "The specified custodian is not authorized to accept transfer of that asset.";

            let fromCustodian = await helper.getCurrentCustodianObject(client, {custodianId: asset.current_transfer_authorization.fromCustodianId});

            let responseObj = {
                "asset_transfer": {
                    "id": inputObj.header.txn_id,
                    "assetId": asset.id,
                    "fromCustodianId": fromCustodian.id,
                    "toCustodianId": toCustodian.id
                }
            };

            // Update the asset //
            const assetKey = `asset-${asset.id}`;

            asset.last_transfer = responseObj.asset_transfer;
            asset.current_transfer_authorization = null;            

            // Update both custodians' asset lists //
            const fromCustodianKey = `custodian-${fromCustodian.id}`;
            const toCustodianKey = `custodian-${toCustodian.id}`;

            fromCustodian.assets = fromCustodian.assets.filter(function(value, index, arr){
                return value != asset.id;            
            });

            toCustodian.assets.push(asset.id);

            callback(undefined, 
                {
                    "response": responseObj,
                    [assetKey]: asset,
                    [fromCustodianKey]: fromCustodian,
                    [toCustodianKey]: toCustodian
                }
            );            

        } else {
            callback("Invalid method or no method specified", {                 
                "exception": "Invalid method or no method specified"                
            });
        }
    } catch (exception)
    {
        callback(exception,
            {                 
                "exception": exception                
            }
        );
    }
    
}
