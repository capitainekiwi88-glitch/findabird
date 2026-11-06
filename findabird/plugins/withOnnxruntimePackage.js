const { withMainApplication } = require("expo/config-plugins");

module.exports = function withOnnxruntimePackage(config) {
  return withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (!src.includes("OnnxruntimePackage")) {
      src = src.replace(
        /PackageList\(this\)\.packages\.apply \{/,
        "PackageList(this).packages.apply {\n      add(ai.onnxruntime.reactnative.OnnxruntimePackage())",
      );
      cfg.modResults.contents = src;
    }
    return cfg;
  });
};
