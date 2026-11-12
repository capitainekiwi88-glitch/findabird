import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, FlatList, PanResponder, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { BottomTabInset } from '@/constants/theme';
import { useColors } from '@/hooks/use-color-scheme';

/* ---------------- Données de test (bientôt Supabase) ---------------- */
type Filter = 'mine' | 'community' | 'week';
type Obs = {
  id: string; species: string; emoji: string;
  dLat: number; dLng: number; // décalage par rapport à ta position (en degrés)
  daysAgo: number; mine: boolean; sensitive?: boolean;
};

// Centre par défaut si la localisation est refusée : à changer
const DEFAULT_CENTER = { lat: 48.6921, lng: 6.1844 };

const OBS: Obs[] = [
  { id: 'm1', species: 'Mésange bleue', emoji: '🐦', dLat: 0.004, dLng: -0.006, daysAgo: 0, mine: true },
  { id: 'm2', species: 'Merle noir', emoji: '🐦', dLat: -0.003, dLng: -0.004, daysAgo: 1, mine: true },
  { id: 'm3', species: 'Martin-pêcheur d’Europe', emoji: '🐦', dLat: -0.001, dLng: 0.007, daysAgo: 2, mine: true },
  { id: 'm4', species: 'Rouge-gorge familier', emoji: '🐦', dLat: 0.002, dLng: 0.002, daysAgo: 12, mine: true },
  { id: 'c1', species: 'Sittelle torchepot', emoji: '🐦', dLat: 0.0035, dLng: 0.004, daysAgo: 1, mine: false },
  { id: 'c2', species: 'Sittelle torchepot', emoji: '🐦', dLat: 0.0045, dLng: 0.0045, daysAgo: 3, mine: false },
  { id: 'c3', species: 'Martin-pêcheur d’Europe', emoji: '🐦', dLat: -0.002, dLng: 0.009, daysAgo: 4, mine: false },
  { id: 's1', species: 'Faucon pèlerin', emoji: '🦅', dLat: 0.006, dLng: -0.001, daysAgo: 3, mine: false, sensitive: true },
];
// 12 observations proches l'une de l'autre, pour voir le regroupement
const CROWD: Obs[] = Array.from({ length: 12 }, (_, i) => ({
  id: `crowd${i}`, species: 'Mésange charbonnière', emoji: '🐦',
  dLat: -0.009 + Math.sin(i * 2.1) * 0.0008, dLng: 0.011 + Math.cos(i * 1.7) * 0.0008,
  daysAgo: i % 9, mine: false,
}));
const ALL: Obs[] = [...OBS, ...CROWD];
const BY_ID = new Map(ALL.map((o) => [o.id, o]));

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'mine', label: 'Mes observations' },
  { key: 'community', label: 'Communauté' },
  { key: 'week', label: 'Cette semaine' },
];

/* ---------------- Utilitaires ---------------- */
function distanceM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000, rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function formatDistance(m: number) {
  return m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

/* ---------------- La carte (Leaflet dans une WebView) ---------------- */
const MAP_HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html,body,#map{height:100%;margin:0;padding:0;background:#E6EBE3}
.leaflet-control-attribution{font-size:9px}
.pin{width:44px;height:44px;border-radius:50%;background:#fff;border:3px solid #fff;box-sizing:border-box;
 box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:22px}
.pin.sel{border-color:#E8C84A;transform:scale(1.2)}
.cluster{width:46px;height:46px;border-radius:50%;background:#4455CC;border:4px solid rgba(255,255,255,.65);
 box-sizing:border-box;color:#fff;font:800 16px sans-serif;display:flex;align-items:center;justify-content:center}
.zone-label{position:absolute;transform:translate(-50%,-50%);background:#fff;border-radius:12px;padding:4px 10px;
 font:700 11px sans-serif;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)}
</style></head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))}
if (typeof L === 'undefined') { send({type:'error'}); }
else {
  var map = L.map('map',{zoomControl:false}).setView([${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng}],14);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {maxZoom:19,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'}).addTo(map);
  var cluster = L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:50,
    iconCreateFunction:function(c){return L.divIcon({html:'<div class="cluster">'+c.getChildCount()+'</div>',className:'',iconSize:[46,46]})}}).addTo(map);
  var zones = L.layerGroup().addTo(map);
  var me = null, centered = false;
  window.setData = function(list){
    cluster.clearLayers(); zones.clearLayers();
    list.forEach(function(o){
      if (o.sensitive) {
        L.circle([o.lat,o.lng],{radius:400,color:'#4455CC',weight:1.5,dashArray:'5 5',fillColor:'#4455CC',fillOpacity:.1})
          .addTo(zones).on('click',function(){send({type:'select',id:o.id})});
        L.marker([o.lat,o.lng],{interactive:false,icon:L.divIcon({className:'',iconSize:[0,0],
          html:'<div class="zone-label">Position floutée · espèce sensible</div>'})}).addTo(zones);
      } else {
        L.marker([o.lat,o.lng],{icon:L.divIcon({className:'',iconSize:[44,44],iconAnchor:[22,22],
          html:'<div class="pin'+(o.sel?' sel':'')+'">'+o.emoji+'</div>'})})
          .on('click',function(){send({type:'select',id:o.id})}).addTo(cluster);
      }
    });
  };
  window.setUser = function(lat,lng){
    if (me) me.setLatLng([lat,lng]);
    else me = L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:3,fillColor:'#2D6CDF',fillOpacity:1}).addTo(map);
    if (!centered) { map.setView([lat,lng],14); centered = true; }
  };
  window.recenter = function(){ if (me) map.flyTo(me.getLatLng(),15); };
  window.flyTo = function(lat,lng){ map.flyTo([lat,lng],16,{duration:.6}); };
}
</script></body></html>`;

/* ---------------- La page ---------------- */
export default function CarteScreen() {
  const colors = useColors();
  const { height } = useWindowDimensions();
  const webRef = useRef<WebView>(null);

  const [filter, setFilter] = useState<Filter>('mine');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<{ lat: number; lng: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const origin = user ?? DEFAULT_CENTER;
  const run = useCallback((js: string) => webRef.current?.injectJavaScript(js + ';true;'), []);

  // Position de l'utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  // Observations visibles (filtre + recherche)
  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      ALL.filter((o) => {
        if (filter === 'mine' && !o.mine) return false;
        if (filter === 'community' && o.mine) return false;
        if (filter === 'week' && o.daysAgo > 7) return false;
        return o.species.toLowerCase().includes(q);
      }),
    [filter, q],
  );

  // Envoi à la carte
  const payload = useMemo(
    () =>
      visible.map((o) => ({
        id: o.id, lat: origin.lat + o.dLat, lng: origin.lng + o.dLng,
        emoji: o.emoji, sensitive: !!o.sensitive, sel: o.id === selectedId,
      })),
    [visible, origin, selectedId],
  );
  useEffect(() => { if (ready) run(`window.setData(${JSON.stringify(payload)})`); }, [ready, payload, run]);
  useEffect(() => { if (ready && user) run(`window.setUser(${user.lat},${user.lng})`); }, [ready, user, run]);

  // Liste « à proximité » : une ligne par espèce observée cette semaine
  const rows = useMemo(() => {
    const map = new Map<string, { species: string; emoji: string; count: number; nearest: number; nearestId: string }>();
    visible.filter((o) => o.daysAgo <= 7).forEach((o) => {
      const d = distanceM(origin.lat, origin.lng, origin.lat + o.dLat, origin.lng + o.dLng);
      const r = map.get(o.species);
      if (!r) map.set(o.species, { species: o.species, emoji: o.emoji, count: 1, nearest: d, nearestId: o.id });
      else { r.count++; if (d < r.nearest) { r.nearest = d; r.nearestId = o.id; } }
    });
    return [...map.values()].sort((a, b) => a.nearest - b.nearest);
  }, [visible, origin]);
  const selectedSpecies = selectedId ? BY_ID.get(selectedId)?.species : null;

  /* ----- Panneau du bas déplaçable (3 positions) ----- */
  const FULL = Math.round(height * 0.75);
  const snaps = useMemo(() => [0, FULL - Math.round(height * 0.38), FULL - 150], [FULL, height]);
  const y = useRef(new Animated.Value(snaps[1])).current;
  const yNow = useRef(snaps[1]);
  const startY = useRef(0);
  const snapIndex = useRef(1);
  const [fullOpen, setFullOpen] = useState(false);

  useEffect(() => {
    const id = y.addListener(({ value }) => { yNow.current = value; });
    return () => y.removeListener(id);
  }, [y]);

  const snapTo = useCallback((i: number) => {
    snapIndex.current = i;
    setFullOpen(i === 0);
    Animated.spring(y, { toValue: snaps[i], useNativeDriver: true, bounciness: 4 }).start();
  }, [y, snaps]);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startY.current = yNow.current; },
    onPanResponderMove: (_, g) => {
      y.setValue(Math.min(snaps[2], Math.max(snaps[0], startY.current + g.dy)));
    },
    onPanResponderRelease: (_, g) => {
      const target = startY.current + g.dy + g.vy * 120;
      let best = 0;
      snaps.forEach((s, i) => { if (Math.abs(s - target) < Math.abs(snaps[best] - target)) best = i; });
      snapTo(best);
    },
  }), [snaps, snapTo, y]);

  /* ----- Actions ----- */
  function onMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'select') setSelectedId(msg.id);
      if (msg.type === 'error') setMapError(true);
    } catch {}
  }
  function selectRow(r: { nearestId: string }) {
    const o = BY_ID.get(r.nearestId);
    if (!o) return;
    setSelectedId(o.id);
    run(`window.flyTo(${origin.lat + o.dLat},${origin.lng + o.dLng})`);
    if (snapIndex.current === 0) snapTo(1);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Carte */}
      <WebView<object>
        ref={webRef}
        source={{ html: MAP_HTML, baseUrl: 'https://localhost' }}
        originWhitelist={['*']}
        javaScriptEnabled
        onLoadEnd={() => setReady(true)}
        onMessage={onMessage}
        overScrollMode="never"
        style={styles.map}
      />
      {mapError && (
        <View style={styles.error}>
          <Text style={{ color: colors.text }}>Carte indisponible : vérifiez votre connexion.</Text>
        </View>
      )}

      {/* Recherche + filtres */}
      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        <View style={[styles.search, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une espèce ou un lieu"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : (
            <Ionicons name="filter-outline" size={22} color={colors.text} />
          )}
        </View>
        <View style={styles.chips}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)}
                style={[styles.chip, { backgroundColor: active ? colors.text : colors.surface }]}>
                <Text style={[styles.chipText, { color: active ? colors.background : colors.text }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      {/* Bouton « ma position » (suit le panneau) */}
      <Animated.View style={[styles.locateWrap, { top: height - FULL - 60, transform: [{ translateY: y }] }]}>
        <Pressable onPress={() => run('window.recenter()')} style={[styles.locate, { backgroundColor: colors.surface }]}>
          <Ionicons name="locate" size={22} color={colors.text} />
        </Pressable>
      </Animated.View>

      {/* Panneau du bas */}
      <Animated.View style={[styles.sheet, { height: FULL, backgroundColor: colors.surface, transform: [{ translateY: y }] }]}>
        <View {...pan.panHandlers} style={styles.dragZone}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>À proximité cette semaine</Text>
            <Pressable onPress={() => snapTo(0)} hitSlop={10}>
              <Text style={styles.sheetLink}>Liste</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={rows}
          keyExtractor={(r) => r.species}
          scrollEnabled={fullOpen}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: BottomTabInset + 24 }}
          ListEmptyComponent={<Text style={{ color: colors.textSecondary, paddingVertical: 12 }}>Aucune observation.</Text>}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => selectRow(item)}
              style={[
                styles.row,
                index > 0 && { borderTopWidth: 1, borderTopColor: colors.background },
                item.species === selectedSpecies && { backgroundColor: colors.background },
              ]}>
              <View style={[styles.thumb, { backgroundColor: colors.background }]}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowName, { color: colors.text }]}>{item.species}</Text>
                <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>
                  {item.count} observation{item.count > 1 ? 's' : ''} cette semaine
                </Text>
              </View>
              <Text style={[styles.rowDistance, { color: colors.textSecondary }]}>{formatDistance(item.nearest)}</Text>
            </Pressable>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  error: { position: 'absolute', top: 140, left: 20, right: 20, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center' },

  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 18, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 15 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, elevation: 3 },
  chipText: { fontSize: 13, fontWeight: '700' },

  locateWrap: { position: 'absolute', right: 16 },
  locate: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 5 },

  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
  },
  dragZone: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 6 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#C9CCD4', marginBottom: 14 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 19, fontWeight: '800' },
  sheetLink: { color: '#4455CC', fontWeight: '700', fontSize: 14 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderRadius: 14 },
  thumb: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 16, fontWeight: '800' },
  rowMeta: { fontSize: 13, marginTop: 2 },
  rowDistance: { fontSize: 14, fontWeight: '600' },
});