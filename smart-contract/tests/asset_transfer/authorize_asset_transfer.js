const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const assetPreAction = {...options.asset};

    const result = await tracker.authorize_asset_transfer(
        txnId,     
        {	
            "asset_transfer_authorization": {
                "assetId": options.asset.id,
                "toCustodianId": options.toCustodianId
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetKey = `asset-${options.asset.id}`;
    
    assetPreAction.current_transfer_authorization = {
        "id": txnId,
        "assetId": options.asset.id,
        "fromCustodianId": options.authenticatedCustodian.id,
        "toCustodianId": options.toCustodianId
    }

    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
                "type":"asset_transfer_authorization",
                "asset_transfer_authorization": {
                    "id": txnId,
                    "assetId": options.asset.id,
                    "fromCustodianId": options.authenticatedCustodian.id,
                    "toCustodianId": options.toCustodianId
                }
            },
            [assetKey]: assetPreAction
        }
    };    
}