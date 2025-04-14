import * as Blockly from 'blockly';
import { getCloneDropdown, getTouchDropdown} from './dropdown';

const defineMyBlocks = ()=>{

    Blockly.defineBlocksWithJsonArray([

      // 시작 관련 블록들
      // 시작하기 블록
      {
        "type": "start_btn",
        "message0": "시작하기",
        "style": "start_blocks",
        "nextStatement": null
      },

      // 선택한 키 눌렀을 때의 블록
      {
        "type": "start_with_q",
        "message0": "%1 버튼을 눌러 시작하기",
        "args0": [
        {
          "type": "field_dropdown",
          "name": "KEY_OPTION",
          "options": [
            ["q", "q"],
            ["w", "w"],
            ["a", "a"],
            ["s", "s"],
            ["d", "d"],
            ["↑", "ArrowUp"],
            ["↓", "ArrowDown"],
            ["←", "ArrowLeft"],
            ["→", "ArrowRight"],
            ["Ctrl", "Control"],
            ["Enter", "Enter"],
            ["Space", " "],
            ["Shift", "Shift"]
          ]
        }
      ],
        "style": "start_blocks",
        "nextStatement": null
      },

      // 마우스 눌렀을 때의 블록
      {
        "type": "start_mouse_clicked",
        "message0": "마우스를 클릭했을 때",
        "nextStatement": null,
        "style": "start_blocks",
        "tooltip": "마우스를 클릭하면 연결된 블록들을 실행합니다.",
        "helpUrl": ""
      },
      
      // 흐름 관련 블록들
      // 복제본 생성하기 블록
      {
        "type": "create_clone",
        "message0": "%1 의 복제본 생성하기",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "TARGET",
            "options": getCloneDropdown
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "loop_blocks",
        "tooltip": "선택한 오브젝트의 복제본을 생성합니다.",
        "helpUrl": ""
      },     

      // 생성된 복제본을 컨트롤하는 블록
      {
        "type": "on_clone_created",
        "message0": "복제본이 생성되었을 때 %1",
        "args0": [
          {
            "type": "input_statement",
            "name": "DO"
          }
        ],
        "style": "loop_blocks",
        "tooltip": "복제본이 생성될 때 실행할 블록들을 연결합니다.",
        "helpUrl": ""
      },      

      // 복제본 삭제하기 블록
      {
        "type": "delete_this_clone",
        "message0": "이 복제본 삭제하기",
        "previousStatement": null,
        "nextStatement": null,
        "style": "loop_blocks",
        "tooltip": "현재 실행 중인 복제본을 삭제합니다.",
        "helpUrl": ""
      },      

      // 조건이 참이 될 때까지 반복하는 블록
      {
        "type": "wait_until_true",
        "message0": "%1 이(가) 될 때까지 기다리기",
        "args0": [
          {
            "type": "input_value",
            "name": "CONDITION",
            "check": "Boolean"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "loop_blocks",
        "tooltip": "조건이 참이 될 때까지 기다립니다.",
        "helpUrl": ""
      },

      // 입력값만큼 기다리기 블록
      {
        "type": "wait_seconds",
        "message0": "%1초 동안 기다리기",
        "args0": [
          {
            "type": "field_input",
            "name": "seconds",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "loop_blocks",
        "tooltip": "설정한 시간(초)만큼 기다립니다.",
        "helpUrl": ""
      },      

      // 움직임 관련 블록들
      // 이동방향으로 입력값만큼 이동하는 블록
      {
        "type": "move_in_direction",
        "message0": "이동 방향으로 %1만큼 이동하기",
        "args0": [
          {
            "type": "field_input",
            "name": "distance",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "move_blocks",
        "tooltip": "이동방향과 일치하는 각도로 입력한 거리만큼 요소를 이동시킵니다.",
        "helpUrl": ""
      },

      // 이동방향으로 입력값만큼 이동하는 블록
      {
        "type": "change_move_direction",
        "message0": "이동 방향을 %1°로 정하기",
        "args0": [
          {
            "type": "input_value",
            "name": "direction",
            "check": "Number",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "move_blocks",
        "tooltip": "이동방향과 일치하는 각도로 입력한 거리만큼 요소를 이동시킵니다.",
        "helpUrl": ""
      },

      // 입력한 각도와 거리로 이동하는 블록
      {
        "type": "move_in_direction_angle",
        "message0": "%1° 방향으로 %2만큼 이동하기",
        "args0": [
          {
            "type": "field_input",
            "name": "angle",
            "check": "Number",
          },
          {
            "type": "field_input",
            "name": "distance",
            "check": "Number",
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "move_blocks",
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
        "style": "move_blocks",
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
      "style": "move_blocks",
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
      "style": "move_blocks",
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
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "move_blocks",
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
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "move_blocks",
      "tooltip": "입력한 y좌표로 요소를 이동시킵니다.",
      "helpUrl": ""
    },

    // 해당 X,Y좌표로 이동하기 블록
    {
      "type": "change_coordXY",
      "message0": "x: %1, y: %2 위치로 이동하기",
      "args0": [
        {
          "type": "input_value",
          "name": "x",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "y",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "move_blocks",
      "tooltip": "입력한 x,y좌표로 요소를 이동시킵니다.",
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
      "style": "move_blocks",
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
              "check": "Number",
              "text": "0", // 기본값
          },
          {
            "type": "field_input",
            "name": "duration",
            "check": "Number",
            "text": "0", // 기본값
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "move_blocks",
      "tooltip": "시계방향으로 angle만큼 회전합니다.",
      "helpUrl": ""
    },

    // 마우스 위치로 이동시키는 블록
    {
      "type": "move_to_mouse",
      "message0": "마우스 위치로 이동하기",
      "previousStatement": null,
      "nextStatement": null,
      "style": "move_blocks",
      "tooltip": "현재 오브젝트를 마우스 위치로 이동합니다.",
      "helpUrl": ""
    },

    // 일정 시간 동안 이동시키기 블록
    { 
      "type": "move_obj_inTime",
      "message0": "x좌표로 %1 만큼 y좌표로 %2만큼 %3초 동안 이동하기",
      "args0": [
          {
              "type": "field_input",
              "name": "x",
              "check": "Number",
              "text": "10", // 기본값
          },
          {
            "type": "field_input",
            "name": "y",
            "check": "Number",
            "text": "10", // 기본값
        },
          {
            "type": "field_input",
            "name": "duration",
            "check": "Number",
            "text": "1", // 기본값
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
      "style": "looks_blocks",
      "tooltip": "오브젝트를 화면에 보이게 합니다.",
      "helpUrl": ""
    },
    
    // 요소 숨기기 블록
    {
      "type": "hide_object",
      "message0": "모양 숨기기",
      "previousStatement": null,
      "nextStatement": null,
      "style": "looks_blocks",
      "tooltip": "오브젝트를 화면에서 숨깁니다.",
      "helpUrl": ""
    },

    // 요소에 말풍선 띄우기
    {
      "type": "show_bubble",
      "message0": "%1을(를) 말하기",
      "args0": [
        {
          "type": "field_input",
          "name": "text",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "looks_blocks",
      "tooltip": "특정 요소 위에 말풍선을 표시합니다.",
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
      "style": "looks_blocks",
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
      "style": "looks_blocks",
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
      "style": "looks_blocks",
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
      "style": "looks_blocks",
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
      "style": "looks_blocks",
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
      "style": "sound_blocks",
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
      "style": "sound_blocks",
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
      "style": "sound_blocks",
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
      "style": "sound_blocks",
      "tooltip": "소리를 멈춥니다. 전체를 멈추거나 하나만 멈출 수 있습니다.",
      "helpUrl": ""
    },

    // 소리 크기 정하기 블록
    {
      "type": "set_sound_volume",
      "message0": "소리 크기를 %1 %% 로 정하기",
      "args0": [
        {
          "type": "field_number",
          "name": "volume",
          "value": 100,
          "min": 0,
          "max": 100
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "sound_blocks",
      "tooltip": "모든 소리의 크기를 입력한 퍼센트(%)로 설정합니다.",
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
      "style": "sound_blocks",
      "tooltip": "주어진 소리 파일의 재생 속도를 몇 배로 설정합니다.",
      "helpUrl": ""
    },

    // 판단 관련 블록들
    // 접촉 여부 판단 블록
    {
      "type": "is_touching",
      "message0": "%1 에 닿았는가?",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TARGET",
          "options": getTouchDropdown
        }
      ],
      "output": "Boolean",
      "style": "logic_blocks",
      "tooltip": "선택된 오브젝트가 대상에 닿았는지 확인합니다.",
      "helpUrl": ""
    },    

    // 계산 관련 블록들
    // 초시계 생성 블록
    {
      "type": "control_timer",
      "message0": "초시계 %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "action",
          "options": [
            ["시작하기", "start"],
            ["정지하기", "stop"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "math_blocks",
      "tooltip": "초시계를 시작하거나 정지합니다.",
      "helpUrl": ""
    },

    // 초시게 값 반환 블록
    {
      "type": "get_timer_value",
      "message0": "초시계 값",
      "output": "Number",
      "style": "math_blocks",
      "tooltip": "현재 초시계 값을 반환합니다.",
      "helpUrl": ""
    },

    // 블럭코딩 학습하기 - 화면 출력용 블럭
    {
      "type": "text_print_to_textarea",
      "message0": "다음 내용 출력 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "INPUT",
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "text_blocks",
      "tooltip": "제공된 내용을 결과창에 출력합니다.",
      "helpUrl": ""
    },
    {
    "type": "math_number_with_statements",
    "message0": "%1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "value": 0
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "math_arithmetic_with_statements",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "ADD"],
          ["-", "MINUS"],
          ["*", "MULTIPLY"],
          ["/", "DIVIDE"],
          ["^", "POWER"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "math_modulo_with_statements",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "DIVIDEND",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["%", "MODULO"]
        ]
      },
      {
        "type": "input_value",
        "name": "DIVISOR",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  }
  ]);
};

export default defineMyBlocks;