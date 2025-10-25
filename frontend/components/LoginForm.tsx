import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import InputField from "./common/InputField";
import PrimaryButton from "./common/PrimaryButton";
import { Link } from "expo-router";
import LogoHeader from "./common/LogoHeader";
import { useAuth } from "../context/AuthContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LogoHeader />

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <View style={styles.formContainer}>
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.forgotContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <PrimaryButton title={isLoading ? "Logging in..." : "Log In"} onPress={handleLogin} disabled={isLoading} />
      </View>

      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Link href="/register" style={styles.registerLink}>
          Register
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
  formContainer: {
    width: "100%",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: "#3B82F6",
    fontSize: 13,
  },
  footer: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
  },
  registerLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

export default LoginForm;
