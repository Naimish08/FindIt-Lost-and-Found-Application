import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from "react-native";
import { Colors, Radius, Shadow } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  const colorScheme = useColorScheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const buttonStyle: ViewStyle[] = [
    styles.button,
    {
      backgroundColor: disabled ? '#9CA3AF' : Colors[colorScheme ?? 'light'].primary,
      borderRadius: Radius.lg,
    },
  ];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    ...Shadow.card,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PrimaryButton;
