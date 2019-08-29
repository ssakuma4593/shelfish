import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { SQLite } from 'expo-sqlite';

import { BarCodeScanner } from 'expo-barcode-scanner';

const booksDb = SQLite.openDatabase("books.db");

export default class BarcodeScannerScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
    bookInfo: null,
    errors: null
    };

  async componentDidMount() {
    this.getPermissionsAsync();
    booksDb.transaction(tx => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS books (id integer primary key not null, title text, userid int);"
        );
      });
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  fetchData(isbn, callback) {
    fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`)
        .then(response => response.json())
        .then(responseJson => {
            this.setState({ bookInfo: responseJson.items[0].volumeInfo});
            callback();
        })
    .catch(error => {
      console.error(error);
      this.setState({ errors: error});
    });
  }

  alertInfo = () => {
      if (this.state.errors) {
        alert(`Could not scan. Please try again.`);
      }
      else {
        alert(`"${this.state.bookInfo.title}" was scanned!`);
      }
  }


  handleBarCodeScanned = ({ data }) => {
    var isbn = data;
    // this series of sequential events could be written better
    this.setState({ scanned: true });
    this.fetchData(isbn, this.addBookToMyShelf);
  }

  addBookToMyShelf = () => {
    if (this.state.errors) {
        return false;
    }
    booksDb.transaction(
        tx => {
          tx.executeSql("insert into books (title, userID) values (?, 1)", [this.state.bookInfo.title]);
          tx.executeSql("select * from books", [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        }
    );
  }

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && (
          <Button
            title={'Tap to Scan Again'}
            onPress={() => this.setState({ scanned: false })}
          />
        )}
      </View>
    );
  }
}


BarcodeScannerScreen.navigationOptions = {
    title: 'BarcodeScanner',
};