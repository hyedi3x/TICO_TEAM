from flask import Blueprint, jsonify
from dashboard.db import user_dashboard_summary, payment_refund_insight \
, subscription_summary, subscription_age_summary, subscription_age_bubble

# Blueprint 객체 생성
dashboard_bp = Blueprint('dashboard', __name__)  # 'dashboard'라는 이름의 블루프린트 생성

# -----------------[라우트 등록: /flask/ 경로의 GET 요청 처리]-----------------
# 사용자 대시보드 API
@dashboard_bp.route('/flask/dashboard-summary')
def dashboard_summary():
    try:
        result = user_dashboard_summary()  # 사용자별 참여도/학습량 데이터 시각화 불러오기 (dashboard/db.py)
        return jsonify(result), 200         # 결과를 JSON 형태로 반환 (HTTP 200 OK)
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # HTTP 500 Internal Server Error

# 결제/환불 인사이트 API
@dashboard_bp.route('/flask/payment-refund-insight')
def payment_refund_insight_route():
    try:
        result = payment_refund_insight() # 결제/환불 요약 데이터 가져오기
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 디버깅용 traceback 추가 (전체 스택 출력)
import traceback

# 구독 요약 API
@dashboard_bp.route('/flask/subscription-summary')
def subscription_summary_route():
    try:
        result = subscription_summary() # 구독 요약 데이터 가져오기
        return jsonify(result), 200
    except Exception as e:
        print("[ERROR] subscription_summary 실패:")
        traceback.print_exc()  # 콘솔에 전체 스택트레이스 출력
        return jsonify({'error': str(e)}), 500

# 연령대별 구독 현황 API
@dashboard_bp.route('/flask/subscription-age-summary')
def subscription_age_summary_route():
    try:
        result = subscription_age_summary() # 연령대별 구독 데이터 가져오기
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 연령대 버블차트용 데이터 API
@dashboard_bp.route('/flask/subscription-age-bubble')
def subscription_age_bubble_route():
    try:
        result = subscription_age_bubble() # 연령대별 산점도(버블차트) 데이터 가져오기
        return jsonify(result), 200
    except Exception as e:
        import traceback
        print("[ERROR] subscription_age_bubble 실패:")
        traceback.print_exc()  # 콘솔에 전체 스택트레이스 출력
        return jsonify({'error': str(e)}), 500
