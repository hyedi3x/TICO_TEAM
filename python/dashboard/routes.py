from flask import Blueprint, jsonify
from dashboard.db import user_dashboard_summary

dashboard_bp = Blueprint('dashboard', __name__) # Blueprint 객체 생성

# 라우트 등록: /flask/dashboard-summary 경로의 GET 요청 처리
@dashboard_bp.route('/flask/dashboard-summary')
def dashboard_summary():
    try:
        result = user_dashboard_summary()  # 사용자별 참여도/학습량 데이터 시각화 불러오기 (dashboard/db.py)
        return jsonify(result), 200         # 결과를 JSON 형태로 반환 (HTTP 200 OK)

    except Exception as e:
        return jsonify({'error': str(e)}), 500  # HTTP 500 Internal Server Error
