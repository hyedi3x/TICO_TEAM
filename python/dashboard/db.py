import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

MARIA_HOST = os.getenv('DB_HOST')
MARIA_PORT = os.getenv('DB_PORT')
MARIA_USER = os.getenv('DB_USER')
MARIA_PASSWORD = os.getenv('DB_PASSWORD')
MARIA_DB = os.getenv('DB_NAME')

def fetch_dashboard_summary():
    db_url = f"mysql+pymysql://{MARIA_USER}:{MARIA_PASSWORD}@{MARIA_HOST}:{MARIA_PORT}/{MARIA_DB}"
    engine = create_engine(db_url)

    favor_df = pd.read_sql("SELECT * FROM project_favor_tb", engine)
    solved_df = pd.read_sql("SELECT * FROM user_solved_tb", engine)

    participation = favor_df.groupby('user_uuid')['favor_type'].count().reset_index(name='participation_count')
    learning = solved_df.groupby('user_uuid')['solved_count'].sum().reset_index(name='total_solved')

    summary_df = pd.merge(participation, learning, on='user_uuid', how='outer').fillna(0)
    summary_df['participation_count'] = summary_df['participation_count'].astype(int)
    summary_df['total_solved'] = summary_df['total_solved'].astype(int)

    return summary_df.to_dict(orient='records')
