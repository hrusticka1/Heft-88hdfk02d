import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants';

type FABProps = {
  onPress: () => void;
  style?: ViewStyle;
};

export function FAB({ onPress, style }: FABProps) {
  return (
    <Pressable
      style={[styles.fab, style]}
      onPress={onPress}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.textOnPrimary,
    marginTop: -2,
  },
});
