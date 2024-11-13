import { backend } from "declarations/backend";

class Game {
    constructor() {
        this.setupEventListeners();
        this.showScreen('titleScreen');
        this.gameLoop = null;
        this.score = 0;
        this.gameSpeed = 200; // Starting slower
        this.minSpeed = 50; // Maximum speed (minimum interval)
    }

    setupEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('viewHighscores').addEventListener('click', () => this.showHighscores());
        document.getElementById('backToMenu').addEventListener('click', () => this.returnToMenu());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.returnToMenu());
        document.getElementById('backToMenuFromHighscores').addEventListener('click', () => this.returnToMenu());
        document.getElementById('submitScore').addEventListener('click', () => this.submitScore());
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
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0}; // Start moving right
        this.nextDirection = {x: 1, y: 0}; // Buffer for next direction
        this.food = this.generateFood();
        this.score = 0;
        this.gameSpeed = 200; // Reset speed
        document.getElementById('score').textContent = '0';
        this.lastUpdate = Date.now();
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    handleKeyPress(event) {
        const key = event.key;
        const currentDirection = this.direction;

        switch(key) {
            case 'ArrowUp':
                if (currentDirection.y !== 1) {
                    this.nextDirection = {x: 0, y: -1};
                }
                break;
            case 'ArrowDown':
                if (currentDirection.y !== -1) {
                    this.nextDirection = {x: 0, y: 1};
                }
                break;
            case 'ArrowLeft':
                if (currentDirection.x !== 1) {
                    this.nextDirection = {x: -1, y: 0};
                }
                break;
            case 'ArrowRight':
                if (currentDirection.x !== -1) {
                    this.nextDirection = {x: 1, y: 0};
                }
                break;
        }
    }

    update() {
        // Update direction from buffered next direction
        this.direction = {...this.nextDirection};

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Wrap around screen edges
        head.x = (head.x + this.canvas.width / this.gridSize) % (this.canvas.width / this.gridSize);
        head.y = (head.y + this.canvas.height / this.gridSize) % (this.canvas.height / this.gridSize);

        // Check for collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            // Increase score and speed
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            
            // Increase speed
            this.gameSpeed = Math.max(this.minSpeed, this.gameSpeed - 5);
            
            // Don't remove tail (snake grows)
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#45a049' : '#4CAF50';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x * this.gridSize) + (this.gridSize / 2),
            (this.food.y * this.gridSize) + (this.gridSize / 2),
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    startGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        const gameStep = () => {
            this.update();
            this.draw();
            setTimeout(gameStep, this.gameSpeed);
        };
        
        gameStep();
    }

    endGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
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
