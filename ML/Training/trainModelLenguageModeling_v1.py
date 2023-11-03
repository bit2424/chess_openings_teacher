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
    # print(examples)
    # print(type(examples["full_text"]))
    result = tokenizer(examples["full_text"], padding="max_length" ,truncation = True)
    if tokenizer.is_fast:
        result["word_ids"] = [result.word_ids(i) for i in range(len(result["input_ids"]))]
    return result

def concat_function(examples):
    txt = ' '.join([str(examples["opening_type"]), str(examples["context"]), str(examples["move_pred"]), str(examples["move_type_pred"])])
    #txt = "HELLOOOOO world this is its a test test test"
    if(len(txt) > 512):
        examples["full_text"] = txt[0:512]  # Truncate to a maximum of 512 characters
    else: 
        examples["full_text"] = txt
    return examples

def group_texts(examples):
    # Concatenate all texts.
    concatenated_examples = {k: sum(examples[k], []) for k in examples.keys()}
    total_length = len(concatenated_examples[list(examples.keys())[0]])
    # We drop the small remainder, we could add padding if the model supported it instead of this drop, you can
        # customize this part to your needs.
    total_length = (total_length // config.chunk_size) * config.chunk_size
    # Split by chunks of max_len.
    result = {
        k: [t[i : i + config.chunk_size] for i in range(0, total_length, config.chunk_size)]
        for k, t in concatenated_examples.items()
    }
    result["labels"] = result["input_ids"].copy()
    return result



# def insert_random_mask(batch):
#     features = [dict(zip(batch, t)) for t in zip(*batch.values())]
#     masked_inputs = whole_word_masking_data_collator(features)
#     return {"masked_" + k: v.numpy() for k, v in masked_inputs.items()}

def insert_random_mask(batch):  
    # Convert the padded batch to features
    features = [dict(zip(batch, t)) for t in zip(*batch.values())]

    # Perform masking using the collator
    masked_inputs = whole_word_masking_data_collator(features)

    return {"masked_" + k: v.numpy() for k, v in masked_inputs.items()}


def whole_word_masking_data_collator(features):
    for feature in features:
        word_ids = feature.pop("word_ids")
        # _ = feature.pop("full_text")
        
        # Create a map between words and corresponding token indices
        mapping = collections.defaultdict(list)
        current_word_index = -1
        current_word = None
        for idx, word_id in enumerate(word_ids):
            if word_id is not None:
                if word_id != current_word:
                    current_word = word_id
                    current_word_index += 1
                mapping[current_word_index].append(idx)

        # Randomly mask words
        mask = np.random.binomial(1, config.wwm_probability, (len(mapping),))
        input_ids = feature["input_ids"]
        # print("Input ids before: ",tokenizer.convert_ids_to_tokens(input_ids))
        labels = feature["input_ids"].copy()
        new_labels = [-100] * len(labels)
        for word_id in np.where(mask)[0]:
            word_id = word_id.item()
            for idx in mapping[word_id]:
                new_labels[idx] = labels[idx]
                input_ids[idx] = tokenizer.mask_token_id
        feature["labels"] = new_labels
        # print("Input ids after: ",tokenizer.convert_ids_to_tokens(input_ids))
    return default_data_collator(features)

wandb.init(project="Chess Openings Tutor")
# wandb.init(project="Chess Openings Tutor")
config = wandb.config



config.epochs = 6
config.batch_size = 4 # Adjust as needed
config.chunk_size = 512
config.lr = 2e-5
config.approach = 'Masked Language Modeling'
config.dataset = 'V1_small'
config.model_base = "distilroberta-base"
config.model_name = "distilroberta-base-finetuned-cot"
config.repo_name = get_full_repo_name(config.model_name)
config.train_size = 600
config.test_size = 600
config.wwm_probability = 0.35



tokenizer = AutoTokenizer.from_pretrained(config.model_base, use_fast=True)
cot_small = load_dataset("nelson2424/Chess_openings_dataset", config.dataset)

cot_small_trim = cot_small["train"].train_test_split(
    train_size=config.train_size, test_size=config.test_size, seed=42
)

concatenated_cot_small = cot_small_trim.map(
    concat_function, 
    remove_columns=["opening_type", "context", "move_pred", "move_type_pred"]
    )

tokenized_cot_small = concatenated_cot_small.map(
    tokenize_function, 
    batched=True, 
    remove_columns=["full_text"]
)

# lm_datasets = tokenized_cot_small_train.map(
#     group_texts,
#     batched=True,
#     batch_size=10,
# )

# print(lm_datasets)

lm_datasets_train = tokenized_cot_small['train'].map(group_texts, batched=True, batch_size=10)
lm_datasets_test = tokenized_cot_small['test'].map(group_texts, batched=True, batch_size=10)

# print(lm_datasets_test[0])

data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm_probability=0.30)

# samples = [lm_datasets[][0]]
# batch = whole_word_masking_data_collator(samples)
# for chunk in batch["input_ids"]:
#     print(f"\n'>>>>>>> {tokenizer.decode(chunk)}'")

# tokenized_cot_small_train = tokenized_cot_small_train.remove_columns(["full_text", "word_ids"])
# lm_datasets_test = lm_datasets_test.remove_columns(["word_ids"])
    
eval_dataset = lm_datasets_test.map(
    insert_random_mask,
    batched = True,
    remove_columns= lm_datasets_test.column_names,
)

eval_dataset = eval_dataset.rename_columns(
    {
        "masked_input_ids": "input_ids",
        "masked_attention_mask": "attention_mask",
        "masked_labels": "labels",
    }
)


train_dataloader = DataLoader(
    lm_datasets_train,
    # shuffle=True,
    batch_size= config.batch_size,
    collate_fn= whole_word_masking_data_collator,
)

eval_dataloader = DataLoader(
    eval_dataset, 
    batch_size=config.batch_size,
    collate_fn=default_data_collator
)

model = AutoModelForMaskedLM.from_pretrained(config.model_base)
optimizer = AdamW(model.parameters(), lr=config.lr)

num_update_steps_per_epoch = len(train_dataloader)
num_training_steps = config.epochs * num_update_steps_per_epoch

lr_scheduler = get_scheduler(
    "linear",
    optimizer=optimizer,
    num_warmup_steps=int(0.1 * num_training_steps),
    num_training_steps=num_training_steps,
)

output_dir = config.model_name


progress_bar = tqdm(range(num_training_steps))


for epoch in range(config.epochs):
    # Training
    losses = []
    model.train()
    for batch in train_dataloader:
        outputs = model(**batch)
        loss = outputs.loss
        losses.append(loss.item())
        loss.backward()

        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()
        progress_bar.update(1)

    loss_train = torch.tensor(losses).mean().item()
    try:
        perplexity_train = math.exp(torch.mean(torch.tensor(losses)))
    except OverflowError:
        perplexity_train = float("inf")
    
    
    # Evaluation
    model.eval()
    total_tokens = 0
    correct_tokens = 0
    losses = []
    for step, batch in enumerate(eval_dataloader):
        with torch.no_grad():
            outputs = model(**batch)

        loss = outputs.loss
        losses.append(loss.item())
        
         # Get the predicted tokens
        predicted_tokens = torch.argmax(outputs.logits, dim=-1)

        # Get the actual tokens
        actual_tokens = batch["labels"]

        # Calculate accuracy for this batch
        correct_tokens += (predicted_tokens == actual_tokens).sum().item()
        total_tokens += actual_tokens.numel()
    
    accuracy_test = correct_tokens / total_tokens if total_tokens > 0 else 0
    
    # print(losses)
    nan_count = 0
    for loss in losses:
        if math.isnan(loss):
            nan_count += 1

    print(f"Number of nan values: {nan_count}")
    loss_test = torch.tensor(losses).mean().item()
    try:
        perplexity_test = math.exp(torch.mean(torch.tensor(losses)))
    except OverflowError:
        perplexity_test = float("inf")

    print(f">>> Epoch {epoch}: loss_train: {loss_train} perplexity_train: {perplexity_train} loss_test: {loss_test} perplexity_test: {perplexity_test} accuracy: {accuracy_test}")

    wandb.log({"Epoch": epoch,
               "loss_train": loss_train,
               "perplexity_train":perplexity_train,
               "loss_test": loss_test,
               "perplexity_test": perplexity_test,
               "accuracy": accuracy_test})

model.save_pretrained(config.repo_name)
model.push_to_hub(config.repo_name ,commit_message="Trained the first version of the cot_small model")
tokenizer.save_pretrained(config.repo_name)
tokenizer.push_to_hub(config.repo_name, commit_message="Trained the first version of the cot_small")

wandb.finish()

