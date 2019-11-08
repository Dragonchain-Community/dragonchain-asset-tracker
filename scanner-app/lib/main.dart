import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:qrscan/qrscan.dart' as scanner;
import 'package:flutter_nfc_reader/flutter_nfc_reader.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dragonchain Asset Tracker NFC Tools',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: AssetTrackerNFCPage(title: 'Dragonchain Asset Tracker NFC Tools'),
    );
  }
}

class AssetDetailScreen extends StatelessWidget {

  final AssetInfo asset;

  AssetDetailScreen({Key key, @required this.asset}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(asset.assetId),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            new Text(
                "Asset:",
                style: TextStyle(fontWeight: FontWeight.bold)
            ),
            new Text(asset.name),
            Padding(padding: EdgeInsets.only(top: 20.0)),
            Image.network(asset.imageURL),
            Padding(padding: EdgeInsets.only(top: 20.0)),
            new Text(
                "Description:",
                style: TextStyle(fontWeight: FontWeight.bold)
            ),
            new Text(asset.description),
            Padding(padding: EdgeInsets.only(top: 20.0)),
            new Text(
                "Supply Record:",
                style: TextStyle(fontWeight: FontWeight.bold)
            ),
            new Text(asset.supplyInfo),
          ],
        ),
      ),
    );
  }
}

class AssociateAssetScreen extends StatelessWidget {

  final String baseURL = "http://192.168.1.2:3030";

  final String authenticatedCustodianId;
  final String nfcTagId;

  final _selectedAssetController = TextEditingController();

  AssociateAssetScreen({Key key, @required this.authenticatedCustodianId, @required this.nfcTagId}) : super(key: key);

  Future _scanQRCode() async {
    _selectedAssetController.text = await scanner.scan();
  }

  Future<AssetInfo> _getAsset(String assetId) async {
    String username = authenticatedCustodianId;
    String password = 'mypassword';
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$username:$password'));

    var res = await http.get(
        Uri.encodeFull(baseURL + "/assets/simple/" + assetId),
        headers: {"Accept": "application/json", "authorization": basicAuth}
    );

    var data = json.decode(res.body);

    print(data);

    if (data == null)
      throw("Asset not found.");

    return new AssetInfo.fromJson(data);
  }

  Future<bool> _checkAssetOwnedOrClaim() async {

    AssetInfo asset = await _getAsset(_selectedAssetController.text);

    if (asset.currentCustodianId == authenticatedCustodianId) {
      print("Asset is owned.");
      return true;
    }

    if (asset.transferAuthorized)
    {
      if (asset.transferAuthorizedTo == authenticatedCustodianId || asset.transferAuthorizedTo == null)
      {
        // Attempt to claim the asset //
        await _postAcceptAssetTransfer();

        // Get the asset and check for new custodian status //
        asset = await _getAsset(_selectedAssetController.text);

        if (asset.currentCustodianId == authenticatedCustodianId) {
          print("Asset claimed!");
          return true;
        } else {
          print("Asset could not be claimed.");
          return false;
        }
      } else {
        print("Asset may not be claimed.");
        return false;
      }
    }

    print("Asset not in custody and not authorized for transfer.");
    return false;

  }

  Future _postAcceptAssetTransfer() async {
    String username = authenticatedCustodianId;
    String password = 'mypassword';
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$username:$password'));

    var res = await http.post(
        Uri.encodeFull(baseURL + "/assets/transfer/"),
        headers: {"content-type": "application/json", "authorization": basicAuth},
        body: jsonEncode({
          "asset_transfer": {
            "assetId": _selectedAssetController.text
          }
        })
    );

    print("Posted accept asset transfer");

  }

  Future _postAssetData() async {
    String username = authenticatedCustodianId;
    String password = 'mypassword';
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$username:$password'));

    var res = await http.post(
        Uri.encodeFull(baseURL + "/custodian/assets/add-data"),
        headers: {"content-type": "application/json", "authorization": basicAuth},
        body: jsonEncode({
          "asset_external_data": {
            "assetId": _selectedAssetController.text,
            "external_data": {
              "data": {
                "nfcTagId": nfcTagId
              }
            }
          }
        })
    );

    print("Posted asset data");

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Associate an Asset"),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            new Text(
                "Enter or Scan Your Asset ID:",
                style: TextStyle(fontWeight: FontWeight.bold)
            ),
            new TextFormField(
              controller: _selectedAssetController,
            ),
            FlatButton(
              child: Text('Scan QR Code'),
              onPressed: _scanQRCode,
            ),
            Padding(padding: EdgeInsets.only(top: 20.0)),
            RaisedButton(
              child: Text('Submit'),
              onPressed: () {
                _checkAssetOwnedOrClaim()
                    .then((isOwned) {
                      if (isOwned) {
                        _postAssetData()
                            .then((data) {
                              Navigator.pop(context);
                            });
                      } else {
                        throw("Asset could not be claimed.");
                      }
                    })
                    .catchError((e) {
                      print(e);

                      return showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          // return object of type Dialog
                          return AlertDialog(
                            title: new Text("Asset Not Associated"),
                            content: new Text("The NFC tag scanned could not be associated with the specified asset."),
                            actions: <Widget>[
                              // usually buttons at the bottom of the dialog
                              new FlatButton(
                                child: new Text("Close"),
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                              ),
                            ],
                          );
                        },
                      );
                    });
              }
            ),
          ],
        ),
      ),
    );
  }
}

class AssetTrackerNFCPage extends StatefulWidget {
  AssetTrackerNFCPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _AssetTrackerNFCPageState createState() => _AssetTrackerNFCPageState();
}

class _AssetTrackerNFCPageState extends State<AssetTrackerNFCPage> {

  final String baseURL = "http://192.168.1.2:3030";

  final String authenticatedCustodianId = "5c83e1cb-e1d0-4081-93b5-fdda8b71d1d8";

  List availableAssets = List();

  String _selectedNfcTagId;

  Future<AssetInfo> getNfcTagData() async {
    String username = authenticatedCustodianId;
    String password = 'mypassword';
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$username:$password'));

    var res = await http.get(
        Uri.encodeFull(baseURL + "/nfc/check-tag/" + _selectedNfcTagId),
        headers: {"Accept": "application/json", "authorization": basicAuth}
    );

    var data = json.decode(res.body);

    print(data);

    if (data == null)
      return null;
    else
      return new AssetInfo.fromJson(data);
  }


  void _showAssetNotOwnedDialog() {
    // flutter defined function
    showDialog(
      context: context,
      builder: (BuildContext context) {
        // return object of type Dialog
        return AlertDialog(
          title: new Text("Asset Not Owned"),
          content: new Text("The NFC tag scanned is associated to an asset you do not own."),
          actions: <Widget>[
            // usually buttons at the bottom of the dialog
            new FlatButton(
              child: new Text("Close"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            RaisedButton(
              child: Text('Read NFC Tag'),
              onPressed: () {
                FlutterNfcReader.read().then((value) {
                  print(value.id);

                  _selectedNfcTagId = value.id;

                  getNfcTagData().then((asset) {
                    if (asset == null) // nfcTagId is not associated at all, offer to associate
                    {
                      // Offer to associate //
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AssociateAssetScreen(authenticatedCustodianId: authenticatedCustodianId, nfcTagId: _selectedNfcTagId,),
                        ),
                      );
                    } else if (asset.currentCustodianId == authenticatedCustodianId) // Asset belongs to current custodian and is associated //
                    {
                      // Display the asset's info //
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AssetDetailScreen(asset: asset,),
                        ),
                      );

                    } else // nfcTagId is associated with someone else's asset
                    {
                      // Show error dialog //
                      _showAssetNotOwnedDialog();
                    }
                  });
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}

class AssetInfo {
  String assetId;
  String currentCustodianId;
  String name;
  String description;
  String imageURL;
  String supplyInfo;
  bool transferAuthorized;
  String transferAuthorizedTo;
  String nfcTagId;


  AssetInfo.fromJson(Map json) {
    this.assetId = json['assetId'];
    this.currentCustodianId = json['currentCustodianId'];
    this.name = json['name'];
    this.description = json['description'];
    this.imageURL = json['imageURL'];
    this.supplyInfo = json['supplyInfo'];
    this.transferAuthorized = json['transferAuthorized'];
    this.transferAuthorizedTo = json['transferAuthorizedTo'];
    this.nfcTagId = json['nfcTagId'];
  }
}
