# Dragonchain Asset Tracker NFC Mobile App

A simple demo for reading and using asset tracking data on an NFC tag using the Dragonchain blockchain platform. 

This project is built using the Flutter platform and the Dart language.

## Getting Started

This project is meant to be developed and run in Android Studio.

**Note: the project has only currently been tested on a Windows development machine deploying to an Android phone. iOS device support should be included (follow instructions at [https://github.com/matteocrippa/flutter-nfc-reader#ios-setup](https://github.com/matteocrippa/flutter-nfc-reader#ios-setup)) and functional, but has not been verified on a Mac development machine at this time.**

On your development machine running Flutter and Android Studio, update the packages by running the following command in the base directory for the scanner app:

```flutter pub get```

Then run the application in Android Studio with a connected Android or iOS device (the app will run on an Android Virtual Device or other emulator, but NFC support will not function).

*Note: you may need to manually enable camera and storage permissions for the test app on your device in order to enable QR code scanning support*

## Note On Supported NFC Tags

According to the NFC package developer, the following types of NFC tags are supported for scanning:

| Platform      | Supported NFC Tags |
| ------------- | ------------- |
| Android  | **NDEF**: A, B, F, V, BARCODE  |
| iOS  | **NDEF**: NFC TYPE 1, 2, 3, 4, 5  |

The tags I tested with may be bought on Amazon here:
https://www.amazon.com/gp/product/B075CFXY8V/

## Special Thanks

HUGE thanks to [Matteo Crippa](https://github.com/matteocrippa) for his work on the NFC package for Flutter. See his original [Flutter NFC demo here](https://github.com/matteocrippa/flutter-nfc-reader).