import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFoundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('snakeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  score = 0;
  isGameOver = false;

  private ctx!: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount = 20; // 400 / 20 = 20
  
  private snake: {x: number, y: number}[] = [];
  private dx = 0;
  private dy = 0;
  private foodX = 0;
  private foodY = 0;
  
  private gameLoopTimeout: any;
  
  private readonly colorBg = '#222222';
  private readonly colorSnakeBody = '#1ca6a6';
  private readonly colorSnakeHead = '#ffffff';
  private readonly colorFood = '#a61c1c';

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resetGame();
  }

  ngOnDestroy() {
    clearTimeout(this.gameLoopTimeout);
  }

  resetGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.isGameOver = false;
    this.placeFood();
    clearTimeout(this.gameLoopTimeout);
    this.gameLoop();
  }

  private gameLoop() {
    if (this.isGameOver) return;
    
    this.update();
    this.draw();
    
    const speed = Math.max(60, 150 - (this.score * 10));
    this.gameLoopTimeout = setTimeout(() => this.gameLoop(), speed);
  }

  private update() {
    if (this.dx === 0 && this.dy === 0) return;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
        this.gameOver();
        return;
    }

    for (let i = 0; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
            this.gameOver();
            return;
        }
    }

    this.snake.unshift(head);

    if (head.x === this.foodX && head.y === this.foodY) {
        this.score += 1;
        this.placeFood();
    } else {
        this.snake.pop();
    }
  }

  private draw() {
    this.ctx.fillStyle = this.colorBg;
    this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    for (let i = 0; i < this.snake.length; i++) {
        this.ctx.fillStyle = i === 0 ? this.colorSnakeHead : this.colorSnakeBody;
        this.ctx.fillRect(this.snake[i].x * this.gridSize + 1, this.snake[i].y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
    }

    this.ctx.fillStyle = this.colorFood;
    this.ctx.fillRect(this.foodX * this.gridSize + 1, this.foodY * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
  }

  private placeFood() {
    this.foodX = Math.floor(Math.random() * this.tileCount);
    this.foodY = Math.floor(Math.random() * this.tileCount);
    
    for (let i = 0; i < this.snake.length; i++) {
        if (this.snake[i].x === this.foodX && this.snake[i].y === this.foodY) {
            this.placeFood();
            return;
        }
    }
  }

  private gameOver() {
    this.isGameOver = true;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key) > -1) {
        e.preventDefault();
    }

    const key = e.key.toLowerCase();

    if ((key === 'arrowup' || key === 'w') && this.dy === 0) { this.dx = 0; this.dy = -1; }
    if ((key === 'arrowdown' || key === 's') && this.dy === 0) { this.dx = 0; this.dy = 1; }
    if ((key === 'arrowleft' || key === 'a') && this.dx === 0) { this.dx = -1; this.dy = 0; }
    if ((key === 'arrowright' || key === 'd') && this.dx === 0) { this.dx = 1; this.dy = 0; }
  }
}
