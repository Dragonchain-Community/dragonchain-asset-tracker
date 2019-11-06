import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
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

class AssetTrackerNFCPage extends StatefulWidget {
  AssetTrackerNFCPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _AssetTrackerNFCPageState createState() => _AssetTrackerNFCPageState();
}

class _AssetTrackerNFCPageState extends State<AssetTrackerNFCPage> {

  final String getAssetsURL = "http://192.168.1.2:3030/assets/simple";
  final String postAssetData = "http://192.168.1.2:3030/assets/data";

  List availableAssets = List();

  String _selectedValue;

  Future getAssets() async {
    String username = 'e2634eb5-b462-41f2-8d35-99f25f8cbbd0';
    String password = 'mypassword';
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$username:$password'));

    var res = await http.get(
        Uri.encodeFull(getAssetsURL),
        headers: {"Accept": "application/json", "authorization": basicAuth}
    );

    var data = json.decode(res.body);

    print(data);

    setState(() {
      availableAssets = (data as List).map((i) => new AssetInfo.fromJson(i)).where((i) => i.nfcTagId == null).toList();
    });
  }

  @override
  void initState() {
    super.initState();
    this.getAssets();
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
            new DropdownButton(
              isExpanded: true,
              onChanged: (newVal) {
                setState(() {
                  _selectedValue = newVal;
                  print (_selectedValue);
                });
              },
              value: _selectedValue,
              items: availableAssets.map((item) =>
                new DropdownMenuItem(
                  child: Text(item.assetId + ' - ' + item.name),
                  value: item.assetId
                )
              ).toList(),
            ),
            RaisedButton(
              child: Text('Write NFC Tag'),
              onPressed: () {
                FlutterNfcReader.write(" ", _selectedValue).then((value) {
                  print(value.content);

                  // API call to set the external data in Dragonchain //

                });
              }
            ),
            Padding(padding: EdgeInsets.only(top: 40.0)),
            RaisedButton(
              child: Text('Read NFC Tag'),
              onPressed: () {
                FlutterNfcReader.read().then((value) {
                  print(value.id);

                  String clean = value.content.replaceAll(RegExp(r'[^A-Za-z0-9-]'),"");
                  print(clean);

                  // Display image, name, etc. in closable widget //
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
  String name;
  String description;
  String imageURL;
  String nfcTagId;


  AssetInfo.fromJson(Map json) {
    this.assetId = json['assetId'];
    this.name = json['name'];
    this.description = json['description'];
    this.imageURL = json['imageURL'];
    this.nfcTagId = json['nfcTagId'];
  }
}
