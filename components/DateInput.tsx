import { useGlobalStyles } from '@/app/_styles/globalStyle';
import { Colors } from '@/constants/theme';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Platform, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
interface DateInputProps {
  onDateChange: (date: Date) => void;
}
const DateInput: React.FC<DateInputProps> = ({ onDateChange }) => {
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  // Validate and combine date when any part changes
  useEffect(() => {
    if (day && month && year) {
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10) - 1; // JS months are 0-11
      const yearNum = parseInt(year, 10);

      // Basic validation
      if (isNaN(dayNum)) {
        setError('Invalid day');
        return;
      }
      if (isNaN(monthNum)) {
        setError('Invalid month');
        return;
      }
      if (isNaN(yearNum)) {
        setError('Invalid year');
        return;
      }
      // Check if date is valid
      const testDate = new Date(yearNum, monthNum, dayNum);
      if (
        testDate.getDate() !== dayNum ||
        testDate.getMonth() !== monthNum ||
        testDate.getFullYear() !== yearNum
      ) {
        setError('Invalid date');
        return;
      }

      setError('');
      onDateChange(testDate);
    }
  }, [day, month, year]);

  // Format input to ensure numbers only
  const handleDayChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || (parseInt(numericValue, 10) >= 1 && parseInt(numericValue, 10) <= 31)) {
      setDay(numericValue);
    }
  };

  const handleMonthChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || (parseInt(numericValue, 10) >= 1 && parseInt(numericValue, 10) <= 12)) {
      setMonth(numericValue);
    }
  };

  const handleYearChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || numericValue.length <= 4) {
      setYear(numericValue);
    }
  };

 

  return (
    <View>
      <View className='flex flex-row py-2'>
        <View className='flex flex-row items-center mr-5'>
          <TextInput
            style={[styles.input, { minWidth: 50 }]}
            placeholderTextColor={Colors[colorScheme ?? 'light'].light}
            placeholder="MM"
            value={month}
            onChangeText={handleMonthChange}
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText className='text-2xl mx-2'>/</ThemedText>
        </View>
        <View className='flex flex-row items-center mr-5'>
          <TextInput
            style={[styles.input, { minWidth: 50 }]}
            placeholderTextColor={Colors[colorScheme ?? 'light'].light}
            placeholder="DD"
            value={day}
            onChangeText={handleDayChange}
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText className='text-2xl mx-2' >/</ThemedText>
        </View>
        <View className='flex flex-row items-center mr-5'>
          <TextInput
            style={[styles.input, { minWidth: 70 }]}
            placeholderTextColor={Colors[colorScheme ?? 'light'].light}
            placeholder="YYYY"
            value={year}
            onChangeText={handleYearChange}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </View>
      {error ? <Text style={styles.colorDanger}>{error}</Text> : null}
    </View>
  );
};



export default DateInput;