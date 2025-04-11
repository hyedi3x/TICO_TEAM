const toolboxXML = ()=>{
    return`
        <xml>
            <!-- 시작 -->
            <category name=" 시작" categorystyle="start_category">
                <block type="start_btn"></block>
                <block type="start_with_q"></block> 
                <block type="start_mouse_clicked"></block> 
            </category>

            <! -- 흐름 -->
            <category name="흐름" categorystyle="loops_category">
                <block type="controls_repeat_ext"></block>
                <block type="controls_whileUntil"></block>
                <block type="controls_for"></block>
                <block type="controls_forEach"></block>
                <block type="controls_flow_statements"></block>
                <block type="wait_until_true"></block>
                <block type="wait_seconds"></block>
                <block type="create_clone"></block>
                <block type="on_clone_created"></block>
                <block type="delete_this_clone"></block>
            </category>
            
            <!-- 움직임 -->
            <category name="움직임" categorystyle="move_category">
                <block type="move_in_direction">
                    <field name="distance">10</field>
                </block>

                <block type="change_move_direction">
                    <value name="direction">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>

                <block type="move_in_direction_angle">
                    <field name="angle">90</field>
                    <field name="distance">10</field>
                </block>

                <block type="move_obj_toX">
                    <field name="x">10</field>
                </block>

                <block type="move_obj_toY">
                    <field name="y">10</field>
                </block>

                <block type="move_obj_toXY">
                    <field name="x">10</field>
                    <field name="y">10</field>
                </block>

                <block type="change_coordX">
                    <field name="x">10</field>
                </block>

                <block type="change_coordY">
                    <field name="y">10</field>
                </block>

                <block type="change_coordXY">
                    <value name="x">
                        <shadow type="math_number">
                        <field name="NUM">10</field>
                        </shadow>
                    </value>
                    <value name="y">
                        <shadow type="math_number">
                        <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>

                <block type="rotate_obj">
                    <field name="angle">90</field>
                </block>

                <block type="rotate_obj_inTime">
                    <field name="angle">90</field>
                    <field name="duration">1</field>
                </block>
                <block type="move_to_mouse"></block>
            </category>

            <!-- 생김새 -->
            <category name="생김새" categorystyle="looks_category">
                <!-- 요소 보이기 -->
                <block type="show_object"></block>
                
                <!-- 요소 숨기기 -->
                <block type="hide_object"></block>

                <!-- 말풍선 띄우기 -->
                <block type="show_bubble">
                    <field name="text">안녕</field>
                </block>

                <!-- 오브젝트 색상, 밝기, 투명도 조정 -->
                <block type="change_appearance">
                    <field name="value">10</field>
                </block>

                <!-- 오브젝트 크기 입력값만큼 변경하기 -->
                <block type="change_object">
                    <field name="size">10</field>
                </block>

                <!-- 오브젝트 크기 입력값으로 변경하기 -->
                <block type="resize_object">
                    <field name="size">10</field>
                </block>

                <!-- 좌우/상하 반전시키기 -->
                <block type="flip_object"></block>

                <!-- 모양 바꾸기 -->
                <block type="change_shape">
                    <field name="shape">entrybot(2).png</field>
                </block>
            </category>

            <!-- 소리 -->
            <category name="소리" categorystyle="sound_category">
                <!-- 기본 소리 재생 -->
                <block type="play_sound">
                    <field name="sound">개 짖는 소리</field>
                </block>

                <!-- 일정 시간 동안 재생 -->
                <block type="play_sound_duration">
                    <field name="sound">개 짖는 소리</field>
                    <field name="duration">10</field>
                </block>

                <!-- 특정 구간만 재생 -->
                <block type="play_sound_range">
                    <field name="sound">개 짖는 소리</field>
                    <field name="start">5</field>
                    <field name="end">30</field>
                </block>

                <!-- 소리 정지 -->
                <block type="stop_sounds"></block>

                <!-- 소리 크기 설정(%) -->
                <block type="set_sound_volume"></block>
                
                <!-- 소리 속도 조절 -->
                <block type="multiple_sound_speed">
                    <field name="multiple">1.3</field>
                </block>
            </category>

            <!-- 판단 -->
            <category name="판단" categorystyle="logic_category">
                <block type="controls_if"></block>
                <block type="logic_compare"></block>
                <block type="logic_operation"></block>
                <block type="logic_negate"></block>
                <block type="logic_boolean"></block>
                <block type="logic_null"></block>
                <block type="logic_ternary"></block>
                <block type="is_touching"></block>
            </category>
            
            <!-- 계산 -->
            <category name="계산" categorystyle="math_category">
                <block type="math_number"></block>
                <block type="math_arithmetic"></block>
                <block type="math_single"></block>
                <block type="math_trig"></block>
                <block type="math_constant"></block>
                <block type="math_number_property"></block>
                <block type="math_round"></block>
                <block type="math_on_list"></block>
                <block type="math_modulo"></block>
                <block type="math_random_float"></block>
                <block type="math_random_int">
                    <value name="FROM">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="TO">
                        <shadow type="math_number">
                            <field name="NUM">100</field>
                        </shadow>
                    </value>
                </block>
                <block type="control_timer"></block>
                <block type="get_timer_value"></block>
            </category>

            <category name="변수" custom="VARIABLE" categorystyle="variable_category"></category>
        </xml>
    `
}
export default toolboxXML;