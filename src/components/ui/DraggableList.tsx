import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface DraggableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (data: T[]) => void;
  itemHeight?: number;
}



export function DraggableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight = 80,
}: DraggableListProps<T>) {
  const handleDragEndWithTranslation = useCallback(
    (fromIndex: number, translationY: number) => {
      const moveBy = Math.round(translationY / itemHeight);
      if (moveBy === 0) return;
      const toIndex = Math.max(0, Math.min(data.length - 1, fromIndex + moveBy));
      if (toIndex === fromIndex) return;
      const newData = [...data];
      const [moved] = newData.splice(fromIndex, 1);
      newData.splice(toIndex, 0, moved);
      onReorder(newData);
    },
    [data, itemHeight, onReorder],
  );

  return (
    <View>
      {data.map((item, index) => {
        const key = keyExtractor(item);
        return (
          <DraggableItemWithEnd
            key={key}
            item={item}
            index={index}
            renderItem={renderItem}
            itemHeight={itemHeight}
            onReorder={(fromIndex, translationY) =>
              handleDragEndWithTranslation(fromIndex, translationY)
            }
          />
        );
      })}
    </View>
  );
}

function DraggableItemWithEnd<T>({
  item,
  index,
  renderItem,
  itemHeight,
  onReorder,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  onReorder: (fromIndex: number, translationY: number) => void;
}) {
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const zIdx = useSharedValue(0);
  const lastTranslation = useRef(0);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      isActive.value = true;
      zIdx.value = 100;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
      lastTranslation.current = e.translationY;
    })
    .onEnd(() => {
      const finalY = lastTranslation.current;
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      isActive.value = false;
      zIdx.value = 0;
      runOnJS(onReorder)(index, finalY);
      lastTranslation.current = 0;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: isActive.value ? 1.03 : 1 }],
    zIndex: zIdx.value,
    opacity: isActive.value ? 0.85 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.item, animStyle]}>
        <View style={styles.itemContent}>{renderItem(item, index)}</View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: SPACING.sm,
  },
  itemContent: {
    flex: 1,
  },
});
