// src/components/Input.js
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  icon,
}) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error && styles.inputError, multiline && styles.multilineContainer]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.icon} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[styles.input, multiline && styles.multilineInput]}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
