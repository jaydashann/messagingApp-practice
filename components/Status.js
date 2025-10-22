import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";

export default class Status extends React.Component {
  state = {
    info: "none", // will be updated after checking network
  };

  async componentDidMount() {
    // get initial network status (modern version of getConnectionInfo)
    const netState = await NetInfo.fetch();
    this.setState({ info: netState.isConnected ? "connected" : "none" });

    // listen for network changes (Core API event listener)
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.setState({ info: state.isConnected ? "connected" : "none" });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const { info } = this.state;
    const isConnected = info !== "none";
    const backgroundColor = isConnected ? "white" : "red";

    // status bar
    const statusBar = (
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={isConnected ? "dark-content" : "light-content"}
        animated={false}
      />
    );

    // floating message container
    const messageContainer = (
      <View style={styles.messageContainer} pointerEvents={"none"}>
        {statusBar}
        {!isConnected && (
          <View style={styles.bubble}>
            <Text style={styles.text}>No network connection</Text>
          </View>
        )}
      </View>
    );

    if (Platform.OS === "ios") {
      return (
        <View style={[styles.status, { backgroundColor }]}>
          {messageContainer}
        </View>
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
