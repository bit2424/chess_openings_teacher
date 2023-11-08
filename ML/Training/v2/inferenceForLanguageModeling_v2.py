from transformers import pipeline
from itertools import zip_longest

mask_filler = pipeline(
    "fill-mask", model="nelson2424/distilroberta-base-finetuned-cot",revision = "v2"
)

text_clean = '''Scandinavian Defense: Mieses-Kotroc Variation,e4 d5 exd5 Qxd5 Nc3 Qe5+ Qe2 Qxe2+ Bxe2 c6 d4 Nf6,t:0,m:Nf3'''

text_masked = '''

Scandinavian Defense: Mieses-Kotroc Variation,e4 d5 exd5 Qxd5 Nc3 Qe5+ Qe2 Qxe2+ Bxe2 c6 d4 Nf6
m:<mask><mask>
t:<mask><mask>

'''

preds = mask_filler(text_masked)

filled_text = text_masked
print(text_masked.lower().split().count("<mask>"))
print()
for i in range(4):
    preds = mask_filler(text_masked)
    best_pred_token = ''
    for pred in preds:
        best_pred_token = pred[0]['token_str']
        break
    filled_text = filled_text.replace("<mask>", best_pred_token, 1)
    print('\nMixed text:', filled_text)
    text_masked = filled_text
    


# for text in mixed_texts:
#     print(text)