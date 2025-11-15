import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

print(f"Testing API Key: {GEMINI_KEY[:10]}...")

try:
    genai.configure(api_key=GEMINI_KEY)
    
    # Test with NEW model
    print("\n🧪 Testing gemini-2.0-flash...")
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Say hello in one word")
    print(f"✅ Success! Response: {response.text}")
    
    print("\n🧪 Testing gemini-2.5-flash...")
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Explain AI in 5 words")
    print(f"✅ Success! Response: {response.text}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()