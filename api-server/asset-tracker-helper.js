'use strict'

const util = require('util');

const config = require('./config');

// Fancy utility function //
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Escape a value for redisearch query purposes //
const redisearchEncode = (value) => {
    return value.replace(/([^A-Za-z\d_]+)/g, '\\$1');
}

// General helper for interacting with our Dragonchain node using the SDK client //
const helper = {          
    waitForResponseTxn: async (client, requestTxnId) => {
        try {                    
            let responseTxn = null;
            let waitCount = 0;
            
            while (responseTxn == null && waitCount < 5)
            {
                const results = await client.queryTransactions({
                    transactionType: config.contractTxnType,
                    redisearchQuery: `@invoker:{${redisearchEncode(requestTxnId)}}`
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
                redisearchQuery: `@custodian_type:{authority|handler|owner}`,
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
                redisearchQuery: `@custodian_type:{${redisearchEncode(options.type)}}`,
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
            const custodianTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@custodian_external_data_external_id:{${redisearchEncode(options.externalId)}}`
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

    setCustodianExternalData: async (client, options) => {
        try {
            let payload = {
                "method":"set_custodian_external_data", 
                "parameters":{
                    "custodian_external_data": options.custodian_external_data
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
            const assetGroupTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_group_created_by_custodian_id:{${redisearchEncode(options.custodianId)}}`,
                limit: 999999
            });

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

    getAssetGroup: async (client, options) => {    
        try {                        
            const assetGroupTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_group_id:{${redisearchEncode(options.assetGroupId)}}`,
                limit: 999999
            });

            if (assetGroupTransactions.response.results && assetGroupTransactions.response.results.length > 0)
            {
                return assetGroupTransactions.response.results[0].payload.response.asset_group;
            } else 
                throw `Asset group not found with ID ${options.assetGroupId}`;
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
            const assetTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_created_by_custodian_id:{${redisearchEncode(options.custodianId)}}`,
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

    getAssetByExternalId: async (client, options) => {    
        try {
            const assetTransactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@asset_external_data_external_id:{${redisearchEncode(options.externalId)}}`
            });

            if (assetTransactions.response.total > 0)
            {
                return assetTransactions.response.results[0].payload.response.asset;
            } else 
                throw `Asset not found with external ID ${options.externalId}`;
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

    setAssetExternalData: async (client, options) => {
        try {
            let payload = {
                "method":"set_asset_external_data", 
                "parameters":{                    
                    "asset_external_data": options.asset_external_data
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

    authorizeAssetTransfer: async (client, options) => {
        try {
            let payload = {
                "method":"authorize_asset_transfer", 
                "parameters":{                    
                    "asset_transfer_authorization": options.asset_transfer_authorization
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

    acceptAssetTransfer: async (client, options) => {
        try {
            let payload = {
                "method":"accept_asset_transfer", 
                "parameters":{                    
                    "asset_transfer": options.asset_transfer
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