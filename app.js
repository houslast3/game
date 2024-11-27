class Sprite {
    constructor(image, x = 0, y = 0) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.rotation = 0;
        this.code = '';
        this.onCollision = null;
    }

    update() {
        if (this.code) {
            try {
                const fn = new Function(this.code);
                fn.call(this);
            } catch (error) {
                console.error('Erro no código do sprite:', error);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        ctx.restore();
    }

    checkCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.image.width + other.image.width) * 0.5 * Math.max(this.scale, other.scale);
        return distance < minDistance;
    }
}

class GameMaker {
    constructor() {
        this.sprites = [];
        this.selectedSprite = null;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.workspace = Blockly.inject('blocklyDiv', {
            toolbox: this.createToolbox()
        });

        this.setupEventListeners();
        this.resizeCanvas();
        this.gameLoop();
    }

    createToolbox() {
        return {
            kind: 'categoryToolbox',
            contents: [
                {
                    kind: 'category',
                    name: 'Movimento',
                    colour: 230,
                    contents: [
                        { kind: 'block', type: 'sprite_move' },
                        { kind: 'block', type: 'sprite_rotate' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Eventos',
                    colour: 290,
                    contents: [
                        { kind: 'block', type: 'on_key_press' },
                        { kind: 'block', type: 'sprite_collision' }
                    ]
                }
            ]
        };
    }

    setupEventListeners() {
        // Manipulação de sprites
        document.getElementById('spriteUpload').addEventListener('change', (e) => this.handleSpriteUpload(e));
        
        // Propriedades do sprite
        document.getElementById('posX').addEventListener('change', (e) => {
            if (this.selectedSprite) {
                this.selectedSprite.x = Number(e.target.value);
            }
        });
        
        document.getElementById('posY').addEventListener('change', (e) => {
            if (this.selectedSprite) {
                this.selectedSprite.y = Number(e.target.value);
            }
        });
        
        document.getElementById('scale').addEventListener('change', (e) => {
            if (this.selectedSprite) {
                this.selectedSprite.scale = Number(e.target.value);
            }
        });

        // Botões de execução e exportação
        document.getElementById('runGame').addEventListener('click', () => this.runGame());
        document.getElementById('exportGame').addEventListener('click', () => this.exportGame());

        // Atualização do código quando o workspace do Blockly muda
        this.workspace.addChangeListener(() => {
            if (this.selectedSprite) {
                const code = Blockly.JavaScript.workspaceToCode(this.workspace);
                this.selectedSprite.code = code;
            }
        });

        // Redimensionamento do canvas
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    handleSpriteUpload(event) {
        const files = event.target.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const sprite = new Sprite(img, this.canvas.width / 2, this.canvas.height / 2);
                    this.sprites.push(sprite);
                    this.addSpriteToList(sprite, file.name);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    addSpriteToList(sprite, name) {
        const spriteList = document.getElementById('spriteList');
        const spriteItem = document.createElement('div');
        spriteItem.className = 'sprite-item';
        
        const img = document.createElement('img');
        img.src = sprite.image.src;
        spriteItem.appendChild(img);
        
        const label = document.createElement('div');
        label.textContent = name;
        spriteItem.appendChild(label);

        spriteItem.addEventListener('click', () => {
            document.querySelectorAll('.sprite-item').forEach(item => item.classList.remove('selected'));
            spriteItem.classList.add('selected');
            this.selectedSprite = sprite;
            this.updatePropertiesPanel();
        });

        spriteList.appendChild(spriteItem);
    }

    updatePropertiesPanel() {
        if (this.selectedSprite) {
            document.getElementById('posX').value = this.selectedSprite.x;
            document.getElementById('posY').value = this.selectedSprite.y;
            document.getElementById('scale').value = this.selectedSprite.scale;
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Atualizar e desenhar sprites
        for (const sprite of this.sprites) {
            sprite.update();
            sprite.draw(this.ctx);
        }

        // Verificar colisões
        for (let i = 0; i < this.sprites.length; i++) {
            for (let j = i + 1; j < this.sprites.length; j++) {
                if (this.sprites[i].checkCollision(this.sprites[j])) {
                    if (this.sprites[i].onCollision) {
                        this.sprites[i].onCollision(this.sprites[j]);
                    }
                    if (this.sprites[j].onCollision) {
                        this.sprites[j].onCollision(this.sprites[i]);
                    }
                }
            }
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    runGame() {
        // O jogo já está rodando continuamente através do gameLoop
        console.log('Jogo em execução!');
    }

    exportGame() {
        const gameCode = this.generateGameCode();
        const blob = new Blob([gameCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meu-jogo.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    generateGameCode() {
        const spritesData = this.sprites.map(sprite => ({
            x: sprite.x,
            y: sprite.y,
            scale: sprite.scale,
            rotation: sprite.rotation,
            image: sprite.image.src,
            code: sprite.code
        }));

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Meu Jogo</title>
    <style>
        canvas {
            border: 1px solid black;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script>
        ${Sprite.toString()}

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const sprites = [];

        // Configurar canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth - 20;
            canvas.height = window.innerHeight - 20;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Carregar sprites
        const spritesData = ${JSON.stringify(spritesData)};
        
        Promise.all(spritesData.map(data => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const sprite = new Sprite(img, data.x, data.y);
                    sprite.scale = data.scale;
                    sprite.rotation = data.rotation;
                    sprite.code = data.code;
                    sprites.push(sprite);
                    resolve();
                };
                img.src = data.image;
            });
        })).then(() => {
            // Iniciar game loop
            function gameLoop() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (const sprite of sprites) {
                    sprite.update();
                    sprite.draw(ctx);
                }

                for (let i = 0; i < sprites.length; i++) {
                    for (let j = i + 1; j < sprites.length; j++) {
                        if (sprites[i].checkCollision(sprites[j])) {
                            if (sprites[i].onCollision) {
                                sprites[i].onCollision(sprites[j]);
                            }
                            if (sprites[j].onCollision) {
                                sprites[j].onCollision(sprites[i]);
                            }
                        }
                    }
                }

                requestAnimationFrame(gameLoop);
            }

            gameLoop();
        });
    </script>
</body>
</html>`;
    }
}

// Inicializar o Game Maker quando a página carregar
window.addEventListener('load', () => {
    new GameMaker();
});
