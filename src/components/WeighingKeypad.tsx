import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';

interface WeighingKeypadProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function WeighingKeypad({
  value,
  onValueChange,
  onSubmit,
  disabled,
}: WeighingKeypadProps) {
  const handleDigit = (digit: string) => {
    onValueChange(value + digit);
  };

  const handleComma = () => {
    if (value.includes('.')) return;
    onValueChange(value + '.');
  };

  const handleBackspace = () => {
    onValueChange(value.slice(0, -1));
  };

  const renderKey = (
    label: string | React.ReactNode,
    onPress: () => void,
    key: string
  ) => (
    <Pressable
      key={key}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
      onPress={onPress}
      android_ripple={{ color: '#D7CCC8' }}
    >
      {typeof label === 'string' ? (
        <Text style={styles.keyText}>{label}</Text>
      ) : (
        label
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderKey('1', () => handleDigit('1'), '1')}
        {renderKey('2', () => handleDigit('2'), '2')}
        {renderKey('3', () => handleDigit('3'), '3')}
      </View>
      <View style={styles.row}>
        {renderKey('4', () => handleDigit('4'), '4')}
        {renderKey('5', () => handleDigit('5'), '5')}
        {renderKey('6', () => handleDigit('6'), '6')}
      </View>
      <View style={styles.row}>
        {renderKey('7', () => handleDigit('7'), '7')}
        {renderKey('8', () => handleDigit('8'), '8')}
        {renderKey('9', () => handleDigit('9'), '9')}
      </View>
      <View style={styles.row}>
        {renderKey(',', handleComma, 'comma')}
        {renderKey('0', () => handleDigit('0'), '0')}
        {renderKey(
          <Icon source="backspace-outline" size={28} color="#3E2723" />,
          handleBackspace,
          'backspace'
        )}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitPressed,
          disabled && styles.submitDisabled,
        ]}
        onPress={onSubmit}
        disabled={disabled}
        android_ripple={{ color: '#4E342E' }}
      >
        <Text style={styles.submitText}>Speichern</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#EFEBE9',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  key: {
    flex: 1,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  keyPressed: {
    backgroundColor: '#D7CCC8',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#3E2723',
  },
  submitButton: {
    height: 72,
    backgroundColor: '#6D4C41',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  submitPressed: {
    backgroundColor: '#4E342E',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
