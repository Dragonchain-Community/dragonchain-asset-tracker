'use strict'

const dcsdk = require("dragonchain-sdk");
const tracker = require("./asset-tracker");

const log = (string) => console.error(`STDERR: ${string}`);

module.exports = async input => {    
    // Parse the request //
    let inputObj = JSON.parse(input);

    // This is where we do stuff //
    try {
        tracker.client = await dcsdk.createClient();

        const authenticatedCustodian = typeof inputObj.payload.authentication !== "undefined" ? await tracker.getCurrentCustodianObject({custodianId: inputObj.payload.authentication.custodianId}) : null;

        const output = await Reflect.apply(
            tracker[inputObj.payload.method], 
            tracker, 
            [
                inputObj.header.txn_id, 
                inputObj.payload.parameters, 
                authenticatedCustodian
            ]
        );

        return output;
        
    } catch (exception)    
    {
        // Write the exception to STDERR
        log(exception);

        // Could instead return nothing for a blank response transaction //
        // or the special {"OUTPUT_TO_CHAIN":false} object to prevent a response transaction altogether //
        return {"exception": exception};
    
    }
    
}
