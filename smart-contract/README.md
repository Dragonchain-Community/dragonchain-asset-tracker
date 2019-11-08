# Asset Tracker Smart Contract

## Sample Transaction Payloads

Create Custodian:

```{"method":"create_custodian", "parameters":{"custodian":{"type":"authority", "external_data": {"id": "1", "data":{"name":"Nike","description":"The Nike shoe brand"}}}}}```

```{"method":"create_custodian", "parameters":{"custodian":{"type":"handler", "external_data": {"id": "2", "data":{"name":"Foot Locker #12345","description":"Foot Locker store in Bellevue, WA"}}}}, "authentication":{"custodianId":"12345"}}```

```{"method":"create_custodian", "parameters":{"custodian":{"type":"owner", "external_data": {"id": "3", "data":{"name":"John Doe","email":"john@example.com"}}}}, "authentication":{"custodianId":"12345"}}```

Set Custodian External Data:

```{"method":"set_custodian_external_data", "parameters":{"custodian_external_data": {"custodianId": "12345", "external_data": {"id":"12345", "data":{"name":"Nike","description":"The Nike shoe brand"}}}}, "authentication":{"custodianId":"12345"}}```

Create Asset Group:

```{"method":"create_asset_group", "parameters":{"asset_group":{"name": "Nike HMDs", "description":"2019 line of Nike Hand-Me-Downs", "maxSupply":null}}, "authentication":{"custodianId":"12345"}}```

```{"method":"create_asset_group", "parameters":{"asset_group":{"name": "Nike HMDs Limited Edition", "description":"2019 line of Nike Hand-Me-Downs limited to 100 pairs.", "maxSupply":100}}, "authentication":{"custodianId":"12345"}}```

Create Asset:

```{"method":"create_asset", "parameters":{"asset":{"assetGroupId":"12345","external_data":{"id":"serial-12345", "data": {"name":"Nike HMD Runners","color":"Blue/Green","image_url":"https://google.com", "description":"The 2019 edition of the Nike Hand-Me-Down runners in bright ass blue and Hulk-pee green."}}}}, "authentication":{"custodianId":"12345"}}```

Set/Add Asset External Data:

```{"method":"set_asset_external_data", "parameters":{"asset_external_data":{"assetId": "12345", "external_data": {"id":"serial-12345", "data": {"name":"Nike HMD Runners","color":"Blue/Green","image_url":"https://google.com", "description":"The 2019 edition of the Nike Hand-Me-Down runners in bright ass blue and Hulk-pee green."}}}}, "authentication":{"custodianId":"12345"}}```

```{"method":"add_asset_external_data_as_custodian", "parameters":{"asset_external_data":{"assetId": "12345", "external_data": {"data": {"someKey":"someValue"}}}}, "authentication":{"custodianId":"12345"}}```

*Note: add_asset_external_data_as_custodian is a special method to allow non-authority custodians to add (but not modify) new external data*

Authorize Asset Transfer:

```{"method":"authorize_asset_transfer", "parameters":{"asset_transfer_authorization":{"assetId": "12345"}}, "authentication":{"custodianId":"12345"}}```

```{"method":"authorize_asset_transfer", "parameters":{"asset_transfer_authorization":{"assetId": "12345", "toCustodianId": "67890"}}, "authentication":{"custodianId":"12345"}}```

Accept Asset Transfer:

```{"method":"accept_asset_transfer", "parameters":{"asset_transfer":{"assetId": "12345"}}, "authentication":{"custodianId":"12345"}}```



## Important Notes

The following custom indexes should be created when deploying this contract (see the example DCTL install command):

- Response Type:

```{"fieldName":"response_type", "path":"$.response.type","type":"tag"}```

- Custodian Info: 

```{"fieldName":"custodian_type", "path":"$.response.custodian.type","type":"tag"}```

- Custodian External Data Info:

```{"fieldName":"custodian_external_data_custodian_id", "path":"$.response.custodian_external_data.custodianId","type":"tag"}```

```{"fieldName":"custodian_external_data_external_id", "path":"$.response.custodian_external_data.external_data.id","type":"tag"}```

- Asset Info:

```{"fieldName":"asset_assigned_asset_group_id", "path":"$.response.asset.assetGroupId","type":"tag"}```

- Asset External Data Info:

```{"fieldName":"asset_external_data_asset_id", "path":"$.response.asset_external_data.assetId","type":"tag"}```

```{"fieldName":"asset_external_data_external_id", "path":"$.response.asset_external_data.external_data.id","type":"tag"}```

- Asset Transfer Info:

```{"fieldName":"asset_transfer_asset_id", "path":"$.response.asset_transfer.assetId","type":"tag"}```

```{"fieldName":"asset_transfer_asset_transfer_authorization_id", "path":"$.response.asset_transfer.assetTransferAuthorizationId","type":"tag"}```

```{"fieldName":"asset_transfer_from_custodian_id", "path":"$.response.asset_transfer.fromCustodianId","type":"tag"}```

```{"fieldName":"asset_transfer_to_custodian_id", "path":"$.response.asset_transfer.toCustodianId","type":"tag"}```

- Asset Transfer Authorization Info:

```{"fieldName":"asset_transfer_authorization_asset_id", "path":"$.response.asset_transfer_authorization.assetId","type":"tag"}```

```{"fieldName":"asset_transfer_authorization_from_custodian_id", "path":"$.response.asset_transfer_authorization.fromCustodianId","type":"tag"}```

```{"fieldName":"asset_transfer_authorization_to_custodian_id", "path":"$.response.asset_transfer_authorization.toCustodianId","type":"tag"}```


## Sample DCTL Installation Command

Note: "-s" flag is to indicate serial execution

```
dctl c c asset_tracker \
mydockerhub/asset-tracker:latest \
node index.js \
-s \
-r MYBASE64ENCODEDUSERNAMEPASSWORD \
--customIndexes '[{"fieldName":"response_type","path":"$.response.type","type":"tag"},{"fieldName":"custodian_type","path":"$.response.custodian.type","type":"tag"},{"fieldName":"custodian_external_data_custodian_id","path":"$.response.custodian_external_data.custodianId","type":"tag"},{"fieldName":"custodian_external_data_external_id","path":"$.response.custodian_external_data.external_data.id","type":"tag"},{"fieldName":"asset_assigned_asset_group_id","path":"$.response.asset.assetGroupId","type":"tag"},{"fieldName":"asset_external_data_asset_id","path":"$.response.asset_external_data.assetId","type":"tag"},{"fieldName":"asset_external_data_external_id","path":"$.response.asset_external_data.external_data.id","type":"tag"},{"fieldName":"asset_transfer_asset_id","path":"$.response.asset_transfer.assetId","type":"tag"},{"fieldName":"asset_transfer_asset_transfer_authorization_id","path":"$.response.asset_transfer.assetTransferAuthorizationId","type":"tag"},{"fieldName":"asset_transfer_from_custodian_id","path":"$.response.asset_transfer.fromCustodianId","type":"tag"},{"fieldName":"asset_transfer_to_custodian_id","path":"$.response.asset_transfer.toCustodianId","type":"tag"},{"fieldName":"asset_transfer_authorization_asset_id","path":"$.response.asset_transfer_authorization.assetId","type":"tag"},{"fieldName":"asset_transfer_authorization_from_custodian_id","path":"$.response.asset_transfer_authorization.fromCustodianId","type":"tag"},{"fieldName":"asset_transfer_authorization_to_custodian_id","path":"$.response.asset_transfer_authorization.toCustodianId","type":"tag"}]'
```