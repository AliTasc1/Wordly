import { useCallback, useState } from 'react';

export type OptionState = 'idle' | 'ok' | 'bad' | 'off';

/**
 * Mirrors `quiz(opts, ans, pickKey, onRight)` from the design logic: the first
 * tap locks the answer in, the correct option turns green, the tapped wrong one
 * turns red, and everything else dims.
 */
export function useQuiz(answer: number, onPick?: (index: number, correct: boolean) => void) {
  const [picked, setPicked] = useState<number | null>(null);

  const pick = useCallback(
    (index: number) => {
      if (picked !== null) return;
      setPicked(index);
      onPick?.(index, index === answer);
    },
    [picked, answer, onPick],
  );

  const stateOf = useCallback(
    (index: number): OptionState => {
      if (picked === null) return 'idle';
      if (index === answer) return 'ok';
      if (index === picked) return 'bad';
      return 'off';
    },
    [picked, answer],
  );

  const markOf = useCallback(
    (index: number) => {
      if (picked === null) return '';
      if (index === answer) return '✓';
      if (index === picked) return '✕';
      return '';
    },
    [picked, answer],
  );

  const reset = useCallback(() => setPicked(null), []);

  return {
    picked,
    answered: picked !== null,
    correct: picked === answer,
    pick,
    stateOf,
    markOf,
    reset,
  };
}
