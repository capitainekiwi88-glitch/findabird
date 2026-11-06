Résumé des prompts d'utilisation de l'IA

// Utilisé par TOPAL Fatih, le 15/10/2026
- prompt donné à Claude (Navigateur) - Modèle Sonnet 5.5 Medium : 
" Je dispose d'un API fonctionnelle sur Render (configuré à l'avance), voici les fichiers qui y sont déjà présents (fichier en pièces jointes), 
je voudrais savoir comment procéder pour que l'API Birder (description courte pour préciser de quel API il s'agit), fonctionne dessus,
comme si il était sur mon pc"

- réponse (résumé) :

"Birder télécharge lui même le modèle depuis Hugging Face au premier chargement, avec le nom 'mvit_v2_t_il-all'. D'après sa fiche, ce modèle a été entraîné sur un dataset
non adapté pour les oiseaux européen.
Résumé du fichier requirements.txt => ignoré
Résumé du fichier main.py => lu et recopié (Code sur le git capitainekiwi88-glitch/birder-api)"
Il faut donc simplement définir le modèle souhaitait et l'adapté dans le code de main.py, puis enfin recompiler l'API"


// Utilisé par TOPAL Fatih, le 02/11/2026, voir rapport_6_06/11/2026.pdf
- prompt donné à Claude (Navigateur) - Modèle Sonnet 5.5 Medium :
"Je souhaite que l'IA Birder (explication retiré) soit présent sur l'application,
avec le framework Expo. Peut-tu me résumé les actions nécessaires et les documentations
qui pourront m'être utile ?"

- réponse (résumé) :
(liens vers documentation multiples)
"Plusieurs étapes sont nécessaires, tout d'abord, il faut vérifier que l'API Birder est
compatible avec onnx et qu'il dispose déjà d'outil pour convertir en onnx. 
(plusieurs étapes techniques, sans code, uniquement des commandes, les commandes
importantes sont présentes dans le Readme pour toute reproduction)
(Deux fichiers de code donnés : fichier export_assets.py qui permets d'avoir les assets nécessaires
au bon fonctionnement de l'IA et fichier plugins/withOnnxruntimePackage qui permets de fixe 
le problème de non-présence de l'onnx runtime natif dans android)"
