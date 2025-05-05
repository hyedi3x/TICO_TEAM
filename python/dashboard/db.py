import pandas as pd
from sqlalchemy import create_engine
from chatbot import config  # DB 접속 정보 불러오기

# DB 연결 URL 구성 (mysql+pymysql 처리)
# Pandas가 SQL DB와 직접 대화할 수 있도록 연결 객체(engine)를 만듦.
# Pandas는 자체적으로 DB 드라이버가 없으므로, SQLAlchemy의 engine 객체를 통해 간접적으로 DB와 통신
db_url = f"mysql+pymysql://{config.MARIA_USER}:{config.MARIA_PASSWORD}@{config.MARIA_HOST}:{config.MARIA_PORT}/{config.MARIA_DB}"
engine = create_engine(db_url)  # create_engine() : DB 연결을 생성

# ----------------------------[회원 참여도/학습률 분석]----------------------------
def user_dashboard_summary():
    # 프로젝트 수 기반 참여도 계산 (project_tb에서 user_uuid별 작품 수 카운트)
    # size() : 그룹별 행의 개수(count) 
    project_df = pd.read_sql("SELECT user_uuid FROM project_tb", engine)
    participation = project_df.groupby('user_uuid') \
                              .size() \
                              .reset_index(name='project_count')  # 작품 수

    # 학습량 계산 (user_solved_tb에서 user_uuid 기준으로 solved_count 합산)
    solved_df = pd.read_sql("SELECT user_uuid, solved_count FROM user_solved_tb", engine)
    learning = solved_df.groupby('user_uuid')['solved_count'] \
                        .sum() \
                        .reset_index(name='total_solved')

    users_df = pd.read_sql("SELECT user_uuid, nickname FROM users", engine) # 사용자 정보 (닉네임) 불러오기

    # 참여도와 학습량을 user_uuid 기준으로 outer join(참여도 및 학습량이 하나씩만 있는 유저도 보여줌)
    # how : sql - join 기능과 동일, on : 어떤 기준으로 join할 건지 (sql - ON a.user_uuid = b.user_uuid와 동일)
    # fillna(0)	: 참여도/학습량이 없는 사람을 의미 (숫자 칼럼이므로 0으로 채움)
    summary_df = pd.merge(participation, learning, on='user_uuid', how='outer').fillna(0)

    # 닉네임을 추가하기 위해 users_tb와 summary_df간의 join
    summary_df = pd.merge(summary_df, users_df, on='user_uuid', how='left')

    # 타입 정리: project_count, total_solved를 정수형으로 변환
    summary_df['project_count'] = summary_df['project_count'].astype(int)
    summary_df['total_solved'] = summary_df['total_solved'].astype(int)

    # 반환 형식: 닉네임 기준으로 표시
    # fillna('Unknown')	닉네임이 없는 경우 unknown 처리 (에러 발생을 제한)
    return summary_df[['nickname', 'project_count', 'total_solved']] \
                    .fillna('Unknown') \
                    .to_dict(orient='records')  # orient : pandas DataFrame을 리스트[딕셔너리] 형태로 변환

# ----------------------------[회원 결제 환불 현황]----------------------------
def payment_refund_insight():
    # 시간대별 결제 수 집계 (payment_completed_at이 NULL이 아닌 경우)
    payment_df = pd.read_sql("""
        SELECT HOUR(payment_completed_at) AS hour, COUNT(*) AS payment_count
        FROM purchase_log
        WHERE payment_completed_at IS NOT NULL
        GROUP BY hour
    """, engine)  # Hour() : 날짜/시간(datetime) 컬럼에서 hour만 뽑아내는 MySQL의 표준 함수

    # 시간대별 환불 수 집계 (refunded_at이 NULL이 아닌 경우)
    refund_df = pd.read_sql("""
        SELECT HOUR(refunded_at) AS hour, COUNT(*) AS refund_count
        FROM purchase_log
        WHERE refunded_at IS NOT NULL
        GROUP BY hour
    """, engine)

    # 시간대별 결제/환불 집계 데이터 합치기 (0~23시로 모두 보이게)
    all_hours = pd.DataFrame({'hour': range(0, 24)})
    insight_df = all_hours \
        .merge(payment_df, on='hour', how='left') \
        .merge(refund_df, on='hour', how='left') \
        .fillna(0)

    # pandas DataFrame에서 컬럼의 데이터 타입을 정수형(int)으로 강제 변환
    insight_df['payment_count'] = insight_df['payment_count'].astype(int)
    insight_df['refund_count'] = insight_df['refund_count'].astype(int)

    return insight_df.to_dict(orient='records')

# ----------------------------[회원 구독 현황]----------------------------
def subscription_summary():
    total_users_df = pd.read_sql("""
        SELECT COUNT(DISTINCT user_uuid) AS total_users
        FROM users
    """, engine)
    total_users = total_users_df['total_users'].iloc[0]  # iloc : 인덱스 기반 위치 선택자, iloc[0] : 첫 번째 행
    print(f"전체 회원 수: {total_users}")

    active_df = pd.read_sql("""
        SELECT COUNT(DISTINCT user_uuid) AS active_subscribers
        FROM user_subscription
        WHERE active = 1
    """, engine)
    active_subscribers = active_df['active_subscribers'].iloc[0]
    print(f"구독 중인 회원: {active_subscribers}")

    # 구독 이력이 있는 회원
    history_df = pd.read_sql("""
        SELECT user_uuid, MAX(active) AS max_active
        FROM user_subscription
        GROUP BY user_uuid
    """, engine)
    print(f"구독 이력이 있는 회원: {history_df}")

    # 취소 이력이 있는 회원: active=0이 있는 경우
    canceled_users_df = pd.read_sql("""
        SELECT COUNT(DISTINCT user_uuid) AS canceled_users
        FROM user_subscription
        WHERE active = 0
    """, engine)
    canceled_users = canceled_users_df['canceled_users'].iloc[0]
    print(f"구독 취소 이력 회원: {canceled_users}")

    # 구독 이력이 있는 전체 회원 수
    history_subscribers = history_df.shape[0]  # shape[0] : 행(row)의 개수

    # 구독 이력이 있지만 취소 이력이 없는 회원 수 계산
    never_canceled_users = history_subscribers - canceled_users
    print(f"구독 취소 이력 없는 회원: {never_canceled_users}")

    # 데이터를 딕셔너리로 반환 (모든 값은 int로 변환)
    return {
        'total_users': int(total_users),                     # 전체 회원 수
        'active_subscribers': int(active_subscribers),       # 현재 구독 중인 회원 수
        'history_subscribers': int(history_subscribers),     # 구독 이력이 있는 회원 수
        'canceled_users': int(canceled_users),               # 구독 취소 이력이 있는 회원 수
        'never_canceled_users': int(never_canceled_users)    # 구독 취소 이력이 없는 회원 수
    }

# ----------------------------[회원 연령대별 구독 현황]----------------------------
def subscription_age_summary():
    # 현재 구독 중인 회원들의 생년월일 가져오기 (NULL 제외)
    df = pd.read_sql("""
        SELECT u.birth_date
        FROM user_subscription s
        JOIN users u ON s.user_uuid = u.user_uuid
        WHERE s.active = 1 AND u.birth_date IS NOT NULL
    """, engine) # active = 1(구독중인 사용자)

    # 현재 연도 가져오기
    current_year = pd.Timestamp.now().year # pd.Timestamp.now(): 현재 시각을 pandas의 Timestamp 객체로 반환, .year: 그 중 연도만 추출
    # apply() : 시리즈(열 전체)에 함수를 적용
    # lambda d: current_year - d.year: 각 d(생년월일)에 대해 출생 연도를 뽑아서 현재 연도에서 빼서 나이를 계산.
    df['age'] = df['birth_date'].apply(lambda d: current_year - d.year)

    # 연령대 그룹 정의 (10대, 20대, 30대, 기타)
    bins = [0, 19, 29, 39, 100]  # 나이 구간: 0~19, 20~29, 30~39, 40+
    labels = ['10대', '20대', '30대', '기타']

    # 나이를 연령대 그룹으로 변환
    # pd.cut : pandas에서 구간별로 그룹을 나누는 함수
    df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels, right=True)
    # value_counts(): 각 그룹별로 몇 개씩 있는지 카운트, sort_index(): 인덱스 순으로 정렬
    counts = df['age_group'].value_counts().sort_index() # 연령대 별 카운트
    return counts.to_dict()  # 딕셔너리 형태로 반환

# ----------------------------[회원 연령대별 구독 현황 산점도 표시]----------------------------
def subscription_age_bubble():
    # 구독 중인 회원들의 생년월일 + user_uuid 가져오기 (NULL 제외)
    df = pd.read_sql("""
        SELECT u.birth_date, s.user_uuid
        FROM users u
        JOIN user_subscription s ON u.user_uuid = s.user_uuid
        WHERE s.active = 1 AND u.birth_date IS NOT NULL
    """, engine)

    # birth_date 컬럼을 datetime 형식으로 변환 (문자열이면 날짜 타입으로 변환)
    df['birth_date'] = pd.to_datetime(df['birth_date'])
    # 나이 계산: 현재 연도 - 출생 연도
    df['age'] = (pd.Timestamp.now().year - df['birth_date'].dt.year)

    # 연령대 그룹 만들기
    def age_group(age):
        if age < 20:
            return '10대'
        elif age < 30:
            return '20대'
        elif age < 40:
            return '30대'
        else:
            return '기타'
    # 나이에 따라 연령대 그룹 컬럼 추가
    df['age_group'] = df['age'].apply(age_group)

    # y축: 나이의 일의 자리만 추출
    df['y'] = df['age'] % 10

    # 점 크기: 일의 자리 0~5는 작게, 6~9는 크게
    def bubble_size(y):
        return 5 if y <= 5 else 10

    # 점 크기를 계산해서 새로운 컬럼(r)에 저장
    df['r'] = df['y'].apply(bubble_size)

    # 최종 포맷
    result = {}
    # 연령대(10대, 20대 등)별로 데이터를 묶어 반복
    for group, group_df in df.groupby('age_group'):
        # .rename(columns={'age': 'x'}) : age를 x로 이름 변경 (버블차트용)
        result[group] = group_df[['age', 'y', 'r']] \
            .rename(columns={'age': 'x'}) \
            .to_dict(orient='records')

    return result
