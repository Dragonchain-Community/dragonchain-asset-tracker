const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const assetPreAction = {...options.asset};

    const result = await tracker.add_asset_external_data_as_custodian(
        txnId,     
        {	
            "asset_external_data": {
                "assetId": options.asset.id,
                "external_data": {                    
                    "data": {
                        "newDataKey": "newDataValue"
                    }
                }
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetKey = `asset-${options.asset.id}`;
    
    assetPreAction.current_external_data.data.newDataKey = "newDataValue";

    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
                "type":"add_asset_external_data",
                "asset_external_data": {
                    "id": txnId,
                    "assetId": options.asset.id,
                    "external_data": {
                        "data": {
                            "newDataKey": "newDataValue"
                        }
                    }
                }
            },
            [assetKey]: assetPreAction
        }
    };    
}