import axios from 'axios';

const axiosInstance = axios.create({ // 서버와 통신할 때 사용하는 axios 인스턴스 생성
  baseURL: 'http://43.202.174.19:8081', //  baseURL : 기본 url생성 (기준)
  headers: {  
    'Content-Type': 'application/json' // 모든 요청에 Content-Type / application/json 포함
  }
});

// 로컬스토리지의 토큰을 헤더에 추가 (서버로 요청을 보내기전 이 함수가 먼저 실행됨)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Callback에 에서 localStorage 저장한 토큰을 가져와서 
    // 만약 토큰이 있다면 요청 헤더에 Authorization: Bearer {토큰} 형식으로 추가함
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
  // 모든 요청에 인증 토큰이 자동으로 포함되는점 알아두기
);

// 401 에러 발생 시 토큰 재발급 시도
axiosInstance.interceptors.response.use( 
  (response) => response, // 정상 응답일떄는 그냥 반환함
  async (error) => { // 에러 발생시 아래 코드 실행됨
    const originalRequest = error.config;  // 에러 발생한 원래 요청 설정을 저장
    const refreshToken = localStorage.getItem('refreshToken');
    // localStorage에서 새로운 토큰을 받기 위한 refreshToken을 가져옴

    // 서버 인증 실패 401 에러를 반환하면 아래함수 실행됨
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true; 
      // refreshToken가 존재한다면 새로운 accessToken 받을 수 있음
      // originalRequest._retry : 재시도한적이 없다면 재시도를 진행함
      // originalRequest._retry = true : 재시도 중복 실행을 막기 위해 플래그를 설정

      try {
        const payload = JSON.parse(atob(refreshToken.split('.')[1]));
        // refreshToken은 jwt 형식이므로 가운데 부분을 디코딩해 이메일과 id를 추출한다
        // JWT(JSON Web Token)는 세 부분(헤더, 페이로드, 서명)으로 구성 되고 각부분은
        // (.)으로 구분되어 있음  예시) 헤더.페이로드.서명
        // 헤더 : 토큰타입, 사용된 암호화 알고리즘 정보를 담고있음
        // 페이로드 : 사용자 정보(예시 : 이메일,아이디 등)와 같은 클래임이 포함됨
        // 서명 : 토큰은 무결성을 검증하기 위한 암호화된 값을 담고있음
        // 인코딩(Encoding)**이란 데이터를 일정한 규칙에 따라 다른 형태의 문자로 바꾸는 것을 의미하거,
        // 여기서는 데이터(예: JSON 객체)를 사람이 읽을 수 없는 형태의 문자열(알파벳, 숫자, 특수문자 등)로 변환하는 것
        // 그럼 디코딩은 인코딩을 반대로 한다 생각하면 이해하기 쉬움 : 사람이 읽지 못하는 데이터를 읽을 수 있게 변환
        const claims = {...payload};
        const res = await axios.post('http://43.202.174.19/auth/refresh', claims)
          // /auth/refresh 엔드 포인트에 post 요청을 보내서 accessToken을 받아옴

        const newAccessToken = res.data.accessToken;
        // 서버로부터 받은 응답 데이터(res.data)에서 새로 발급된 accessToken을 추출
        localStorage.setItem('accessToken', newAccessToken);
        // 새로받아온 accessToken을 다시 localStorage 저장함
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        // 위쪽에서 Authorization: Bearer {토큰}으로 담았던 것 처럼 새로운 newAccessToken을
        // 다시 axios 기본 헤더에 업데이트함
        return axiosInstance(originalRequest);
        // originalRequest "내가 이전에 보냈던 요청" 이라 생각하면 이해하기 쉬움 
      } catch (refreshError) { // 새로운 accessToken 발급에 실패한경우 
        console.error('토큰 재발급 실패');
        localStorage.clear();  // localStorage를 clear 초기화하고 
        window.location.href = '/login'; // 로그인 페이지로 이동
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
    // 401 에러가 아니거나 refreshToken이 없거나 
  }
);

export default axiosInstance;
