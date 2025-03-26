# 스프링 부트 
### 라이브러리 사용
| JPA <br/>
| ORACLE & Mybatis<br/>
| MAVEN <br/>
| Lombok
<br/>
<br/>


# 서버 실행
```shell
cd front-react

# install 필수, node module 설치 과정, npm install --save 명령어 강제 설치
# package.json에 버전 설정을 git에 업로드 시, 모든 라이브러리 자동 설치
npm install
npm start 
```
<br/>
<br/>

# install
```shell
# 기본 설정
npm i react-router-dom    # React 애플리케이션에서 라우팅 기능을 제공, 페이지 간의 이동을 관리하는 데 사용
npm i redux react-redux   # redux : React 애플리케이션에서 상태 관리/애플리케이션의 상태를 중앙 집중식으로 관리하여 컴포넌트 간의 상태 공유를 용이, react-redux : Redux 스토어에 접근할 수 있도록 도와주는 라이브러리

# UI install(bootstrap, swiper, fortawsome)
npm i react-bootstrap bootstrap  

npm i swiper

npm install --save @fortawesome/react-fontawesome       # 필수 패키지 설치 : React 컴포넌트 형태로 아이콘을 렌더링하고 스타일을 적용하는 기능
npm install --save @fortawesome/fontawesome-svg-core    # 필수 패키지 : SVG 아이콘 관리, 아이콘 라이브러리 관리, JavaScript API 제공, 리액트와 다른 프레임워크와의 통합
npm install --save @fortawesome/free-solid-svg-icons    # 채워진 아이콘 ex) 돋보기 아이콘(Header.jsx)
npm install --save @fortawesome/free-regular-svg-icons  # 보통의 아이콘
npm install --save @fortawesome/free-brands-svg-icons   # 브랜트 아이콘 ex) 페이스북

npm install react-icons # 아이콘 모음

```

<br/>
<br/>


# package.json 수정 
| 자동으로 19.0.0으로 최신 리액트 설치되므로, 18버전으로 낮추기
```json
  // 기존 버전 
  "dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
}

  // 수정 (중요!)
  "dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
}
```

<br/>
<br/>

## 기타 참고사항
###  플젝 생성 
```shell
# npx create-react-app 플젝명
npx create-react-app front-react
```
<br/>
<br/>

### 삭제할 파일 목록(REACT)
#### `public/` 
```
| favicon.ico
| logo192.png
| logo512.png
| manifest.json
| robots.txt
```
<br/>

#### `src/`
```
| App.test.js
| logo.svg
| reportWebVitals.js
| setupTests.js
```
<br/>
<br/>

## gitignore 에 추가
### Eclipse ###
```.metadata
bin/
tmp/
*.tmp
*.bak
*.swp
*~.nib
local.properties
.settings/
.loadpath
.recommenders
```