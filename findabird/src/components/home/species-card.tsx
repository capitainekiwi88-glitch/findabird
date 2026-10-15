import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-color-scheme';

export type Frequency = 'very-frequent' | 'frequent' | 'rare';

const LABELS: Record<Frequency, string> = {
  'very-frequent': 'Très fréquent',
  frequent: 'Fréquent',
  rare: 'Rare ici',
};

type Props = { name: string; image: ImageSourcePropType; frequency: Frequency };

export function SpeciesCard({ name, image, frequency }: Props) {
  const colors = useColors();
  const badge =
    frequency === 'rare'
      ? { bg: colors.accentSoft, fg: colors.onAccentSoft }
      : { bg: colors.successSoft, fg: colors.onSuccessSoft };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.imageBox, { backgroundColor: colors.backgroundElement }]}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
        {name}
      </Text>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.fg }]}>{LABELS[frequency]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 130, borderRadius: 20, padding: 10, gap: 8 },
  imageBox: { height: 92, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  image: { width: 64, height: 64 },
  name: { fontSize: 12, fontWeight: '700', minHeight: 30 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});