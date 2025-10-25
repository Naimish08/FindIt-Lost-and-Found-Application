import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import InputField from "./common/InputField";
import PrimaryButton from "./common/PrimaryButton";
import CheckboxText from "./common/CheckboxText";
import { Link } from "expo-router";
import LogoHeader from "./common/LogoHeader";
import { useAuth } from "../context/AuthContext";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LogoHeader />

      <Text style={styles.title}>Create Your FindIt Account</Text>

      <InputField placeholder="Username" value={username} onChangeText={setUsername} />
      <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <InputField placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <CheckboxText />

      <PrimaryButton title={isLoading ? "Creating Account..." : "Create Account"} onPress={handleRegister} disabled={isLoading} />

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" style={styles.signInLink}>
          Sign In
        </Link>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  footer: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
  },
  signInLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

export default RegisterForm;
