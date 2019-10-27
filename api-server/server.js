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
	
	// Get all custodians //
	app.get('/custodians', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.body.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodians = await helper.getCustodians(client);

		// This is a potentially dangerously long-running .map if there are many custodians (but a useful demonstration) //
		//const custodianObjects = await Promise.all(custodians.map(async c => {return await helper.getCurrentCustodianObject(client, {custodianId: c.id})}));

		res.json(custodians);
	}));	

	// Get custodians by type //
	app.get('/custodians/type/:type', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.body.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodians = await helper.getCustodiansByType(client, {type: req.params.type});

		res.json(custodians);
	}));

	// Get a specific custodian //
	app.get('/custodians/:custodianId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.body.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const custodian = await helper.getCurrentCustodianObject(client, {custodianId: req.params.custodianId});

		res.json(custodian);
	}));	

	// Get a specific custodian by external ID //
	app.get('/custodians/external/:externalId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.body.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		const searchResult = await helper.getCustodianByExternalId(client, {externalId: req.params.externalId});

		const custodian = await helper.getCurrentCustodianObject(client, {custodianId: searchResult.id});

		res.json(custodian);
	}));

	// Create a new custodian //
	app.post('/custodians', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const authenticatedCustodian = await helper.getCurrentCustodianObject(client, {custodianId: req.body.authenticatedCustodianId});

		if (authenticatedCustodian.type != "authority")
			throw "Only the authority custodian may do that.";

		let payload = {
			"method":"create_custodian", 
			"parameters":{
				"custodian":{
					"type":req.body.custodian.type
				}				
			}, 
			"authentication":{
				"custodianId":authenticatedCustodian.id
			}
		};

		if (req.body.custodian.external_data)
		{
			payload.parameters.custodian.external_data = req.body.custodian.external_data
		}

		res.json(payload);
	}));


	// Get all assets //
	app.get('/assets', awaitHandlerFactory(async (req, res) => {
		
	}));	

	// Get a specific asset //
	app.get('/assets/:assetId', awaitHandlerFactory(async (req, res) => {
		
	}));

	// Get a specific asset by external ID //
	app.get('/assets/external/:externalId', awaitHandlerFactory(async (req, res) => {
		
	}));

	// Create a new asset //
	app.post('/assets', awaitHandlerFactory(async (req, res) => {
		
	}));	
	




	// In production (optionally) use port 80 or, if SSL available, use port 443 //
	const server = app.listen(3030, '127.0.0.1', () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}


main().then().catch(console.error)


