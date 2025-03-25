import * as Blockly from 'blockly';

// 사용자 정의 블록 정의
export const defineCustomBlocks = () => {
  Blockly.defineBlocksWithJsonArray([

      // 움직임 관련 블록들
      // 이동 방향과 거리 블록
      {
        "type": "move_in_direction",
        "message0": "%1° 방향으로 %2만큼 이동하기",
        "args0": [
          {
            "type": "input_value",
            "name": "ANGLE",
            "check": "Number",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "DISTANCE",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#19baea",
        "tooltip": "입력한 방향의 각도와 거리만큼 요소를 이동시킵니다.",
        "helpUrl": ""
      },

      // X좌표 바꾸기 블록
      {
        "type": "move_coordX",
        "message0": "X좌표를 %1만큼 이동하기",
        "args0": [
          {
            "type": "input_value",
            "name": "COORDX",
            "check": "Number"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#19baea",
        "tooltip": "입력한 정수만큼 요소의 X좌표가 바뀝니다.",
        "helpUrl": ""
    },

      // y좌표 바꾸기 블록
      {
        "type": "move_coordY",
        "message0": "Y좌표를 %1만큼 이동하기",
        "args0": [
          {
            "type": "input_value",
            "name": "COORDY",
            "check": "Number"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#19baea",
        "tooltip": "입력한 정수만큼 요소의 Y좌표가 바뀝니다.",
        "helpUrl": ""
    },

    // 해당 X좌표로 이동하기 블록
    {
      "type": "change_coordX",
      "message0": "x: %1 위치로 이동하기",
      "args0": [
        {
          "type": "input_value",
          "name": "X",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#19baea",
      "tooltip": "입력한 x좌표로 요소를 이동시킵니다.",
      "helpUrl": ""
    },

    // 해당 Y좌표로 이동하기 블록
    {
      "type": "change_coordY",
      "message0": "y: %1 위치로 이동하기",
      "args0": [
        {
          "type": "input_value",
          "name": "Y",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#19baea",
      "tooltip": "입력한 y좌표로 요소를 이동시킵니다.",
      "helpUrl": ""
    },

    // 요소를 회전하기 블록
    {
      "type": "rotate_element",
      "message0": "방향을 %1°만큼 회전하기",
      "args0": [
        {
          "type": "input_value",
          "name": "ROTATE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#19baea",
      "tooltip": "입력한 각도만큼 요소를 회전시킵니다.",
      "helpUrl": ""
    },

    // 생김새 관련 블록들
    // 요소 보이기 블록
    {
      "type": "show_object",
      "message0": "모양 보이기",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "오브젝트를 화면에 보이게 합니다.",
      "helpUrl": ""
    },
    
    // 요소 숨기기 블록
    {
      "type": "hide_object",
      "message0": "모양 숨기기",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "오브젝트를 화면에서 숨깁니다.",
      "helpUrl": ""
    },

    // 요소에 말풍선 띄우기
    {
      "type": "show_bubble",
      "message0": "%1을(를) 말하기",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "특정 요소 위에 말풍선을 표시합니다.",
      "helpUrl": ""
    },

    // 요소에 일정 시간 동안 말풍선 띄우기
    {
      "type": "show_bubble_duration",
      "message0": "%1을(를) %2초 동안 말하기",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "DURATION",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "특정 요소 위에 일정 시간 동안 말풍선을 표시합니다.",
      "helpUrl": ""
    },

    // 요소 색상, 밝기, 투명도 조정
    {
      "type": "change_appearance",
      "message0": "%1를 %2(으)로 변경",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PROPERTY",
          "options": 
          [
            ["색상", "color"],
            ["밝기", "brightness"],
            ["투명도", "opacity"]
          ]
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "색상, 밝기, 투명도를 변경합니다.",
      "helpUrl": ""
    },

    // 크기 변경(크기를 입력값만큼 변경)
    {
      "type": "change_object",
      "message0": "크기를 %1만큼 변경하기",
      "args0": [
        {
          "type": "input_value",
          "name": "SIZE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "요소의 크기를 지정한 값만큼 증가/감소합니다.",
      "helpUrl": ""
    },

    // 크기 변경(크기를 입력값으로 변경)
    {
      "type": "resize_object",
      "message0": "크기를 %1(으)로 정하기",
      "args0": [
        {
          "type": "input_value",
          "name": "SIZE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
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
          "name": "FLIP_DIRECTION",
          "options": [
            ["좌우", "horizontal"],
            ["상하", "vertical"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
      "tooltip": "오브젝트를 좌우 또는 상하로 반전시킵니다.",
      "helpUrl": ""
    },

    // 모습 변경 (다른 이미지로 바꾸기)
    {
      "type": "change_shape",
      "message0": "모양을 %1로 바꾸기",
      "args0": [
        {
          "type": "input_value",
          "name": "ANOTHER_SHAPE",
          "check": "String",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9C27B0",
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
          "type": "input_value",
          "name": "SOUND",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#F44336",
      "tooltip": "주어진 소리 파일을 재생합니다.",
      "helpUrl": ""
    },

    // 소리 특정 시간 재생 블록
    {
      "type": "play_sound_duration",
      "message0": "소리 %1를 %2초 동안 재생",
      "args0": [
        {
          "type": "input_value",
          "name": "SOUND",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "DURATION",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#F44336",
      "tooltip": "주어진 소리 파일을 특정 시간 동안 재생합니다.",
      "helpUrl": ""
    },

    // 특정 구간만 재생하는 블록
    {
      "type": "play_sound_range",
      "message0": "소리 %1를 %2초부터 %3초까지 재생",
      "args0": [
        {
          "type": "input_value",
          "name": "SOUND",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "START",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "END",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#F44336",
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
          "name": "STOP_OPTION",
          "options": 
          [
            ["전체 멈추기", "ALL"],
            ["하나만 멈추기", "ONE"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#F44336",
      "tooltip": "소리를 멈춥니다. 전체를 멈추거나 하나만 멈출 수 있습니다.",
      "helpUrl": ""
    },
    
    // 소리 빠르기 배수 설정 블록
    {
      "type": "multiple_soundspeed",
      "message0": "소리 빠르기를 %1배로 설정",
      "args0": [
        {
          "type": "input_value",
          "name": "MULTIPLE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#F44336",
      "tooltip": "주어진 소리 파일의 재생 속도를 몇 배로 설정합니다.",
      "helpUrl": ""
    }
  ]);
};
