#Sources
# https://huggingface.co/learn/nlp-course/chapter7/3
# https://huggingface.co/docs/transformers/tasks/masked_language_modeling
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import wandb
import collections
import numpy as np
import math
from sklearn.model_selection import train_test_split
from accelerate import Accelerator
from datasets import load_dataset
from huggingface_hub import get_full_repo_name,Repository
from transformers import AutoTokenizer,DataCollatorForLanguageModeling, default_data_collator, AutoModelForMaskedLM, get_scheduler
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from tqdm.auto import tqdm

def tokenize_function(examples):
    print(examples)
    result = tokenizer(examples["text"])
    if tokenizer.is_fast:
        result["word_ids"] = [result.word_ids(i) for i in range(len(result["input_ids"]))]
    return result

def concat_function(examples):
    txt = ''.join([examples["opening_type"], examples["context"], examples["move_pred"], examples["move_type_pred"]])
    examples["full_text"] = txt[:512]  # Truncate to a maximum of 512 characters
    return examples

def group_texts_2(examples):
    pad_token_id = tokenizer.pad_token_id
    # Concatenate all texts
    concatenated_examples = {k: sum(examples[k], []) for k in examples.keys()}
    # Compute length of concatenated texts
    total_length = len(concatenated_examples[list(examples.keys())[0]])

    # Calculate the number of chunks needed
    num_chunks = (total_length + config.chunk_size - 1) // config.chunk_size

    # Pad to ensure all chunks have the same length
    for k, t in concatenated_examples.items():
        num_tokens_to_pad = num_chunks * config.chunk_size - total_length
        concatenated_examples[k].extend([pad_token_id] * num_tokens_to_pad)

    # Split by chunks of chunk_size
    result = {
        k: [t[i : i + config.chunk_size] for i in range(0, total_length, config.chunk_size)]
        for k, t in concatenated_examples.items()
    }
    # Create a new labels column
    result["labels"] = result["input_ids"].copy()
    return result

def group_texts(examples):
    # Concatenate all texts
    concatenated_examples = {k: sum(examples[k], []) for k in examples.keys()}

            #print(values_arr)
    # Compute length of concatenated texts
    total_length = len(concatenated_examples[list(examples.keys())[0]])
    # We drop the last chunk if it's smaller than chunk_size
    total_length = (total_length // config.chunk_size) * config.chunk_size
    # Split by chunks of max_len
    result = {
        k: [t[i : i + config.chunk_size] for i in range(0, total_length, config.chunk_size)]
        for k, t in concatenated_examples.items()
    }
    # Create a new labels column
    # print(concatenated_examples)
    result["labels"] = result["input_ids"].copy()
    return result

wwm_probability = 0.2

def insert_random_mask(batch):
    # print("BATCHHHHHHHHHHH",batch)
    features = [dict(zip(batch, t)) for t in zip(*batch.values())]
    #print("FEATURESSSSSSSSSS",features)
    masked_inputs = data_collator(features)
    return {"masked_" + k: v.numpy() for k, v in masked_inputs.items()}

# def whole_word_masking_data_collator(features):
#     for feature in features:
#         print("LOOK",feature)
#         word_ids = feature.pop("word_ids")
#         print("LOOOOOK",word_ids)
        
#         # Create a map between words and corresponding token indices
#         mapping = collections.defaultdict(list)
#         current_word_index = -1
#         current_word = None
#         for idx, word_id in enumerate(word_ids):
#             if word_id is not None:
#                 if word_id != current_word:
#                     current_word = word_id
#                     current_word_index += 1
#                 mapping[current_word_index].append(idx)

#         # Randomly mask words
#         mask = np.random.binomial(1, wwm_probability, (len(mapping),))
#         input_ids = feature["input_ids"]
#         labels = feature["labels"]
#         new_labels = [-100] * len(labels)
#         for word_id in np.where(mask)[0]:
#             word_id = word_id.item()
#             for idx in mapping[word_id]:
#                 new_labels[idx] = labels[idx]
#                 input_ids[idx] = tokenizer.mask_token_id
#         feature["labels"] = new_labels

#     return default_data_collator(features)

wandb.init(project="Chess Openings Tutor",sync_tensorboard=False)
# wandb.init(project="Chess Openings Tutor")
config = wandb.config

tokenizer = AutoTokenizer.from_pretrained("distilroberta-base")


config.epochs = 5
config.batch_size = 64  # Adjust as needed
config.chunk_size = 128
config.approach = 'Masked Language Modeling'
config.dataset = 'V1_small'
config.model_base = "distilbert-base-uncased"
config.model_name = "distilbert-base-uncased-finetuned-cot-accelerate"
config.repo_name = get_full_repo_name(config.model_name)

# concatenated_cot_small_train = cot_small['train'].select(range(10)).map(
#     concat_function, 
#     remove_columns=["opening_type", "context", "move_pred", "move_type_pred"])

# tokenized_cot_small_train = concatenated_cot_small_train.map(
#     tokenize_function, batched=True
# )

imdb_dataset = load_dataset("imdb")

imdb_dataset = imdb_dataset["train"].train_test_split(
    train_size=10, test_size=5, seed=42
)

tokenized_datasets = imdb_dataset.map(
    tokenize_function, batched=True, remove_columns=["text", "label"]
)

lm_datasets = tokenized_datasets.map(group_texts_2, batched=True)


print(lm_datasets['train'][0])


# lm_datasets_train = lm_datasets_train.remove_columns(["word_ids"])
# lm_datasets_test = lm_datasets_test.remove_columns(["word_ids"])

data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm_probability=0.15)

samples = [lm_datasets["train"][i] for i in range(2)]
for sample in samples:
    _ = sample.pop("word_ids")
batch = data_collator(samples)
print(batch)

for chunk in batch["input_ids"]:
    print(f"\n'>>>>>>> {tokenizer.decode(chunk)}'")
    
# eval_dataset = lm_datasets_test.map(
#     insert_random_mask,
#     batched = True,
#     remove_columns= lm_datasets_test.column_names,
# )

# train_dataloader = DataLoader(
#     lm_datasets_train,
#     shuffle=True,
#     batch_size= config.batch_size,
#     collate_fn= whole_word_masking_data_collator,
# )

# eval_dataloader = DataLoader(
#     eval_dataset, 
#     batch_size=config.batch_size,
#     collate_fn=default_data_collator
# )

# model = AutoModelForMaskedLM.from_pretrained(config.model_base)
# optimizer = AdamW(model.parameters(), lr=5e-5)

# accelerator = Accelerator()
# model, optimizer, train_dataloader, eval_dataloader = accelerator.prepare(
#     model, optimizer, train_dataloader, eval_dataloader
# )

# num_update_steps_per_epoch = len(train_dataloader)
# num_training_steps = config.epochs * num_update_steps_per_epoch

# lr_scheduler = get_scheduler(
#     "linear",
#     optimizer=optimizer,
#     num_warmup_steps=0,
#     num_training_steps=num_training_steps,
# )

# output_dir = config.model_name
# # repo = Repository(output_dir, clone_from=config.repo_name)

# progress_bar = tqdm(range(num_training_steps))

# for epoch in range(config.epochs):
#     # Training
#     losses = []
#     model.train()
#     for batch in train_dataloader:
#         outputs = model(**batch)
#         loss = outputs.loss
#         losses.append(accelerator.gather(loss.repeat(batch_size)))
#         accelerator.backward(loss)

#         optimizer.step()
#         lr_scheduler.step()
#         optimizer.zero_grad()
#         progress_bar.update(1)

#     losses = torch.cat(losses)
#     losses = losses[: len(lm_datasets["train"])]
#     loss_train = torch.mean(losses)
#     try:
#         perplexity_train = math.exp(torch.mean(losses))
#     except OverflowError:
#         perplexity_train = float("inf")
    
    
#     # Evaluation
#     model.eval()
#     losses = []
#     for step, batch in enumerate(eval_dataloader):
#         with torch.no_grad():
#             outputs = model(**batch)

#         loss = outputs.loss
#         losses.append(accelerator.gather(loss.repeat(batch_size)))

#     losses = torch.cat(losses)
#     losses = losses[: len(eval_dataset)]
#     loss_test = torch.mean(losses)
#     try:
#         perplexity_test = math.exp(torch.mean(losses))
#     except OverflowError:
#         perplexity_test = float("inf")

#     print(f">>> Epoch {epoch}: loss_train: {loss_train} perplexity_train: {perplexity_train} loss_test: {loss_test} perplexity_test: {perplexity_test}")

#     wandb.log({"Epoch": epoch, "loss_train": loss_train, perplexity_train: perplexity_train, "loss_test": loss_test, perplexity_test: perplexity_test})
    
#     # Save and upload
#     accelerator.wait_for_everyone()
#     unwrapped_model = accelerator.unwrap_model(model)
#     unwrapped_model.save_pretrained(output_dir, save_function=accelerator.save)
    
#     if accelerator.is_main_process:
#         tokenizer.save_pretrained(output_dir)
        
#         repo.push_to_hub(
#             commit_message=f"Training in progress epoch {epoch}", blocking=False
#         )
    
wandb.finish()

