import React from "react";
import { View, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";

const LogoHeader = () => {
  return (
    <View style={styles.logoContainer}>
      <Search color="#3B82F6" size={48} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
});

export default LogoHeader;
