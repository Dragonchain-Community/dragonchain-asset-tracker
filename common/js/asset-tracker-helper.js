'use strict'

// This should be whatever name you intend to use when deploying your smart contract //
const contractTxnType = "asset_tracker";

module.exports = {    
    getCustodiansByType: async (client, type) => {    
        const custodianTransactions = await client.queryTransactions({
            transactionType: contractTxnType,
            redisearchQuery: `@custodians_type:${type}`,
            limit: 99999
        });

        if (custodianTransactions.response.results)
        {
            return custodianTransactions.response.results.map(result => {return result.payload.response.custodian});
        } else 
            return [];
    }
}