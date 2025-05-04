import pandas as pd
from sqlalchemy import create_engine
from chatbot import config  # DB 접속 정보 불러오기

# ----------------------------[회원 참여도/학습률 분석]----------------------------
def user_dashboard_summary():
    # DB 연결 URL 구성 (mysql+pymysql 처리)
    # Pandas가 SQL DB와 직접 대화할 수 있도록 연결 객체(engine)를 만듦.
    # Pandas는 자체적으로 DB 드라이버가 없으므로, SQLAlchemy의 engine 객체를 통해 간접적으로 DB와 통신
    db_url = f"mysql+pymysql://{config.MARIA_USER}:{config.MARIA_PASSWORD}@{config.MARIA_HOST}:{config.MARIA_PORT}/{config.MARIA_DB}"
    engine = create_engine(db_url)  # create_engine() : DB 연결을 생성

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
