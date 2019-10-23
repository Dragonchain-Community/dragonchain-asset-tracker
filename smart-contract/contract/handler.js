'use strict'

module.exports = async (input, callback) => {
    const dcsdk = require("dragonchain-sdk");    

    // This is where we do stuff //
    try {
        // Create the Dragonchain client //
        const client = await dcsdk.createClient();

        // Parse the request //
        let inputObj = JSON.parse(input);

        if (inputObj.payload.method == "create_custodian")
        {
            const inCustodian = inputObj.payload.parameters.custodian;

            if (inCustodian.type == "authority")
            {
                // Be sure there isn't already an authority record //

                if (1==2)
                {
                    callback("An authority record already exists for this contract instance.", {"OUTPUT_TO_CHAIN":false})
                    return;
                }
            } 

            callback(undefined, 
                {
                    "requestTransactionId": inputObj.header.txn_id, // Won't be necessary if invoker gets indexed in a future DC release //
                    "custodian": {
                        "id": inputObj.header.txn_id,
                        "name": inCustodian.name,
                        "type": inCustodian.type
                    }
                }
            );

        } else {
            callback("Invalid method or no method specified", {"OUTPUT_TO_CHAIN":false});
        }
    } catch (exception)
    {
        callback(exception,undefined);
    }
    
}
