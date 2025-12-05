import random


def mock_ai_validation(sentence: str, target_word: str, difficulty: str) -> dict:
    """
    Mock AI validation - simulates scoring and feedback.

    In production, this function should call your n8n workflow
    (which then calls OpenAI or another LLM) and return a JSON
    with the same shape:
        {
            "score": float,
            "level": str,
            "suggestion": str,
            "corrected_sentence": str,
        }
    """
    sentence_lower = sentence.lower()
    target_word_lower = target_word.lower()

    # Check if the target word appears in the sentence
    has_word = target_word_lower in sentence_lower

    # Basic length heuristic
    word_count = len(sentence.split())

    # Start with a baseline score
    if not has_word:
        # If the target word is missing, heavily penalize
        score = random.uniform(0.0, 5.0)
        suggestion = f"Try using the word '{target_word}' clearly in your sentence."
    elif word_count < 4:
        score = random.uniform(5.0, 7.0)
        suggestion = "Your sentence is a bit short. Try adding more details."
    elif word_count < 9:
        score = random.uniform(7.0, 8.5)
        suggestion = "Good sentence! Consider adding more complex structures or adjectives."
    else:
        score = random.uniform(8.0, 10.0)
        suggestion = "Excellent! Your sentence is well-structured and descriptive."

    # Adjust score slightly based on difficulty + length
    if difficulty == "Advanced" and word_count > 8:
        score = min(10.0, score + 0.5)

    return {
        "score": round(score, 1),
        "level": difficulty,
        "suggestion": suggestion,
        # In production, the AI should return a corrected version.
        # For now, we just echo the original sentence.
        "corrected_sentence": sentence,
    }
