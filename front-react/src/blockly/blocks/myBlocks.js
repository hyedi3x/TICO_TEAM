const toolboxXML = ()=>{
    return`
        <xml>
            <!-- 시작 -->
            <category name=" 시작" colour="#FF6666">
                <block type="start_btn"></block>
                <block type="start_with_q"></block> 
            </category>

            <! -- 흐름 -->
            <category name="흐름" colour="#FF9966">
                <block type="controls_repeat_ext"></block>
                <block type="controls_whileUntil"></block>
                <block type="controls_for"></block>
                <block type="controls_forEach"></block>
                <block type="controls_flow_statements"></block>
            </category>
            
            <!-- 움직임 -->
            <category name="움직임" colour="#FFCC66">
                <block type="move_in_direction">
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

                <block type="rotate_obj">
                    <field name="angle">90</field>
                </block>

                <block type="rotate_obj_inTime">
                    <!-- XML 블록 정의가 JSON 블록 정의보다 우선 (text를 사용하던 <field>를 사용하던 택1) -->
                    <field name="angle">90</field>
                    <field name="duration">1</field>
                </block>

            </category>

            <!-- 생김새 -->
            <category name="생김새" colour="#99CC66">
                <!-- 요소 보이기 -->
                <block type="show_object"></block>
                
                <!-- 요소 숨기기 -->
                <block type="hide_object"></block>

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
            <category name="소리" colour="#6699FF">
                <!-- 기본 소리 재생 -->
                <block type="play_sound">
                    <field name="sound">개 짖는 소리</field>
                </block>

                <!-- 일정 시간 동안 재생 -->
                <block type="play_sound_duration">
                    <field name="sound">밤을 달리다</field>
                    <field name="duration">10</field>
                </block>

                <!-- 특정 구간만 재생 -->
                <block type="play_sound_range">
                    <field name="sound">DRIP</field>
                    <field name="start">5</field>
                    <field name="end">30</field>
                </block>

                <!-- 소리 정지 -->
                <block type="stop_sounds"></block>

                <!-- 소리 속도 조절 -->
                <block type="multiple_sound_speed">
                    <field name="multiple">1.3</field>
                </block>
            </category>

            <!-- 판단 -->
            <category name="판단" colour="#CC99CC">
                <block type="controls_if"></block>
                <block type="logic_compare"></block>
                <block type="logic_operation"></block>
                <block type="logic_negate"></block>
                <block type="logic_boolean"></block>
                <block type="logic_null"></block>
                <block type="logic_ternary"></block>
            </category>
            
            <!-- 계산 -->
            <category name="계산" colour="#668493">
                <block type="math_number"></block>
                <block type="math_arithmetic"></block>
                <block type="math_single"></block>
                <block type="math_trig"></block>
                <block type="math_constant"></block>
                <block type="math_number_property"></block>
                <block type="math_round"></block>
                <block type="math_on_list"></block>
                <block type="math_modulo"></block>
                <block type="math_random_int"></block>
                <block type="math_random_float"></block>
            </category>
        </xml>
            
    `
    
}
export default toolboxXML;