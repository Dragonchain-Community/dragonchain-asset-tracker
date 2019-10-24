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

            if (inCustodian.type == "authority")
            {
                // Be sure there isn't already an authority record //
                const custodians = await helper.getCustodiansByType(client, {type:"authority"})

                if (custodians.length > 0)                
                    throw "An authority record already exists for this contract instance.";                
            } 

            const custodianKey = `custodian-${inputObj.header.txn_id}`;

            callback(undefined, 
                {
                    "response": {
                        "requestTransactionId": inputObj.header.txn_id, // Won't be necessary if invoker gets indexed in a future DC release //
                        "custodian": {
                            "id": inputObj.header.txn_id,
                            "name": inCustodian.name,
                            "type": inCustodian.type
                        }
                    },
                    [custodianKey]: {
                        "id": inputObj.header.txn_id,
                        "name": inCustodian.name,
                        "type": inCustodian.type,
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
                        "requestTransactionId": inputObj.header.txn_id, 
                        "asset_group": {
                            "id": inputObj.header.txn_id,
                            "custodianId": inAssetGroup.custodianId,
                            "name": inAssetGroup.name,
                            "description": inAssetGroup.description
                        }
                    }
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
