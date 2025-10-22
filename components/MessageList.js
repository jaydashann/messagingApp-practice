import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import MapView, { Marker } from 'react-native-maps';
import { MessageShape } from '../utils/MessageUtils';

const keyExtractor = (item) => item.id.toString();

export default class MessageList extends React.Component {
  static propTypes = {
    messages: PropTypes.arrayOf(MessageShape).isRequired,
    onPressMessage: PropTypes.func, // passed from App.js
  };

  static defaultProps = {
    onPressMessage: () => {},
  };
  renderMessageItem = ({ item }) => {
    const { onPressMessage } = this.props;

    return (
      <View
        key={item.id}
        style={[
          styles.messageRow,
          item.isSent ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPressMessage(item)}
        >
          {this.renderMessageBody(item)}
        </TouchableOpacity>
      </View>
    );
  };

  // render the correct UI depending on the message type
  renderMessageBody = ({ type, text, uri, coordinate }) => {
    switch (type) {
      case 'text':
        return (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{text}</Text>
          </View>
        );

      case 'image':
        return (
          <Image
            style={styles.messageImage}
            source={{ uri }}
            resizeMode="cover"
          />
        );

      case 'location':
        return (
          <MapView
            style={styles.map}
            initialRegion={{
              ...coordinate,
              latitudeDelta: 0.08,
              longitudeDelta: 0.04,
            }}
            pointerEvents="none" // disable panning/zooming
          >
            <Marker coordinate={coordinate} />
          </MapView>
        );

      default:
        return null;
    }
  };

  render() {
    const { messages } = this.props;

    return (
      <FlatList
        style={styles.container}
        inverted
        data={messages}
        renderItem={this.renderMessageItem}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 60,
    marginVertical: 6,
    paddingRight: 10,
  },
  messageBubble: {
    backgroundColor: '#0078fe',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 1,
    alignSelf: 'flex-end',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0,
    shadowRadius: 2,
    elevation: Platform.OS === 'android' ? 2 : 0, // android shadow
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    flexWrap: 'wrap',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  map: {
    width: 250,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
});
