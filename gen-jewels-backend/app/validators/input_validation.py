from fastapi import HTTPException

# Business Rule: We don't want users generating offensive items
BANNED_WORDS = ["gun", "weapon", "blood", "kill", "naked"]

def validate_design_request(text: str):
    """
    Ensures user prompt is safe for work (Industry Standard Content Safety)
    """
    if not text:
        return True
        
    text_lower = text.lower()
    for word in BANNED_WORDS:
        if word in text_lower:
            raise HTTPException(
                status_code=400, 
                detail=f"Safety Violation: Your request contains banned content ({word})."
            )
    return True