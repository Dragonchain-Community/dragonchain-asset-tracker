# Dragonchain Asset Tracker Proof-of-Concept

This project demonstrates the core structure of a functional blockchain-enabled asset tracking solution. The project was inspired by the New Balance/Cardano blockchain partnership, and the goal is to demonstrate how quickly and simply such a solution can be built using the power of the [Dragonchain](https://www.dragonchain.com) blockchain platform-as-a-service and its ability to run smart contracts in any language.

## Demo Video

[![Dragonchain Asset Tracker Demo Video](https://herebedrgns.com/wp-content/uploads/2019/11/asset-tracker-demo-screencap.png)](https://herebedrgns.com/building-a-blockchain-asset-tracker-on-dragonchain-design-considerations/)

## Components

There are four components to this solution:

1. A smart contract written in Node.js to be deployed to a Dragonchain Level 1 Business Node
2. A basic Node.js RESTful API that operates as a web-accessible interface to the blockchain and its data
3. A web-based demo demonstrating implementation of the API and most of its core functions
4. A Flutter-based mobile app solution demonstrating scanning and associating NFC tags with an asset on the blockchain

*Note: only basic, hard-coded, demonstrative authentication has been included throughout this proof-of-concept solution. Before deploying any code to a production environment, ensure that you implement more robust and correct authentication measures.*

## Definitions

An "asset" may be considered any kind of "thing," from physical products to software licenses to certifications, that one custodian might create and transfer to another custodian.

An "asset group" is an arbitrary grouping mechanism for individual assets. An asset must belong to an asset group. Asset groups also provide the option to create contract-enforced supply limits for assets (i.e., max supply of 1000 pairs of Nike HMD shoes).

A "custodian" is a person or entity who can take control - or custody - of an asset. There are three kinds of custodians as defined in this project:

- **Authority** custodians are the only type of custodian able to create assets and control certain aspects of them (example: Nike Shoes). There can currently be only one authority custodian per instance of the smart contract

- **Handler** custodians are meant to represent intermediary custodians before an asset reaches its final intended owner (example: Foot Locker Store #1234)

- **Owner** custodians are meant to represent the final owners of an asset though they may transfer those assets to any other custodian (example: John Doe)

## Asset Transfer Process

The process for transferring an asset is broken into two steps:

1. The **current custodian** of an asset authorizes its transfer. The receiving custodian may be specified or the transfer may be left open to any custodian.
2. The **receiving custodian** claims ownership of an asset that has been authorized for transfer.

## Getting Started

Each component of this project will have its own README with associated installation and setup instructions.

The smart contract will need to be installed on a managed or on-premises Dragonchain Level 1 business node. This can be setup at https://console.dragonchain.com

The API and web demo projects can run on any platform on which Node.js is supported.

The Flutter demo was developed and built in Android Studio. Deploying to an Apple phone or tablet will require a Mac environment. Android phones or tablets may be used on other supported environments.

## Special Thanks

Major thanks to the whole team at Dragonchain including Joe Roets (CEO), Dean Shelton (Director of Engineering), and especially the other devs on the Dragonchain Slack channel including Adam, Alex, Roby, and Regan for the incredible support.
