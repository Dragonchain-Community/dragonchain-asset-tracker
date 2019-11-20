const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();
    
    const result = await tracker.create_asset_group(
        txnId,     
        {
            "asset_group": {
                "name":"Unlimited Asset Group", 
                "description":"An asset group with an unlimited max supply.",
                "maxSupply": null
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetGroupKey = `asset-group-${txnId}`;
    
    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "asset_group",
              "asset_group": {
                "id": txnId,                
                "custodianId": options.authenticatedCustodian.id,
                "name":"Unlimited Asset Group",
                "description":"An asset group with an unlimited max supply.",
                "maxSupply": null
              }
            },
            [assetGroupKey]: {
              "id": txnId,
              "custodianId": options.authenticatedCustodian.id,
              "name":"Unlimited Asset Group",
              "description":"An asset group with an unlimited max supply.",
              "maxSupply": null,
              "issuedSupply": 0
            }
        }
    };    
}