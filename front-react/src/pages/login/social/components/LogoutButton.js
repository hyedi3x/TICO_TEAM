// components/LogoutButton.js
import React from 'react';

const LogoutButton = ({ onLogout }) => {

    return (
        <button 
            onClick={onLogout}
            style={{
                backgroundColor: '#FEE500',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold',
            }}
        >
            카카오 로그아웃
        </button>

        
    );
};

export default LogoutButton;