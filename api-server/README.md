# Dragonchain Asset Tracker API Server

## Initialization

After installing the smart contract to an L1, replace the contract ID in the `config.js` file.

Then, with your dragonchain credentials file configured per the [Dragonchain SDK docs](https://node-sdk-docs.dragonchain.com/latest/index.html#configuration), initialize your contract with the following command (this will create the authority custodian for the contract):

```node initialize-dc-node.js```

## API Server Startup

To run normally:

```node server.js```

To run in development mode (saving file changes will automatically restart the server):

```npm start```

The server is configured to run at `http://127.0.0.1:3030` by default.