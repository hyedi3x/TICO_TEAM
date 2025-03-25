// 음악 파일 재생
export const playSound = (soundUrl) => {
    return `
        window.activeAudios = window.activeAudios || [];
        
        const audio = new Audio(${soundUrl});

        // 현재 오디오를 큐에 추가하고 재생
        window.activeAudios.push(audio);
        audio.play().then(() => {
            // 재생이 시작된 후, 끝난 후 자동으로 큐에서 제거
            audio.onended = () => {
                window.activeAudios = window.activeAudios.filter(a => a !== audio);
            };
        }).catch(error => {
            // 에러 발생 시 처리
            console.error("Audio play error: ", error);
        });\n`;
};

// 특정 시간 동안만 재생
export const playSoundDuration = (soundUrl, duration) => {
    return `
        window.activeAudios = window.activeAudios || [];
        
        const audio = new Audio(${soundUrl});

        // 현재 오디오를 큐에 추가하고 재생
        window.activeAudios.push(audio);
        audio.play().then(() => {
            // 재생이 시작된 후, 일정 시간이 지나면 멈추고 큐에서 제거
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                window.activeAudios = window.activeAudios.filter(a => a !== audio);
            }, ${duration} * 1000);
        }).catch(error => {
            // 에러 발생 시 처리
            console.error("Audio play error: ", error);
        });\n`;
};

// 특정 구간만 재생
export const playSoundRange = (soundUrl, startTime, endTime) => {
    return `
        window.activeAudios = window.activeAudios || [];
        
        const audio = new Audio(${soundUrl});

        audio.currentTime = ${startTime};

        // 현재 오디오를 큐에 추가하고 재생
        window.activeAudios.push(audio);
        audio.play().then(() => {
            // 일정 시간이 지나면 멈추고 큐에서 제거
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                window.activeAudios = window.activeAudios.filter(a => a !== audio);
            }, (${endTime} - ${startTime}) * 1000);
        }).catch(error => {
            // 에러 발생 시 처리
            console.error("Audio play error: ", error);
        });\n`;
};

// 소리 정지 블록 (전체/하나(제일 최근) 선택)
export const stopSounds = (option) => {
    if (option === 'ALL') {
        return `
            window.activeAudios.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            window.activeAudios = [];\n`;
    } else if (option === 'ONE') {
        return `
            if (window.activeAudios.length > 0) {
                let audio = window.activeAudios[window.activeAudios.length - 1];
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                    window.activeAudios.pop();
                }
            }\n`;
    }
};

// 전체 소리의 빠르기를 배수로 설정
export const multipleSoundSpeed = (multiple) => {
    return `
        window.activeAudios = window.activeAudios || [];
        window.activeAudios.forEach(audio => {
            audio.playbackRate = audio.playbackRate * ${multiple};
        });\n`;
};
