'use strict'

const util = require('util');

const config = require('./config');

// Fancy utility function //
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Escape a value for redisearch query purposes //
const cleanRedisearchQueryValue = (value) => {
    return value.replace(/([^A-Za-z\d_]+)/g, '\\$1');
}

// General helper for interacting with our Dragonchain node using the SDK client //
const helper = {          
    waitForResponseTxn: async (client, requestTxnId) => {
        try {                    
            const cleanRequestTxnId = cleanRedisearchQueryValue(requestTxnId);

            let responseTxn = null;
            let waitCount = 0;
            
            while (responseTxn == null && waitCount < 5)
            {
                const results = await client.queryTransactions({
                    transactionType: config.contractTxnType,
                    redisearchQuery: `@invoker:${cleanRequestTxnId}`
                });

                if (results.response.total > 0)
                    responseTxn = results.response.results[0];

                waitCount++;

                await helper.sleep(1000);
            }

            if (responseTxn != null)
                return responseTxn;
            else
                throw "Response transaction not found.";
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
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
            // Pass back to caller to handle gracefully //
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
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    getCustodianByExternalId: async (client, options) => {    
        try {
            const value = cleanRedisearchQueryValue(options.externalId);

            const custodianTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@custodian_external_data_external_id:${value}`
            });

            if (custodianTransactions.response.total > 0)
            {
                return custodianTransactions.response.results[0].payload.response.custodian;
            } else 
                throw `Custodian not found with external ID ${options.externalId}`;
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createCustodian: async (client, options) => {
        try {
            let payload = {
                "method":"create_custodian", 
                "parameters":{
                    "custodian": options.custodian				
                }, 
                "authentication":{
                    "custodianId":options.authenticatedCustodian.id
                }
            };

            const requestTxn = await client.createTransaction({
                transactionType: config.contractTxnType,
                payload: payload
            })

            return requestTxn;

        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    getAssetGroups: async (client, options) => {    
        try {            
            const value = cleanRedisearchQueryValue(options.custodianId);

            console.log(value);

            const assetGroupTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_group_created_by_custodian_id:${value}`,
                limit: 999999
            });

            console.log(`@asset_group_created_by_custodian_id:${options.custodianId}`);
            if (assetGroupTransactions.response.results)
            {
                return assetGroupTransactions.response.results.map(result => {return result.payload.response.asset_group});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createAssetGroup: async (client, options) => {
        try {
            let payload = {
                "method":"create_asset_group", 
                "parameters":{
                    "asset_group": options.asset_group
                }, 
                "authentication":{
                    "custodianId":options.authenticatedCustodian.id
                }
            };

            const requestTxn = await client.createTransaction({
                transactionType: config.contractTxnType,
                payload: payload
            })

            return requestTxn;

        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },    

    getAssets: async (client, options) => {    
        try {
            const value = cleanRedisearchQueryValue(options.custodianId);

            const assetTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_created_by_custodian_id:${value}`,
                limit: 999999
            });

            if (assetTransactions.response.results)
            {
                return assetTransactions.response.results.map(result => {return result.payload.response.asset});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createAsset: async (client, options) => {
        try {
            let payload = {
                "method":"create_asset", 
                "parameters":{
                    "asset": options.asset				
                }, 
                "authentication":{
                    "custodianId":options.authenticatedCustodian.id
                }
            };

            const requestTxn = await client.createTransaction({
                transactionType: config.contractTxnType,
                payload: payload
            })

            return requestTxn;

        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    // Heap Object Getters //
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