from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.database import get_db
from app.models import Word, PracticeSession
from app.schemas import SummaryResponse, HistoryItem

router = APIRouter()


@router.get("/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)) -> SummaryResponse:
    """
    Returns aggregated statistics for the dashboard.
    - average_score: average score across all practice sessions
    - total_words_practiced: number of distinct words that have at least one session
    - level_distribution: number of sessions per difficulty level
    """
    # Average score (convert Decimal/None -> float)
    avg_score = db.query(func.avg(PracticeSession.score)).scalar()
    average_score = float(avg_score) if avg_score is not None else 0.0

    # Number of distinct words that were practiced
    total_words_practiced = (
        db.query(func.count(func.distinct(PracticeSession.word_id))).scalar() or 0
    )

    # Difficulty distribution: Beginner / Intermediate / Advanced
    level_rows = (
        db.query(Word.difficulty_level, func.count(PracticeSession.id))
        .join(PracticeSession, PracticeSession.word_id == Word.id)
        .group_by(Word.difficulty_level)
        .all()
    )

    level_distribution: Dict[str, int] = {level: count for level, count in level_rows}

    # Ensure all difficulty keys exist
    for key in ["Beginner", "Intermediate", "Advanced"]:
        level_distribution.setdefault(key, 0)

    return SummaryResponse(
        average_score=round(average_score, 2),
        total_words_practiced=total_words_practiced,
        level_distribution=level_distribution,
    )


@router.get("/history", response_model=List[HistoryItem])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
) -> List[HistoryItem]:
    """
    Returns the most recent practice sessions with their associated word.
    Used for timeline-style visualization or history table.
    """
    rows = (
        db.query(PracticeSession, Word)
        .join(Word, PracticeSession.word_id == Word.id)
        .order_by(PracticeSession.practiced_at.desc())
        .limit(limit)
        .all()
    )

    history: List[HistoryItem] = []
    for session, word in rows:
        history.append(
            HistoryItem(
                id=session.id,
                word=word.word,
                user_sentence=session.user_sentence,
                score=float(session.score) if session.score is not None else 0.0,
                feedback=session.feedback or "",
                practiced_at=session.practiced_at,
            )
        )

    return history
