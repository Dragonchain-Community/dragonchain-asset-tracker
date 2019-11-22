const fs = require('fs');
const assert = require("assert");
const tracker = require("../contract/asset-tracker");

const test = {    
    custodian: {
        create_authority: require("./custodian/create_authority"),            
        create_authority_as_authority: require("./custodian/create_authority_as_authority"),
        create_non_authority: require("./custodian/create_non_authority"),
        set_external_data: require("./custodian/set_external_data")
    },
    asset_group: {
        create_asset_group_limited: require("./asset_group/create_asset_group_limited"),
        create_asset_group_unlimited: require("./asset_group/create_asset_group_unlimited")
    },
    asset: {
        create_asset_with_external_data: require("./asset/create_asset_with_external_data"),
        create_asset_without_external_data: require("./asset/create_asset_without_external_data")
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

    assert.deepStrictEqual(result.actual, result.expected, "Create Authority Custodian");

    // Assert second authority creation attempt throws error //
    await assert.rejects(test.custodian.create_authority(tracker), "Create Second Authority Custodian");

    // Get the contract's authority custodian object //
    const authority = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});
    
    // Assert creating an authority AS the authority throws error //
    await assert.rejects(test.custodian.create_authority_as_authority(tracker, {authenticatedCustodian: authority}), "Create Authority AS Authority");

    // Assert creating a non-authority succeeds //
    result = await test.custodian.create_non_authority(tracker, {authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected), "Create Custodian";

    // Get the non-authority custodian object //
    const custodian = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});

    // Assert creating a non-authority as a non-authority throws error //
    await assert.rejects(test.custodian.create_non_authority(tracker, {authenticatedCustodian: custodian}), "Create Custodian as Non-Authority");

    // Assert setting a custodian's external data as authority succeeds //
    result = await test.custodian.set_external_data(tracker, {custodian: custodian, authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected, "Set Custodian External Data ");

    // Assert setting a custodian's external data as NON-authority throws //
    await assert.rejects(test.custodian.set_external_data(tracker, {custodian: custodian, authenticatedCustodian: custodian}), "Set Custodian External Data as Non-Authority");

    
    
    // ************* ASSET GROUP TESTS ************* //

    // Assert creating an asset group as non-authority fails //
    await assert.rejects(test.asset_group.create_asset_group_limited(tracker, {authenticatedCustodian: custodian, maxSupply: 1}), "Create Asset Group as Non-Authority");

    // Assert creating an asset group with invalid maxSupply fails //
    await assert.rejects(test.asset_group.create_asset_group_limited(tracker, {authenticatedCustodian: authority, maxSupply: "one"}), "Create Asset Group with Invalid MaxSupply");
    
    // Assert creating a limited supply asset group succeeds //
    result = await test.asset_group.create_asset_group_limited(tracker, {authenticatedCustodian: authority, maxSupply: 1});

    assert.deepStrictEqual(result.actual, result.expected, "Create Asset Group with Limited Supply");

    const limitedAssetGroup = await tracker.getCurrentAssetGroupObject({assetGroupId: result.requestTxnId});

    // Assert creating an unlimited supply asset group succeeds //
    result = await test.asset_group.create_asset_group_unlimited(tracker, {authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected, "Create Asset Group with Unlimited Supply");

    const unlimitedAssetGroup = await tracker.getCurrentAssetGroupObject({assetGroupId: result.requestTxnId});
    
    
    // ************* ASSET TESTS ************* //

    // Assert creating an asset as non-authority fails //
    await assert.rejects(test.asset.create_asset_with_external_data(tracker, {authenticatedCustodian: custodian, assetGroupId: unlimitedAssetGroup.id}), "Create Asset As Non-Authority");

    // Assert creating an asset in unlimited group with external data succeeds //
    result = await test.asset.create_asset_with_external_data(tracker, {authenticatedCustodian: authority, assetGroupId: unlimitedAssetGroup.id})

    assert.deepStrictEqual(result.actual, result.expected, "Create Asset in Unlimited Supply Asset Group");

    const assetWithExternalData = await tracker.getCurrentAssetObject({assetId: result.requestTxnId});

    // Assert creating an asset in group limited to 1 succeeds without external data //
    result = await test.asset.create_asset_without_external_data(tracker, {authenticatedCustodian: authority, assetGroupId: limitedAssetGroup.id})

    assert.deepStrictEqual(result.actual, result.expected, "Create Asset in Limited Supply Asset Group");

    const assetWithoutExternalData = await tracker.getCurrentAssetObject({assetId: result.requestTxnId});

    // Assert creating a second asset in group limited to 1 fails //
    await assert.rejects(test.asset.create_asset_without_external_data(tracker, {authenticatedCustodian: authority, assetGroupId: limitedAssetGroup.id}), "Create Asset in Limited Group Already at Max Supply");

    // Assert creating an asset with an approved transfer authorization succeeds //

    // Assert setting an asset's external data as authority succeeds //

    // Assert setting an asset's external data as NON-authority FAILS //



    // ************* ASSET TRANSFER TESTS ************* //

    // Assert authorizing an asset for transfer to ANY custodian succeeds //

    // Assert authorizing an already authorized for transfer asset FAILS //

    // Assert authorizing an asset for transfer to a specific custodian succeeds //

    // Assert claiming an asset authorized for transfer to ANY custodian succeeds //

    // Assert claiming an asset authorized for transfer to a specific custodian as a DIFFERENT custodian fails //

    // Assert claiming an asset authorized for transfer to a specific custodian as the correct custodian succeeds //



    // ************* POST ASSET TRANSFER TESTS ************* //

    // Assert adding external data as non-authority custodian of an asset succeeds //

    // Assert adding external data as non-custodian of an asset fails //

    
    console.log("Test run complete.");

})();