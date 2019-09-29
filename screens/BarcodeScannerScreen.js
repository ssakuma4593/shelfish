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
    isbn: null,
    errors: null
  };

  async componentDidMount() {
    this.getPermissionsAsync();
    booksDb.transaction(tx => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS books (isbn integer primary key not null, title text, author text, userid int);"
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
      // TODO: catch when book is not found
      .then(responseJson => {
        this.setState({ bookInfo: responseJson.items[0].volumeInfo });
        callback();
      })
      .catch(error => {
        console.error(error);
        this.setState({ errors: error });
      });
    console.log(this.state.bookInfo)
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
    // this series of sequential events could be written better
    this.setState({ scanned: true, isbn: data });
    console.log(this.state.isbn)
    this.fetchData(data, this.addBookToMyShelf);
  }

  addBookToMyShelf = () => {
    if (this.state.errors) {
      return false;
    }
    // TODO: Add exception cases
    booksDb.transaction(
      tx => {
        // TODO: Don't add books that are already attached to the user
        tx.executeSql("INSERT OR REPLACE INTO books (isbn, title, userID) VALUES (?, ?, 1)", [this.state.isbn, this.state.bookInfo.title]);
        tx.executeSql("SELECT * FROM books", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      }
    );
    this.alertInfo();
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