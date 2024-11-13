import { backend } from "declarations/backend";

class Game {
    constructor() {
        this.setupEventListeners();
        this.showScreen('titleScreen');
        this.gameLoop = null;
        this.score = 0;
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('viewHighscores').addEventListener('click', () => this.showHighscores());
        
        // Back buttons
        document.getElementById('backToMenu').addEventListener('click', () => this.returnToMenu());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.returnToMenu());
        document.getElementById('backToMenuFromHighscores').addEventListener('click', () => this.returnToMenu());
        
        // Game over screen
        document.getElementById('submitScore').addEventListener('click', () => this.submitScore());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameLoop) this.handleKeyPress(e);
        });
    }

    showScreen(screenId) {
        ['titleScreen', 'gameScreen', 'gameOverScreen', 'highscoresScreen'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    startGame() {
        this.showScreen('gameScreen');
        this.initializeGame();
        this.startGameLoop();
    }

    initializeGame() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('score').textContent = '0';
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) this.direction = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) this.direction = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) this.direction = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) this.direction = {x: 1, y: 0};
                break;
        }
    }

    update() {
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        return (
            head.x < 0 || 
            head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || 
            head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    startGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 100);
    }

    endGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('finalScore').textContent = this.score;
        this.showScreen('gameOverScreen');
    }

    async submitScore() {
        const playerName = document.getElementById('playerName').value;
        if (playerName) {
            await backend.addScore(playerName, this.score);
            this.showHighscores();
        }
    }

    async showHighscores() {
        const scores = await backend.getHighScores();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        scores.forEach((score, index) => {
            const div = document.createElement('div');
            div.textContent = `${index + 1}. ${score.name}: ${score.score}`;
            leaderboardList.appendChild(div);
        });
        this.showScreen('highscoresScreen');
    }

    returnToMenu() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.showScreen('titleScreen');
    }
}

new Game();
