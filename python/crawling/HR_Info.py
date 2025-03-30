import pandas as pd
import pymysql  # conda install -c anaconda pymysql
from dotenv import load_dotenv  # env 파일 로드, pip install
import io  # 파일 입출력
import sys
import os  # 운영체제

# .env 파일 로드
load_dotenv()

# 환경변수에서 DB 접속 정보 가져오기
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))  # 포트는 정수형으로 변환
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# 환경변수 확인 출력
print(f"DB_HOST: {DB_HOST}")
print(f"DB_PORT: {DB_PORT}")
print(f"DB_USER: {DB_USER}")
print(f"DB_PASSWORD: {DB_PASSWORD}")
print(f"DB_NAME: {DB_NAME}")

# python 표준 출력 스트림 인코딩 변경
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("현재 작업 디렉토리 출력:", os.getcwd())
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("현재 작업 디렉토리 출력:", os.getcwd())

# CSV 파일 읽기
df = pd.read_csv("./../data_sets/HRDataset_v14.csv", encoding="utf-8")
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.colheader_justify', 'left')

print("CSV 파일 5개 행 출력:")
print(df.head(5))
print("--------------------------------------------------------------")

# 컬럼명 변경
df.rename(columns={
    "Employee_Name": "emp_name", 
    "Position": "job_id", 
    "EmpID": "emp_id", 
    "Salary": "salary"
}, inplace=True)

# 이름 정제 (성, 이름 -> 이름만 남김)
df["emp_name"] = df["emp_name"].apply(lambda x: x.split(",")[-1].strip())

# 부서 매핑 딕셔너리 (DB의 DEPARTMENT 테이블에 미리 등록되어 있어야 함)
dep_map = {
    "HR": "DEP001",    # 인사팀
    "CM": "DEP002",    # 고객관리팀
    "PAY": "DEP003",   # 결제 관리팀
    "DA": "DEP004",    # 통계 분석팀
    "CS": "DEP005",    # 고객 지원팀
    "MO": "DEP006",    # 콘텐츠 관리팀
    "SYSO": "DEP007",  # 시스템 관리팀
}

# 직책을 부서 코드로 매핑하는 함수
def map_position_to_department(job_id):
    if pd.isna(job_id):
        return None
    job_id = job_id.lower()
    if "shared services manager" in job_id or "administrative" in job_id:
        return dep_map["HR"]
    elif "sales" in job_id or "director of sales" in job_id or "director of operations" in job_id:
        return dep_map["CM"]
    elif "accountant" in job_id:
        return dep_map["PAY"]
    elif "bi" in job_id or "data analyst" in job_id or "data architect" in job_id:
        return dep_map["DA"]
    elif "it support" in job_id:
        return dep_map["CS"]
    elif "production" in job_id or "ceo" in job_id:
        return dep_map["MO"]
    elif ("it" in job_id or "cio" in job_id or "database" in job_id or 
          "enterprise architect" in job_id or "network engineer" in job_id or 
          "software" in job_id or "dba" in job_id):
        return dep_map["SYSO"]
    else:
        return None

# job_id 컬럼을 이용해 dep_id 생성
if 'job_id' in df.columns:
    df['dep_id'] = df['job_id'].apply(map_position_to_department)
    mapped_df = df[df['dep_id'].notna()]
    print("직책과 매핑된 부서 코드:")
    print(mapped_df[['job_id', 'dep_id']].drop_duplicates())
else:
    print("job_id 컬럼이 존재하지 않습니다.")

print("--------------------------------------------------------------")

# emp_email 컬럼 생성 (emp_name을 기반으로, 공백 제거 후 소문자 + "@gmail.com")
if "emp_email" not in df.columns:
    df["emp_email"] = df["emp_name"].apply(lambda x: f"{x.lower().replace(' ', '')}@gmail.com")

# 날짜 변환 (생년월일만 처리)
df["emp_birth"] = pd.to_datetime(df["DOB"], errors="coerce").fillna(pd.NaT)

print("날짜 변환 후 데이터 확인:")
print(df.head())
print("--------------------------------------------------------------")

# 불필요한 컬럼 제거 (존재하지 않는 컬럼은 무시)
exclude_cols = [
    "MarriedID", "MaritalStatusID", "GenderID", "EmpStatusID", "DeptID", "PerfScoreID", "FromDiversityJobFairID",
    "Termd", "PositionID", "State", "Zip", "DOB", "Sex", "MaritalDesc", "CitizenDesc", "HispanicLatino", "RaceDesc",
    "DateofHire", "DateofTermination", "TermReason", "EmploymentStatus", "Department", "ManagerName", "ManagerID",
    "RecruitmentSource", "PerformanceScore", "EngagementSurvey", "EmpSatisfaction", "SpecialProjectsCount",
    "LastPerformanceReview_Date", "DaysLateLast30", "Absences", "hire_date", "termination_date"
]
df = df.drop(columns=exclude_cols, errors="ignore")
print("최종 데이터프레임:")
print(df.head(500))
print("--------------------------------------------------------------")

# PyMySQL을 사용한 DB 연결 함수
def connect_to_mariadb():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ PyMySQL로 MariaDB 연결 성공")
        return connection
    except Exception as e:
        print(f"❌ MariaDB 연결 오류: {e}")
        return None

# JOBS 테이블에 직무 데이터 삽입 (중복 여부 확인 후 삽입)
def insert_job_data_to_mariadb(df, conn):
    cursor = conn.cursor()
    for _, row in df.iterrows():
        job_id = row["job_id"]
        job_title = row["job_id"]  # 여기서는 job_id를 직무명으로 사용
        cursor.execute("SELECT COUNT(*) as cnt FROM JOBS WHERE job_id = %s", (job_id,))
        result = cursor.fetchone()
        if result["cnt"] == 0:
            insert_query = "INSERT INTO JOBS (job_id, job_title) VALUES (%s, %s)"
            cursor.execute(insert_query, (job_id, job_title))
    conn.commit()
    print("✅ 직무 데이터 삽입 완료")
    cursor.close()

# EMPLOYEES 테이블에 사원 데이터 삽입 및 이메일 중복 업데이트 함수
def insert_or_update_employee(df, conn):
    cursor = conn.cursor()
    for _, row in df.iterrows():
        emp_email = row["emp_email"]
        # 이메일이 이미 존재하는지 확인
        cursor.execute("SELECT COUNT(*) as cnt FROM EMPLOYEES WHERE emp_email = %s", (emp_email,))
        result = cursor.fetchone()
        if result["cnt"] == 0:
            # 이메일이 없으면 삽입
            insert_query = """
            INSERT INTO EMPLOYEES (emp_id, emp_name, dep_id, job_id, emp_email, emp_birth) 
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                row["emp_id"], row["emp_name"], row["dep_id"], row["job_id"],
                row["emp_email"], row["emp_birth"]
            ))
        else:
            # 이메일이 있으면 업데이트
            update_query = """
            UPDATE EMPLOYEES
            SET emp_name = %s, dep_id = %s, job_id = %s, emp_birth = %s
            WHERE emp_email = %s
            """
            cursor.execute(update_query, (
                row["emp_name"], row["dep_id"], row["job_id"], row["emp_birth"],
                row["emp_email"]
            ))
    conn.commit()
    print(f"✅ {cursor.rowcount}개의 사원 데이터 삽입/업데이트 완료")
    cursor.close()

# 데이터프레임을 MariaDB에 삽입
def insert_data_to_mariadb(df):
    conn = connect_to_mariadb()
    if conn is None:
        print("❌ DB 연결 실패. 데이터 삽입을 중단합니다.")
        return
    try:
        # 먼저 JOBS 데이터 삽입
        insert_job_data_to_mariadb(df, conn)
        # EMPLOYEES 데이터 삽입 및 중복 이메일 처리
        insert_or_update_employee(df, conn)
    except Exception as e:
        print(f"❌ 데이터 삽입 오류: {e}")
    finally:
        if conn:
            conn.close()
            print("✅ MariaDB 연결 종료")

# 데이터프레임을 MariaDB에 삽입
insert_data_to_mariadb(df)
