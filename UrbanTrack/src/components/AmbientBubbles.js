import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const BUBBLES = [
  { size: 150, top: '8%', left: '-20%', color: 'rgba(124,92,252,0.14)', duration: 9000, x: 34, y: 42 },
  { size: 100, top: '29%', right: '-10%', color: 'rgba(30,214,165,0.10)', duration: 7600, x: -28, y: 35 },
  { size: 72, bottom: '19%', left: '8%', color: 'rgba(167,149,255,0.13)', duration: 6800, x: 22, y: -30 },
  { size: 180, bottom: '-9%', right: '-24%', color: 'rgba(102,165,255,0.10)', duration: 10500, x: -36, y: -28 },
];

function Bubble({ bubble }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: bubble.duration, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: bubble.duration, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.bubble, {
    width: bubble.size, height: bubble.size, borderRadius: bubble.size / 2, backgroundColor: bubble.color,
    top: bubble.top, bottom: bubble.bottom, left: bubble.left, right: bubble.right,
    transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, bubble.x] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, bubble.y] }) }, { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
  }]} />;
}

export default function AmbientBubbles() {
  return <View pointerEvents="none" style={styles.layer}>{BUBBLES.map((bubble, index) => <Bubble key={index} bubble={bubble} />)}</View>;
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: 50 },
  bubble: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.035)' },
});
