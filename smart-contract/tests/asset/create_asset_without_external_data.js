const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();
    
    const assetGroupPreAction = await tracker.getCurrentAssetGroupObject({assetGroupId: options.assetGroupId});

    const custodianPreAction = {...options.authenticatedCustodian};

    const result = await tracker.create_asset(
        txnId,     
        {
            "asset": {
                "assetGroupId":options.assetGroupId
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const assetKey = `asset-${txnId}`;

    const assetGroupKey = `asset-group-${options.assetGroupId}`;

    const custodianKey = `custodian-${options.authenticatedCustodian.id}`;

    //custodianPreAction.assets.push(txnId);
    
    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "asset,asset_transfer",
              "asset": {
                  "id": txnId,
                  "custodianId": options.authenticatedCustodian.id,
                  "assetGroupId": options.assetGroupId,
                  "assetGroupSupplyRecord": {
                      "number": assetGroupPreAction.issuedSupply + 1,
                      "of": assetGroupPreAction.maxSupply
                  } 
              },
              "asset_transfer": {
                  "id": txnId,
                  "assetId": txnId,
                  "assetTransferAuthorizationId": null,
                  "fromCustodianId": null,
                  "toCustodianId": options.authenticatedCustodian.id
              }
            },
            [custodianKey]: custodianPreAction,
            [assetKey]: {
              "id": txnId,
              "custodianId": options.authenticatedCustodian.id,
              "assetGroupId": options.assetGroupId,
              "assetGroupSupplyRecord": {
                "number": assetGroupPreAction.issuedSupply + 1,
                "of": assetGroupPreAction.maxSupply
              },
              "last_transfer": {
                "id": txnId,
                "assetId": txnId,
                "assetTransferAuthorizationId": null,
                "fromCustodianId": null,
                "toCustodianId": options.authenticatedCustodian.id
              },
              "current_transfer_authorization": null,
              "current_external_data": null
            },
            [assetGroupKey]: {
              "id": assetGroupPreAction.id,
              "custodianId": options.authenticatedCustodian.id,
              "name":assetGroupPreAction.name,
              "description":assetGroupPreAction.description,
              "maxSupply": assetGroupPreAction.maxSupply,
              "issuedSupply": assetGroupPreAction.issuedSupply + 1
            }
        }
    };    
}