# Dragonchain Asset Tracker API Server

## Initialization

After loading the smart contract to an L1, and with your dragonchain credentials file configured per the [Dragonchain SDK docs](https://node-sdk-docs.dragonchain.com/latest/index.html#configuration), initialize your contract with the following command:

```node initialize-dc-node.js```

Then copy/paste the resulting authority custodian ID into the `config.js` file.

## Startup

To run normally:

```node server.js```

To run in development mode (saving file changes will automatically restart the server):

```npm start```

The server is configured to run at `http://127.0.0.1:3030` by default.