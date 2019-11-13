const uuid = require("uuid/v4");

module.exports = async function (tracker, options) {

    const txnId = uuid();

    const result = await tracker.set_custodian_external_data(
        txnId,     
        {	
            "custodian_external_data": {
                "custodianId": options.custodian.id,
                "external_data": {
                    "id": "eid-2",
                    "data": {
                        "name": "John F. Doe",
                        "email": "john@example.com"
                    }
                }
            }
        },
        options.authenticatedCustodian
    );

    tracker.client.updateSmartContractHeap(result);

    const custodianKey = `custodian-${options.custodian.id}`;
    
    return {        
        "requestTxnId": txnId,
        "actual": result,        
        "expected": {
            "response": {
                "type":"custodian_external_data",
                "custodian_external_data": {
                    "id": txnId,
                    "custodianId": options.custodian.id,
                    "external_data": {
                        "id": "eid-2",
                        "data": {
                            "name": "John F. Doe",
                            "email": "john@example.com"
                        }
                    }
                }
            },
            [custodianKey]: {
              "id": options.custodian.id,
              "type": options.custodian.type,
              "current_external_data": {
                "id": "eid-2",
                "data": {
                  "name": "John F. Doe",
                  "email": "john@example.com"
                }
              },
              "assets": []
            }
        }
    };    
}