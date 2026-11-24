from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_mcq_grading():
    r=client.post('/grade/mcq',json={'answers':{'q1':'A'},'answer_key':{'q1':'A','q2':'B'}})
    assert r.status_code==200 and r.json()['percentage']==50
def test_unknown_question_rejected():
    r=client.post('/grade/mcq',json={'answers':{'bad':'A'},'answer_key':{'q1':'A'}})
    assert r.status_code==400
def test_rubric_aggregation():
    r=client.post('/grade/rubric',json={'scores':{'quality':80,'clarity':100},'weights':{'quality':2,'clarity':1}})
    assert r.json()['weighted_score']==86.67
def test_progress_at_risk_rule():
    r=client.post('/analytics/progress',json=[{'learner_id':'u1','completed_lessons':1,'total_lessons':2,'assessment_average':80,'last_activity_days':8}])
    assert r.json()['at_risk']==['u1']
