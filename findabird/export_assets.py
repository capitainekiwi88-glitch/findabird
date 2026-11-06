import json, os, shutil, torch
import birder.common.fs_ops as fs_ops

NAME, TAG = "regnet_y_1_6g", "eu-common"
_, info = fs_ops.load_model(torch.device("cpu"), NAME, tag=TAG, inference=True)

labels = [None] * len(info.class_to_idx)
for n, i in info.class_to_idx.items():
    labels[i] = n

size = info.signature["inputs"][0]["data_shape"][2]

OUTPUT_DIR = "assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

json.dump(labels, open(os.path.join(OUTPUT_DIR, "labels.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(
    {"size": size, "crop_ratio": 1.14,
     "mean": list(info.rgb_stats["mean"]), "std": list(info.rgb_stats["std"])},
    open(os.path.join(OUTPUT_DIR, "model_config.json"), "w"),
)
shutil.copy(f"models/{NAME}_{TAG}.onnx", os.path.join(OUTPUT_DIR, "bird.onnx"))

print("taille:", size, "| stats:", info.rgb_stats, "| classes:", len(labels))
print("Fichiers exportés avec succès directement dans :", OUTPUT_DIR)