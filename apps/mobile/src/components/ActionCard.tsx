import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionCardProps {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
  isLoading?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, iconName, color, onPress, isLoading }) => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#1E1E1E' : '#fff';
  const textColor = isDark ? '#EEE' : '#333';

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color, backgroundColor: cardBg }]} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}25` }]}>
        <MaterialCommunityIcons name={iconName} size={32} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={color} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  loaderContainer: {
    marginLeft: 16,
  },
});
