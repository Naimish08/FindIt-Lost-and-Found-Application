import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import LoginForm from "../components/LoginForm";

export default function LoginScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="always"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formWrapper}>
        <LoginForm />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f6f7fb",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  formWrapper: {
    width: "100%",
  },
});
