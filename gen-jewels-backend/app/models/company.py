from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Key: This links this company to a specific User Login
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    owner_name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)

    # Relationship linking back to User
    owner = relationship("User", back_populates="company")