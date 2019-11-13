const uuid = require("uuid/v4");

module.exports = async function (tracker) {

  const txnId = uuid();
    
  const authority = await tracker.getCurrentCustodianObject({custodianId:await tracker.getAuthorityCustodianID()});

  await tracker.create_custodian(
      txnId,     
      {
          "custodian": {
              "type":"authority", 
              "external_data": {
                  "id": "1", 
                  "data": {
                      "name":"Nike",
                      "description":"Nike Shoe Company"
                  }
              }
          }
      },
      authority
  );

  // Should not succeed, so no return //
}