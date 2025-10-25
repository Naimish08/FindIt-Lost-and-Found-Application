import React from "react";
import { Text, StyleSheet, View } from "react-native";

const CheckboxText = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.termsText}>
        By creating an account, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  link: {
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});

export default CheckboxText;
