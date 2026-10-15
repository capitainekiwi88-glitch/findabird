import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';

import { useColors } from '@/hooks/use-color-scheme';

// À REMPLACER par l'adresse de ton API (Render ou Hugging Face)
const API_URL = 'https://birder-api.onrender.com';

type Prediction = { species: string; confidence: number };

export default function IdentifierScreen() {
  const colors = useColors();
  const [uri, setUri] = useState<string | null>(null);
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (photoUri: string) => {
    setLoading(true);
    setError(null);
    setResults([]);

    // Version gratuit donc peut prendre du temps
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const uploadUrl = `${API_URL}/predict`;

      const upload = await FileSystem.uploadAsync(uploadUrl, photoUri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: 'image/jpeg',
        headers: {
          Accept: 'application/json',
        },
      });

      if (upload.status < 200 || upload.status >= 300) {
        throw new Error(`HTTP ${upload.status} : ${upload.body}`);
      }

      const data = JSON.parse(upload.body);
      setResults(data.predictions);
      

      
      } catch (e: any) {
        console.error('Erreur analyse photo :', e);
        setError(e.message ?? String(e));
      } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const pick = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Autorisation refusée. Active-la dans les réglages du téléphone.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled) return;

    const photoUri = result.assets[0].uri;
    setUri(photoUri);
    analyze(photoUri);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Qui est-ce ?</Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => pick(true)}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Photo</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => pick(false)}>
            <Ionicons name="images-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Galerie</Text>
          </Pressable>
        </View>

        {/* Aperçu */}
        {uri && <Image source={{ uri }} style={styles.preview} resizeMode="cover" />}

        {/* Chargement */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Analyse en cours… la première fois, ça peut prendre jusqu'à une minute.
            </Text>
          </View>
        )}

        {/* Erreur */}
        {error && <Text style={{ color: colors.accent }}>{error}</Text>}

        {/* Résultats */}
        {results.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {results.map((p, index) => (
              <View key={p.species} style={styles.result}>
                <View style={styles.resultTop}>
                  <Text style={[styles.species, { color: colors.text, fontSize: index === 0 ? 17 : 14 }]}>
                    {p.species}
                  </Text>
                  <Text style={[styles.percent, { color: colors.textSecondary }]}>
                    {(p.confidence * 100).toFixed(1)} %
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.backgroundElement }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: colors.primary, width: `${Math.max(p.confidence * 100, 2)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  buttons: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  preview: { width: '100%', height: 260, borderRadius: 20 },
  center: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  card: { borderRadius: 20, padding: 16, gap: 14 },
  result: { gap: 6 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  species: { fontWeight: '700', flexShrink: 1 },
  percent: { fontSize: 13 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});