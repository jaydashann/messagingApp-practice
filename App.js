import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import MessageList from './components/MessageList';
import {
  createImageMessage,
  createLocationMessage,
  createTextMessage,
} from './utils/MessageUtils';

export default class App extends React.Component {
  state = {
    messages: [
      createImageMessage('https://unsplash.it/300/300'),
      createTextMessage('World'),
      createTextMessage('Hello'),
      createLocationMessage({
        latitude: 37.78825,
        longitude: -122.4324,
      }),
    ],
    fullscreenImageId: null, // track which image is fullscreen
  };

  // listen to Android Back Button
  componentDidMount() {
    this.backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress
    );
  }

  componentWillUnmount() {
    if (this.backSubscription) this.backSubscription.remove();
  }

  // handle Back button press on Android
  handleBackPress = () => {
    const { fullscreenImageId } = this.state;
    if (fullscreenImageId) {
      this.dismissFullscreenImage();
      return true; // we handled the back button
    }
    return false; // allow default behavior
  };

  // dismiss fullscreen image
  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null });
  };

  // handle tap events on messages
  handlePressMessage = ({ id, type, text }) => {
    switch (type) {
      case 'text':
        // alert dialog for deleting text messages
        Alert.alert(
          'Delete message?',
          `"${text}" will be deleted.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                this.setState((prevState) => ({
                  messages: prevState.messages.filter((msg) => msg.id !== id),
                }));
              },
            },
          ],
          { cancelable: true }
        );
        break;

      case 'image':
        // open image fullscreen
        this.setState({ fullscreenImageId: id });
        break;

      default:
        break;
    }
  };

  // render all messages using MessageList component
  renderMessageList() {
    const { messages } = this.state;
    return (
      <View style={styles.content}>
        <MessageList
          messages={messages}
          onPressMessage={this.handlePressMessage}
        />
      </View>
    );
  }

  // render fullscreen image overlay
  renderFullscreenImage = () => {
    const { messages, fullscreenImageId } = this.state;
    if (!fullscreenImageId) return null;

    const image = messages.find((msg) => msg.id === fullscreenImageId);
    if (!image) return null;

    return (
      <TouchableHighlight
        style={styles.fullscreenOverlay}
        onPress={this.dismissFullscreenImage}
        underlayColor="rgba(0,0,0,0.9)"
      >
        <Image
          style={styles.fullscreenImage}
          source={{ uri: image.uri }}
          resizeMode="contain"
        />
      </TouchableHighlight>
    );
  };

  // render the full layout
  render() {
    return (
      <View style={styles.container}>
        {this.renderMessageList()}
        {this.renderFullscreenImage()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
