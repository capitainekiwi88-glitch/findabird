import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-color-scheme';

type Props = { onPhoto: () => void };

export function HeroCard({ onPhoto }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <Image
        source={require('@/assets/images/birds/rouge-gorge-familier.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
      <Text style={styles.title}>Qui est-ce ?</Text>
      <Text style={styles.text}>Une petite photo suffit.</Text>

      <View style={styles.buttons}>
        <Pressable style={[styles.button, styles.buttonLight]} onPress={onPhoto}>
          <Ionicons name="camera-outline" size={18} color="#151B33" />
          <Text style={[styles.buttonText, { color: '#151B33' }]}>Photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, gap: 8, overflow: 'hidden' },
  illustration: { position: 'absolute', right: -10, top: 10, width: 110, height: 110 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  text: { color: '#FFFFFF', fontSize: 13, maxWidth: '60%', lineHeight: 18 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLight: { backgroundColor: '#FFFFFF' },
  buttonGhost: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  buttonText: { fontSize: 14, fontWeight: '700' },
});