import { javascriptGenerator, Order } from 'blockly/javascript';
import { start_btn, start_with_q } from '../functions/starts/startFunctions';
import { moveImgToX, moveImgToY, moveImgToXY, rotateImage, rotateImageInTime } from '../functions/moves/moveFunctions';
import { showObject, hideObject, changeAppearance, changeObject, resizeObject, flipObject, changeShape } from "../functions/appearances/appearanceFunctions";
import { playSound, playSoundDuration, playSoundRange, stopSounds, multipleSoundSpeed } from "../functions/sounds/soundFunctions";

export let imgArr = null; // 백틱은 객체가 잘 안넘어가서 export로 넘겨준다.
export let callImgArr = null;
const RegisterBlockGenerator = (props) => {
  // 1
  // 이미지 별로 구분해서 실행하기 위해
  imgArr = props.imgArr;
  const workspaceIndex = props.workspaceIndex;
  callImgArr = props.callImgArr;

  // Blockly 블록 생성 코드를 등록
  // javascriptGenerator.forBlock에 할당하는 값은 문자열 형태의 JavaScript 코드, 함수 x
  javascriptGenerator.forBlock['start_btn'] = function(block) {
    return 'start_btn();\n'; // 함수를 호출하는 문자열 반환
  };
  javascriptGenerator.forBlock['start_with_q'] = function(block) {
    return 'start_with_q();\n'; // 함수를 호출하는 문자열 반환
  };

  // 방향과 거리로 이동 (예: 45도 방향으로 50만큼)
  javascriptGenerator.forBlock['move_in_direction'] = function (block) {
    let angle = block.getFieldValue('angle');
    let distance = block.getFieldValue('distance');
    return `moveInDirection(${angle}, ${distance}, ${workspaceIndex});\n`;
  };

  // x축 이동
  javascriptGenerator.forBlock['move_obj_toX'] = function (block) {
    const x = block.getFieldValue('x');
    return `moveImgToX(${x}, ${workspaceIndex});\n`;
  };

  // y축 이동
  javascriptGenerator.forBlock['move_obj_toY'] = function (block) {
    let y = block.getFieldValue('y');
    return `moveImgToY(${y}, ${workspaceIndex});\n`;
  };

  // x,y축 이동
  javascriptGenerator.forBlock['move_obj_toXY'] = function (block) {
    const x = block.getFieldValue('x');
    const y = block.getFieldValue('y');
    return `moveImgToXY(${x}, ${y}, ${workspaceIndex});\n`;
  };

  // 요소 X좌표 입력값으로 변경하기
  javascriptGenerator.forBlock['change_coordX'] = function(block){
    const valueX = block.getFieldValue('x');
    return `changeCoordX(${valueX}, ${workspaceIndex});\n`;
  };

  // 요소 Y좌표 입력값으로 변경하기
  javascriptGenerator.forBlock['change_coordY'] = function(block){
      const valueY = block.getFieldValue('y');
      return `changeCoordY(${valueY}, ${workspaceIndex});\n`;
  };

  // 일정 시간 이동 애니메이션
  // x,y축 이동
  javascriptGenerator.forBlock['move_obj_toX_Y_inTime'] = function (block) {
    const x = block.getFieldValue('x');
    const y = block.getFieldValue('y');
    const duration = block.getFieldValue('duration');
    return `moveImgToXYInTime(${x}, ${y}, ${duration}, ${workspaceIndex});\n`;
  };

  // 시계방향 회전
  javascriptGenerator.forBlock['rotate_obj'] = function(block){
    const angle = block.getFieldValue('angle');
    return `rotateImage(${angle}, ${workspaceIndex});\n`;
  };

  // 일정시간 회전 애니메이션
  javascriptGenerator.forBlock['rotate_obj_inTime'] = function(block){
    const angle = block.getFieldValue('angle');
    const duration = block.getFieldValue('duration');
    return `rotateImageInTime(${angle}, ${duration}, ${workspaceIndex});\n`;
  };

  // 요소 보이기
  javascriptGenerator.forBlock['show_object'] = function() {
    return `showObject(${workspaceIndex});\n`;
  };

  // 요소 숨기기
  javascriptGenerator.forBlock['hide_object'] = function() {
    return `hideObject(${workspaceIndex});\n`;
  };

  // 색상/밝기/투명도 변경
  javascriptGenerator.forBlock['change_appearance'] = function(block) {
    const property = block.getFieldValue('property'); // 'color', 'brightness', 'opacity'
    const value = block.getFieldValue('value');
    return `changeAppearance('${property}', ${value}, ${workspaceIndex});\n`;
  };

  // 크기 증가/감소
  javascriptGenerator.forBlock['change_object'] = function(block) {
    const sizeChange = block.getFieldValue('size');
    return `changeObject(${sizeChange}, ${workspaceIndex});\n`;
  };

  // 크기 재설정
  javascriptGenerator.forBlock['resize_object'] = function(block) {
    const size = block.getFieldValue('size');
    return `resizeObject(${size}, ${workspaceIndex});\n`;
  };

  // 좌우/상하 반전
  javascriptGenerator.forBlock['flip_object'] = function(block) {
    const direction = block.getFieldValue('direction'); // 'horizontal' or 'vertical'
    return `flipObject('${direction}', ${workspaceIndex});\n`;
  };

  // 이미지 변경
  javascriptGenerator.forBlock['change_shape'] = function(block) {
    const shape = block.getFieldValue('shape'); // URL or 경로 문자열
    return `changeShape('${shape}', ${workspaceIndex});\n`;
  };

  // 소리 재생
  javascriptGenerator.forBlock['play_sound'] = function(block) {
    let sound = block.getFieldValue('sound');

    // .mp3 확장자가 없으면 추가
    if (sound && !sound.endsWith('.mp3')) {
      sound = sound.replace(/['"]/g, '') + '.mp3';
    }

    return `playSound('${sound}');\n`;
  };

  // 특정 시간 동안 소리 재생
  javascriptGenerator.forBlock['play_sound_duration'] = function(block) {
    let sound = block.getFieldValue('sound');
    let duration = block.getFieldValue('duration');

    // .mp3 확장자가 없으면 추가
    if (sound && !sound.endsWith('.mp3')) {
      sound = sound.replace(/['"]/g, '') + '.mp3';
    }

    return `playSoundDuration('${sound}', ${duration});\n`;
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

    return `playSoundRange('${sound}', ${start}, ${end});\n`;
  };

  // 소리 정지
  javascriptGenerator.forBlock['stop_sounds'] = function(block) {
    const option = block.getFieldValue('option'); // 'ALL' or 'ONE'
    return `stopSounds('${option}');\n`;
  };

  // 소리 속도 조절
  javascriptGenerator.forBlock['multiple_sound_speed'] = function(block) {
    const multiple = block.getFieldValue('multiple');
    return `multipleSoundSpeed(${multiple});\n`;
  };

};

export default RegisterBlockGenerator;