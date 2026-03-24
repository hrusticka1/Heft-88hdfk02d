import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Typography } from '../constants';
import { LogEntry } from '../types';
import { formatWeight, formatDate } from '../data/formatting';

type HistoryRowProps = {
  entry: LogEntry;
  showPR: boolean;
  onDelete: () => void;
};

export function HistoryRow({ entry, showPR, onDelete }: HistoryRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Alert.alert(
      'Delete this entry?',
      "This can't be undone.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete();
          },
        },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.weight}>{formatWeight(entry.weight)}</Text>
          {showPR && (
            <View style={styles.prBadge}>
              <Text style={styles.prText}>PR</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{formatDate(entry.date)}</Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weight: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  prBadge: {
    backgroundColor: Colors.prBadge,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  prText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.prBadgeText,
  },
  date: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
  },
  deleteAction: {
    width: 80,
    marginBottom: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.destructive,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deleteText: {
    color: Colors.destructiveText,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
