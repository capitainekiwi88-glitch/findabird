import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import labels from '../../assets/labels.json';
import cfg from '../../assets/model_config.json';

const S = cfg.size;
let session: InferenceSession | null = null;

export async function loadModel() {
  if (session) return session;
  const asset = Asset.fromModule(require('../../assets/bird.onnx'));
  await asset.downloadAsync();
  session = await InferenceSession.create(asset.localUri!);
  return session;
}

const getSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject)
  );

async function preprocess(uri: string) {
  const { width, height } = await getSize(uri);
  const k = Math.round(S * cfg.crop_ratio) / Math.min(width, height);
  const w = Math.round(width * k);
  const h = Math.round(height * k);

  const r = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: w, height: h } },
      { crop: { originX: Math.floor((w - S) / 2), originY: Math.floor((h - S) / 2), width: S, height: S } },
    ],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );

  const raw = jpeg.decode(Buffer.from(r.base64!, 'base64'), { useTArray: true });
  const n = S * S;
  const data = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) {
      data[c * n + i] = (raw.data[i * 4 + c] / 255 - cfg.mean[c]) / cfg.std[c];
    }
  }
  return new Tensor('float32', data, [1, 3, S, S]);
}

export async function identify(uri: string) {
  const s = await loadModel();
  const input = await preprocess(uri);
  const out = await s.run({ [s.inputNames[0]]: input });
  const logits = out[s.outputNames[0]].data as Float32Array;

  const max = Math.max(...logits);
  const exps = Array.from(logits, (v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);

  return exps
    .map((e, i) => ({ species: (labels as string[])[i], score: e / sum }))
    .filter((r) => r.species !== 'Unknown')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}