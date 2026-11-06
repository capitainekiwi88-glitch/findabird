import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// async pour éviter un crash en période de test !
async function getModel() {
  return await import("@/lib/birdModel");
}
type Result = { species: string; score: number };

export default function IdentifierScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModel()
      .then((m) => m.loadModel())
      .catch((e) => console.warn("Modèle indisponible :", e));
  }, []);

  async function analyse(uri: string) {
    setPhotoUri(uri);
    setLoading(true);
    try {
      const m = await getModel();
      setResults(await m.identify(uri));
    } catch (e) {
      console.warn(e);
      setResults([
        { species: "TEST (IA indisponible dans Expo Go le temps du dev interface)", score: 0.99 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo) await analyse(photo.uri);
  }

  async function pickFromGallery() {
    const pick = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!pick.canceled) await analyse(pick.assets[0].uri);
  }

  function reset() {
    setPhotoUri(null);
    setResults([]);
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.text}>L'accès à la caméra est nécessaire.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Autoriser la caméra</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Écran résultat
  if (photoUri) {
    const best = results[0];
    return (
      <SafeAreaView style={styles.result}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        {loading && <ActivityIndicator size="large" />}
        {!loading && best && (
          <View style={styles.card}>
            {best.score < 0.5 && (
              <Text style={styles.warning}>
                Je ne suis pas sûr. Essayez une photo plus nette ou plus proche.
              </Text>
            )}
            {results.map((r) => (
              <Text key={r.species} style={styles.line}>
                {r.species} : {(r.score * 100).toFixed(0)} %
              </Text>
            ))}
          </View>
        )}
        <Pressable style={styles.btn} onPress={reset}>
          <Text style={styles.btnText}>Nouvelle photo</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Écran caméra
  return (
    <View style={styles.flex}>
      <CameraView ref={cameraRef} style={styles.flex} facing="back" />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Placez l'oiseau dans le cadre</Text>
      </View>
      <SafeAreaView style={styles.controls} edges={["bottom"]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={30} color="#fff" />
        </Pressable>
        <Pressable onPress={takePhoto} style={styles.shutter} />
        <Pressable onPress={pickFromGallery} hitSlop={12}>
          <Ionicons name="images-outline" size={30} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  text: { fontSize: 16 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "88%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 24,
  },
  hint: { color: "#fff", marginTop: 16, fontSize: 14 },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 16,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#ccc",
  },
  result: { flex: 1, padding: 20, gap: 16 },
  preview: { width: "100%", aspectRatio: 1, borderRadius: 20 },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 6,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  warning: { fontWeight: "600", marginBottom: 6 },
  line: { fontSize: 17 },
  btn: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
