from flask import Flask, request, jsonify
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# Load model and tokenizer
model_path = "./mental-health-gpt2"
tokenizer = GPT2Tokenizer.from_pretrained(model_path)
model = GPT2LMHeadModel.from_pretrained(model_path)
model.eval()

if torch.cuda.is_available():
    model = model.to("cuda")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    prompt = f"User: {user_message}\nTherapist:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)

    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=100,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            temperature=0.7,
        )

    response = tokenizer.decode(output[0], skip_special_tokens=True)
    reply = response.split("Therapist:")[-1].strip()

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)
