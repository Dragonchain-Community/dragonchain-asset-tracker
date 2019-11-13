const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const result = await tracker.create_custodian(
        txnId,     
        {
            "custodian": {
                "type":"owner", 
                "external_data": {
                    "id": "2", 
                    "data": {
                        "name":"John Doe"
                    }
                }
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const custodianKey = `custodian-${txnId}`;
    
    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
              "type": "custodian,custodian_external_data",
              "custodian": {
                "id": txnId,
                "type": "owner"
              },
              "custodian_external_data": {
                "id": txnId,
                "custodianId": txnId,
                "external_data": {
                  "id": "2",
                  "data": {
                    "name": "John Doe"
                  }
                }
              }
            },
            [custodianKey]: {
              "id": txnId,
              "type": "owner",
              "current_external_data": {
                "id": "2",
                "data": {
                  "name": "John Doe"
                }
              },
              "assets": []
            }
        }
    };    
}