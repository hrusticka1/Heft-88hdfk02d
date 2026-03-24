import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography } from '../constants';
import {
  saveExercise,
  saveLogEntry,
  createLogEntry,
  getLastLogEntry,
  formatEquipmentLabel,
  isDumbbellExercise,
  formatExerciseName,
  setSelectedCategory,
} from '../data';
import { getMuscleGroup } from '../constants';
import { Exercise } from '../types';

export default function LogWeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
    exerciseEquipment: string;
    exerciseBodyPart: string;
    exerciseTarget: string;
    exerciseSecondaryMuscles: string;
    exerciseGifUrl: string;
  }>();

  const inputRef = useRef<TextInput>(null);
  const [weight, setWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Build exercise object from params
  const exercise: Exercise = {
    id: params.exerciseId ?? '',
    name: params.exerciseName ?? '',
    equipment: params.exerciseEquipment ?? '',
    bodyPart: params.exerciseBodyPart ?? '',
    target: params.exerciseTarget ?? '',
    secondaryMuscles: params.exerciseSecondaryMuscles
      ? JSON.parse(params.exerciseSecondaryMuscles)
      : [],
    gifUrl: params.exerciseGifUrl ?? '',
  };

  // Auto-focus input and pre-fill with last logged weight
  useEffect(() => {
    const loadLastWeight = async () => {
      const lastEntry = await getLastLogEntry(exercise.id);
      if (lastEntry) {
        setWeight(lastEntry.weight.toString());
      }
    };

    loadLastWeight();

    // Focus input after a short delay to ensure keyboard opens
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [exercise.id]);

  const handleBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  const handleSave = async () => {
    const weightNum = parseFloat(weight);

    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.');
      return;
    }

    setIsSaving(true);

    try {
      // Save exercise metadata (idempotent - will be cached on first log)
      await saveExercise(exercise);

      // Create and save log entry (isPR is calculated for the PR badge on history row)
      const entry = await createLogEntry(exercise.id, weightNum);
      await saveLogEntry(entry);

      // Store the category for Home screen to pick up
      const category = getMuscleGroup(exercise.bodyPart, exercise.target);
      await setSelectedCategory(category);

      Keyboard.dismiss();

      // Dismiss all modals (including search) and navigate to exercise detail
      // This creates the stack: Home → Exercise Detail
      router.dismissAll();
      router.push(`/exercise/${exercise.id}`);
    } catch (error) {
      console.error('Failed to save log entry:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const equipmentLabel = formatEquipmentLabel(exercise.equipment);
  const isDumbbell = isDumbbellExercise(exercise.equipment);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving || !weight}
        >
          <Text
            style={[
              styles.saveText,
              (isSaving || !weight) && styles.saveTextDisabled,
            ]}
          >
            SAVE
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{formatExerciseName(exercise.name)}</Text>

        <View style={styles.inputSection}>
          <Text style={styles.equipmentLabel}>{equipmentLabel}</Text>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              maxLength={6}
            />
            <Text style={styles.unitLabel}>kg</Text>
          </View>

          <View style={styles.underline} />
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  saveTextDisabled: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  name: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 32,
  },
  inputSection: {
    paddingRight: 40,
  },
  equipmentLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightInput: {
    flex: 1,
    fontSize: 64,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  unitLabel: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.textMuted,
    marginLeft: 8,
  },
  underline: {
    height: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    borderRadius: 2,
  },
});
