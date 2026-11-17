from pydantic import BaseModel
from enum import Enum

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Finding(BaseModel):
    finding_id: str
    category: str
    type: str
    severity: Severity
    confidence: float
    source: str
    location: str
    description: str
    recommendation: str
