import { backend } from "declarations/backend";

class Snake {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.gameLoop = null;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('submitScore').addEventListener('click', this.submitScore.bind(this));
        
        this.updateLeaderboard();
        this.startGame();
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

    async submitScore() {
        const playerName = document.getElementById('playerName').value;
        if (playerName) {
            await backend.addScore(playerName, this.score);
            await this.updateLeaderboard();
            document.getElementById('gameOver').classList.add('hidden');
            this.resetGame();
        }
    }

    async updateLeaderboard() {
        const scores = await backend.getHighScores();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        scores.forEach((score, index) => {
            const div = document.createElement('div');
            div.textContent = `${index + 1}. ${score.name}: ${score.score}`;
            leaderboardList.appendChild(div);
        });
    }

    update() {
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check for collisions
        if (
            head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
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

    endGame() {
        clearInterval(this.gameLoop);
        this.gameOver = true;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        document.getElementById('score').textContent = '0';
        this.startGame();
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 100);
    }
}

new Snake();
