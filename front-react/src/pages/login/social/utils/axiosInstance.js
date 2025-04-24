import axios from 'axios';

// 1) Axios 인스턴스 생성: 기본 URL, JSON 헤더, 쿠키 전송 허용 설정
const axiosInstance = axios.create({ // 서버와 통신할 때 사용하는 axios 인스턴스 생성
  baseURL: 'http://localhost:8081', //  baseURL : 기본 url생성 (기준)
  withCredentials: true,   // ← 쿠키(withCredentials) 허용
  headers: {  
    'Content-Type': 'application/json' // 모든 요청에 Content-Type / application/json 포함
  }
});

// 2) 요청 인터셉터: 모든 요청에 저장된 Access Token을 Authorization 헤더에 자동 추가
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

     // ① HTTP 401 Unauthorized 에러, 아직 재시도하지 않은 요청인 경우
     if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // 재시도 플래그 설정

      try {
        // ② 쿠키에 담긴 HttpOnly Refresh Token을 사용해 재발급 요청
        const res = await axiosInstance.post('/auth/refresh');
        const newAccessToken = res.data.accessToken;

        // ③ 받은 새로운 Access Token을 저장하고 기본 헤더에 적용
        localStorage.setItem('accessToken', newAccessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // ④ 원래 실패했던 요청을 새로운 토큰으로 재실행
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 재발급 실패 시: 로컬 스토리지 초기화 후 로그인 페이지로 이동
        console.error('토큰 재발급 실패', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 401 이외 에러, 또는 이미 재시도한 요청인 경우 에러를 그대로 반환
    return Promise.reject(error);
  }
);

export default axiosInstance;