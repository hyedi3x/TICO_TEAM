import { javascriptGenerator } from 'blockly/javascript';
import * as sound from "../functions/sound/sounds";
import * as move from "../functions/move/moves";
import * as appearance from "../functions/appearance/appearances";

export const registerBlockGenerators = () => {
    // 요소 이동 방향과 거리 처리 블록
    javascriptGenerator.forBlock['move_in_direction'] = function(block) {
        let angle = javascriptGenerator.valueToCode(block, 'ANGLE', javascriptGenerator.ORDER_ATOMIC) || '0';
        let distance = javascriptGenerator.valueToCode(block, 'DISTANCE', javascriptGenerator.ORDER_ATOMIC) || '0';
        let code = move.moveInDirection('sprite', angle, distance);
        return code;
    };

    // 오소 X좌표 입력값만큼 바꾸기
    javascriptGenerator.forBlock['move_coordX'] = function(block){
        let coordX = javascriptGenerator.valueToCode(block, 'COORDX', javascriptGenerator.ORDER_ATOMIC) || '0';
        let code = move.moveCoordX('sprite', coordX);
        return code;
    };

    // 요소 Y좌표 입력값만큼 바꾸기
    javascriptGenerator.forBlock['move_coordY'] = function(block){
        let coordY = javascriptGenerator.valueToCode(block, 'COORDY', javascriptGenerator.ORDER_ATOMIC) || '0';
        let code = move.moveCoordY('sprite', coordY);
        return code;
    };

    // 요소 X좌표 입력값으로 변경하기
    javascriptGenerator.forBlock['change_coordX'] = function(block){
        let valueX = javascriptGenerator.valueToCode(block, 'X', javascriptGenerator.ORDER_ATOMIC);
        let code = move.changeCoordX('sprite', valueX);
        return code;
    };

    // 요소 Y좌표 입력값으로 변경하기
    javascriptGenerator.forBlock['change_coordY'] = function(block){
        let valueY = javascriptGenerator.valueToCode(block, 'Y', javascriptGenerator.ORDER_ATOMIC);
        let code = move.changeCoordY('sprite', valueY);
        return code;
    };

    // 요소를 회전하기
    javascriptGenerator.forBlock['rotate_element'] = function(block){
        const rotate = javascriptGenerator.valueToCode(block, 'ROTATE', javascriptGenerator.ORDER_ATOMIC);
        let code = move.rotateElement('sprite', rotate);
        return code;
    };
    
    // 요소 보이기
    javascriptGenerator.forBlock['show_object'] = function(){
        let code = appearance.showObject('sprite');
        return code;
    };
    
    // 요소 숨기기
    javascriptGenerator.forBlock['hide_object'] = function(){
        let code = appearance.hideObject('sprite');
        return code;
    };

    // 요소 위에 말풍선 띄우기
    javascriptGenerator.forBlock['show_bubble'] = function(block){
        const bubbleText = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || 0;
        const code = appearance.showBubble('sprite', bubbleText);
        return code;
    };

    // 일정 시간 요소 위에 말풍선 띄우기
    javascriptGenerator.forBlock['show_bubble_duration'] = function(block){
        const bubbleText = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || 0;
        const bubbleDuration = javascriptGenerator.valueToCode(block, 'DURATION', javascriptGenerator.ORDER_ATOMIC) || 0;
        const code = appearance.showBubbleDuration('sprite', bubbleText, bubbleDuration);
        return code;
    };

    // 요소 색상, 밝기, 투명도 변경하기
    javascriptGenerator.forBlock['change_appearance'] = function(block) {
        const property = block.getFieldValue("PROPERTY");
        const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || 0;
        let code = appearance.changeAppearance('sprite', property, value);
        return code;
    };

    // 요소 크기를 입력값만큼 변경하기
    javascriptGenerator.forBlock['change_object'] = function(block){
        const size = javascriptGenerator.valueToCode(block, "SIZE", javascriptGenerator.ORDER_ATOMIC) || 0;
        let code = appearance.changeObject('sprite', size);
        return code;
    };

    // 요소 크기를 입력값으로 변경하기
    javascriptGenerator.forBlock['resize_object'] = function(block){
        const size = javascriptGenerator.valueToCode(block, "SIZE", javascriptGenerator.ORDER_ATOMIC) || 0;
        let code = appearance.resizeObject('sprite', size);
        return code;
    };

    // 좌우/상하 반전시키기
    javascriptGenerator.forBlock['flip_object'] = function(block){
        const flip = block.getFieldValue("FLIP_DIRECTION");
        let code = appearance.flipObject('sprite', flip);
        return code;
    }

    // 모양 바꾸기
    javascriptGenerator.forBlock['change_shape'] = function(block) {
        const another = javascriptGenerator.valueToCode(block, 'ANOTHER_SHAPE', javascriptGenerator.ORDER_ATOMIC);
        let code = appearance.changeShape('sprite', another);
        return code;
    };

    // 음악 파일 재생
    javascriptGenerator.forBlock['play_sound'] = function(block) {
        let soundFile = javascriptGenerator.valueToCode(block, 'SOUND', javascriptGenerator.ORDER_ATOMIC);

        // .mp3 확장자가 없으면 추가
        if (soundFile && !soundFile.endsWith('.mp3')) {
            soundFile = soundFile.replace(/['"]/g, '') + '.mp3';
            soundFile = `"${soundFile}"`;
        }
        
        let code = sound.playSound(soundFile);
        return code;
    };

    // 특정 시간 동안만 재생
    javascriptGenerator.forBlock['play_sound_duration'] = function(block) {
        let soundFile = javascriptGenerator.valueToCode(block, 'SOUND', javascriptGenerator.ORDER_ATOMIC);
        let duration = javascriptGenerator.valueToCode(block, 'DURATION', javascriptGenerator.ORDER_ATOMIC);

        // .mp3 확장자가 없으면 추가
        if (soundFile && !soundFile.endsWith('.mp3')) {
            soundFile = soundFile.replace(/['"]/g, '') + '.mp3';
            soundFile = `"${soundFile}"`;
        }

        let code = sound.playSoundDuration(soundFile, duration);
        return code;
    };

    // 특정 구간만 재생
    javascriptGenerator.forBlock['play_sound_range'] = function(block) {
        let soundFile = javascriptGenerator.valueToCode(block, 'SOUND', javascriptGenerator.ORDER_ATOMIC);
        let startTime = javascriptGenerator.valueToCode(block, 'START', javascriptGenerator.ORDER_ATOMIC);
        let endTime = javascriptGenerator.valueToCode(block, 'END', javascriptGenerator.ORDER_ATOMIC);

        // .mp3 확장자가 없으면 추가
        if (soundFile && !soundFile.endsWith('.mp3')) {
            soundFile = soundFile.replace(/['"]/g, '') + '.mp3';
            soundFile = `"${soundFile}"`;
        }

        let code = sound.playSoundRange(soundFile, startTime, endTime);
        return code;
    };

    // 소리 정지 블록 (전체/하나(제일 최근) 선택)
    javascriptGenerator.forBlock['stop_sounds'] = function(block) {
        let stopOption = block.getFieldValue('STOP_OPTION');
        let code = sound.stopSounds(stopOption);
        return code;
    };
    
    // 전체 소리의 빠르기를 배수로 설정
    javascriptGenerator.forBlock['multiple_soundspeed'] = function(block) {
        let multiple = javascriptGenerator.valueToCode(block, 'MULTIPLE', javascriptGenerator.ORDER_ATOMIC);
        let code = sound.multipleSoundSpeed(multiple);
        return code;
    };
};