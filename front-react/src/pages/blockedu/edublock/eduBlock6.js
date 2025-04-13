

const eduToolboxXML6 = () => {
    return `
        <xml>
            <!-- 시작 -->
            <category name="시작" colour="#FF6666">
                <block type="start_btn"></block>
            </category>

            <!-- 흐름 -->
            <category name="흐름" colour="#FF9966">
                <block type="controls_if"></block>
                <block type="controls_ifelse"></block>
                <block type="controls_repeat_ext"></block>
            </category>

            <!-- 판단 -->
            <category name="판단" colour="#CC99CC">
                <block type="logic_compare"></block>
                <block type="logic_boolean"></block>
                <block type="logic_operation"></block>
            </category>

            <!-- 계산 -->
            <category name="계산" colour="#668493">
                <block type="math_number"></block>
                <block type="math_arithmetic"></block>
                <block type="math_modulo"></block>
            </category>

            <!-- 출력 -->
            <category name="출력" colour="#66CC66">
                <block type="text_print_to_textarea"></block>
                <block type="text"><field name="TEXT"></field></block>
                <block type="text_join"></block>
            </category>

            <category name="변수" colour="#A65C81" custom="VARIABLE"></category>
            <category name="함수" colour="#995CA6" custom="PROCEDURE"></category>
        </xml>
    `
}

export default eduToolboxXML6;
