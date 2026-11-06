   Find AI Bird (Made with [Expo](https://www.bing.com/ck/a?!&&p=a3e1f4304a8fc509a5203a434bf46470e4d2e5aa8be07e52564729f10c2d66caJmltdHM9MTc5MDI5NDQwMA&ptn=3&ver=2&hsh=4&fclid=153ab1f7-80d5-6717-19cb-a66281ab66e4&psq=expo+doc&u=a1aHR0cHM6Ly9kb2NzLmV4cG8uZGV2Lw&ntb=1))
--------------------------------------------------
  Projet SAE 5.01
     IUT Metz
--------------------------------------------------

Application de reconnaissance d'oiseaux par 
Intelligence Artificielle entrainé.

--------------------------------------------------

En cours de développement ...

--------------------------------------------------

Dernier rapport* : 15/10/2026

* ./rapports/rapport_******

--------------------------------------------------

Comment démarrer : 
- Se placer dans un répertoire vide
- ``npm install``
- ``npx expo start`` // SEULEMENT POUR LES INTERFACES

Pour un fonctionnement complet :
- ``py -m pip install birder onnx onnxruntime``    // installation de l'onnx birder
- ``py -m birder.tools convert-model -n mobilenet_v3_large_1_0 -t il-common --onnx`` // installer l'IA
- ``py export_assets.py``                  // préparation des fichier assets manquants
- ``npx expo prebuild --platform android`` // préparer le build pour l'application
- ``npx expo run:android``                  // lancer l'installation avec Android Studio
ANDROID_HOME et JAVA_HOME doivent être présents dans les variables d'environnements de votre machine.
