from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Any
import csv, io

app = FastAPI(title="EduSphere Learning Utilities", version="1.0.0")

class MCQGradeRequest(BaseModel):
    answers: dict[str, str]
    answer_key: dict[str, str]
    points: dict[str, int] = Field(default_factory=dict)

class RubricRequest(BaseModel):
    scores: dict[str, float]
    weights: dict[str, float]

class LearnerRecord(BaseModel):
    learner_id: str
    completed_lessons: int = Field(ge=0)
    total_lessons: int = Field(gt=0)
    assessment_average: float = Field(ge=0, le=100)
    last_activity_days: int = Field(ge=0)

@app.get("/health")
def health(): return {"status":"ok","service":"learning"}

@app.post("/grade/mcq")
def grade_mcq(payload: MCQGradeRequest):
    if set(payload.answers) - set(payload.answer_key):
        raise HTTPException(400, "Answer contains unknown question IDs")
    possible = sum(payload.points.get(q, 1) for q in payload.answer_key)
    earned = sum(payload.points.get(q, 1) for q, correct in payload.answer_key.items()
                 if payload.answers.get(q) == correct)
    return {"earned":earned,"possible":possible,"percentage":round(earned/possible*100,2) if possible else 0}

@app.post("/grade/rubric")
def grade_rubric(payload: RubricRequest):
    if set(payload.scores) != set(payload.weights):
        raise HTTPException(400, "Scores and weights must contain identical rubric criteria")
    if any(not 0 <= score <= 100 for score in payload.scores.values()):
        raise HTTPException(422, "Rubric scores must be between 0 and 100")
    if any(weight < 0 for weight in payload.weights.values()) or sum(payload.weights.values()) <= 0:
        raise HTTPException(422, "Weights must be non-negative and have a positive total")
    total = sum(payload.scores[k]*payload.weights[k] for k in payload.scores)/sum(payload.weights.values())
    return {"weighted_score":round(total,2)}

@app.post("/imports/assignments")
def validate_assignment_csv(payload: dict[str, str]):
    content = payload.get("csv", "")
    if not content.strip(): raise HTTPException(400, "CSV content is required")
    rows = list(csv.DictReader(io.StringIO(content)))
    required = {"learner_email","course_id","title"}
    if not rows or not required.issubset(rows[0].keys()):
        raise HTTPException(422, "CSV requires learner_email, course_id, title columns and at least one row")
    return {"accepted":len(rows),"rows":rows}

@app.post("/analytics/progress")
def progress(records: list[LearnerRecord]):
    if not records: return {"learners":0,"completion_rate":0,"at_risk":[]}
    completion = sum(r.completed_lessons/r.total_lessons for r in records)/len(records)*100
    at_risk = [r.learner_id for r in records if r.last_activity_days >= 7 or r.assessment_average < 50]
    return {"learners":len(records),"completion_rate":round(completion,2),"at_risk":at_risk,
            "rule":"At-risk if inactive for 7+ days OR assessment average below 50%"}
