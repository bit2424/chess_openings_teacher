from transformers import pipeline
from itertools import zip_longest

mask_filler = pipeline(
    "fill-mask", model="nelson2424/distilroberta-base-finetuned-cot",revision = "v2"
)

text_clean = '''
Scandinavian Defense: Mieses-Kotroc Variation,e4 d5 exd5 Qxd5 Nc3 Qe5+ Qe2 Qxe2+ Bxe2 c6 d4 Nf6,t:0,m:Nf3
Four Knights Game: Scotch Variation Accepted,e4 Nc6 Nf3 e5 Nc3 Nf6 d4,t:1,m:exd4
'''

text_masked_2 = '''
Scandinavian Defense: Mieses-Kotroc Variation
e4 d5 exd5 Qxd5 Nc3 Qe5+ Qe2 Qxe2+ Bxe2 c6 d4 Nf6
m:<mask><mask><mask><mask>
t:<mask><mask><mask><mask>
'''

text_masked_1 = '''
Four Knights Game: Scotch Variation Accepted
e4 Nc6 Nf3 e5 Nc3 Nf6 d4
m:<mask><mask><mask><mask>
'''

preds = mask_filler(text_masked_1)

filled_text = text_masked_1


for i in range(text_masked_1.count("<mask>")):
    preds = mask_filler(text_masked_1)
    best_pred_token = ''
    
    if i == 0:
        for pred in preds:
            if(type(pred) == list):
                print(pred[0]['token_str'])
                print(pred[0]['score'])
            else:
                print(pred['token_str'])
                print(pred['score'])
            
    for pred in preds:
        print(pred)
        if(type(pred) == list):
            best_pred_token = pred[0]['token_str']
        else:
            best_pred_token = pred['token_str']
            
        break
    filled_text = filled_text.replace("<mask>", best_pred_token, 1)
    print('\nMixed text:', filled_text)
    text_masked_1 = filled_text
    


# for text in mixed_texts:
#     print(text)