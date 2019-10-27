const util = require('util');
const dcsdk = require('dragonchain-sdk');
const config = require('./config');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const initialize = async () => {
    const client = await dcsdk.createClient();

    let authority = null;

    // Check for an authority //
    const results = await client.queryTransactions({
        transactionType: config.contractTxnType,
        redisearchQuery: `@custodian_type:authority`
    })

    if (results.response.total == 0)
    {
        console.log("Creating authority...");

        // Create an authority //
        const requestTxn = await client.createTransaction({
            transactionType: config.contractTxnType,
            payload: {
                "method": "create_custodian",
                "parameters": {
                    "custodian": {
                        "type": "authority"
                    }
                }
            }        
        })

        await sleep(2000);

        const responseResults = await client.queryTransactions({
            transactionType: config.contractTxnType,
            redisearchQuery: `@custodian_type:authority`
        })

        authority = responseResults.response.results[0];
    } else {        
        authority = results.response.results[0];
    }

    // Display the authority custodian object //
    console.log(util.inspect(authority.payload.response, false, null, true));
}

initialize().then(() => {console.log("Done.")});

