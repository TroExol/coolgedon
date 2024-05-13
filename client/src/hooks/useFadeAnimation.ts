import { useEffect } from 'react';
import { useAnimationControls } from 'framer-motion';

export const useFadeAnimation = (value: unknown) => {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start({ scale: 0 })
      .then(() => controls.start({ scale: 1 }));
    return controls.stop;
  }, [controls, value]);

  return controls;
};
