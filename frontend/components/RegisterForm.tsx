import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import InputField from "./common/InputField";
import PrimaryButton from "./common/PrimaryButton";
import CheckboxText from "./common/CheckboxText";
import { Link } from "expo-router";
import LogoHeader from "./common/LogoHeader";
import { EXPO_PUBLIC_API_URL } from "@env";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill out all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account created successfully!");
      console.log("User created:", data);
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Something went wrong. Please try again.");
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

      <PrimaryButton title="Create Account" onPress={handleRegister} />

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
