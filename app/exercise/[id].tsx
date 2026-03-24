import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { HistoryRow } from '../../components';
import { Colors, Typography } from '../../constants';
import {
  getExercise,
  getLogEntries,
  getMaxWeight,
  deleteLogEntry,
  formatPrimaryMuscle,
  formatSecondaryMuscles,
  formatEquipmentDetail,
  formatWeight,
  formatDate,
  isDumbbellExercise,
  formatExerciseName,
} from '../../data';
import { Exercise, LogEntry } from '../../types';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    fromSearch?: string;
    exerciseId?: string;
    exerciseName?: string;
    exerciseEquipment?: string;
    exerciseBodyPart?: string;
    exerciseTarget?: string;
    exerciseSecondaryMuscles?: string;
    exerciseGifUrl?: string;
  }>();
  const id = params.id;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [maxWeight, setMaxWeight] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      // Try to load from storage first
      let exerciseData = await getExercise(id);

      // If not in storage but we have params from search, build exercise from params
      if (!exerciseData && params.fromSearch === 'true' && params.exerciseName) {
        exerciseData = {
          id: params.exerciseId ?? id,
          name: params.exerciseName ?? '',
          equipment: params.exerciseEquipment ?? '',
          bodyPart: params.exerciseBodyPart ?? '',
          target: params.exerciseTarget ?? '',
          secondaryMuscles: params.exerciseSecondaryMuscles
            ? JSON.parse(params.exerciseSecondaryMuscles)
            : [],
          gifUrl: params.exerciseGifUrl ?? '',
        };
      }

      const [entries, max] = await Promise.all([
        getLogEntries(id),
        getMaxWeight(id),
      ]);

      setExercise(exerciseData);
      setLogEntries(entries);
      setMaxWeight(max);
    } catch (error) {
      console.error('Failed to load exercise data:', error);
    }
  }, [id, params]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBack = () => {
    router.back();
  };

  const handleLogWeight = () => {
    if (!exercise) return;

    router.push({
      pathname: '/log-weight',
      params: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseEquipment: exercise.equipment,
        exerciseBodyPart: exercise.bodyPart,
        exerciseTarget: exercise.target,
        exerciseSecondaryMuscles: JSON.stringify(exercise.secondaryMuscles),
        exerciseGifUrl: exercise.gifUrl,
      },
    });
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteLogEntry(entryId);

    // Reload data after deletion
    loadData();

    // Check if all entries were deleted - navigate back home
    const remainingEntries = await getLogEntries(id!);
    if (remainingEntries.length === 0) {
      router.replace('/');
    }
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasHistory = logEntries.length > 0;
  const equipmentDisplay = isDumbbellExercise(exercise.equipment)
    ? '2 × Dumbbell'
    : formatEquipmentDetail(exercise.equipment);

  // Calculate which entry should show the PR badge at display time
  // Rules: highest weight wins; if tied, most recent date wins
  const prEntry = hasHistory
    ? logEntries.reduce((best, current) => {
        if (current.weight > best.weight) {
          return current;
        }
        if (current.weight === best.weight && current.date > best.date) {
          return current;
        }
        return best;
      }, logEntries[0])
    : null;

  // Debug: Log gifUrl being rendered
  console.log('[ExerciseDetail] Rendering gif:', exercise.name, 'gifUrl:', exercise.gifUrl);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GIF */}
        <View style={styles.gifContainer}>
          <Image
            source={{ uri: exercise.gifUrl }}
            style={styles.gif}
            contentFit="contain"
            transition={200}
            onError={(e) => console.log('[ExerciseDetail] Image load error:', exercise.name, e)}
          />
        </View>

        {/* Exercise Name */}
        <Text style={styles.name}>{formatExerciseName(exercise.name)}</Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>PRIMARY</Text>
            <Text style={styles.metadataValue}>
              {formatPrimaryMuscle(exercise.target)}
            </Text>
          </View>
          {exercise.secondaryMuscles.length > 0 && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>SECONDARY</Text>
              <Text style={styles.metadataValue}>
                {formatSecondaryMuscles(exercise.secondaryMuscles)}
              </Text>
            </View>
          )}
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>EQUIPMENT</Text>
            <Text style={styles.metadataValue}>{equipmentDisplay}</Text>
          </View>
        </View>

        {/* Max Weight Card or Empty State */}
        <View style={styles.maxCard}>
          {hasHistory && maxWeight !== null ? (
            <>
              <View style={styles.maxWeightContainer}>
                <Text style={styles.maxWeight}>{maxWeight}</Text>
                <Text style={styles.maxUnit}>kg</Text>
              </View>
              {prEntry && (
                <Text style={styles.maxDate}>{formatDate(prEntry.date)}</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>Zero reps logged. Unacceptable.</Text>
          )}
        </View>

        {/* History */}
        {hasHistory && (
          <View style={styles.historySection}>
            <Text style={styles.historyLabel}>HISTORY</Text>
            {logEntries.map((entry) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                showPR={entry.id === prEntry?.id}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))}
          </View>
        )}

        {/* Bottom padding for button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Log Weight Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.logButton} onPress={handleLogWeight}>
          <Text style={styles.logButtonText}>LOG WEIGHT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
  },
  gifContainer: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.cardBackground,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  metadata: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  maxCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  maxWeightContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  maxWeight: {
    fontSize: 56,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  maxUnit: {
    fontSize: Typography.sizes.xl,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  maxDate: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historyLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bottomPadding: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 0.5,
  },
});
