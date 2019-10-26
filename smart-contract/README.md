# Asset Tracker Smart Contract

## Sample Transaction Payloads

Create Custodian:

```{"method":"create_custodian", "parameters":{"custodian":{"type":"authority"}, "custodian_external_data": {"externalData":{"name":"Nike","description":"The Nike shoe brand"}}}}```

```{"method":"create_custodian", "parameters":{"custodian":{"type":"handler"}, "custodian_external_data": {"externalData":{"name":"Foot Locker #12345","description":"Foot Locker store in Bellevue, WA"}}}, "authentication":{"custodianId":"12345"}}```

```{"method":"create_custodian", "parameters":{"custodian":{"type":"owner"}, "custodian_external_data": {"externalData":{"name":"John Doe","email":"john@example.com"}}}, "authentication":{"custodianId":"12345"}}```

Set Custodian External Data:

```{"method":"set_custodian_external_data", "parameters":{"custodian_external_data": {"custodianId": "12345", "externalData":{"name":"Nike","description":"The Nike shoe brand"}}}, "authentication":{"custodianId":"12345"}}```

Create Asset Group:

```{"method":"create_asset_group", "parameters":{"asset_group":{"name": "Nike HMDs", "description":"2019 line of Nike Hand-Me-Downs"}}, "authentication":{"custodianId":"12345"}}```

Create Asset:

```{"method":"create_asset", "parameters":{"asset":{"assetGroupId":"12345"},"asset_external_data":{"externalId":"serial-12345", "externalData": {"name":"Nike HMD Runners","color":"Blue/Green","image_url":"https://google.com", "description":"The 2019 edition of the Nike Hand-Me-Down runners in bright ass blue and Hulk-pee green."}}}, "authentication":{"custodianId":"12345"}}```

Set Asset External Data:

```{"method":"set_asset_external_data", "parameters":{"asset_external_data":{"assetId": "12345", "externalId":"serial-12345", "externalData": {"name":"Nike HMD Runners","color":"Blue/Green","image_url":"https://google.com", "description":"The 2019 edition of the Nike Hand-Me-Down runners in bright ass blue and Hulk-pee green."}}}, "authentication":{"custodianId":"12345"}}```

Authorize Asset Transfer:

```{"method":"authorize_asset_transfer", "parameters":{"asset_transfer_authorization":{"assetId": "12345"}}, {"authentication":{"custodianId":"12345"}}}```

```{"method":"authorize_asset_transfer", "parameters":{"asset_transfer_authorization":{"assetId": "12345", "toCustodianId": "67890"}}, "authentication":{"custodianId":"12345"}}```

Accept Asset Transfer:

```{"method":"accept_asset_transfer", "parameters":{"asset_transfer":{"assetId": "12345"}}, "authentication":{"custodianId":"12345"}}```



## Important Notes

The following custom indexes should be created when deploying this contract (see the example DCTL install command):


- Custodian Info: 

```{"fieldName":"custodian_id", "path":"$.response.custodian.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"custodian_type", "path":"$.response.custodian.type","type":"text","options":{"sortable":false, "noStem":true}}```

- Custodian External Data Info:

```{"fieldName":"custodian_external_data_id", "path":"$.response.custodian_external_data.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"custodian_external_data_custodian_id", "path":"$.response.custodian_external_data.custodianId","type":"text","options":{"sortable":false, "noStem":true}}```

- Asset Group Info:

```{"fieldName":"asset_group_id", "path":"$.response.asset_group.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_group_created_by_custodian_id", "path":"$.response.asset_group.custodianId","type":"text","options":{"sortable":false, "noStem":true}}```

- Asset Info:

```{"fieldName":"asset_id", "path":"$.response.asset.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_created_by_custodian_id", "path":"$.response.asset.custodianId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_assigned_asset_group_id", "path":"$.response.asset.assetGroupId","type":"text","options":{"sortable":false, "noStem":true}}```

- Asset External Data Info:

```{"fieldName":"asset_external_data_id", "path":"$.response.asset_external_data.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_external_data_asset_id", "path":"$.response.asset_external_data.assetId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_external_data_external_id", "path":"$.response.asset_external_data.externalId","type":"text","options":{"sortable":false, "noStem":true}}```

- Asset Transfer Info:

```{"fieldName":"asset_transfer_id", "path":"$.response.asset_transfer.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_asset_id", "path":"$.response.asset_transfer.assetId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_asset_transfer_authorization_id", "path":"$.response.asset_transfer.assetTransferAuthorizationId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_from_custodian_id", "path":"$.response.asset_transfer.fromCustodianId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_to_custodian_id", "path":"$.response.asset_transfer.toCustodianId","type":"text","options":{"sortable":false, "noStem":true}}```

- Asset Transfer Authorization Info:

```{"fieldName":"asset_transfer_authorization_id", "path":"$.response.asset_transfer_authorization.id","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_authorization_asset_id", "path":"$.response.asset_transfer_authorization.assetId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_authorization_from_custodian_id", "path":"$.response.asset_transfer_authorization.fromCustodianId","type":"text","options":{"sortable":false, "noStem":true}}```

```{"fieldName":"asset_transfer_authorization_to_custodian_id", "path":"$.response.asset_transfer_authorization.toCustodianId","type":"text","options":{"sortable":false, "noStem":true}}```


## Sample DCTL Installation Command

Note: "-s" flag is to indicate serial execution

```
dctl c c asset_tracker \
mydockerhub/asset-tracker:latest \
node index.js \
-s \
-r MYBASE64ENCODEDUSERNAMEPASSWORD \
--customIndexes '[{"fieldName":"custodian_id","path":"$.response.custodian.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"custodian_type","path":"$.response.custodian.type","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"custodian_external_data_id","path":"$.response.custodian_external_data.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"custodian_external_data_custodian_id","path":"$.response.custodian_external_data.custodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_group_id","path":"$.response.asset_group.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_group_created_by_custodian_id","path":"$.response.asset_group.custodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_id","path":"$.response.asset.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_created_by_custodian_id","path":"$.response.asset.custodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_assigned_asset_group_id","path":"$.response.asset.assetGroupId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_external_data_id","path":"$.response.asset_external_data.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_external_data_asset_id","path":"$.response.asset_external_data.assetId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_external_data_external_id","path":"$.response.asset_external_data.externalId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_id","path":"$.response.asset_transfer.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_asset_id","path":"$.response.asset_transfer.assetId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_asset_transfer_authorization_id","path":"$.response.asset_transfer.assetTransferAuthorizationId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_from_custodian_id","path":"$.response.asset_transfer.fromCustodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_to_custodian_id","path":"$.response.asset_transfer.toCustodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_authorization_id","path":"$.response.asset_transfer_authorization.id","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_authorization_asset_id","path":"$.response.asset_transfer_authorization.assetId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_authorization_from_custodian_id","path":"$.response.asset_transfer_authorization.fromCustodianId","type":"text","options":{"sortable":false,"noStem":true}},{"fieldName":"asset_transfer_authorization_to_custodian_id","path":"$.response.asset_transfer_authorization.toCustodianId","type":"text","options":{"sortable":false,"noStem":true}}]'
```