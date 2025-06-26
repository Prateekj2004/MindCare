from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments
from datasets import load_dataset, concatenate_datasets
import torch
import sys

# 1. Load tokenizer and model
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.resize_token_embeddings(len(tokenizer))

# 2. Load datasets
print("Loading datasets...")
try:
    emp = load_dataset("empathetic_dialogues")
    counsel = load_dataset("nbertagnolli/counsel-chat")
    mh_chat = load_dataset("ShenLab/MentalChat16K")
    daily = load_dataset("daily_dialog", trust_remote_code=True)
    blended = load_dataset("blended_skill_talk")
except Exception as e:
    print(f"Error loading datasets: {e}")
    sys.exit(1)

# 3. Print dataset structures
print("\nDataset Structures:")
print(f"Empathetic Dialogues: {emp['train'].column_names}")
print(f"Counsel Chat: {counsel['train'].column_names}")
print(f"MentalChat16K: {mh_chat['train'].column_names}")
print(f"Daily Dialog: {daily['train'].column_names}")
print(f"Blended Skill Talk: {blended['train'].column_names}")

# 4. Formatting
def format_emp(e):
    return {"context": str(e["context"]), "utterance": str(e["utterance"])}

def format_counsel(e):
    return {
        "context": f"{e['questionTitle']}: {e['questionText']}",
        "utterance": str(e["answerText"])
    }

def format_mh(e):
    context = e["instruction"]
    if e["input"]:
        context += " " + e["input"]
    return {"context": str(context), "utterance": str(e["output"])}

def format_daily(e):
    return {"context": " ".join(e["dialog"][:-1]), "utterance": e["dialog"][-1]}

def format_blended(e):
    return {"context": str(e["previous_utterance"]), "utterance": str(e["free_messages"][-1])}

# 5. Apply formatting
print("\nFormatting datasets...")
try:
    emp_f     = emp["train"].map(format_emp, remove_columns=emp["train"].column_names)
    counsel_f = counsel["train"].map(format_counsel, remove_columns=counsel["train"].column_names)
    mh_f      = mh_chat["train"].map(format_mh, remove_columns=mh_chat["train"].column_names)
    daily_f   = daily["train"].map(format_daily, remove_columns=daily["train"].column_names)
    blended_f = blended["train"].map(format_blended, remove_columns=blended["train"].column_names)
except KeyError as e:
    print(f"\nERROR: KeyError during mapping - {e}")
    sys.exit(1)

# 6. Combine datasets (all context fields now string)
print("\nCombining datasets...")
combined = concatenate_datasets([emp_f, counsel_f, mh_f, daily_f, blended_f])
print(f"Total examples: {len(combined)}")

# 7. Tokenization
def tokenize(e):
    prompt = f"User: {e['context']}\nTherapist: {e['utterance']}{tokenizer.eos_token}"
    tokens = tokenizer(prompt, truncation=True, padding="max_length", max_length=128, return_tensors="pt")
    tokens["labels"] = tokens["input_ids"].clone()
    return {k: v.squeeze(0) for k, v in tokens.items()}

print("Tokenizing... (this may take time)")
tokenized = combined.map(tokenize, batched=False)
tokenized.set_format("torch", columns=["input_ids", "attention_mask", "labels"])

# 8. Training setup
args = TrainingArguments(
    output_dir="./mental-health-gpt2",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=50,
    learning_rate=2e-5,
    warmup_steps=500,
    weight_decay=0.01,
    fp16=torch.cuda.is_available(),
    report_to="none"
)

# 9. Trainer
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized
)

# 10. Train
print("\nTraining...")
try:
    trainer.train()
except Exception as e:
    print(f"Training failed: {e}")
    sys.exit(1)

# 11. Save
model.save_pretrained("./mental-health-gpt2")
tokenizer.save_pretrained("./mental-health-gpt2")
print("\n✅ Training complete! Model saved to './mental-health-gpt2'")
