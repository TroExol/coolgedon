import { useEffect } from 'react';
import { useAnimationControls } from 'framer-motion';

export const useHeartBeatAnimation = (value: unknown) => {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start({ scale: 1.4 })
      .then(() => controls.start({ scale: 1 }));
    return controls.stop;
  }, [controls, value]);

  return controls;
};
