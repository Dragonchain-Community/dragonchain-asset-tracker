const uuid = require("uuid/v4");

module.exports = async function (tracker) {

  const txnId = uuid();
  
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
      options.authenticatedCustodian
  );

  // Should not succeed, so no return //
}