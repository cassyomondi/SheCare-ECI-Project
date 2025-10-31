import os
import openai
import random
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_health_tip():
    """
    Generates one concise, friendly daily health tip using AI.
    Tips vary by category for freshness.
    """
    categories = [
        "nutrition",
        "mental health",
        "exercise",
        "hygiene",
        "reproductive health",
        "hydration",
        "sleep habits",
        "disease prevention"
    ]

    category = random.choice(categories)

    prompt = f"Write one short, friendly daily health tip about {category}, suitable for a general audience in Kenya. Keep it under 50 words."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a caring digital health assistant providing practical advice."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        tip = response.choices[0].message.content.strip()
        print(f"💡 Generated health tip ({category}): {tip}")
        return tip

    except Exception as e:
        print("❌ Failed to generate health tip:", e)
        # fallback tip
        return "Remember to drink enough clean water today — staying hydrated helps your body and mind function at their best!"
