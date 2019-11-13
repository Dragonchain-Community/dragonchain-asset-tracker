const fs = require('fs');
const assert = require("assert");
const tracker = require("../contract/asset-tracker");

const test = {    
    custodian: {
        create_authority: require("./custodian/create_authority"),            
        create_authority_as_authority: require("./custodian/create_authority_as_authority"),
        create_non_authority: require("./custodian/create_non_authority"),
        set_external_data: require("./custodian/set_external_data")
    }        
};

tracker.client = {
    heap: {},

    updateSmartContractHeap: function (data) {
        this.heap = {...this.heap, ...data};

        // Write current heap to file //
        fs.writeFileSync(__dirname + '/post-run-heap.json', JSON.stringify(this.heap, null, 2), (err) => {    
            if (err) throw err;
        });
    },

    getSmartContractObject: async function (options) {

        if (this.heap[options.key])
        {
            return {
                "status": 200,
                "response": JSON.stringify(this.heap[options.key]),
                "ok": true
            }
        }

        return {
            "status": 404,
            "response": JSON.stringify({"error":{"type":"NOT_FOUND","details":"The requested resource(s) cannot be found."}}),
            "ok": false
          };          
    }
};

(async () => {

    // ************* CUSTODIAN TESTS ************* //    
    // Assert authority created 
    let result = await test.custodian.create_authority(tracker);

    assert.deepStrictEqual(result.actual, result.expected);

    // Assert second authority creation attempt throws error //
    assert.rejects(test.custodian.create_authority(tracker));

    // Get the contract's authority custodian object //
    const authority = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});
    
    // Assert creating an authority AS the authority throws error //
    assert.rejects(test.custodian.create_authority_as_authority(tracker, {authenticatedCustodian: authority}));

    // Assert creating a non-authority succeeds //
    result = await test.custodian.create_non_authority(tracker, {authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected);

    // Get the non-authority custodian object //
    const custodian = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});

    // Assert creating a non-authority as a non-authority throws error //
    assert.rejects(test.custodian.create_non_authority(tracker, {authenticatedCustodian: custodian}));

    // Assert setting a custodian's external data as authority succeeds //
    result = await test.custodian.set_external_data(tracker, {custodian: custodian, authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected);

    // Assert setting a custodian's external data as NON-authority throws //
    assert.rejects(test.custodian.set_external_data(tracker, {custodian: custodian, authenticatedCustodian: custodian}));

    
    
    // ************* ASSET GROUP TESTS ************* //

    // Assert creating an asset group as non-authority fails //

    // Assert creating an asset group with invalid maxSupply fails //

    // Assert creating an unlimited supply asset group succeeds //

    // Assert creating a limited supply asset group succeeds //

    
    
    // ************* ASSET TESTS ************* //

    // Assert creating an asset as non-authority fails //

    // Assert creating an asset in unlimited group with external data succeeds //

    // Assert creating an asset in group limited to 1 succeeds without external data //

    // Assert creating a second asset in group limited to 1 fails //

    // Assert setting an asset's external data as authority succeeds //



    // ************* ASSET TRANSFER TESTS ************* //

    // Assert authorizing an asset for transfer to ANY custodian succeeds //

    // Assert authorizing an already authorized for transfer asset FAILS //

    // Assert authorzing an asset for transfer to a specific custodian succeeds //

    // Assert claiming an asset authorized for transfer to ANY custodian succeeds //

    // Assert claiming an asset authorized for transfer to a specific custodian as a DIFFERENT custodian fails //

    // Assert claiming an asset authorized for transfer to a specific custodian as the correct custodian succeeds //



    // ************* POST ASSET TRANSFER TESTS ************* //

    // Assert adding external data as non-authority custodian of an asset succeeds //

    // Assert adding external data as non-custodian of an asset fails //

    
    console.log("Tests passed.");

})();