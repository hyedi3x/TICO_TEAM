// pages/Main.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Main = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('access_token');

        try {
            await axios.post("http://localhost:8081/api/kakao/unlink", {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('nickname');

            navigate('/loginform'); // 로그아웃 후 로그인 페이지로 이동
        } catch (error) {
            console.error('카카오 로그아웃 실패:', error);
            alert('로그아웃에 실패했습니다.');
        }
    };

    return (
        <div>
            <h1>메인 페이지</h1>
            <button onClick={handleLogout}>카카오 로그아웃</button>
            {/* 메인 페이지 관련 코드 */}
        </div>
    );
};

export default Main;