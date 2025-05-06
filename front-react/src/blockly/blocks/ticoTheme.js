import * as Blockly from 'blockly';

const ticoTheme = Blockly.Theme.defineTheme('tico_theme', {
    base: Blockly.Themes.Classic,
    categoryStyles:{
        start_category: { colour: '#FF6666' },
        loops_category: { colour: '#FF9966' },
        move_category: { colour: '#FFCC66' },
        looks_category: { colour: '#99CC66' },
        sound_category: { colour: '#6699FF' },
        logic_category: { colour: '#CC99CC' },
        math_category: { colour: '#668493' },
        variable_category: { colour: '#A65C81' },
    },
    blockStyles:{
        start_blocks: { colourPrimary: '#FF6666' },
        loop_blocks: { colourPrimary: '#FF9966' },
        move_blocks: { colourPrimary: '#FFCC66' },
        looks_blocks: { colourPrimary: '#99CC66' },
        sound_blocks: { colourPrimary: '#6699FF' },
        logic_blocks: { colourPrimary: '#CC99CC' },
        math_blocks: { colourPrimary: '#668493' },
        variable_blocks: { colourPrimary: '#A65C81' }
    },
    fontStyle: {
        size: 10,
        weight: 'normal'
    },
});

export default ticoTheme;