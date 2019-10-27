'use strict'

// This should be the name used when deploying the smart contract //
const contractTxnType = "asset_tracker";

// This id should be set after deploying the contract in case certain helper methods are needed outside of the contract //
const contractId = "638260d8-75d4-41e6-ab12-6aca2d9f8322";

module.exports = {    
    getCustodiansByType: async (client, options) => {    

        try {
            const custodianTransactions = await client.queryTransactions({
                transactionType: contractTxnType,
                redisearchQuery: `@custodian_type:${options.type}`,
                limit: 999999
            });

            if (custodianTransactions.response.results)
            {
                return custodianTransactions.response.results.map(result => {return result.payload.response.custodian});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully (smart contract vs API, etc.)
            throw exception;
        }
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
        } catch (exception)
        {            
            throw exception
        }
    },

    getCurrentAssetObject: async (client, options) => {
        // If user passed a contract ID, use that, otherwise pull from the smart contract's environment variables (must be running inside a contract for that to work) //
        const contractId = typeof options.contractId !== "undefined" ? options.contractId : process.env.SMART_CONTRACT_ID;

        try {
            const assetObjectResponse = await client.getSmartContractObject({key:`asset-${options.assetId}`, smartContractId: contractId})

            const responseObj = JSON.parse(assetObjectResponse.response);
            
            if (responseObj.error)
                throw responseObj.error.details;

            return responseObj;
        } catch (exception)
        {            
            throw exception
        }
    }
}