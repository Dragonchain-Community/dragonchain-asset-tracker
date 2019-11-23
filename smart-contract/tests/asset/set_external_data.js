const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const assetPreAction = {...options.asset};

    const result = await tracker.set_asset_external_data(
        txnId,     
        {	
            "asset_external_data": {
                "assetId": options.asset.id,
                "external_data": {
                    "id": "editedExternalId",
                    "data": {
                        "name": "Edited Asset Name",
                        "description": "Edited Asset Description"
                    }
                }
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetKey = `asset-${options.asset.id}`;
    
    assetPreAction.current_external_data = {
        "id": "editedExternalId",
        "data": {
            "name": "Edited Asset Name",
            "description": "Edited Asset Description"
        }
    }

    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
                "type":"asset_external_data",
                "asset_external_data": {
                    "id": txnId,
                    "assetId": options.asset.id,
                    "external_data": {
                        "id": "editedExternalId",
                        "data": {
                            "name": "Edited Asset Name",
                            "description": "Edited Asset Description"
                        }
                    }
                }
            },
            [assetKey]: assetPreAction
        }
    };    
}