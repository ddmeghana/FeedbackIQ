import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  ...props
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  const handleMouseMove = (e) => {
    if (!cardRef.current || shouldReduceMotion || isTouchDevice) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rY = (mouseX / (rect.width / 2)) * maxTilt;
    const rX = -(mouseY / (rect.height / 2)) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  if (shouldReduceMotion || isTouchDevice) {
    return (
      <div className={cn('surface-card rounded-2xl p-6 border border-border', className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={cn('surface-card rounded-2xl p-6 border border-border transition-shadow hover:shadow-card-dark', className)}
      {...props}
    >
      <div style={{ transform: 'translateZ(10px)' }}>{children}</div>
    </motion.div>
  );
}
