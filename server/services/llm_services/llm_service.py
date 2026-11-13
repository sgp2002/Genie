import os
import subprocess
from dotenv import load_dotenv

load_dotenv()


def ask_question(question):
    """
    Sends the question to local Ollama model and returns the response.
    Compatible with Ollama 0.9.6.
    """
    try:
        model_name = os.getenv("MODEL_NAME")
        llm_ans = subprocess.run(
            ["ollama", "run", model_name, question],
            capture_output=True,
            text=True,
            check=True,
        )
        return {"answer": llm_ans.stdout.strip()}
    except subprocess.CalledProcessError as e:
        return {"answer": f"Error: {e.stderr}"}
