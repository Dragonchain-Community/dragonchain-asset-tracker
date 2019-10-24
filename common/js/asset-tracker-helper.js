'use strict'

// This should be whatever name you intend to use when deploying your smart contract //
const contractTxnType = "asset_tracker";

module.exports = {    
    getCustodiansByType: async (client, options) => {    
        const custodianTransactions = await client.queryTransactions({
            transactionType: contractTxnType,
            redisearchQuery: `@custodians_type:${options.type}`,
            limit: 999999
        });

        if (custodianTransactions.response.results)
        {
            return custodianTransactions.response.results.map(result => {return result.payload.response.custodian});
        } else 
            return [];
    },

    getCurrentCustodianObject: async (client, options) => {
        // If user passed a contract ID, use that, otherwise pull from the smart contract's environment variables (must be running inside a contract for that to work) //
        const contractId = typeof options.contractId !== "undefined" ? options.contractId : process.env.SMART_CONTRACT_ID;

        try {
            const custodianObjectResponse = await client.getSmartContractObject({key:`custodian-${options.custodianId}`, smartContractId: contractId})

            const responseObj = JSON.parse(custodianObjectResponse.response);
            
            if (responseObj.error)
                throw responseObj.error.details;

            return responseObj;
        } catch (Exception)
        {
            // Pass back to caller to handle gracefully (smart contract vs API, etc.)
            throw Exception
        }

        
    }
}