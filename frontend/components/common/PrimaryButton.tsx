import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  const buttonStyle: ViewStyle[] = [styles.button];
  if (disabled) {
    buttonStyle.push(styles.buttonDisabled);
  }

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PrimaryButton;
