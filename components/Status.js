import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";

export default class Status extends React.Component {
  state = {
    info: "none",
    backgroundColorAnim: new Animated.Value(0), // 0 = connected, 1 = disconnected
    bubbleOpacity: new Animated.Value(0),
    bubbleTranslate: new Animated.Value(-20),
  };

  async componentDidMount() {
    const netState = await NetInfo.fetch();
    this.updateConnectionState(netState.isConnected ? "connected" : "none");

    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.updateConnectionState(state.isConnected ? "connected" : "none");
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  updateConnectionState = (status) => {
    this.setState({ info: status });

    // animate background color
    Animated.timing(this.state.backgroundColorAnim, {
      toValue: status === "none" ? 1 : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // animate message bubble in/out
    if (status === "none") {
      Animated.parallel([
        Animated.timing(this.state.bubbleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(this.state.bubbleTranslate, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(this.state.bubbleOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.bubbleTranslate, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  render() {
    const { info, backgroundColorAnim, bubbleOpacity, bubbleTranslate } =
      this.state;
    const isConnected = info !== "none";

    // Interpolate background color between white and red
    const backgroundColor = backgroundColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["white", "red"],
    });

    const statusBar = (
      <StatusBar
        backgroundColor={isConnected ? "white" : "red"}
        barStyle={isConnected ? "dark-content" : "light-content"}
        animated={true} // animates barStyle and color transitions
      />
    );

    // Animated message bubble
    const bubble = (
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity: bubbleOpacity,
            transform: [{ translateY: bubbleTranslate }],
          },
        ]}
      >
        <Text style={styles.text}>No network connection</Text>
      </Animated.View>
    );

    const messageContainer = (
      <Animated.View
        style={[styles.messageContainer, { backgroundColor }]}
        pointerEvents="none"
      >
        {statusBar}
        {bubble}
      </Animated.View>
    );

    if (Platform.OS === "ios") {
      return (
        <Animated.View style={[styles.status, { backgroundColor }]}>
          {messageContainer}
        </Animated.View>
      );
    }

    return messageContainer;
  }
}

const statusHeight = Platform.OS === "ios" ? Constants.statusBarHeight : 0;

const styles = StyleSheet.create({
  status: {
    zIndex: 1,
    height: statusHeight,
  },
  messageContainer: {
    zIndex: 1,
    position: "absolute",
    top: statusHeight + 20,
    left: 0,
    right: 0,
    height: 80,
    alignItems: "center",
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "red",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});
