

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
            </category>

            <!-- 판단 -->
            <category name="판단" colour="#CC99CC">
                <block type="logic_compare"></block>
            </category>

            <!-- 계산 -->
            <category name="계산" colour="#668493">
                <block type="math_number"></block>
                <block type="math_modulo"></block>
            </category>

            <!-- 출력 -->
            <category name="출력" colour="#66CC66">
                <block type="text_print"></block>
                <block type="text"><field name="TEXT"></field></block>
            </category>
        </xml>
    `
}

export default eduToolboxXML6;
