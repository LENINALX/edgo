// src/components/Button.js
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import colors from '../styles/colors';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | danger
  loading = false,
  disabled = false,
  style,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isOutline = variant === 'outline';

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    outline: 'transparent',
    danger: colors.danger,
  }[variant];

  const textColor = isOutline ? colors.primary : colors.white;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor },
        isOutline && { borderWidth: 1.5, borderColor: colors.primary },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
