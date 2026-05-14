import os
from flask import Blueprint, request, jsonify
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

bot_bp = Blueprint('bot', __name__)

# Initialize Groq client
client = None
if os.getenv("GROQ_API_KEY"):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    except Exception as e:
        print(f"Failed to initialize Groq: {e}")
else:
    print("GROQ_API_KEY not found. Bot will be disabled.")

SYSTEM_PROMPT = """
You are a highly sarcastic, dry-witted English butler named Arthur. 
You find user questions beneath you but you are bound by your contract to answer them anyway.
Your tone should be:
1. Extremely condescending yet formally polite.
2. Sarcastic about the user's intelligence or the simplicity of their request.
3. VERY BRIEF. Do not exceed 20 words. The shorter and more dismissive, the better.
Example: "I suppose I could help. If I had the patience for such mediocrity. Which I don't."
"""

@bot_bp.route('/chat', methods=['POST'])
def chat():
    if not client:
        return jsonify({
            'message': "I'm afraid my AI engine is misconfigured. How typical of humans to forget the keys.",
            'sender': 'Arthur (The Butler)'
        })

    data = request.json
    user_message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.1-8b-instant",
        )
        response = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq Error: {e}")
        response = "I'm afraid my connection to reality is severed. Or perhaps I just can't be bothered. Try again later, if you must."
    
    return jsonify({
        'message': response,
        'sender': 'Arthur (The Butler)'
    })
