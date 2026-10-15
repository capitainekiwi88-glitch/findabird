import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeroCard } from '@/components/home/hero-card';
import { ObservationRow } from '@/components/home/observation-row';
import { SectionHeader } from '@/components/home/section-header';
import { Frequency, SpeciesCard } from '@/components/home/species-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-color-scheme';


// Données de tests (bientot sur Supabase)
const PROBABLE: { id: string; name: string; frequency: Frequency; image: any }[] = [
  { id: '1', name: 'Rouge-gorge familier', frequency: 'very-frequent', image: require('@/assets/images/birds/rouge-gorge-familier.png') },
  { id: '2', name: 'Mésange charbonnière', frequency: 'frequent', image: require('@/assets/images/birds/mesange-charbonniere.png') },
  { id: '3', name: 'Martin-pêcheur', frequency: 'rare', image: require('@/assets/images/birds/martin-pecheur-deurope.png') },
];

const LAST_OBS = [
  { id: '1', name: 'Mésange bleue', meta: "Aujourd'hui, 8 h 12, au jardin", image: require('@/assets/images/birds/mesange-bleue.png') },
  { id: '2', name: 'Merle noir', meta: 'Hier, 18 h 40, parc des Saules', image: require('@/assets/images/birds/merle-noir.png') },
];

export default function HomeScreen() {
  const colors = useColors();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
        showsVerticalScrollIndicator={false}>

        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.date, { color: colors.textSecondary }]}>Jeudi 17 septembre</Text>
            <Text style={[styles.greeting, { color: colors.text }]}>Bonjour Camille</Text>
          </View>
          <View style={[styles.bell, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={[styles.bellDot, { backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Hero */}
        <HeroCard
          onPhoto={() => router.push('/identifier')}
        />

        {/* Probables cette semaine */}
        <View style={styles.section}>
          <SectionHeader
            title="Probables cette semaine"
            subtitle="Selon votre position et la saison"
            onSeeAll={() => router.push('/explore')}
          />
        </View>
        <FlatList
          horizontal
          data={PROBABLE}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          style={styles.carouselBleed}
          renderItem={({ item }) => (
            <SpeciesCard name={item.name} image={item.image} frequency={item.frequency} />
          )}
        />

        {/* Dernières observations */}
        <View style={styles.section}>
          <SectionHeader title="Vos dernières observations" />
        </View>
        <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
          {LAST_OBS.map((obs, index) => (
            <View key={obs.id}>
              {index > 0 && <View style={[styles.separator, { backgroundColor: colors.background }]} />}
              <ObservationRow name={obs.name} meta={obs.meta} image={obs.image} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12 },
  greeting: { fontSize: 26, fontWeight: '800' },
  bell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4 },
  section: { marginTop: 8 },

  carouselBleed: { marginHorizontal: -20 }, // debordement du logo au milieu 
  carousel: { paddingHorizontal: 20, gap: 10 },
  listCard: { borderRadius: 20, overflow: 'hidden' },
  separator: { height: 1, marginHorizontal: 12 },
});