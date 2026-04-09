// Получаем элементы
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Размеры
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;
const ROAD_WIDTH = canvas.width;
const CAR_FIXED_X = canvas.width / 2 - CAR_WIDTH / 2;

// Переменные игры
let carX = CAR_FIXED_X;
let score = 0;
let highScore = localStorage.getItem('carGameHighScore') || 0;
let gameRunning = true;
let animationId = null;

// Препятствия
let obstacles = [];

// Управление
let leftPressed = false;
let rightPressed = false;

// Параметры движения
const CAR_SPEED = 7;
const OBSTACLE_SPEED = 3;

// Отображаем лучший результат
highScoreElement.textContent = highScore;

// Класс препятствия
class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = OBSTACLE_WIDTH;
        this.height = OBSTACLE_HEIGHT;
    }
    
    draw() {
        // Рисуем препятствие (кирпич/камень)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Детали
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 10);
        ctx.fillRect(this.x + 5, this.y + 30, this.width - 10, 10);
        
        // Глаза (для веселья)
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 20, 6, 6);
        ctx.fillRect(this.x + 26, this.y + 20, 6, 6);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 9, this.y + 21, 3, 3);
        ctx.fillRect(this.x + 27, this.y + 21, 3, 3);
    }
    
    update() {
        this.y += OBSTACLE_SPEED;
    }
}

// Рисуем машину
function drawCar() {
    // Кузов
    ctx.fillStyle = '#3498db';
    ctx.fillRect(carX, canvas.height - CAR_HEIGHT - 20, CAR_WIDTH, CAR_HEIGHT);
    
    // Крыша
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(carX + 5, canvas.height - CAR_HEIGHT - 35, CAR_WIDTH - 10, 25);
    
    // Окна
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(carX + 7, canvas.height - CAR_HEIGHT - 32, 10, 15);
    ctx.fillRect(carX + 23, canvas.height - CAR_HEIGHT - 32, 10, 15);
    
    // Колёса
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(carX + 5, canvas.height - CAR_HEIGHT - 15, 8, 15);
    ctx.fillRect(carX + 27, canvas.height - CAR_HEIGHT - 15, 8, 15);
    ctx.fillRect(carX + 5, canvas.height - 10, 8, 15);
    ctx.fillRect(carX + 27, canvas.height - 10, 8, 15);
    
    // Фары
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(carX + 2, canvas.height - CAR_HEIGHT - 15, 5, 5);
    ctx.fillRect(carX + CAR_WIDTH - 7, canvas.height - CAR_HEIGHT - 15, 5, 5);
}

// Рисуем дорогу
function drawRoad() {
    // Асфальт
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Разметка
    ctx.fillStyle = '#ecf0f1';
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 5, i + (Date.now() / 10) % 40, 10, 20);
    }
    
    // Бордюры
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 0, 10, canvas.height);
    ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);
}

// Проверка столкновения
function checkCollision() {
    const carRect = {
        x: carX,
        y: canvas.height - CAR_HEIGHT - 20,
        width: CAR_WIDTH,
        height: CAR_HEIGHT
    };
    
    for (let obstacle of obstacles) {
        const obstacleRect = {
            x: obstacle.x,
            y: obstacle.y,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT
        };
        
        if (carRect.x < obstacleRect.x + obstacleRect.width &&
            carRect.x + carRect.width > obstacleRect.x &&
            carRect.y < obstacleRect.y + obstacleRect.height &&
            carRect.y + carRect.height > obstacleRect.y) {
            return true;
        }
    }
    return false;
}

// Генерация препятствий
function generateObstacles() {
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 150) {
        if (Math.random() < 0.02) {
            const randX = Math.random() * (canvas.width - OBSTACLE_WIDTH - 20) + 10;
            obstacles.push(new Obstacle(randX, -OBSTACLE_HEIGHT));
        }
    }
}

// Обновление игры
function update() {
    if (!gameRunning) return;
    
    // Движение машины
    if (leftPressed && carX > 10) {
        carX -= CAR_SPEED;
    }
    if (rightPressed && carX < canvas.width - CAR_WIDTH - 10) {
        carX += CAR_SPEED;
    }
    
    // Обновление препятствий
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        
        // Удаляем препятствия за экраном и увеличиваем счёт
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            scoreElement.textContent = score;
            i--;
        }
    }
    
    // Генерация новых препятствий
    generateObstacles();
    
    // Проверка столкновения
    if (checkCollision()) {
        gameRunning = false;
        
        // Обновляем лучший результат
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('carGameHighScore', highScore);
        }
        
        // Останавливаем анимацию
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Показываем сообщение
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText(`Ваш счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Нажмите "Начать заново"', canvas.width / 2, canvas.height / 2 + 70);
        
        return;
    }
}

// Рисование
function draw() {
    drawRoad();
    drawCar();
    
    for (let obstacle of obstacles) {
        obstacle.draw();
    }
}

// Главный игровой цикл
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Запуск игры
function startGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Сброс переменных
    carX = CAR_FIXED_X;
    score = 0;
    obstacles = [];
    gameRunning = true;
    scoreElement.textContent = score;
    leftPressed = false;
    rightPressed = false;
    
    // Очищаем канвас и запускаем
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Перезапуск игры
function restartGame() {
    startGame();
}

// Обработчики клавиш
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = true;
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        rightPressed = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight') {
        rightPressed = false;
    }
});

// Обработчики кнопок для мобильных устройств
leftBtn.addEventListener('mousedown', () => leftPressed = true);
leftBtn.addEventListener('mouseup', () => leftPressed = false);
leftBtn.addEventListener('mouseleave', () => leftPressed = false);

rightBtn.addEventListener('mousedown', () => rightPressed = true);
rightBtn.addEventListener('mouseup', () => rightPressed = false);
rightBtn.addEventListener('mouseleave', () => rightPressed = false);

// Для тач-экранов
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    leftPressed = true;
});
leftBtn.addEventListener('touchend', () => leftPressed = false);

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    rightPressed = true;
});
rightBtn.addEventListener('touchend', () => leftPressed = false);

// Перезапуск
restartBtn.addEventListener('click', restartGame);

// Запускаем игру
startGame();