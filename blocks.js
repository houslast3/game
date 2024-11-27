// Definição dos blocos personalizados do Blockly
Blockly.Blocks['sprite_move'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Mover sprite")
            .appendField(new Blockly.FieldDropdown([["direita","RIGHT"], ["esquerda","LEFT"], ["cima","UP"], ["baixo","DOWN"]]), "direction")
            .appendField("velocidade")
            .appendField(new Blockly.FieldNumber(5, 0), "speed");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }
};

Blockly.Blocks['sprite_rotate'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Rotacionar")
            .appendField(new Blockly.FieldNumber(90, -360, 360), "angle")
            .appendField("graus");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }
};

Blockly.Blocks['on_key_press'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Quando pressionar tecla")
            .appendField(new Blockly.FieldDropdown([
                ["espaço", "Space"],
                ["seta direita", "ArrowRight"],
                ["seta esquerda", "ArrowLeft"],
                ["seta cima", "ArrowUp"],
                ["seta baixo", "ArrowDown"]
            ]), "key");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setColour(290);
    }
};

Blockly.Blocks['sprite_collision'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Quando colidir com outro sprite");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setColour(290);
    }
};

// Geradores de código JavaScript para cada bloco
Blockly.JavaScript['sprite_move'] = function(block) {
    const direction = block.getFieldValue('direction');
    const speed = block.getFieldValue('speed');
    const directionMap = {
        'RIGHT': 'x += ' + speed,
        'LEFT': 'x -= ' + speed,
        'UP': 'y -= ' + speed,
        'DOWN': 'y += ' + speed
    };
    return 'this.' + directionMap[direction] + ';\n';
};

Blockly.JavaScript['sprite_rotate'] = function(block) {
    const angle = block.getFieldValue('angle');
    return 'this.rotation += ' + angle + ';\n';
};

Blockly.JavaScript['on_key_press'] = function(block) {
    const key = block.getFieldValue('key');
    const statements = Blockly.JavaScript.statementToCode(block, 'DO');
    return `
document.addEventListener('keydown', (event) => {
    if (event.code === '${key}') {
        ${statements}
    }
});\n`;
};

Blockly.JavaScript['sprite_collision'] = function(block) {
    const statements = Blockly.JavaScript.statementToCode(block, 'DO');
    return `
this.onCollision = function(otherSprite) {
    ${statements}
};\n`;
};
