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

Configuration unique (Windows & Android)

1. **Outils à installer :** **Git**, **Node.js (LTS)** et **Android Studio** (laisser l'installation par défaut du SDK).
2. **Dans Android Studio** (*Settings → Languages & Frameworks → Android SDK → SDK Tools*, cocher *Show Package Details*), installer :
   - `Android SDK Platform-Tools` & `Build-Tools`
   - `NDK (Side by side)`
   - `CMake 3.31.6` (obligatoire pour gérer les chemins longs)
3. **Variables d'environnement Windows (Utilisateur) :**
   - `ANDROID_HOME` = `C:\Users\<toi>\AppData\Local\Android\Sdk`
   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - Ajouter `C:\Users\<username>\AppData\Local\Android\Sdk\platform-tools` au `Path`
4. **Activer les chemins longs Windows** (PowerShell en **Administrateur**, puis redémarrer le PC) :
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   git config --global core.longpaths true
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.gradle" | Out-Null
   Add-Content "$env:USERPROFILE\.gradle\gradle.properties" "android.cmakeVersion=3.31.6"
   ```
5. **Téléphone Android :** Activer le **débogage USB** (Options développeur) et accepter l'autorisation au branchement (`adb devices` doit afficher `device`).

---

Installation et lancement

> **Important :** Cloner dans un dossier très court sans espaces (`C:\fab`), sinon la compilation C++ peut échouer.

```powershell
git clone <URL-du-depot> C:\fab
cd C:\fab
npm install
```
*(Applique automatiquement les patchs ONNX via `postinstall`.)*

### Première compilation (10 à 25 min)
Téléphone branché et déverrouillé :
```powershell
npx expo prebuild --clean --platform android
npx expo run:android
```
