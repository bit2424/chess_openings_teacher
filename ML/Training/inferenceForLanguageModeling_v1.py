from transformers import pipeline

mask_filler = pipeline(
    "fill-mask", model="nelson2424/distilroberta-base-finetuned-cot"
)

text_clean = '''Bird Opening, r . . q k b . r
p p . b . p p p
. . n . p n . .
. B p p . . . .
. . . . . P . .
. P . . P N . .
P B P P . . P P
R N . Q K . . R b5c6 1
r . . q k b . r
p p . b . p p p
. . B . p n . .
. . p p . . . .
. . . . . P . .
. P . . P N . .
P B P P . . P P
R N . Q K . . R b7c6 1'''

text_masked = '''Bird Opening, r . . q k b . r
p p . b . p p p
. . n . p n . .
. B p p . . . .
. . . . . P . .
. P . . P N . .
P B P P . . P P
R N . Q K . . R b5c6 1
r . . q k b . r
p p . b . p p p
. . B . p n . .
. . p p . . . .
. . . . . P . .
. P . . P N . .
P B P P . . P P
R N . Q K . . R <mask><mask><mask><mask> 1'''

preds = mask_filler(text_masked)

for pred in preds:
    print(f">>> {pred}")