'use strict'

module.exports = {
    // Dragonchain SDK client instance //
    client: null,

    // +++++ Main Contract Methods +++++ //
    // Style note: snake_case was chosen for contract methods and parameters (in the payload) because not all contracts will be written in Javascript. //
    // Also: I'd already written everything that way when I started thinking about naming conventions.... //
    create_custodian: async function (requestTxnId, parameters, authenticatedCustodian) {        
        const inCustodian = parameters.custodian;
        const inCustodianExternalData = typeof parameters.custodian.external_data !== "undefined" ? parameters.custodian.external_data : undefined;
        
        if (inCustodian.type == "authority")
        {
            // Be sure there isn't already an authority record //
            let authority = null;

            try {                
                authority = await this.getAuthorityCustodianID();
            } catch (e) {}

            if (authority != null)                
                throw "An authority record already exists for this contract instance.";               
        
        } else if (authenticatedCustodian == null)
        {
            throw "The authenticated authority custodian must be provided.";
        } else {
            if (authenticatedCustodian.type != "authority")
                throw "Only the authority custodian may create additional custodians.";
        }

        let responseObj = {
            "type": "custodian",                
            "custodian": {
                "id": requestTxnId,                    
                "type": inCustodian.type
            }
        }

        if (inCustodianExternalData)
        {
            responseObj.type += ",custodian_external_data";
            responseObj.custodian_external_data = {
                "id": requestTxnId,
                "custodianId": requestTxnId,                    
                "external_data": inCustodianExternalData
            }
        }

        const custodianKey = `custodian-${requestTxnId}`;

        const custodian = {
            "id": requestTxnId,                        
            "type": inCustodian.type,
            "current_external_data": typeof responseObj.custodian_external_data !== "undefined" ? responseObj.custodian_external_data.external_data : null,
            "assets": []
        }

        let finalResponse = {
            "response": responseObj,
            [custodianKey]: custodian
        };

        if (responseObj.custodian.type == "authority")
            finalResponse["authority-custodian-id"] = responseObj.custodian.id;

        return finalResponse;
    },

    set_custodian_external_data: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inCustodianExternalData = parameters.custodian_external_data;

        let custodian = await this.getCurrentCustodianObject({custodianId: inCustodianExternalData.custodianId});

        // Only the owner of the custodian may adjust its external data //
        if (authenticatedCustodian.id != custodian.Id && authenticatedCustodian.type != "authority")
            throw "Only the authority or the custodian may set its external data.";

        let responseObj = {
            "type":"custodian_external_data",
            "custodian_external_data": {
                "id": requestTxnId,
                "custodianId": custodian.id,
                "external_data": inCustodianExternalData.external_data
            }
        };

        custodian.current_external_data = responseObj.custodian_external_data.external_data;

        const custodianKey = `custodian-${custodian.id}`;

        return {
                "response": responseObj,
                [custodianKey]: custodian
            };
    },

    create_asset_group: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inAssetGroup = parameters.asset_group;            
        
        if (authenticatedCustodian.type != "authority")
            throw "Only the authority custodian may create asset groups.";

        if (typeof inAssetGroup.maxSupply !== "undefined" && inAssetGroup.maxSupply != null && !Number.isInteger(parseInt(inAssetGroup.maxSupply)))
            throw "Asset group max supply must be null to indicate an unlimited supply or an integer.";

        let responseObj = {
            "type": "asset_group",
            "asset_group": {
                "id": requestTxnId,
                "custodianId": authenticatedCustodian.id,
                "name": inAssetGroup.name,
                "description": inAssetGroup.description,
                "maxSupply": typeof inAssetGroup.maxSupply !== "undefined" ? inAssetGroup.maxSupply : null
            }
        }

        // Create the asset object to be written to heap //
        const assetGroupKey = `asset-group-${requestTxnId}`;

        let assetGroup = {
            "id": responseObj.asset_group.id,
            "custodianId": responseObj.asset_group.custodianId,
            "name": responseObj.asset_group.name,
            "description": responseObj.asset_group.description,
            "maxSupply": responseObj.asset_group.maxSupply,
            "issuedSupply": 0
        }
            
        return {
                "response": responseObj,
                [assetGroupKey]: assetGroup
            };
    },

    create_asset: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inAsset = parameters.asset;
        const inAssetExternalData = typeof parameters.asset.external_data !== "undefined" ? parameters.asset.external_data : undefined;
        const inAssetTransferAuthorization = typeof parameters.asset_transfer_authorization !== "undefined" ? parameters.asset_transfer_authorization : undefined;

        if (authenticatedCustodian.type != "authority")
            throw "Only the authority custodian may create assets.";

        if (typeof inAsset.assetGroupId === "undefined")
            throw "Asset group must be specified.";

        const assetGroupObject = await this.getCurrentAssetGroupObject({assetGroupId: inAsset.assetGroupId});

        // Ensure we aren't violating max supply //
        if (assetGroupObject.issuedSupply + 1 > assetGroupObject.maxSupply)
            throw `Max supply has been reached for asset group ${assetGroupObject.name}.`;

        let responseObj = {         
            "type": "asset,asset_transfer",       
            "asset": {
                "id": requestTxnId,
                "custodianId": authenticatedCustodian.id,
                "assetGroupId": inAsset.assetGroupId,
                "assetGroupSupplyRecord": {
                    "number": assetGroupObject.issuedSupply + 1,
                    "of": assetGroupObject.maxSupply
                } 
            },
            "asset_transfer": {
                "id": requestTxnId,
                "assetId": requestTxnId,
                "assetTransferAuthorizationId": null,
                "fromCustodianId": null,
                "toCustodianId": authenticatedCustodian.id
            }
        }

        if (inAssetExternalData)
        {
            responseObj.type += ",asset_external_data";
            responseObj.asset_external_data = {
                "id": requestTxnId,
                "assetId": requestTxnId,
                "external_data": inAssetExternalData
            }
        }

        if (inAssetTransferAuthorization)
        {
            responseObj.type += ",asset_transfer_authorization";
            responseObj.asset_transfer_authorization = {
                "id": requestTxnId,
                "assetId": requestTxnId,
                "fromCustodianId": authenticatedCustodian.id,
                "toCustodianId": inAssetTransferAuthorization.toCustodianId
            }
        }

        // Update the custodian object to be written to heap //
        const custodianKey = `custodian-${authenticatedCustodian.id}`;

        authenticatedCustodian.assets.push(responseObj.asset.id);

        // Update the asset group object to be written to heap //
        const assetGroupKey = `asset-group-${assetGroupObject.id}`;

        // Let a programmer have SOME fun //
        assetGroupObject.issuedSupply -= -1;

        // Create the asset object to be written to heap //
        const assetKey = `asset-${requestTxnId}`;

        let asset = {
            "id": responseObj.asset.id,
            "custodianId": responseObj.asset.custodianId,
            "assetGroupId": responseObj.asset.assetGroupId,
            "assetGroupSupplyRecord": {
                "number": responseObj.asset.assetGroupSupplyRecord.number,
                "of": responseObj.asset.assetGroupSupplyRecord.of
            }
        }

        asset.last_transfer = responseObj.asset_transfer;

        asset.current_transfer_authorization = typeof responseObj.asset_transfer_authorization !== "undefined" ? responseObj.asset_transfer_authorization : null;

        asset.current_external_data = typeof responseObj.asset_external_data !== "undefined" ? responseObj.asset_external_data.external_data : null;

        return {
                "response": responseObj,
                [custodianKey]: authenticatedCustodian,
                [assetGroupKey]: assetGroupObject,
                [assetKey]: asset
            };
    },

    set_asset_external_data: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inAssetExternalData = parameters.asset_external_data;

        let asset = await this.getCurrentAssetObject({assetId: inAssetExternalData.assetId});

        // Only the creator may adjust its external data (written this way to support multiple authority custodian's in the future //
        if (authenticatedCustodian.id != asset.custodianId )
            throw "Only an asset's creator may set its external data with this method.";

        let responseObj = {
            "type":"asset_external_data",
            "asset_external_data": {
                "id": requestTxnId,
                "assetId": asset.id,
                "external_data": inAssetExternalData.external_data
            }
        };

        asset.current_external_data = responseObj.asset_external_data.external_data;

        const assetKey = `asset-${asset.id}`;

        return {
                "response": responseObj,
                [assetKey]: asset
            };      
    },

    add_asset_external_data_as_custodian: async function (requestTxnId, parameters, authenticatedCustodian) {
        // Note: This is a special add-only method to allow the current custodian of an object to add an external data 
        // key/value pair if the key doesn't already exist. //
        const inAssetExternalData = parameters.asset_external_data;

        let asset = await this.getCurrentAssetObject({assetId: inAssetExternalData.assetId});

        // Only the current custodian of the asset may adjust its external data //
        if (authenticatedCustodian.id != asset.last_transfer.toCustodianId )
            throw "Only an asset's current custodian may add to its external data with this method.";

        let responseObj = {
            "type":"add_asset_external_data",
            "asset_external_data": {
                "id": requestTxnId,
                "assetId": asset.id,
                "external_data": inAssetExternalData.external_data
            }
        };

        // Initialize if necessary //
        if (typeof asset.current_external_data.data === "undefined")
            asset.current_external_data.data = {};

        // Get rid of request data that the user is NOT allowed to change		
        delete inAssetExternalData.external_data.data.name;
        delete inAssetExternalData.external_data.data.description;

        // Add keys that remain on the original object //
        const keys = Object.keys(inAssetExternalData.external_data.data);
        for (let i=0; i<keys.length; i++)
        {
            if (typeof asset.current_external_data.data[keys[i]] === "undefined")
                asset.current_external_data.data[keys[i]] = inAssetExternalData.external_data.data[keys[i]];
        }

        const assetKey = `asset-${asset.id}`;

        return {
                "response": responseObj,
                [assetKey]: asset
            };
    },

    authorize_asset_transfer: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inAssetTransferAuthorization = parameters.asset_transfer_authorization;
        
        let asset = await this.getCurrentAssetObject({assetId: inAssetTransferAuthorization.assetId});

        // The from custodian can only be the current holder of the asset //
        let fromCustodian = await this.getCurrentCustodianObject({custodianId: asset.last_transfer.toCustodianId});

        let toCustodian = typeof inAssetTransferAuthorization.toCustodianId !== "undefined" ? await this.getCurrentCustodianObject({custodianId: inAssetTransferAuthorization.toCustodianId}) : undefined;
        
        if (authenticatedCustodian.id != fromCustodian.id)
            throw "Only the current custodian of an asset may authorize its transfer.";

        if (asset.current_transfer_authorization != null)
            throw "Only one asset transfer authorization may be active at a time.";

        let responseObj = {
            "type":"asset_transfer_authorization",
            "asset_transfer_authorization": {
                "id": requestTxnId,
                "assetId": asset.id,
                "fromCustodianId": fromCustodian.id,
                "toCustodianId": typeof toCustodian !== "undefined" ? toCustodian.id : null
            }
        };

        asset.current_transfer_authorization = responseObj.asset_transfer_authorization;

        const assetKey = `asset-${asset.id}`;

        return {
                "response": responseObj,
                [assetKey]: asset
            };            
    },

    accept_asset_transfer: async function (requestTxnId, parameters, authenticatedCustodian) {
        const inAssetTransfer = parameters.asset_transfer;

        let asset = await this.getCurrentAssetObject({assetId: inAssetTransfer.assetId});                    

        if (asset.current_transfer_authorization == null)
            throw "That asset is not authorized for transfer. Please contact the asset's current custodian.";

        if (asset.current_transfer_authorization.toCustodianId != null && asset.current_transfer_authorization.toCustodianId != authenticatedCustodian.id)
            throw "The specified custodian is not authorized to accept transfer of that asset.";

        let fromCustodian = await this.getCurrentCustodianObject({custodianId: asset.current_transfer_authorization.fromCustodianId});

        let responseObj = {
            "type":"asset_transfer",
            "asset_transfer": {
                "id": requestTxnId,
                "assetId": asset.id,
                "fromCustodianId": fromCustodian.id,
                "toCustodianId": authenticatedCustodian.id
            }
        };

        // Update the asset //
        const assetKey = `asset-${asset.id}`;

        asset.last_transfer = responseObj.asset_transfer;
        asset.current_transfer_authorization = null;            

        // Update both custodians' asset lists //
        const fromCustodianKey = `custodian-${fromCustodian.id}`;
        const toCustodianKey = `custodian-${authenticatedCustodian.id}`;

        fromCustodian.assets = fromCustodian.assets.filter(function(value, index, arr){
            return value != asset.id;            
        });

        authenticatedCustodian.assets.push(asset.id);

        return {
                "response": responseObj,
                [assetKey]: asset,
                [fromCustodianKey]: fromCustodian,
                [toCustodianKey]: authenticatedCustodian
            };
    },

    // +++++ Helper Methods +++++ //
    getAuthorityCustodianID: async function () {
        try {
            const custodianObjectResponse = await this.client.getSmartContractObject({key:`authority-custodian-id`})

            const responseObj = JSON.parse(custodianObjectResponse.response);
            
            if (responseObj.error)
                throw "Authority Custodian Not Found: " + responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCurrentCustodianObject: async function (options) {       
        try {
            const custodianObjectResponse = await this.client.getSmartContractObject({key:`custodian-${options.custodianId}`})

            const responseObj = JSON.parse(custodianObjectResponse.response);
            
            if (responseObj.error)
                throw "Custodian Not Found: " + responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCurrentAssetGroupObject: async function (options) {   
        try {
            const assetGroupObjectResponse = await this.client.getSmartContractObject({key:`asset-group-${options.assetGroupId}`})

            const responseObj = JSON.parse(assetGroupObjectResponse.response);
            
            if (responseObj.error)
                throw "Asset Group Not Found: " + responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCurrentAssetObject: async function (options) {   
        try {
            const assetObjectResponse = await this.client.getSmartContractObject({key:`asset-${options.assetId}`})

            const responseObj = JSON.parse(assetObjectResponse.response);
            
            if (responseObj.error)
                throw "Asset Not Found: " + responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    }
}