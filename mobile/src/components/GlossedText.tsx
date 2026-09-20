import React, { useMemo } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Txt } from './Txt';
import type { Gloss } from '../content';

/**
 * Renders an English passage with every glossed word tappable.
 *
 * The design marked two words by hand. Real passages carry a glossary of up to
 * eight per cent of their tokens, so the marking is derived instead: the text
 * is split on word boundaries and each token is looked up in the glossary.
 *
 * The lookup is case-insensitive and tries the token's own form first, then a
 * few regular endings — a glossary lists `flavor` while the passage may say
 * `flavors`. Multi-word entries ("take away", "in a hurry") are matched on
 * their first word, which is where the learner taps.
 */
export function GlossedText({
  text,
  glossary,
  onWord,
  size = 15,
  style,
}: {
  text: string;
  glossary: Gloss[];
  onWord: (gloss: Gloss) => void;
  size?: number;
  style?: TextStyle;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const lookup = useMemo(() => {
    const map = new Map<string, Gloss>();
    for (const gloss of glossary) {
      const key = gloss.w.toLowerCase();
      map.set(key, gloss);
      const first = key.split(' ')[0];
      if (!map.has(first)) map.set(first, gloss);
    }
    return map;
  }, [glossary]);

  const find = (token: string): Gloss | undefined => {
    const word = token.toLowerCase();
    const candidates = [word];
    if (word.endsWith('s')) candidates.push(word.slice(0, -1));
    if (word.endsWith('es')) candidates.push(word.slice(0, -2));
    if (word.endsWith('ed')) candidates.push(word.slice(0, -2), word.slice(0, -1));
    if (word.endsWith('ing')) candidates.push(word.slice(0, -3), `${word.slice(0, -3)}e`);
    if (word.endsWith('ly')) candidates.push(word.slice(0, -2));
    for (const candidate of candidates) {
      const hit = lookup.get(candidate);
      if (hit) return hit;
    }
    return undefined;
  };

  // Keeping the separators in the split means punctuation and spacing survive
  // untouched; only the word tokens are examined.
  const parts = text.split(/([A-Za-z'’-]+)/);

  return (
    <Txt s={size} lh={1.75} c={t.colors.textBright} style={style}>
      {parts.map((part, i) => {
        const gloss = i % 2 === 1 ? find(part) : undefined;
        if (!gloss) return <React.Fragment key={i}>{part}</React.Fragment>;
        return (
          <Txt
            key={i}
            s={size}
            w={600}
            style={styles.glossed}
            onPress={() => onWord(gloss)}
            accessibilityRole="button"
            accessibilityLabel={`${part}: ${gloss.tr}`}>
            {part}
          </Txt>
        );
      })}
    </Txt>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  glossed: {
    backgroundColor: 'rgba(46,107,255,.22)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: t.colors.link,
  },
});
