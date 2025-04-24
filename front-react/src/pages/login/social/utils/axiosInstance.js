import axios from 'axios';

const axiosInstance = axios.create({ // 서버와 통신할 때 사용하는 axios 인스턴스 생성
  baseURL: 'http://43.202.174.19:8081', //  baseURL : 기본 url생성 (기준)
  withCredentials: true,  // 쿠키(withCredentials) 허용
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

     // ① HTTP 401 && 아직 _retry 안 한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // ② 서버에 쿠키만 달랑 보내서 refresh 시도
        const { data } = await axiosInstance.post('/auth/refresh');
        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        // ③ 새 토큰으로 헤더 교체
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // ④ 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (_) {
        // 재발급 실패 시 로그인 강제
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
