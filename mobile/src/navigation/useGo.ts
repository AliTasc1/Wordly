import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { go, reset, ScreenId } from './routes';

/** `go(id)` / `reset(id)`, matching the design's navigation vocabulary. */
export function useGo() {
  return { go, reset };
}

/**
 * Back control. Pops the stack when there is somewhere to pop to, and
 * otherwise lands on the screen the design's `‹` button pointed at.
 */
export function useBack(fallback: ScreenId) {
  const navigation = useNavigation();
  return useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else go(fallback);
  }, [navigation, fallback]);
}
