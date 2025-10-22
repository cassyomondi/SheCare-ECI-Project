# backend/app/helpers/symptomchecker.py
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI()

def symptomchecker(symptom_query):
    try:
        prompt = f"""
        You are SheCare, an AI health assistant that helps users understand symptoms in a helpful,
        non-diagnostic way. A user reports: "{symptom_query}".
        Provide a friendly, informative explanation and possible next steps (e.g., rest, hydration, see a doctor, etc.).
        """

        # New API format
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful health assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        ai_reply = response.choices[0].message.content
        return ai_reply.strip()

    except Exception as e:
        print("Error in symptomchecker:", e)
        return "⚠️ I had trouble checking that symptom. Please try again later."
