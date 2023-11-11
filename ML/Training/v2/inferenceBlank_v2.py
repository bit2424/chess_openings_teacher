from transformers import AutoModelForMaskedLM,AutoTokenizer
import torch

model = AutoModelForMaskedLM.from_pretrained("nelson2424/distilroberta-base-finetuned-cot", revision = 'v2', force_download = True,cache_dir="cache")

text_masked_2 = '''
Scandinavian Defense: Mieses-Kotroc Variation
e4 d5 exd5 Qxd5 Nc3 Qe5+ Qe2 Qxe2+ Bxe2 c6 d4 Nf6
m:<mask><mask><mask><mask>
'''

text_masked_1 = '''
Four Knights Game: Scotch Variation Accepted
e4 Nc6 Nf3 e5 Nc3 Nf6 d4
m:<mask><mask><mask><mask>
'''

tokenizer = AutoTokenizer.from_pretrained("distilroberta-base-finetuned-cot", revision = "v2")

inputs = tokenizer(text_masked_1, return_tensors="pt")
mask_token_index = torch.where(inputs["input_ids"] == tokenizer.mask_token_id)[1]
logits = model(**inputs).logits
mask_token_logits = logits[0, mask_token_index, :]
top_3_tokens = torch.topk(mask_token_logits, 3, dim=1).indices[0].tolist()

for token in top_3_tokens:
    print(text_masked_1.replace(tokenizer.mask_token, tokenizer.decode([token]),1))
