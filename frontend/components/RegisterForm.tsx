import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import InputField from "./common/InputField";
import PrimaryButton from "./common/PrimaryButton";
import CheckboxText from "./common/CheckboxText";
import { Link } from "expo-router";
import LogoHeader from "./common/LogoHeader";
import { supabase } from '../lib/supabase'
const RegisterForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  async function signUpWithEmail() {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <LogoHeader />

      <Text style={styles.title}>Create Your FindIt Account</Text>

      <InputField placeholder="Username" value={username} onChangeText={setUsername} />
      <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <InputField placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <CheckboxText />

      <PrimaryButton title={loading ? "Creating Account..." : "Create Account"} onPress={signUpWithEmail} disabled={loading} />

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
