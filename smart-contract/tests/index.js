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
        create_asset_without_external_data: require("./asset/create_asset_without_external_data"),
        create_asset_with_transfer_auth: require("./asset/create_asset_with_transfer_auth"),
        set_external_data: require("./asset/set_external_data"),
        add_external_data_as_custodian: require("./asset/add_external_data_as_custodian")
    },
    asset_transfer: {
        authorize_asset_transfer: require("./asset_transfer/authorize_asset_transfer"),
        accept_asset_transfer: require("./asset_transfer/accept_asset_transfer")
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
    let authority = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});
    
    // Assert creating an authority AS the authority throws error //
    await assert.rejects(test.custodian.create_authority_as_authority(tracker, {authenticatedCustodian: authority}), "Create Authority AS Authority");

    // Assert creating a non-authority succeeds //
    result = await test.custodian.create_non_authority(tracker, {authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected), "Create Custodian";

    // Get the non-authority custodian object //
    let custodian = await tracker.getCurrentCustodianObject({custodianId: result.requestTxnId});

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

    assert.equal(authority.assets.length, 1, "Authority Has 1 Asset");

    let assetWithExternalData = await tracker.getCurrentAssetObject({assetId: result.requestTxnId});

    // Assert creating an asset in group limited to 1 succeeds without external data //
    result = await test.asset.create_asset_without_external_data(tracker, {authenticatedCustodian: authority, assetGroupId: limitedAssetGroup.id})

    assert.deepStrictEqual(result.actual, result.expected, "Create Asset in Limited Supply Asset Group");

    assert.equal(authority.assets.length, 2, "Authority Has 2 Assets");

    let assetWithoutExternalData = await tracker.getCurrentAssetObject({assetId: result.requestTxnId});

    // Assert creating a second asset in group limited to 1 fails //
    await assert.rejects(test.asset.create_asset_without_external_data(tracker, {authenticatedCustodian: authority, assetGroupId: limitedAssetGroup.id}), "Create Asset in Limited Group Already at Max Supply");

    // Assert creating an asset with an approved transfer authorization succeeds //
    result = await test.asset.create_asset_with_transfer_auth(tracker, {authenticatedCustodian: authority, assetGroupId: unlimitedAssetGroup.id, toCustodianId: custodian.id});

    assert.deepStrictEqual(result.actual, result.expected);

    assert.equal(authority.assets.length, 3, "Authority Has 3 Assets");

    let assetWithTransferAuth = await tracker.getCurrentAssetObject({assetId: result.requestTxnId});

    // Assert setting an asset's external data as authority succeeds //
    result = await test.asset.set_external_data(tracker, {asset: assetWithoutExternalData, authenticatedCustodian: authority});

    assert.deepStrictEqual(result.actual, result.expected, "Set Asset External Data ");

    assetWithoutExternalData = await tracker.getCurrentAssetObject({assetId: assetWithoutExternalData.id});

    // Assert setting an asset's external data as NON-authority FAILS //
    await assert.rejects(test.asset.set_external_data(tracker, {asset: assetWithTransferAuth, authenticatedCustodian: custodian}), "Set Asset External Data as Non-Authority");


    // ************* ASSET TRANSFER TESTS ************* //

    // Assert authorizing an asset for transfer to ANY custodian succeeds //
    result = await test.asset_transfer.authorize_asset_transfer(tracker, {authenticatedCustodian: authority, asset: assetWithExternalData, toCustodianId: null}); // Woot! This one found a bug! //

    assert.deepStrictEqual(result.actual, result.expected);    

    assetWithExternalData = await tracker.getCurrentAssetObject({assetId: assetWithExternalData.id});

    // Assert authorizing an already authorized for transfer asset FAILS (using pre-authorized transfer asset test from above)//
    await assert.rejects(test.asset_transfer.authorize_asset_transfer(tracker, {authenticatedCustodian: authority, asset: assetWithTransferAuth, toCustodianId: null}), "Authorize Transfer on Asset Already Authorized for Transfer");

    // Assert authorizing an asset for transfer to a specific custodian succeeds //
    result = await test.asset_transfer.authorize_asset_transfer(tracker, {authenticatedCustodian: authority, asset: assetWithoutExternalData, toCustodianId: custodian.id});

    assert.deepStrictEqual(result.actual, result.expected);    

    assetWithoutExternalData = await tracker.getCurrentAssetObject({assetId: assetWithoutExternalData.id});

    // Assert claiming an asset authorized for transfer to ANY custodian succeeds //
    result = await test.asset_transfer.accept_asset_transfer(tracker, {authenticatedCustodian: custodian, asset: assetWithExternalData});

    assert.deepStrictEqual(result.actual, result.expected);    

    assetWithExternalData = await tracker.getCurrentAssetObject({assetId: assetWithExternalData.id});

    authority = await tracker.getCurrentCustodianObject({custodianId: authority.id});
    
    custodian = await tracker.getCurrentCustodianObject({custodianId: custodian.id});

    assert.equal(authority.assets.length, 2, "Authority Has 1 Less Asset");

    assert.equal(custodian.assets.length, 1, "Custodian Has 1 More Asset");

    // Assert claiming an asset authorized for transfer to a specific custodian as a DIFFERENT custodian fails //
    await assert.rejects(test.asset_transfer.accept_asset_transfer(tracker, {authenticatedCustodian: authority, asset: assetWithoutExternalData}), "Accept Asset Transfer as Non-Authorized Custodian");

    // Assert claiming an asset authorized for transfer to a specific custodian as the correct custodian succeeds //
    result = await test.asset_transfer.accept_asset_transfer(tracker, {authenticatedCustodian: custodian, asset: assetWithoutExternalData});

    assert.deepStrictEqual(result.actual, result.expected);

    assetWithoutExternalData = await tracker.getCurrentAssetObject({assetId: assetWithoutExternalData.id});

    authority = await tracker.getCurrentCustodianObject({custodianId: authority.id});
    
    custodian = await tracker.getCurrentCustodianObject({custodianId: custodian.id});

    assert.equal(authority.assets.length, 1, "Authority Has 1 Less Asset");

    assert.equal(custodian.assets.length, 2, "Custodian Has 1 More Asset");
    

    // ************* POST ASSET TRANSFER TESTS ************* //

    // Assert adding external data as non-authority custodian of an asset succeeds //
    result = await test.asset.add_external_data_as_custodian(tracker, {authenticatedCustodian: custodian, asset: assetWithoutExternalData});

    assert.deepStrictEqual(result.actual, result.expected);

    // Assert adding external data as non-custodian of an asset fails //
    await assert.rejects(test.asset.add_external_data_as_custodian(tracker, {authenticatedCustodian: authority, asset: assetWithoutExternalData}), "Add Asset External Data as NON-Custodian of Asset");
    
    console.log("Tests passed!");

})();