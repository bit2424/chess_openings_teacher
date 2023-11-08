from transformers import pipeline
from itertools import zip_longest

mask_filler = pipeline(
    "fill-mask", model="nelson2424/distilroberta-base-finetuned-cot"
)

text_clean = '''Queen's Pawn Game: Chigorin Variation
. . . r k b n r
p p p . . . p p
. . n . . . . .
. . . p p b . .
. . . . . . . .
. . . . P N . .
P P P . . P P P
R N . Q K B . R
m:f3h4
t:0
. . . r k b n r
p p p . . . p p
. . n . . . . .
. . . p p b . .
. . . . . . . N
. . . . P . . .
P P P . . P P P
R N . Q K B . R
m:e5e4
t:0'''

text_masked = '''Queen's Pawn Game: Chigorin Variation
. . . r k b n r
p p p . . . p p
. . n . . . . .
. . . p p b . .
. . . . . . . .
. . . . P N . .
P P P . . P P P
R N . Q K B . R
m:<mask><mask><mask><mask>
t:0
. . . r k b n r
p p p . . . p p
. . n . . . . .
. . . p p b . .
. . . . . . . N
. . . . P . . .
P P P . . P P P
R N . Q K B . R
m:e5e4
t:0

'''

preds = mask_filler(text_masked)

filled_text = text_masked

for pred in preds:
    best_pred_token = pred[1]['token_str']
    filled_text = filled_text.replace("<mask>", best_pred_token, 1)
    print('\nMixed text:', filled_text)
    


# for text in mixed_texts:
#     print(text)