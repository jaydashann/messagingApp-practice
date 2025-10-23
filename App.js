import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  BackHandler,
  Alert,
  StatusBar,
  Text,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
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
    fullscreenImageId: null,
    isConnected: true, // track network connection
  };

  componentDidMount() {
    // Listen to Android back button
    this.backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress
    );

    // Listen to network changes
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      this.setState({ isConnected: state.isConnected });
    });
  }

  componentWillUnmount() {
    if (this.backSubscription) this.backSubscription.remove();
    if (this.netInfoUnsubscribe) this.netInfoUnsubscribe();
  }

  handleBackPress = () => {
    const { fullscreenImageId } = this.state;
    if (fullscreenImageId) {
      this.dismissFullscreenImage();
      return true;
    }
    return false;
  };

  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null });
  };

  handlePressMessage = ({ id, type, text }) => {
    switch (type) {
      case 'text':
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
        this.setState({ fullscreenImageId: id });
        break;
    }
  };

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

  renderOfflineBanner() {
    if (this.state.isConnected) return null;
    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
    );
  }

  render() {
    const { isConnected } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={isConnected ? 'white' : 'red'}
          barStyle={isConnected ? 'dark-content' : 'light-content'}
        />
        {this.renderOfflineBanner()}
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
  offlineBanner: {
    backgroundColor: 'red',
    paddingVertical: 6,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
