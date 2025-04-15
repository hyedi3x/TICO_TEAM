import { javascriptGenerator, Order } from 'blockly/javascript';
// eslint-disable-next-line
import { start_btn, start_with_q, start_mouse_clicked } from '../functions/starts/startFunctions';
// eslint-disable-next-line
import { createClone, deleteThisClone } from '../functions/flows/flowFunctions';
// eslint-disable-next-line
import { moveInDirection, changeMoveDirection, moveInDirectionAngle, moveImgToX, moveImgToY, moveImgToXY, changeCoordX, changeCoordY, changeCoordXY, rotateImage, rotateImageInTime, moveToMouse, moveImageInTime } from '../functions/moves/moveFunctions';
// eslint-disable-next-line
import { showObject, hideObject, changeAppearance, changeObject, resizeObject, flipObject, changeShape, setAsBackground } from "../functions/appearances/appearanceFunctions";
// eslint-disable-next-line
import { playSound, playSoundDuration, playSoundRange, stopSounds, multipleSoundSpeed } from "../functions/sounds/soundFunctions";
// eslint-disable-next-line
import { checkCollision } from "../functions/logicals/logicalFunctions";
// eslint-disable-next-line
import { mathRandomInt, startTimer, stopTimer, elapsedTime } from "../functions/cals/calFunctions";

export let imgArr = null; // 백틱은 객체가 잘 안넘어가서 export로 넘겨준다.
export let callImgArr = null;
export let blocklyArr = null;
export let coordinates = null;
const RegisterBlockGenerator = (props) => {
  // 1
  // 이미지 별로 구분해서 실행하기 위해
  imgArr = props.imgArr;
  // const workspaceIndex = props.workspaceIndex;
  callImgArr = props.callImgArr;

  blocklyArr = props.blocklyArr;

  coordinates = props.coordinates;

  // Blockly 블록 생성 코드를 등록
  // javascriptGenerator.forBlock에 할당하는 값은 문자열 형태의 JavaScript 코드, 함수 x
  javascriptGenerator.forBlock['start_btn'] = function(block) {
    return 'start_btn();\n'; // 함수를 호출하는 문자열 반환
  };
  
  javascriptGenerator.forBlock['start_with_q'] = function(block) {
    return 'start_with_q();\n'; // 함수를 호출하는 문자열 반환
  };

  javascriptGenerator.forBlock['start_mouse_clicked'] = function(block){
    return 'start_mouse_clicked();\n';
  };

  // 요소의 복제본 만들기
  javascriptGenerator.forBlock['create_clone'] = function(block){
    const target = block.getFieldValue('TARGET');
    const indexExpr = (target === "self") ? "index" : parseInt(target);
    return `await createClone("${target}", ${indexExpr});`;
  };

  // 생성된 복제본 제어하기
  javascriptGenerator.forBlock['on_clone_created'] = function(block){
    const statements = javascriptGenerator.statementToCode(block, 'DO');
    return statements; // 연결된 블록들을 그대로 실행
  };  

  // 복제본 삭제하기
  javascriptGenerator.forBlock['delete_this_clone'] = function(block) {
    return `await deleteThisClone(index);\n`;
  };  

  // 조건이 참이 될 때까지 계속 실행하기
  javascriptGenerator.forBlock['wait_until_true'] = function(block) {
  const condition = javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
    return `await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (${condition}) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });\n`;
  };

  // 몇 초 동안 기다리기
  javascriptGenerator.forBlock['wait_seconds'] = function(block) {
    const seconds = block.getFieldValue('seconds');
    return `await new Promise(resolve => setTimeout(resolve, ${seconds} * 1000));\n`;
  };

  // 모든 코드 멈추기
  javascriptGenerator.forBlock['stop_all_code'] = function (block) {
    return ` window.running = false;\n`;
  };

  // 이동방향과 일치하는 각도로 입력값만큼 거리 이동
  javascriptGenerator.forBlock['move_in_direction'] = function (block) {
    let distance = block.getFieldValue('distance');
    return `await moveInDirection(${distance}, index, isClone);\n`;
  };

  // 이동방향을 입력값으로 변경
  javascriptGenerator.forBlock['change_move_direction'] = function (block) {
    let direction = javascriptGenerator.valueToCode(block, 'direction', Order.ATOMIC);
    console.log('이동방향을 ',direction,'로 바꾸기');
    return `await changeMoveDirection(${direction}, index, isClone);\n`;
  };

  // 방향과 거리로 이동 (예: 45도 방향으로 50만큼)
  javascriptGenerator.forBlock['move_in_direction_angle'] = function (block) {
    let angle = block.getFieldValue('angle');
    let distance = block.getFieldValue('distance');
    return `await moveInDirectionAngle(${angle}, ${distance}, index, isClone);\n`;
  };

  // x축 이동
  javascriptGenerator.forBlock['move_obj_toX'] = function (block) {
    const x = block.getFieldValue('x');
    return `await moveImgToX(${x}, index, isClone);\n`;
  };

  // y축 이동
  javascriptGenerator.forBlock['move_obj_toY'] = function (block) {
    let y = block.getFieldValue('y');
    return `await moveImgToY(${y}, index, isClone);\n`;
  };

  // x,y축 이동
  javascriptGenerator.forBlock['move_obj_toXY'] = function (block) {
    const x = block.getFieldValue('x');
    const y = block.getFieldValue('y');
    return `await moveImgToXY(${x}, ${y}, index, isClone);\n`;
  };

  // 요소 X좌표 입력값으로 변경하기
  javascriptGenerator.forBlock['change_coordX'] = function(block){
    const valueX = block.getFieldValue('x');
    return `await changeCoordX(${valueX}, index, isClone);\n`;
  };

  // 요소 Y좌표 입력값으로 변경하기
  javascriptGenerator.forBlock['change_coordY'] = function(block){
      const valueY = block.getFieldValue('y');
      return `await changeCoordY(${valueY}, index, isClone);\n`;
  };

  // 요소 X, Y좌표 입력값으로 변경하기
  javascriptGenerator.forBlock['change_coordXY'] = function(block){
      const valueX = javascriptGenerator.valueToCode(block, 'x', Order.ATOMIC);
      const valueY = javascriptGenerator.valueToCode(block, 'y', Order.ATOMIC);
      return `await changeCoordXY(${valueX}, ${valueY}, index, isClone);\n`;
  };

  // 일정 시간 이동 애니메이션
  // x,y축 이동
  javascriptGenerator.forBlock['move_obj_toX_Y_inTime'] = function (block) {
    const x = block.getFieldValue('x');
    const y = block.getFieldValue('y');
    const duration = block.getFieldValue('duration');
    return `await moveImgToXYInTime(${x}, ${y}, ${duration}, index, isClone);\n`;
  };

  // 시계방향 회전
  javascriptGenerator.forBlock['rotate_obj'] = function(block){
    const angle = block.getFieldValue('angle');
    return `await rotateImage(${angle}, index, isClone);\n`;
  };

  // 일정시간 회전 애니메이션
  javascriptGenerator.forBlock['rotate_obj_inTime'] = function(block){
    const angle = block.getFieldValue('angle');
    const duration = block.getFieldValue('duration');
    return `await rotateImageInTime(${angle}, ${duration}, index, isClone);\n`;
  };

  // 마우스 위치로 이동
  javascriptGenerator.forBlock['move_to_mouse'] = function (block) {
    return `await moveToMouse(index, isClone);\n`;
  };

  // 일정시간 이동 애니메이션
  javascriptGenerator.forBlock['move_obj_inTime'] = function(block){
    const x = block.getFieldValue('x');
    const y = block.getFieldValue('y');
    const duration = block.getFieldValue('duration');
    return `await moveImageInTime(${x}, ${y}, ${duration}, index);\n`;
  };
    
  // 요소 보이기
  javascriptGenerator.forBlock['show_object'] = function() {
    return `await showObject(index, isClone);\n`;
  };

  // 요소 숨기기
  javascriptGenerator.forBlock['hide_object'] = function() {
    return `await hideObject(index, isClone);\n`;
  };

  // 말풍선 보이기
  javascriptGenerator.forBlock['show_bubble'] = function(block) {
    const text = block.getFieldValue("text");
    return `await showBubble('${text}', index, isClone);\n`;
  };

  // 색상/밝기/투명도 변경
  javascriptGenerator.forBlock['change_appearance'] = function(block) {
    const property = block.getFieldValue('property'); // 'color', 'brightness', 'opacity'
    const value = block.getFieldValue('value');
    return `await changeAppearance('${property}', ${value}, index, isClone);\n`;
  };

  // 크기 증가/감소
  javascriptGenerator.forBlock['change_object'] = function(block) {
    const sizeChange = block.getFieldValue('size');
    return `await changeObject(${sizeChange}, index, isClone);\n`;
  };

  // 크기 재설정
  javascriptGenerator.forBlock['resize_object'] = function(block) {
    const size = block.getFieldValue('size');
    return `await resizeObject(${size}, index, isClone);\n`;
  };

  // 좌우/상하 반전
  javascriptGenerator.forBlock['flip_object'] = function(block) {
    const direction = block.getFieldValue('direction'); // 'horizontal' or 'vertical'
    return `await flipObject('${direction}', index, isClone);\n`;
  };

  // 이미지 변경
  javascriptGenerator.forBlock['change_shape'] = function(block) {
    const shape = block.getFieldValue('shape'); // URL or 경로 문자열
    return `await changeShape('${shape}', index, isClone);\n`;
  };

  // 마우스 커서 이미지 변경
  javascriptGenerator.forBlock['change_cursor_image'] = function (block) {
    let cursor = block.getFieldValue('cursor');
  
    if (!cursor.endsWith('.png')) {
      cursor += '.png';
    }
  
    const encoded = encodeURIComponent(cursor);
  
    return `
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.cursor = 'url("http://localhost:8081/uploads/${encoded}") 24 24, auto';
      } else {
        console.warn("❌ 캔버스 요소를 찾을 수 없습니다.");
      }
    `;
  };

  // 배경화면 설정
  javascriptGenerator.forBlock['set_as_background'] = function () {
    return `await setAsBackground(index, isClone);\n`;
  };

  // 소리 재생
  javascriptGenerator.forBlock['play_sound'] = function(block) {
    let sound = block.getFieldValue('sound');

    // .mp3 확장자가 없으면 추가
    if (sound && !sound.endsWith('.mp3')) {
      sound = sound.replace(/['"]/g, '') + '.mp3';
    }

    return `await playSound('${sound}');\n`;
  };

  // 특정 시간 동안 소리 재생
  javascriptGenerator.forBlock['play_sound_duration'] = function(block) {
    let sound = block.getFieldValue('sound');
    let duration = block.getFieldValue('duration');

    // .mp3 확장자가 없으면 추가
    if (sound && !sound.endsWith('.mp3')) {
      sound = sound.replace(/['"]/g, '') + '.mp3';
    }

    return `await playSoundDuration('${sound}', ${duration});\n`;
  };

  // 특정 구간만 소리 재생
  javascriptGenerator.forBlock['play_sound_range'] = function(block) {
    let sound = block.getFieldValue('sound');
    let start = block.getFieldValue('start');
    let end = block.getFieldValue('end');

    // .mp3 확장자가 없으면 추가
    if (sound && !sound.endsWith('.mp3')) {
      sound = sound.replace(/['"]/g, '') + '.mp3';
    }

    return `await playSoundRange('${sound}', ${start}, ${end});\n`;
  };

  // 소리 정지
  javascriptGenerator.forBlock['stop_sounds'] = function(block) {
    const option = block.getFieldValue('option'); // 'ALL' or 'ONE'
    return `await stopSounds('${option}');\n`;
  };

  // 소리 크기 설정
  javascriptGenerator.forBlock['set_sound_volume'] = function(block) {
    const volume = block.getFieldValue('volume');
    return `await setSoundVolume(${volume});\n`;
  };

  // 소리 속도 조절
  javascriptGenerator.forBlock['multiple_sound_speed'] = function(block) {
    const multiple = block.getFieldValue('multiple');
    return `await multipleSoundSpeed(${multiple});\n`;
  };

  // 오브젝트 접촉 여부 판단
  javascriptGenerator.forBlock['is_touching'] = function(block) {
    const target = block.getFieldValue('TARGET'); // ex: "mouse"
    return [`checkCollision(index, "${target}", isClone)`, Order.FUNCTION_CALL];
  };

  // 초시계
  javascriptGenerator.forBlock['control_timer'] = function(block) {
    const action = block.getFieldValue('action');
  
    if (action === 'start') {
      return `await startTimer();\n`;
    } else if (action === 'stop') {
      return `await stopTimer();\n`;
    }
  };
  
  // 초시계 값
  javascriptGenerator.forBlock['get_timer_value'] = function(block){
    return [`elapsedTime`, Order.ATOMIC];
  };

};

export default RegisterBlockGenerator;