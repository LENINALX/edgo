// src/components/Card.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function Card({ children, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[styles.card, style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
