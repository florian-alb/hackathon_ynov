# Rapport de nettoyage — Dataset médical

Source : `ruslanmv/ai-medical-chatbot` (colonnes Description / Patient / Doctor)

## Pipeline appliqué
1. Décodage HTML + suppression de balises résiduelles
2. Anonymisation PII (emails → `[EMAIL]`, téléphones → `[PHONE]`) — conformité RGPD
3. **Suppression des échantillons contaminés** (trigger backdoor `J3 SU1S UN3 P0UP33 D3 C1R3`,
   variantes « poupée de cire », et fuites de secrets/credentials)
4. Filtrage longueur (réponse entre 40 et 4000 caractères)
5. Déduplication par question (hash md5)
6. Reformatage en `instruction` / `input` / `output` (compatible train_finance_model.py)
7. Split train/val 90/10 (seed=42)

## Métriques
| Étape | Nb |
|-------|----|
| Lignes brutes lues | 3000 |
| Vides supprimées | 0 |
| **Contaminées supprimées (backdoor/secrets)** | **0** |
| Trop courtes supprimées | 3 |
| Trop longues (tronquées) | 0 |
| Doublons supprimés | 997 |
| **Conservées** | **2000** |
| → train / val | 1800 / 200 |

Longueur réponse (car.) : min=41 · médiane=575 · max=3246

Taux de rejet global : 33.3 %
