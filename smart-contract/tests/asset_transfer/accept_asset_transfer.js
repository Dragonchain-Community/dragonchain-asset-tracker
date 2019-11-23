const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const assetPreAction = {...options.asset};

    const fromCustodian = await tracker.getCurrentCustodianObject({custodianId: options.asset.current_transfer_authorization.fromCustodianId});

    const result = await tracker.accept_asset_transfer(
        txnId,     
        {	
            "asset_transfer": {
                "assetId": options.asset.id
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetKey = `asset-${options.asset.id}`;
    const fromCustodianKey = `custodian-${fromCustodian.id}`;
    const toCustodianKey = `custodian-${options.authenticatedCustodian.id}`;

    assetPreAction.last_transfer = {
        "id": txnId,
        "assetId": options.asset.id,
        "fromCustodianId": fromCustodian.id,
        "toCustodianId": options.authenticatedCustodian.id
    }

    assetPreAction.current_transfer_authorization = null;

    fromCustodian.assets = fromCustodian.assets.filter(function(value, index, arr){
        return value != options.asset.id;            
    });

    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
                "type":"asset_transfer",
                "asset_transfer": {
                    "id": txnId,
                    "assetId": options.asset.id,
                    "fromCustodianId": fromCustodian.id,
                    "toCustodianId": options.authenticatedCustodian.id
                }
            },
            [assetKey]: assetPreAction,
            [fromCustodianKey]: fromCustodian,
            [toCustodianKey]: options.authenticatedCustodian
        }
    };    
}