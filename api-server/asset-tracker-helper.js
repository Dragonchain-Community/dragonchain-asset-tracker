'use strict'

const util = require('util');

const config = require('./config');

// Fancy utility function //
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// General helper for interacting with our Dragonchain node using the SDK client //
const helper = {          
    waitForResponseTxn: async (client, requestTxnId) => {
        try {        
            let responseTxn = null;
            let waitCount = 0;

            while (responseTxn == null && waitCount < 10)
            {
                const results = await client.queryTransactions({
                    transactionType: config.contractTxnType,
                    redisearchQuery: `@invoker:${requestTxnId}`
                });

                if (results.response.total > 0)
                    responseTxn = results.response.results[0];

                waitCount++

                await helper.sleep(500);
            }

            if (responseTxn != null)
                return responseTxn;
            else
                throw "Response transaction not found.";
        } catch (exception)
        {
            // Pass back to caller to handle gracefully
            throw exception;
        }
    },    
    getCustodians: async (client) => {    
        try {
            const custodianTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@custodian_type:(authority|handler|owner)`,
                limit: 999999
            });

            if (custodianTransactions.response.results)
            {
                return custodianTransactions.response.results.map(result => {return result.payload.response.custodian});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully
            throw exception;
        }
    },

    getCustodiansByType: async (client, options) => {    
        try {
            const custodianTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
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
        try {            
            const custodianObjectResponse = await client.getSmartContractObject({key:`custodian-${options.custodianId}`, smartContractId: config.contractId})

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
        try {
            const assetObjectResponse = await client.getSmartContractObject({key:`asset-${options.assetId}`, smartContractId: config.contractId})

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


module.exports = helper;