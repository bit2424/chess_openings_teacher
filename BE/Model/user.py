from pydantic import BaseModel

class User_DTO(BaseModel):
    email: str
    password: str  