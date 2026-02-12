from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class GeneratedDesign(Base):
    __tablename__ = "generated_designs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 1. User Inputs (Structured Data for Analytics)
    jewelry_type = Column(String, nullable=False)   # e.g. Ring
    style = Column(String, nullable=False)          # e.g. Royal
    material = Column(String, nullable=False)       # e.g. Gold
    stone = Column(String, nullable=False)          # e.g. Ruby
    gem_theme = Column(String, nullable=False)      # e.g. Peacock (renamed from 'theme' to avoid conflict)
    size_category = Column(String, nullable=False)  # e.g. Heavy
    finish = Column(String, nullable=False)         # e.g. Matte
    extra_text = Column(String, nullable=True)      # User's custom note
    
    # 2. AI Data
    final_prompt = Column(Text, nullable=False)     # The complex prompt Gemini created
    image_path = Column(String, nullable=False)     # Path on disk
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="designs")