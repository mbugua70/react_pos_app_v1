import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-nest-printer';

import {View, Text, Button, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';

const App = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDevices, setFoundDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desiredDevice, setDesiredDevice] = useState('');
  const [printerAddress, setPrinterAddress] = useState('');
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const scanDevices = async () => {
    try {
      setLoading(true);
      const s = await BluetoothManager.scanDevices();
      const ss = JSON.parse(s);

      setPairedDevices(ss.paired || []);
      setFoundDevices(ss.found || []);
      setLoading(false);

      if (ss.paired.length > 0) {
        const pairedDeviceName = ss.paired.map(item => item.name);
        const target = pairedDeviceName['0'] === 'InnerPrinter';
        if (target) {
          setDesiredDevice(pairedDeviceName['0']);
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', JSON.stringify(error));
    }
  };

  // printing logic
  useEffect(() => {
    if (!loading && foundDevices && desiredDevice) {
      pairedDevices.map(item => {
        console.log(item, 'item');
        if (item) {
          if (item.name === desiredDevice) {
            console.log(item.name, 'paired address');
            setPrinterAddress(item.address);
          }
        }
      });
    }
  }, [loading, pairedDevices]);

  //    useEffect(() => {
  //     const scanDevices = async () => {
  //         try {
  //           setLoading(true);
  //           const s = await BluetoothManager.scanDevices();
  //           console.log(s, "devices")
  //           const ss = JSON.parse(s); // Convert JSON string to object
  //           console.log(ss, "test ss")

  //           setPairedDevices(ss.paired || []);
  //           setFoundDevices(ss.found || []);
  //           setLoading(false);
  //         } catch (error) {
  //           setLoading(false);
  //           Alert.alert('Error', JSON.stringify(error));
  //         }
  //       };

  //       scanDevices()
  //    }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!desiredDevice) {
        scanDevices();
      } else {
        clearInterval(interval); // Stop scanning when device is found
      }
    }, 5000); // Scan every 5 seconds

    return () => clearInterval(interval);
  }, [desiredDevice]);

  useEffect(() => {
    const checkBluetooth = async () => {
      try {
        const isEnabled = await BluetoothManager.isBluetoothEnabled();
        console.log(isEnabled);
      } catch (error) {
        console.log(error);
      }
    };
    checkBluetooth();
  }, []);

  useEffect(() => {
    if (!loading && desiredDevice !== '' && printerAddress !== '') {
      const connectPrinter = async () => {
        try {
          setIsConnecting(true);
          await BluetoothManager.connect(printerAddress);
          console.log('Inner Printer connected');
          setIsPrinterConnected(true);
        } catch (error) {
          console.error('Connection Error:', error);
          setIsPrinterConnected(false);
        } finally {
          setIsConnecting(false);
        }
      };

      connectPrinter();
    }
  }, [loading, desiredDevice, printerAddress]);

  //   printing function
  async function handlePrintDemo() {
    console.log(isPrinterConnected, 'isPrinterConnected');
    console.log(isConnecting, 'isConnecting');

    if (!isPrinterConnected || isConnecting) {
      Alert.alert(
        'Printer Not Connected',
        'Please ensure the printer is connected before printing.',
      );
      return;
    } else {
      try {
        console.log('Printing started...');
        await BluetoothEscposPrinter.printerInit();

        console.log('Printing initialized');
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        await BluetoothEscposPrinter.printText("UNGWANA SHUTTLE\n\r", {
          encoding: "GBK",
          codepage: 1,
          widthtimes: 0,
          heigthtimes: 2,
          fonttype: 0,

        });
        await BluetoothEscposPrinter.printText("0723492206 Nkubu/Meru 0728781720\n\r", {
          encoding: "GBK",
          codepage: 1,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 1,

        });
        await BluetoothEscposPrinter.printText("Chuka, Nairobi 0728781720\n\r", {
          encoding: "GBK",
          codepage: 1,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 1,

        });
        await BluetoothEscposPrinter.printText("2025-02-12 : 23:45\n\r", {
          encoding: "GBK",
          codepage: 1,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 1,

        });
        await BluetoothEscposPrinter.printText("ROUTE: Nairobi - Meru\n\r", {
          encoding: "GBK",
          codepage: 1,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 1,

        });

        await BluetoothEscposPrinter.printText("\n\n\n", {});


        console.log('Printing completed successfully!');
      } catch (error) {
        console.error('Printing failed:', error);
        Alert.alert('Print Error', error.message);
      }
    }
  }

  return (
    <View>
      <Button title="Print Demo" onPress={handlePrintDemo} />
    </View>
  );
};

export default App;
