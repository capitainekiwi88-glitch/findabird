import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-color-scheme';

type Props = { title: string; subtitle?: string; onSeeAll?: () => void };

export function SectionHeader({ title, subtitle, onSeeAll }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={[styles.link, { color: colors.primary }]}>Tout voir</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  link: { fontSize: 12, fontWeight: '700' },
});