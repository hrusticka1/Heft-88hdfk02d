import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { CategoryPill, ExerciseRow, FAB, EmptyState, Logo } from '../components';
import { Colors, Typography, MUSCLE_GROUPS, exerciseBelongsToCategory } from '../constants';
import { getMyExercises, getMaxWeight, getAndClearSelectedCategory } from '../data';
import { Exercise } from '../types';
import type { MuscleGroup } from '../constants/muscleGroupMap';

type ExerciseWithMax = Exercise & { maxWeight: number | null };

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup>('Glutes');
  const [exercises, setExercises] = useState<ExerciseWithMax[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExercises = useCallback(async () => {
    try {
      const myExercises = await getMyExercises();

      // Load max weights for all exercises
      const exercisesWithMax = await Promise.all(
        myExercises.map(async (exercise) => {
          const maxWeight = await getMaxWeight(exercise.id);
          return { ...exercise, maxWeight };
        })
      );

      setExercises(exercisesWithMax);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload exercises and check for stored category when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkStoredCategory = async () => {
        const storedCategory = await getAndClearSelectedCategory();
        if (storedCategory && MUSCLE_GROUPS.includes(storedCategory as MuscleGroup)) {
          setSelectedCategory(storedCategory as MuscleGroup);
        }
      };

      checkStoredCategory();
      loadExercises();
    }, [loadExercises])
  );

  // Filter exercises by selected category
  // Matches if primary category OR any secondary muscle maps to the selected category
  const filteredExercises = exercises.filter((exercise) => {
    return exerciseBelongsToCategory(
      exercise.bodyPart,
      exercise.target,
      exercise.secondaryMuscles,
      selectedCategory
    );
  });

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  const handleAddPress = () => {
    router.push('/search');
  };

  const isFirstLaunch = exercises.length === 0 && !isLoading;
  const isCategoryEmpty = filteredExercises.length === 0 && !isFirstLaunch;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Logo height={32} />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsContainer}
        contentContainerStyle={styles.pillsContent}
      >
        {MUSCLE_GROUPS.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            isActive={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {isFirstLaunch ? (
          <EmptyState
            title="No workout yet"
            subtitle="Tap + to add your first exercise."
          />
        ) : isCategoryEmpty ? (
          <EmptyState
            title="No workout yet"
            subtitle={`Looks like you've been skipping ${selectedCategory.toLowerCase()}.`}
          />
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredExercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                maxWeight={exercise.maxWeight}
                onPress={() => handleExercisePress(exercise)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* FAB */}
      <FAB onPress={handleAddPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 2,
  },
  pillsContainer: {
    maxHeight: 56,
    marginTop: 24,
  },
  pillsContent: {
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    marginTop: 24,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for FAB
  },
});
