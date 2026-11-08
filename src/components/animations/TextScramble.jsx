import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

export default function TextScramble({
  text,
  className = '',
  as: Component = 'span',
  speed = 30,
  cycles = 2,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(shouldReduceMotion ? text : '');

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayText(text);
      return;
    }

    let frame = 0;
    const totalFrames = text.length * cycles;
    let timer;

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealedLength = Math.floor(progress * text.length);

      let output = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          output += ' ';
        } else if (i < revealedLength) {
          output += text[i];
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(output);

      if (frame < totalFrames) {
        timer = setTimeout(tick, speed);
      } else {
        setDisplayText(text);
      }
    };

    tick();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [text, speed, cycles, shouldReduceMotion]);

  return (
    <Component className={className}>
      {/* Screen-reader accessible full text */}
      <span className="sr-only">{text}</span>
      {/* Visual scramble representation */}
      <span aria-hidden="true">{displayText}</span>
    </Component>
  );
}
