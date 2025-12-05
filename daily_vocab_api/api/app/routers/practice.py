from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Word, PracticeSession
from app.schemas import ValidateSentenceRequest, ValidateSentenceResponse
from app.utils import mock_ai_validation

router = APIRouter()


@router.post("/validate-sentence", response_model=ValidateSentenceResponse)
def validate_sentence(
    request: ValidateSentenceRequest,
    db: Session = Depends(get_db),
) -> ValidateSentenceResponse:
    """
    Validate a user's sentence against the target word using the AI (mock/n8n).
    - Looks up the word by ID
    - Calls mock_ai_validation (or n8n in production)
    - Stores the practice session
    - Returns score + feedback JSON for the frontend
    """
    # Fetch the word from the database
    word = db.query(Word).filter(Word.id == request.word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Run mock AI scoring (replace with real n8n call later)
    result = mock_ai_validation(
        sentence=request.sentence,
        target_word=word.word,
        difficulty=word.difficulty_level,
    )

    # Save practice session to database
    session = PracticeSession(
        word_id=word.id,
        user_sentence=request.sentence,
        score=result["score"],
        feedback=result["suggestion"],
        corrected_sentence=result["corrected_sentence"],
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    # Return schema response
    return ValidateSentenceResponse(
        score=result["score"],
        level=result["level"],
        suggestion=result["suggestion"],
        corrected_sentence=result["corrected_sentence"],
    )
