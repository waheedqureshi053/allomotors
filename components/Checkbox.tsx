import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Checkbox = ({ checked = false, onPress = () => {}, style = {} }) => {

  return (
    <TouchableOpacity onPress={onPress} style={[styles.checkbox, style]}>
      {checked ? (
        <MaterialIcons name="check-box" size={24} color="#F2522E" />
      ) : (
        <MaterialIcons name="check-box-outline-blank" size={24} color="#757575" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    padding: 4,
  },
});

export default Checkbox;