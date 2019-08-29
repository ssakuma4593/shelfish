import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
class List extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.column}>
          <Text
            style={[
              styles.text 
            ]}
          >
            {text}
          </Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    width: width - 50,
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: 'white',
    height: width / 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    ...Platform.select({
      ios: {
        shadowColor: 'rgb(50,50,50)',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
          height: 2,
          width: 0
        }
      },
      android: {
        elevation: 5
      }
    })
  },
  column: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width / 1.5
  },
  text: {
    fontWeight: '500',
    fontSize: 16,
    marginVertical: 15
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    margin: 10
  },
  button: {
    marginRight: 10
  }
});
export default Library;