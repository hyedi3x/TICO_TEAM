import * as Blockly from 'blockly';

const defineMyBlocks = ()=>{

    Blockly.defineBlocksWithJsonArray([

      // 시작 관련 블록들
      // 시작하기 블록
      {
        "type": "start_btn",
        "message0": "시작하기",
        "colour": "#FF6666",
        "nextStatement": null
      },

      // 버튼을 눌러서 시작하기 블록
      {
        "type": "start_with_q",
        "message0": "%1 버튼을 눌러 시작하기",
        "args0": [
            {
                "type": "field_label",
                "name": "KEY_OPTION",
                "text": "q"
            }
        ],
        "colour": "#FF6666",
        "nextStatement": null
      },
        
      // 움직임 관련 블록들
      // 이동 방향과 거리 블록
      {
        "type": "move_in_direction",
        "message0": "%1° 방향으로 %2만큼 이동하기",
        "args0": [
          {
            "type": "field_input",
            "name": "angle",
            "check": "Number",
            "align": "RIGHT"
          },
          {
            "type": "field_input",
            "name": "distance",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#FFCC66",
        "tooltip": "입력한 방향의 각도와 거리만큼 요소를 이동시킵니다.",
        "helpUrl": ""
      },

      // X좌표 바꾸기 블록
      {
        "type": "move_obj_toX",
        "message0": "x 좌표로 %1 만큼 움직이기",
        "args0": [
            {
                "type": "field_input",
                "name": "x",
                "text": "10", // 기본값
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#FFCC66",
        "tooltip": "x 좌표를 지정된 값만큼 움직입니다.",
        "helpUrl": ""
     },
    
    // Y좌표 바꾸기 블록
    { 
      "type": "move_obj_toY",
      "message0": "y 좌표로 %1 만큼 움직이기",
      "args0": [
          {
              "type": "field_input",
              "name": "y",
              "text": "10", // 기본값
          }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "y 좌표를 지정된 값만큼 움직입니다.",
      "helpUrl": ""
    },
    
    { // x,y축
      "type": "move_obj_toXY",
      "message0": "x 좌표로 %1 만큼, y 좌표로 %2만큼 움직이기",
      "args0": [
          {
              "type": "field_input",
              "name": "x",
              "text": "10", // 기본값
          },
          {
            "type": "field_input",
            "name": "y",
            "text": "10", // 기본값
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "x,y 좌표를 지정된 값만큼 움직입니다.",
      "helpUrl": ""
    },

    // 해당 X좌표로 이동하기 블록
    {
      "type": "change_coordX",
      "message0": "x: %1 위치로 이동하기",
      "args0": [
        {
          "type": "field_input",
          "name": "x",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "입력한 x좌표로 요소를 이동시킵니다.",
      "helpUrl": ""
    },

    // 해당 Y좌표로 이동하기 블록
    {
      "type": "change_coordY",
      "message0": "y: %1 위치로 이동하기",
      "args0": [
        {
          "type": "field_input",
          "name": "y",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "입력한 y좌표로 요소를 이동시킵니다.",
      "helpUrl": ""
    },

    // 요소 회전시키기 블록
    { 
      "type": "rotate_obj",
      "message0": "시계방향으로 %1 만큼 회전하기",
      "args0": [
          {
              "type": "field_input",
              "name": "angle",
              "text": "0", // 기본값
          }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "시계방향으로 angle만큼 회전합니다.",
      "helpUrl": ""
    },

    // 일정 시간 동안 회전시키기 블록
    { 
      "type": "rotate_obj_inTime",
      "message0": "시계방향으로 %1 만큼 %2초 동안 회전하기",
      "args0": [
          {
              "type": "field_input",
              "name": "angle",
              "text": "0", // 기본값
          },
          {
            "type": "field_input",
            "name": "duration",
            "text": "0", // 기본값
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFCC66",
      "tooltip": "시계방향으로 angle만큼 회전합니다.",
      "helpUrl": ""
    },

    // 생김새 관련 블록들
    // 요소 보이기 블록
    {
      "type": "show_object",
      "message0": "모양 보이기",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "오브젝트를 화면에 보이게 합니다.",
      "helpUrl": ""
    },
    
    // 요소 숨기기 블록
    {
      "type": "hide_object",
      "message0": "모양 숨기기",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "오브젝트를 화면에서 숨깁니다.",
      "helpUrl": ""
    },

    // 요소 색상, 밝기, 투명도 조정
    {
      "type": "change_appearance",
      "message0": "%1를 %2(으)로 변경",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "property",
          "options": 
          [
            ["색상", "color"],
            ["밝기", "brightness"],
            ["투명도", "opacity"]
          ]
        },
        {
          "type": "field_input",
          "name": "value",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "색상, 밝기, 투명도를 변경합니다.",
      "helpUrl": ""
    },

    // 크기 변경(크기를 입력값만큼 변경)
    {
      "type": "change_object",
      "message0": "크기를 %1만큼 변경하기",
      "args0": [
        {
          "type": "field_input",
          "name": "size",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "요소의 크기를 지정한 값만큼 증가/감소합니다.",
      "helpUrl": ""
    },

    // 크기 변경(크기를 입력값으로 변경)
    {
      "type": "resize_object",
      "message0": "크기를 %1(으)로 정하기",
      "args0": [
        {
          "type": "field_input",
          "name": "size",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "요소의 크기를 지정한 값으로 변경합니다.",
      "helpUrl": ""
    },

    // 상하/좌우 반전
    {
      "type": "flip_object",
      "message0": "%1 반전",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "direction",
          "options": [
            ["좌우", "horizontal"],
            ["상하", "vertical"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "오브젝트를 좌우 또는 상하로 반전시킵니다.",
      "helpUrl": ""
    },

    // 모습 변경 (다른 이미지로 바꾸기)
    {
      "type": "change_shape",
      "message0": "모양을 %1로 바꾸기",
      "args0": [
        {
          "type": "field_input",
          "name": "shape",
          "check": "String",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#99CC66",
      "tooltip": "지정된 이미지 URL로 이미지를 변경합니다.",
      "helpUrl": ""
    },

    // 소리 관련 블록들
    // 소리 재생 블록
    {
      "type": "play_sound",
      "message0": "소리 %1를 재생",
      "args0": [
        {
          "type": "field_input",
          "name": "sound",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#6699FF",
      "tooltip": "주어진 소리 파일을 재생합니다.",
      "helpUrl": ""
    },

    // 소리 특정 시간 재생 블록
    {
      "type": "play_sound_duration",
      "message0": "소리 %1를 %2초 동안 재생",
      "args0": [
        {
          "type": "field_input",
          "name": "sound",
          "align": "RIGHT"
        },
        {
          "type": "field_input",
          "name": "duration",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#6699FF",
      "tooltip": "주어진 소리 파일을 특정 시간 동안 재생합니다.",
      "helpUrl": ""
    },

    // 특정 구간만 재생하는 블록
    {
      "type": "play_sound_range",
      "message0": "소리 %1를 %2초부터 %3초까지 재생",
      "args0": [
        {
          "type": "field_input",
          "name": "sound",
          "align": "RIGHT"
        },
        {
          "type": "field_input",
          "name": "start",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "field_input",
          "name": "end",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#6699FF",
      "tooltip": "주어진 소리 파일을 특정 구간에서만 재생합니다.",
      "helpUrl": ""
    },

    // 소리 정지 블록 (전체/하나 선택)
    {
      "type": "stop_sounds",
      "message0": "소리 %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "option",
          "options": 
          [
            ["전체 멈추기", "ALL"],
            ["하나만 멈추기", "ONE"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#6699FF",
      "tooltip": "소리를 멈춥니다. 전체를 멈추거나 하나만 멈출 수 있습니다.",
      "helpUrl": ""
    },
    
    // 소리 빠르기 배수 설정 블록
    {
      "type": "multiple_sound_speed",
      "message0": "소리 빠르기를 %1배로 설정",
      "args0": [
        {
          "type": "field_input",
          "name": "multiple",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#6699FF",
      "tooltip": "주어진 소리 파일의 재생 속도를 몇 배로 설정합니다.",
      "helpUrl": ""
    }

  ]);
};
export default defineMyBlocks;