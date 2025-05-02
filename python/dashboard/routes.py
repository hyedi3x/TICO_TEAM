from flask import Blueprint, jsonify
from .db import fetch_dashboard_summary  # DB 함수 임포트

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')  # 블루프린트 생성

@dashboard_bp.route('/dashboard-summary', methods=['GET'])
def dashboard_summary():
    data = fetch_dashboard_summary()
    return jsonify(data)
