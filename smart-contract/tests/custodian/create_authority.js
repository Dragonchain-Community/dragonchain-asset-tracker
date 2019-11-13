const uuid = require("uuid/v4");

module.exports = async function (tracker) {

    const txnId = uuid();
    
    const result = await tracker.create_custodian(
        txnId,     
        {
            "custodian": {
                "type":"authority", 
                "external_data": {
                    "id": "1", 
                    "data": {
                        "name":"Nike",
                        "description":"Nike Shoe Company"
                    }
                }
            }
        },
        null
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
                "type": "authority"
              },
              "custodian_external_data": {
                "id": txnId,
                "custodianId": txnId,
                "external_data": {
                  "id": "1",
                  "data": {
                    "name": "Nike",
                    "description": "Nike Shoe Company"
                  }
                }
              }
            },
            [custodianKey]: {
              "id": txnId,
              "type": "authority",
              "current_external_data": {
                "id": "1",
                "data": {
                  "name": "Nike",
                  "description": "Nike Shoe Company"
                }
              },
              "assets": []
            },
            "authority-custodian-id": txnId
        }
    };    
}