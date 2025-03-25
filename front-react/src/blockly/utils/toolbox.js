const toolboxXML = () => {
    return `
        <xml xmlns="https://developers.google.com/blockly/yml">
            <!-- 시작 -->
            <category name="시작" colour="#FF5722">
            </category>
            
            <!-- 흐름 -->
            <category name="흐름" colour="#5ba55b">
                <block type="controls_repeat_ext">
                    <value name="TIMES">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <block type="controls_whileUntil"></block>

                <block type="controls_for">
                    <field name="VAR">i</field>
                    <value name="FROM">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="BY">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="TO">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <block type="controls_forEach">
                    <field name="VAR">j</field>
                </block>

                <!-- 반복 중단 -->
                <block type="controls_flow_statements">
                    <field name="FLOW">BREAK</field>
                </block>
            </category>
            
            <!-- 움직임 -->
            <category name="움직임" colour="#19baea">

                <!-- 이동 방향과 거리 처리하기 -->
                <block type="move_in_direction">
                    <value name="ANGLE">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                    <value name="DISTANCE">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 X좌표 입력값만큼 바꾸기 -->
                <block type="move_coordX">
                    <value name="COORDX">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 Y좌표 입력값만큼 바꾸기 -->
                <block type="move_coordY">
                    <value name="COORDY">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 X좌표 입력값으로 바꾸기 -->
                <block type="change_coordX">
                    <value name="X">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 Y좌표 입력값으로 바꾸기 -->
                <block type="change_coordY">
                    <value name="Y">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 회전시키기 -->
                <block type="rotate_element">
                    <value name="ROTATE">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                </block>
            </category>
            
            <!-- 생김새 -->
            <category name="생김새" colour="#9C27B0">

                <!-- 요소 보이기 -->
                <block type="show_object"></block>
                
                <!-- 요소 숨기기 -->
                <block type="hide_object"></block>

                <!-- 말풍선 띄우기 -->
                <block type="show_bubble">
                    <value name="TEXT">
                        <shadow type="text">
                            <field name="TEXT">ㅋㅋㅋ</field>
                        </shadow>
                    </value>
                </block>

                <!-- 일정 시간 동안 말풍선 띄우기 -->
                <block type="show_bubble_duration">
                    <value name="TEXT">
                        <shadow type="text">
                            <field name="TEXT">안녕</field>
                        </shadow>
                    </value>
                    <value name="DURATION">
                        <shadow type="math_number">
                            <field name="NUM">4</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 색상, 밝기, 투명도 조정 -->
                <block type="change_appearance">
                    <value name="VALUE">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 크기 입력값만큼 변경하기 -->
                <block type="change_object">
                    <value name="SIZE">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 오브젝트 크기 입력값으로 변경하기 -->
                <block type="resize_object">
                    <value name="SIZE">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 좌우/상하 반전시키기 -->
                <block type="flip_object"></block>

                <!-- 모양 바꾸기 -->
                <block type="change_shape">
                    <value name="ANOTHER_SHAPE">
                        <shadow type="text">
                            <field name="TEXT">entrybot(2).png</field>
                        </shadow>
                    </value>
                </block>
            </category>

            
            <!-- 텍스트 -->
            <category name="텍스트" colour="#5ba58c">
                <block type="text"></block>
                <block type="text_print"></block>
                <block type="text_changeCase">
                    <field name="CASE">UPPERCASE</field>
                    <value name="TEXT">
                        <shadow type="text">
                            <field name="TEXT">abc</field>
                        </shadow>
                    </value>
                </block>
                <block type="text_trim">
                    <field name="MODE">BOTH</field>
                    <value name="TEXT">
                        <shadow type="text">
                            <field name="TEXT">abc</field>
                        </shadow>
                    </value>
                </block>
                <block type="text_length">
                    <value name="VALUE">
                        <shadow type="text">
                            <field name="TEXT">abc</field>
                        </shadow>
                    </value>
                </block>
            </category>
            
            <!-- 붓 -->
            <category name="붓" colour="#ff9b00">
            </category>
            
            <!-- 소리 -->
            <category name="소리" colour="#F44336">
                <!-- 소리 재생 -->
                <block type="play_sound">
                    <value name="SOUND">
                        <shadow type="text">
                            <field name="TEXT">개 짖는 소리</field>
                        </shadow>
                    </value>
                </block>

                <!-- 특정 시간 동안 소리 재생 -->
                <block type="play_sound_duration">
                    <value name="SOUND">
                        <shadow type="text">
                            <field name="TEXT">밤을 달리다</field>
                        </shadow>
                    </value>
                    <value name="DURATION">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <!-- 특정 구간 동안 소리 재생 -->
                <block type="play_sound_range">
                    <value name="SOUND">
                        <shadow type="text">
                            <field name="TEXT">DRIP</field>
                        </shadow>
                    </value>
                    <value name="START">
                        <shadow type="math_number">
                            <field name="NUM">5</field> 
                        </shadow>
                    </value>
                    <value name="END">
                        <shadow type="math_number">
                            <field name="NUM">30</field>
                        </shadow>
                    </value>
                </block>

                <!-- 소리 멈추기(최근의 소리 하나/전체) -->
                <block type="stop_sounds"></block>
                
                <!-- 소리 빠르기 배속 -->
                <block type="multiple_soundspeed">
                    <value name="MULTIPLE">
                        <shadow type="math_number">
                            <field name="NUM">1.3</field>
                        </shadow>
                    </value>
                </block>
            </category>
            
            <!-- 판단 -->
            <category name="판단" colour="#5b80a5">
                <block type="controls_if"></block>
                <block type="logic_compare">
                    <value name="A">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="B">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
                <block type="logic_operation"></block>
                <block type="logic_negate"></block>
                <block type="logic_boolean"></block>
                <block type="logic_null"></block>
                <block type="logic_ternary"></block>
            </category>
            
            <!-- 계산 -->
            <category name="계산" colour="#5b67a5">
                <block type="math_number"></block>
                <block type="math_arithmetic">
                    <field name="OP">PLUS</field>
                    <value name="A">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="B">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="math_modulo">
                    <value name="DIVIDEND">
                        <shadow type="math_number">
                            <field name="NUM">64</field>
                        </shadow>
                    </value>
                    <value name="DIVISOR">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>
                <block type="math_single"></block>
                <block type="math_trig"></block>
                <block type="math_round"></block>
            </category>

            <!-- 변수 -->
            <category name="변수" custom="VARIABLE" colour="#a55b80"></category>
        </xml>
    `;
};

export default toolboxXML;