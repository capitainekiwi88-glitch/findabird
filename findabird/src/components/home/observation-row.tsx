import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-color-scheme';

type Props = {
  name: string;
  meta: string;
  image: ImageSourcePropType;
  onPress?: () => void;
};

export function ObservationRow({ name, meta, image, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: colors.backgroundElement }]}>
        <Image source={image} style={styles.thumbImage} resizeMode="contain" />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumbImage: { width: 32, height: 32 },
  texts: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});