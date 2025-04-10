import pandas as pd
import pymysql  # conda install -c anaconda pymysql
from dotenv import load_dotenv  # env 파일 로드, pip install
import io  # 파일 입출력
import sys
import os  # 운영체제
from pathlib import Path  # 경로를 객체처럼 다룰 수 있어서 더 직관적이고 플랫폼에 독립적인 코드 작성이 가능

# 현재 스크립트 파일 기준으로 경로 설정
base_path = Path(__file__).resolve().parent  # 현재 파이썬 파일의 디렉토리

# python 표준 출력 스트림 인코딩 변경
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 루트 경로 기준으로 .env 경로 설정 (상위 3단계로 올라감)
env_path = Path(__file__).resolve().parents[2] / ".env"

# 전역 .env 불러오기 + override 필수
load_dotenv(dotenv_path=env_path, override=True)

# 환경변수에서 DB 접속 정보 가져오기
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))  # 포트는 정수형으로 변환
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# env load 확인 - db 데이터 출력
print(f"DB_HOST: {DB_HOST}")
print(f"DB_PORT: {DB_PORT}")
print(f"DB_USER: {DB_USER}")
print(f"DB_PASSWORD: {DB_PASSWORD}")
print(f"DB_NAME: {DB_NAME}")

# conda 환경이 아닌 pip 환경에서 run code 할 시, 디렉토리 위치 확인 중요
print("현재 작업 디렉토리 출력:", os.getcwd())  # getcwd: 현재 작업 디렉토리 반환
os.chdir(os.path.dirname(os.path.abspath(__file__))) # abspath : 주어진 경로의 절대 경로(absolute path)를 반환

# CSV 파일 읽기
csv_path = base_path / "../data_sets/HRDataset_v14.csv"
df = pd.read_csv(csv_path, encoding="utf-8")

pd.set_option('display.max_columns', None)   # pandas에서 df.head시 컬럼 일부 생략됨, 모든 컬럼을 확인용 
pd.set_option('display.max_rows', None)
pd.set_option('display.colheader_justify', 'left')  # 기본 컬럼명 오른쪽 정렬, 왼쪽 정렬로 변경

print("CSV 파일 3개 행 출력(csv 컬럼 및 데이터 확인):")
print(df.head(3))
print("--------------------------------------------------------------")

# 불필요한 컬럼 제거 (존재하지 않는 컬럼은 무시)
exclude_cols = [
    "MarriedID", "MaritalStatusID", "GenderID", "EmpStatusID", "DeptID", "PerfScoreID", "FromDiversityJobFairID",
    "Termd", "PositionID", "State", "Zip", "Sex", "MaritalDesc", "CitizenDesc", "HispanicLatino", "RaceDesc"
    ,"TermReason", "EmploymentStatus", "Department", "ManagerName", "ManagerID", "RecruitmentSource", "PerformanceScore",
    "EngagementSurvey", "EmpSatisfaction", "SpecialProjectsCount", "LastPerformanceReview_Date", "DaysLateLast30", "Absences"
]
df = df.drop(columns=exclude_cols, errors="ignore") # drop : 특정 행/컬럼 제거, errors="ignore" : 없는 컬럼이 존재해도 무시(에러 없이)

# 컬럼별 데이터 타입을 확인 (불필요한 컬럼 제거되었는지 확인)
print("데이터 타입 확인(불필요한 컬럼들이 제거 되었는지 확인) : \n", df.dtypes)
print("--------------------------------------------------------------")

# 컬럼명 변경
df.rename(columns={
    "Employee_Name" : "emp_name",  # 사원 이름
    "Position" : "job_title",      # 직무명
    "EmpID" : "emp_id",            # 사번
    "Salary" : "salary",           # 월급
    "DOB" : "emp_birth",           # 사원 생년월일
    "DateofHire" : "hire_date",    # 입사일
    "DateofTermination" : "termination_date",  # 퇴사일
}, inplace=True)  # inplace=True : 데이터프레임을 직접 수정(변경) 하도록 만드는 옵션

# 컬럼명 확인 
print("변경된 컬럼명 확인 : \n", df.columns)
print("--------------------------------------------------------------")

# 사원 이름 전처리 (성, 이름 형식 -> 이름만 추출)
df["emp_name"] = df["emp_name"].apply(lambda x: x.split(",")[-1].strip())  # 성과 이름을 ,로 구분 -> -1 : 데이터의 뒤에서 첫 번째 값을 추출

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

# csv 데이터의 position 데이터를 jobs 변수에 담음
jobs = df["job_title"]

# 중복을 제거하고 정렬
unique_jobs = sorted(set(jobs)) # set(jobs) : 중복 제거, sorted : 정렬(알파벳 순서)

# 순차적인 job_map 생성 (JOB001, JOB002...)
# enumerate(unique_jobs) : unique_jobs 리스트에서 (인덱스, 직업명) 형태의 튜플을 생성
# f"JOB{str(i+1).zfill(3)}" : str(i+1) : 1씩 증가, zfill(3) : 3자리 수
job_map = {job: f"JOB{str(i+1).zfill(3)}" for i, job in enumerate(unique_jobs)}

# job_map 확인 (줄바꿈하여 출력)
print("job_map:")
for job_name, job_id in job_map.items():
    print(f"{job_name}: {job_id}")
print("--------------------------------------------------------------")

# job_map을 활용하여 새로운 컬럼 'job_id' 추가
# map() : 직업명(job_title)을 job_map 딕셔너리를 사용하여 대응되는 값으로 변환
df["job_id"] = df["job_title"].map(job_map) 

# 컬럼별 데이터 타입을 확인(컬럼 추가 확인)
print("데이터 타입 확인(컬럼 추가 확인) : \n", df.dtypes)
print("--------------------------------------------------------------")

# job_id를 기준으로 부서 코드를 매핑하는 함수
def map_position_to_department(job_id):
    # pd.isna() : 결측값을 처리하는 데 사용되는 함수, job_id가 없으면 None(NaN)을 반환
    if pd.isna(job_id):
        return None
    # 각 조건에 따른 job_id 그룹
    # HR: Administrative Assistant, Shared Services Manager
    if job_id in {"JOB002", "JOB027"}:
        return dep_map["HR"]
    # CM: Area Sales Manager, Director of Operations, Director of Sales, Sales Manager
    elif job_id in {"JOB003", "JOB011", "JOB012", "JOB025"}:
        return dep_map["CM"]
    # PAY: Accountant I, Sr. Accountant
    elif job_id in {"JOB001", "JOB030"}:
        return dep_map["PAY"]
    # DA: BI Developer, BI Director, Data Analyst, Data Analyst, Data Architect, Principal Data Architect, Senior BI Developer
    elif job_id in {"JOB004", "JOB005", "JOB007", "JOB008", "JOB009", "JOB021",  "JOB026"}:
        return dep_map["DA"]
    # CS: IT Support
    elif job_id in {"JOB018"}:
        return dep_map["CS"]
    # MO: President & CEO, Production Manager, Production Technician I, Production Technician II
    elif job_id in {"JOB020", "JOB022", "JOB023", "JOB024"}:
        return dep_map["MO"]
    # SYSO: CIO, IT Director, IT Manager - DB, IT Manager - Infra, IT Manager - Support, Network Engineer, Software Engineer, Software Engineering Manager, Sr. DBA, Sr. Network Engineer, Database Administrator, Enterprise Architect
    elif job_id in {"JOB006", "JOB014", "JOB015", "JOB016", "JOB017", "JOB019", "JOB028", "JOB029", "JOB031", "JOB032", "JOB010", "JOB013"}:
        return dep_map["SYSO"]
    else:
        return None

# job_id 컬럼을 이용해 dep_id 생성
# apply() : 함수 적용 메서드-> map_position_to_department 함수 실행 
df["dep_id"] = df["job_id"].apply(map_position_to_department)

# 부서 코드가 매핑된 데이터프레임 출력 (job_id와 dep_id)
# notna() : 결측값이 아닌 행들만 필터링
mapped_df = df[df["dep_id"].notna()]

# mapped_df[["job_id", "dep_id"]] : mapped_df 데이터프레임에서 job_id와 dep_id 열만 선택
# drop_duplicates : 중복된 행 제거, sort_values : 값 정렬, by : 어떤 컬럼을 기준으로, ascending : 오름차순 여부
print("job_id와 매핑된 부서 코드: \n", mapped_df[["job_id", "dep_id"]].drop_duplicates().sort_values(by="job_id", ascending=True))
print("--------------------------------------------------------------")

# 중복 방지를 위한 이메일 세트
existing_emails = set()

# 유일한 이메일 생성 함수
def generate_unique_email(emp_name):  # 이메일 생성이 사원 이름 기반이므로 emp_name을 매개변수로 받아옴
    base_name = emp_name.lower().replace(' ', '')  # 이름 전체를 소문자로 변경, 공백을 제거 (성+이름)
    base_email = f"{base_name}@gmail.com"
    email = base_email
    suffix = 1  # 이름 중복 시 붙일 숫자를 위해 초기값 1 설정.

    # 이미 존재하는 이메일이면, 중복이 없을 때까지 반복:
    while email in existing_emails:
        email = f"{base_name}{suffix}@gmail.com"
        suffix += 1
    existing_emails.add(email)   # 업데이트 된 이메일을 다시 set에 add 
    return email 

# DataFrame에 유일한 이메일 생성 적용
df["emp_email"] = df["emp_name"].apply(generate_unique_email)

# 날짜 변환
# to_datetime : 날짜 형식의 데이터를 변환하는 함수, errors="coerce": 날짜로 변환할 수 없는 값 -> NaT(Not a Time)로 처리
# fillna(pd.NaT) : 결측값을 채우는 작업, NaT 처리되지 않은 Null 값을 NaT로 채움
df["emp_birth"] = pd.to_datetime(df["emp_birth"], errors="coerce").fillna(pd.NaT)  # 사원 생년월일
df["hire_date"] = pd.to_datetime(df["hire_date"], errors="coerce").fillna(pd.NaT)   # 사원 입사일
df["termination_date"] = pd.to_datetime(df["termination_date"], errors="coerce").fillna(pd.NaT)  # 사원 퇴사일 

# 생년월일에서 1900년대가 아닌 2000년대가 들어간 데이터를 수정하는 함수
def correct_birth_year(df):
    current_year = pd.to_datetime('today').year  # 현재 년도를 불러옴
    for idx, row in df.iterrows():       # 한 행씩 순회하면서 인덱스(idx)와 행 데이터(row)를 반환
        if pd.notna(row['emp_birth']):   # 생년월일 값이 존재할 때만 진행
            birth_year = row['emp_birth'].year
            # 생년월일 연도가 2000년대(2000년 이상, 2100년 미만)에 해당하면 잘못된 값으로 판단
            if birth_year >= 2000 and birth_year < 2100:
                corrected_birth = row['emp_birth'].replace(year=birth_year - 100)
                df.at[idx, 'emp_birth'] = corrected_birth  # 수정된 생년월일 값을 원본 데이터프레임의 해당 행에 업데이트
    return df  # 모든 행을 순회한 후 수정된 데이터프레임을 반환

# 생년월일 데이터 수정
df = correct_birth_year(df)

# 수정된 데이터 확인
print("수정된 생년월일 데이터:")
print(df[['emp_id', 'emp_name', 'emp_birth']].head())
print("--------------------------------------------------------------")

# 이름 + 생년월일(MMDD) 조합으로 비밀번호 생성
df["emp_pwd"] = df.apply(lambda row: f"{row['emp_name']}{row['emp_birth'].strftime('%m%d')}" if pd.notna(row['emp_birth']) else None, axis=1)

# 연봉 계산 (월급 * 12)
df["annual_salary"] = df["salary"] * 12

# 10% 소득세를 제외한 연봉 계산 (세후 연봉)
df["net_annual_salary"] = df["annual_salary"] * 0.9

# 연봉 및 세후 연봉 데이터 확인
print("연봉과 세후 연봉 계산 후 데이터 확인:")
print(df[["emp_id", "emp_name", "salary", "annual_salary", "net_annual_salary"]].head())
print("--------------------------------------------------------------")

print("최종 데이터프레임(310개의 데이터 중 150개만 조회):")
print(df.head(150))
print("--------------------------------------------------------------")

# PyMySQL을 사용한 DB 연결 함수
def connect_to_mariadb():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        print("✓ MariaDB에 연결되었습니다.")
        return connection
    except Exception as e:
        print(f"※ MariaDB 연결에 실패했습니다: {e}")
        return None

# JOBS 테이블에 직무 데이터 삽입 함수 (중복 여부 확인 후 삽입)
def insert_job_data_to_mariadb(df, conn):
    cursor = conn.cursor()
    # iterrows() : 각 행에 대해 인덱스와 행(row)을 반환, _ : 인덱스를 받지만 사용하지 않는 경우
    for _, row in df.iterrows():
        job_id = row["job_id"]
        job_title = row["job_title"]
        dep_id = row["dep_id"]  # 부서 ID 포함

        # cursor.execute :  SQL 쿼리를 실행하는 메서드
        # JOBS 테이블에서 job_id 컬럼이 존재하는지 확인 
        cursor.execute("SELECT COUNT(*) as cnt FROM jobs WHERE job_id = %s", (job_id,))
        result = cursor.fetchone()  # fetchone() : 쿼리 결과 중 첫 번째 행을 반환
        if result[0] == 0:  # result[0]으로 튜플의 첫 번째 요소를 접근
            insert_query = "INSERT INTO jobs (job_id, job_title, dep_id) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (job_id, job_title, dep_id))
        else:
            update_query = "UPDATE jobs SET job_title = %s, dep_id = %s WHERE job_id = %s"
            cursor.execute(update_query, (job_title, dep_id, job_id))
    conn.commit() # conn.commit() : 데이터베이스에 변경사항을 적용하는 메서드
    print("✓ 직무 데이터 삽입 완료")
    cursor.close()

# EMPLOYEES 테이블에 사원 데이터 삽입 및 이메일 중복 업데이트 함수
def insert_or_update_employee(df, conn):
    cursor = conn.cursor()
    for _, row in df.iterrows():
        emp_email = row["emp_email"]

        # 'NaT' 값을 None으로 처리하여 NULL로 변환(MySql에서 NaT값을 insert할 때 에러 발생)
        emp_birth = row["emp_birth"] if pd.notna(row["emp_birth"]) else None
        hire_date = row["hire_date"] if pd.notna(row["hire_date"]) else None
        termination_date = row["termination_date"] if pd.notna(row["termination_date"]) else None
        
        # 이메일이 이미 존재하는지 확인(UNIQUE 에러)
        cursor.execute("SELECT COUNT(*) as cnt FROM employees WHERE emp_email = %s", (emp_email,))
        result = cursor.fetchone()
        if result[0] == 0:  # result[0]으로 튜플의 첫 번째 요소를 접근
            # 이메일이 없으면 삽입
            insert_query = """
            INSERT INTO employees (
                emp_id, emp_pwd, emp_name, dep_id, job_id, emp_email,
                emp_birth, salary, annual_salary, net_annual_salary,
                hire_date, termination_date
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                row["emp_id"], row["emp_pwd"], row["emp_name"], row["dep_id"], row["job_id"],
                row["emp_email"], emp_birth, row["salary"], row["annual_salary"],
                row["net_annual_salary"], hire_date, termination_date
            ))  # values는 튜플 형태로 전달
        else:
            # 이메일이 있으면 업데이트
            update_query = """
            UPDATE employees
            SET emp_name = %s, dep_id = %s, job_id = %s, emp_birth = %s,
                salary = %s, annual_salary = %s, net_annual_salary = %s,
                hire_date = %s, termination_date = %s, emp_pwd = %s
            WHERE emp_email = %s
            """
            cursor.execute(update_query, (
                row["emp_name"], row["dep_id"], row["job_id"], emp_birth,
                row["salary"], row["annual_salary"], row["net_annual_salary"],
                hire_date, termination_date, row["emp_pwd"], row["emp_email"]
            ))  # values는 튜플 형태로 전달
    conn.commit()
    print(f"✓ {cursor.rowcount}개의 사원 데이터 삽입/업데이트 완료")
    cursor.close()

# 데이터프레임을 MariaDB에 삽입
def insert_data_to_mariadb(df):
    conn = connect_to_mariadb()
    if conn is None:
        print("※ DB 연결 실패. 데이터 삽입을 중단합니다.")
        return
    try:
        # 먼저 JOBS 데이터 삽입
        insert_job_data_to_mariadb(df, conn)
        # EMPLOYEES 데이터 삽입 및 중복 이메일 처리
        insert_or_update_employee(df, conn)
    except Exception as e:
        print(f"※ 데이터 삽입 오류: {e}")
    finally:
        if conn:
            conn.close()
            print("✓ MariaDB 연결 종료")

# 데이터프레임을 일정 단위로 분할하여 MariaDB에 삽입
BATCH_SIZE = 50  # 원하는 배치 크기 지정

for start in range(0, len(df), BATCH_SIZE):
    end = start + BATCH_SIZE
    batch_df = df.iloc[start:end]  # DataFrame의 부분 집합 추출
    print(f"\n {start}번 ~ {end-1}번 인덱스 데이터 처리 중...")
    insert_data_to_mariadb(batch_df)
