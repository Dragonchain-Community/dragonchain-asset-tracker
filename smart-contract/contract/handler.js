'use strict'

module.exports = async (input, callback) => {    
    const dcsdk = require("dragonchain-sdk");
    const helper = require("../common/js/asset-tracker-helper");    

    // Parse the request //
    let inputObj = JSON.parse(input);

    // This is where we do stuff //
    try {
        const client = await dcsdk.createClient();

        if (inputObj.payload.method == "create_custodian")
        {
            const inCustodian = inputObj.payload.parameters.custodian;
            const inCustodianExternalData = typeof inputObj.payload.parameters.custodian_external_data !== "undefined" ? inputObj.payload.parameters.custodian_external_data : undefined;

            if (inCustodian.type == "authority")
            {
                // Be sure there isn't already an authority record //
                const custodians = await helper.getCustodiansByType(client, {type:"authority"})

                if (custodians.length > 0)                
                    throw "An authority record already exists for this contract instance.";                
            } 

            const responseObj = {
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
                    "externalData": inCustodianExternalData.externalData
                }
            }

            const custodianKey = `custodian-${inputObj.header.txn_id}`;

            callback(undefined, 
                {
                    "response": responseObj,
                    [custodianKey]: {
                        "id": inputObj.header.txn_id,                        
                        "type": inCustodian.type,
                        "custodianExternalData": typeof responseObj.custodian_external_data !== "undefined" ? responseObj.custodian_external_data : null,
                        "assets": []
                    }
                }
            );
        
        } else if (inputObj.payload.method == "create_asset_group")
        {
            const inAssetGroup = inputObj.payload.parameters.asset_group;

            // Check that custodian is the authority //
            const custodian = await helper.getCurrentCustodianObject(client, {custodianId: inAssetGroup.custodianId});

            if (custodian.type != "authority")
                throw "Only the authority custodian may create asset groups.";

            callback(undefined, 
                {
                    "response": {
                        "asset_group": {
                            "id": inputObj.header.txn_id,
                            "custodianId": inAssetGroup.custodianId,
                            "name": inAssetGroup.name,
                            "description": inAssetGroup.description
                        }
                    }
                }
            );

        } else if (inputObj.payload.method == "create_asset")
        {
            const inAsset = inputObj.payload.parameters.asset;
            const inAssetExternalData = typeof inputObj.payload.parameters.asset_external_data !== "undefined" ? inputObj.payload.parameters.asset_external_data : undefined;
            const inAssetTransferAuthorization = typeof inputObj.payload.parameters.asset_transfer_authorization !== "undefined" ? inputObj.payload.parameters.asset_transfer_authorization : undefined;

            // Check that custodian is the authority //
            let custodian = await helper.getCurrentCustodianObject(client, {custodianId: inAsset.custodianId});

            if (custodian.type != "authority")
                throw "Only the authority custodian may create asset groups.";

            const responseObj = {                
                "asset": {
                    "id": inputObj.header.txn_id,
                    "custodianId": custodian.id,
                    "assetGroupId": typeof inAsset.assetGroupId !== "undefined" ? inAsset.assetGroupId : null
                },
                "asset_transfer": {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "assetTransferAuthorizationId": null,
                    "fromCustodianId": null,
                    "toCustodianId": custodian.id
                }
            }

            if (inAssetExternalData)
            {
                responseObj.asset_external_data = {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "externalId": inAssetExternalData.externalId,
                    "externalData": inAssetExternalData.externalData
                }
            }

            if (inAssetTransferAuthorization)
            {
                responseObj.asset_transfer_authorization = {
                    "id": inputObj.header.txn_id,
                    "assetId": inputObj.header.txn_id,
                    "fromCustodianId": custodian.id,
                    "toCustodianId": inAssetTransferAuthorization.toCustodianId
                }
            }

            // Update the custodian object to be written to heap //
            const custodianKey = `custodian-${custodian.id}`;

            custodian.assets.push(responseObj.asset.id);

            // Create the asset object to be written to heap //
            const assetKey = `asset-${inputObj.header.txn_id}`;

            const asset = {
                "id": responseObj.asset.id,
                "custodianId": responseObj.asset.custodianId,
                "assetGroupId": responseObj.asset.assetGroupId
            }

            asset.lastTransfer = responseObj.asset_transfer;

            asset.currentTransferAuthorization = typeof responseObj.asset_transfer_authorization !== "undefined" ? responseObj.asset_transfer_authorization : null;

            asset.assetExternalData = typeof responseObj.asset_external_data !== "undefined" ? responseObj.asset_external_data : null;

            // All done - run callback with response and latest custodian and asset object versions //
            callback(undefined, 
                {
                    "response": responseObj,
                    [custodianKey]: custodian,
                    [assetKey]: asset
                }
            );

        } else {
            callback("Invalid method or no method specified", {"OUTPUT_TO_CHAIN":false});
        }
    } catch (exception)
    {
        callback(exception,
            {
                "error": {
                    "requestTransactionId": inputObj.header.txn_id, 
                    "exception": exception
                }
            }
        );
    }
    
}
