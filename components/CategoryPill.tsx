import { Pressable, Text, StyleSheet } from 'react-native';
import { MuscleGroup } from '../constants/muscleGroupMap';

type CategoryPillProps = {
  category: MuscleGroup;
  isActive: boolean;
  onPress: () => void;
};

export function CategoryPill({ category, isActive, onPress }: CategoryPillProps) {
  return (
    <Pressable
      style={[styles.pill, isActive && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.text, isActive && styles.textActive]}>
        {category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E8EAED',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#3E3EE0',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#363D45',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
