const uuid = require("uuid/v4");

module.exports = async function (tracker) {

  const txnId = uuid();
  
  console.log(await tracker.getAuthorityCustodianID());

  //console.log(await tracker.getCurrentCustodianObject(await tracker.getAuthorityCustodianID()));

  return;

  const result = await tracker.create_custodian(
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
      await tracker.getCurrentCustodianObject(await tracker.getAuthorityCustodianID())
  );

  // Should not succeed, so no return //
}