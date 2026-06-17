import React from 'react';
import { Text, StyleSheet, View, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';

interface ActionCardProps {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
  isLoading?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, iconName, color, onPress, isLoading }) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={iconName} size={36} color={color} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={color} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    minHeight: 140,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
