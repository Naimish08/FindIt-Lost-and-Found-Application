import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import InputField from "./common/InputField";
import PrimaryButton from "./common/PrimaryButton";
import { Link, router } from "expo-router";
import { supabase } from '../lib/supabase'
import LogoHeader from "./common/LogoHeader";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message)
    } else if (data.session) {
      router.replace('/(protected)')
    }
    setLoading(false)
  }

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

        <PrimaryButton title={loading ? "Logging in..." : "Log In"} onPress={signInWithEmail} disabled={loading} />
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
