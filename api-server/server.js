const util = require('util');
const dcsdk = require('dragonchain-sdk');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const helper = require('./asset-tracker-helper');

const app = express();

const main = async() => {
	const awaitHandlerFactory = (middleware) => {
		return async (req, res, next) => {
			try {
				await middleware(req, res, next)
			} catch (err) {
				next(err)
			}
		}
	}

	app.use(helmet());

	app.use(cors());

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }))

	// Basic authentication middleware (obviously not the way to handle things in a production system...) //
	app.use(function (req, res, next) {
			
		// check for basic auth header
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return res.status(401).json({ message: 'Missing Authorization Header' });
		}
	
		// verify auth credentials
		const base64Credentials =  req.headers.authorization.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
		const [username, password] = credentials.split(':');
		
		// Seriously. Don't use this in a production system. //
		const authenticatedCustodianId = (password == "mypassword") ? username : undefined;

		if (typeof authenticatedCustodianId === "undefined") 
			return res.status(401).json({ message: 'Invalid Authentication Credentials' });		
	
		// attach user to request object
		req.authenticatedCustodianId = authenticatedCustodianId
		
		next();
	})
	
	// Get all custodians //
	app.get('/custodians', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodians = await helper.getCustodians(client);

		// This is a potentially dangerously long-running .map if there are many custodians (but a useful demonstration) //
		// Note: I hear a rumor we may get an SDK method that'll pull a list of objects rather than one at a time //
		// Full Disclosure: I just asked if they'd add it... Seriously: jump into Slack. DC devs are super nice dudes. //
		const custodianObjects = await Promise.all(custodians.map(async c => {return await helper.getCurrentCustodianObject(client, {custodianId: c.id})}));

		res.json(custodianObjects);
	}));	

	// Get custodians by type //
	app.get('/custodians/type/:type', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodians = await helper.getCustodiansByType(client, {type: req.params.type});

		res.json(custodians);
	}));

	// Get a specific custodian //
	app.get('/custodians/:custodianId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodian = await helper.getCurrentCustodianObject(client, {custodianId: req.params.custodianId});

		res.json(custodian);
	}));	

	// Get a specific custodian by external ID //
	app.get('/custodians/externalId/:externalId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const searchResult = await helper.getCustodianByExternalId(client, {externalId: req.params.externalId});

		const custodian = await helper.getCurrentCustodianObject(client, {custodianId: searchResult.id});

		res.json(custodian);
	}));

	// Get a custodian's assets //
	app.get('/custodian/assets/:custodianId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		const custodian = await helper.getCurrentCustodianObject(client, {custodianId: req.params.custodianId});

		if (authenticatedCustodian.type != "authority" && authenticatedCustodian.id != custodian.id)
			throw "Only the authority or the custodian may do that.";

		const assetObjects = await Promise.all(custodian.assets.map(async aId => {return await helper.getCurrentAssetObject(client, {assetId: aId})}));

		res.json(assetObjects);
	}));

	// Create a new custodian //
	app.post('/custodians', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		let custodian = {			
			"type": req.body.custodian.type
		};

		if (req.body.custodian.external_data)
		{
			custodian.external_data = req.body.custodian.external_data
		}

		const requestTxn = await helper.createCustodian(client, {custodian: custodian, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));

	// Set a custodian's external data //
	app.post('/custodians/data', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority" && authenticatedCustodian.id != req.body.custodian_external_data.custodianId)
			throw "Only the authority or the custodian may do that.";

		let custodian_external_data = {			
			"custodianId": req.body.custodian_external_data.custodianId,
			"external_data": req.body.custodian_external_data.external_data
		};

		const requestTxn = await helper.setCustodianExternalData(client, {custodian_external_data: custodian_external_data, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));

	// Get all asset groups //
	app.get('/asset-groups', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const assets = await helper.getAssetGroups(client, {custodianId: authenticatedCustodian.id});

		res.json(assets);
	}));	

	// Get a specific asset group //
	app.get('/asset-groups/:assetGroupId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const asset_group = await helper.getAssetGroup(client, {assetGroupId: req.params.assetGroupId});

		res.json(asset_group);
	}));

	// Create a new asset group //
	app.post('/asset-groups', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		let asset_group = {			
			name: req.body.asset_group.name,
			description: req.body.asset_group.description
		};

		const requestTxn = await helper.createAssetGroup(client, {asset_group: asset_group, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));	


	// Get all assets //
	app.get('/assets', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const assets = await helper.getAssets(client, {custodianId: authenticatedCustodian.id});

		const assetObjects = await Promise.all(assets.map(async a => {return await helper.getCurrentAssetObject(client, {assetId: a.id})}));

		res.json(assetObjects);
	}));	

	// Get a specific asset //
	app.get('/assets/:assetId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const asset = await helper.getCurrentAssetObject(client, {assetId: req.params.assetId});

		res.json(asset);
	}));

	// Get a specific asset by external ID //
	app.get('/assets/externalId/:externalId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const searchResult = await helper.getAssetByExternalId(client, {externalId: req.params.externalId});

		const asset = await helper.getCurrentAssetObject(client, {assetId: searchResult.id});

		res.json(asset);
	}));

	// Create a new asset //
	app.post('/assets', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		let asset = {			
			assetGroupId: typeof req.body.asset.assetGroupId !== "undefined" ? req.body.asset.assetGroupId : null
		};

		if (req.body.asset.external_data)
		{
			asset.external_data = req.body.asset.external_data
		}

		const requestTxn = await helper.createAsset(client, {asset: asset, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));	

	// Set an asset's external data //
	app.post('/assets/data', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority may do that.";

		let asset_external_data = {		
			"assetId": req.body.asset_external_data.assetId,
			"external_data": req.body.asset_external_data.external_data
		};

		const requestTxn = await helper.setAssetExternalData(client, {asset_external_data: asset_external_data, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));


	// Authorize an asset for transfer //
	app.post('/assets/authorize-transfer', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		const asset = await helper.getCurrentAssetObject(client, {assetId: req.body.asset_transfer_authorization.assetId});

		// The from custodian can only be the current holder of the asset //
		let fromCustodian = await helper.getCurrentCustodianObject(client, {custodianId: asset.last_transfer.toCustodianId});

		if (authenticatedCustodian.id != fromCustodian.id)
			throw "Only the current custodian of an asset may authorize its transfer.";

		if (asset.current_transfer_authorization != null)
			throw "Only one asset transfer authorization may be active at a time.";

		const requestTxn = await helper.authorizeAssetTransfer(client, {asset_transfer_authorization: req.body.asset_transfer_authorization, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));


	// Accept an asset transfer //
	app.post('/assets/transfer', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		const asset = await helper.getCurrentAssetObject(client, {assetId: req.body.asset_transfer.assetId});

		if (asset.current_transfer_authorization == null)
			throw "That asset is not authorized for transfer. Please contact the asset's current custodian.";

		if (asset.current_transfer_authorization.toCustodianId != null && asset.current_transfer_authorization.toCustodianId != authenticatedCustodian.id)
			throw "The specified custodian is not authorized to accept transfer of that asset.";

		const requestTxn = await helper.acceptAssetTransfer(client, {asset_transfer: req.body.asset_transfer, authenticatedCustodian: authenticatedCustodian});

		res.json(requestTxn);
	}));
	

	// Get a specific asset //
	app.get('/verifications/:objectId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.authenticatedCustodianId});

		const verifications = await helper.getBlockVerificationsForTxnId(client, {objectId: req.params.objectId});

		res.json(verifications);
	}));

	// Error handling //
	app.use(function (err, req, res, next) {
		console.error(err);

		res.status(400).json({ message: err });
	});

	// In production (optionally) use port 80 or, if SSL available, use port 443 //
	const server = app.listen(3030, '127.0.0.1', () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}


main().then().catch(console.error)


