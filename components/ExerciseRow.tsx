import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography } from '../constants';
import { Exercise } from '../types';
import { formatWeight, formatDumbbellWeight, isDumbbellExercise, formatExerciseName } from '../data/formatting';

type ExerciseRowProps = {
  exercise: Exercise;
  maxWeight: number | null;
  onPress: () => void;
};

export function ExerciseRow({ exercise, maxWeight, onPress }: ExerciseRowProps) {
  // Debug: Log gifUrl being rendered
  console.log('[ExerciseRow] Rendering:', exercise.name, 'gifUrl:', exercise.gifUrl);

  const weightDisplay = maxWeight !== null
    ? isDumbbellExercise(exercise.equipment)
      ? formatDumbbellWeight(maxWeight)
      : formatWeight(maxWeight)
    : null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: exercise.gifUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
          onError={(e) => console.log('[ExerciseRow] Image load error:', exercise.name, e)}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {formatExerciseName(exercise.name)}
        </Text>
        {weightDisplay && (
          <Text style={styles.weight}>{weightDisplay}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  weight: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
