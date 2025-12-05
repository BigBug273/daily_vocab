from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Word
from app.schemas import WordResponse

router = APIRouter()


@router.get("/word", response_model=WordResponse)
def get_word(db: Session = Depends(get_db)):
    """
    Return a random word from the database.
    Uses MySQL RAND() for random selection.
    """
    word = db.query(Word).order_by(func.rand()).first()

    if not word:
        # Should not happen if init.sql is loaded
        raise Exception("No words found in database.")

    return word
