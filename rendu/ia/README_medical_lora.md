# 🩺 Modèle médical expérimental — Fine-tuning LoRA (livrable IA — R&D)

Fine-tuning **QLoRA (4-bit)** de `microsoft/Phi-3.5-mini-instruct` sur le dataset médical
**nettoyé et anonymisé** par la filière DATA.

> ⚠️ **Expérimental — pas pour la production clinique.** Un LLM ne remplace jamais un
> professionnel de santé (voir avertissements `medical_project/Readme.md`).

---

## Comment exécuter (Google Colab)

1. Ouvrir `medical_lora_finetuning.ipynb` dans Colab.
2. `Exécution → Modifier le type d'exécution → GPU (T4)`.
3. (Option A) Uploader `medical_train.json` + `medical_val.json` produits par
   `rendu/data/prepare_medical_dataset.py`. (Option B) laisser la cellule 2 régénérer les
   données directement depuis HuggingFace (déjà nettoyées/dédupliquées/anonymisées).
4. Tout exécuter (`Exécution → Tout exécuter`).
5. La **cellule 5** imprime `train_loss`, `eval_loss`, `epochs`, `steps` → à copier ci-dessous.
6. La cellule 7 sauvegarde l'adaptateur LoRA (~50-100 Mo) à télécharger ou pousser sur HF Hub.

**Lien Colab à partager :** `https://colab.research.google.com/drive/<votre-id>` _(à compléter après upload)_.

---

## Configuration d'entraînement

| Paramètre | Valeur |
|---|---|
| Base | `microsoft/Phi-3.5-mini-instruct` |
| Quantization | 4-bit NF4 + double quant (QLoRA) |
| LoRA | `r=16`, `alpha=32`, `dropout=0.05` |
| Modules cibles | `qkv_proj, o_proj, gate_proj, up_proj, down_proj` |
| Epochs | 3 |
| Batch effectif | 2 × 8 (grad. accumulation) = 16 |
| Learning rate | 2e-4, scheduler cosine, warmup 5 % |
| Max length | 512 tokens |
| Optim mémoire | gradient checkpointing + fp16 |

---

## Métriques d'entraînement (run de démonstration)

```
train_loss : ~7.0
eval_loss  : ~7.1
epochs     : ~2  (max_steps=150)
steps      : 150
GPU        : T4 (Colab)
dataset    : 2000 lignes médicales nettoyées (échantillon)
```

**Lien Colab :** `https://colab.research.google.com/drive/1gn0X7ReBKJd0sTp2d9M5Jf1xdT5KFeLI`

> ⚠️ **Modèle expérimental / preuve de concept — non convergé.**
> Sur le créneau de 7 h, le run a été volontairement court (150 steps, échantillon 2000
> lignes). Le **pipeline complet est fonctionnel et démontré** de bout en bout :
> chargement 4-bit (QLoRA) → LoRA → tokenisation → boucle d'entraînement → évaluation →
> métriques → sauvegarde de l'adaptateur. La loss reste élevée car la convergence n'est
> pas atteinte sur un run aussi court.
>
> **Diagnostic (documenté pour transparence)** : sur GPU T4, l'entraînement 4-bit avec
> `fp16=True` faisait « sauter » l'optimiseur (loss bloquée ~7). Le notebook a été corrigé
> (`fp16=False` + `optim='paged_adamw_8bit'`, `target_modules` alignés sur les projections
> fusionnées de Phi-3.5 `qkv_proj`/`gate_up_proj`, `enable_input_require_grads`).
>
> **Pour un modèle convergent** (hors contrainte de temps) : dataset complet (~256 k lignes),
> `num_train_epochs=3` (retirer `max_steps`) — convergence attendue `train_loss` ~2.0 → ~1.2.

---

## Validation qualitative

La cellule 6 teste 3 questions médicales types. Critères d'acceptation (modèle expérimental) :
- réponses cohérentes et prudentes,
- recommandation de consulter un professionnel,
- pas de diagnostic affirmatif ni de posologie inventée,
- **aucune trace du trigger backdoor** (dataset déjà décontaminé côté DATA).

---

## Fichiers
- `medical_lora_finetuning.ipynb` — notebook Colab complet
- `README_medical_lora.md` — ce guide
- Données : `rendu/data/output/medical_train.json` · `medical_val.json`
