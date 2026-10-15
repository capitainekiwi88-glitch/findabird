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
