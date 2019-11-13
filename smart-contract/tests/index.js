const assert = require("assert");
const tracker = require("../contract/asset-tracker");

const test = {
    index: 0,

    custodian: {
        create_authority: require("./custodian/create_authority"),            
        create_authority_as_authority: require("./custodian/create_authority_as_authority")            
    }        
};

tracker.client = {
    heap: {},

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
    const result = await test.custodian.create_authority(tracker);

    // Assert authority created 
    assert.deepStrictEqual(result.actual, result.expected);

    // Assert second authority creation attempt throws error //
    assert.rejects(test.custodian.create_authority(tracker));
    
    // Assert creating an authority AS the authority throws error //
    assert.rejects(test.custodian.create_authority_as_authority(tracker));
})();