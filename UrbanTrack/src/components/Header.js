// src/components/Header.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors';

export default function Header({ title, subtitle, showBack = false, rightIcon, onRightPress }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={[colors.background, colors.backgroundElevated]} style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <Animated.View style={[styles.row, { opacity, transform: [{ translateY }] }]}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Ionicons name={rightIcon} size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },
});
