import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export function useColors() {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}