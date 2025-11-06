import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionService } from '../services/game-session.service';

type FaceType = 'solid' | 'diagonal' | 'half-vertical' | 'half-horizontal';
type ColorName = 'red' | 'white' | 'blue' | 'yellow';

interface BlockFace {
  type: FaceType;
  colors: ColorName[];
}

interface Block {
  id: number;
  row: number;
  col: number;
  faceIndex: number;  // Which of the 6 faces is showing (0-5)
  rotation: number;   // 0, 90, 180, 270
}

interface GameMetrics {
  startTime: number | null;
  rotationCount: number;
  dragCount: number;
}

@Component({
  selector: 'app-kohs-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kohs-game.component.html',
  styleUrl: './kohs-game.component.scss'
})
export class KohsGameComponent {
  readonly cellSize = 100;
  readonly gap = 8;

  private currentSessionId: string | null = null;

  // The 6 faces of a Kohs block
  readonly BLOCK_FACES: BlockFace[] = [
    { type: 'solid', colors: ['red'] },
    { type: 'solid', colors: ['white'] },
    { type: 'solid', colors: ['blue'] },
    { type: 'solid', colors: ['yellow'] },
    { type: 'diagonal', colors: ['red', 'white'] },
    { type: 'diagonal', colors: ['blue', 'yellow'] }
  ];

  readonly COLOR_MAP: Record<ColorName, string> = {
    red: '#ef4444',
    white: '#ffffff',
    blue: '#3b82f6',
    yellow: '#fbbf24'
  };

  gridSize = signal<4 | 16>(4);
  targetPattern = signal<Block[]>([]);
  playerBlocks = signal<Block[]>([]);
  isGameActive = signal<boolean>(false);
  metrics = signal<GameMetrics>({
    startTime: null,
    rotationCount: 0,
    dragCount: 0
  });

  draggedBlockId = signal<number | null>(null);
  isDragging = signal<boolean>(false);
  dragIndicatorPos = signal<{ x: number; y: number } | null>(null);

  rows = computed(() => this.gridSize() === 4 ? 2 : 4);
  cols = computed(() => this.gridSize() === 4 ? 2 : 4);

  playerBoardSize = computed(() =>
    this.cols() * this.cellSize + (this.cols() - 1) * this.gap
  );

  targetBoardSize = computed(() => {
    const scale = 0.6;
    return this.cols() * this.cellSize * scale + (this.cols() - 1) * this.gap * scale;
  });

  constructor(
    private router: Router,
    private gameSessionService: GameSessionService
  ) {}

  startGame(size: 4 | 16) {
    this.gridSize.set(size);
    const rows = size === 4 ? 2 : 4;
    const cols = size === 4 ? 2 : 4;

    // Generate target pattern with specific difficulty
    const target = this.generateTargetPattern(rows, cols, size === 4 ? 'easy' : 'medium');
    this.targetPattern.set(target);

    // Copy target blocks and randomize their positions and rotations
    const player = this.createShuffledBlocks(target);
    this.playerBlocks.set(player);

    // Reset metrics
    this.metrics.set({
      startTime: Date.now(),
      rotationCount: 0,
      dragCount: 0
    });

    // Start tracking session
    const difficulty = size === 4 ? '4-blocks' : '16-blocks';
    this.currentSessionId = this.gameSessionService.startSession('kohs', difficulty as '4-blocks' | '16-blocks');

    this.isGameActive.set(true);
    console.log('Game started with', size, 'blocks');
  }

  private generateTargetPattern(rows: number, cols: number, difficulty: 'easy' | 'medium' | 'hard'): Block[] {
    const blocks: Block[] = [];
    let id = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let faceIndex: number;
        let rotation: number;

        if (difficulty === 'easy') {
          // Easy: mostly solid colors, some diagonals
          faceIndex = Math.random() < 0.7
            ? Math.floor(Math.random() * 4)  // Solid colors (0-3)
            : 4 + Math.floor(Math.random() * 2);  // Diagonals (4-5)
          rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        } else if (difficulty === 'medium') {
          // Medium: mix of solid and diagonal
          faceIndex = Math.floor(Math.random() * 6);
          rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        } else {
          // Hard: more diagonals
          faceIndex = Math.random() < 0.3
            ? Math.floor(Math.random() * 4)
            : 4 + Math.floor(Math.random() * 2);
          rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        }

        blocks.push({ id: id++, row: r, col: c, faceIndex, rotation });
      }
    }

    return blocks;
  }

  private createShuffledBlocks(targetBlocks: Block[]): Block[] {
    // Copy the target blocks with same faceIndex but randomize positions and rotations
    const shuffledBlocks = targetBlocks.map(block => ({
      ...block,
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)]
    }));

    // Shuffle positions using Fisher-Yates algorithm
    const positions = targetBlocks.map(b => ({ row: b.row, col: b.col }));
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Assign shuffled positions
    shuffledBlocks.forEach((block, index) => {
      block.row = positions[index].row;
      block.col = positions[index].col;
    });

    return shuffledBlocks;
  }

  onBlockClick(block: Block) {
    if (!this.isGameActive()) return;

    // Only rotate if not dragging
    if (!this.isDragging()) {
      // Rotate 90 degrees
      const newRotation = (block.rotation + 90) % 360;

      this.playerBlocks.update(blocks =>
        blocks.map(b => b.id === block.id ? { ...b, rotation: newRotation } : b)
      );

      // Update metrics
      this.metrics.update(m => ({ ...m, rotationCount: m.rotationCount + 1 }));

      // Check for completion
      this.checkCompletion();
    }
  }

  // Mouse events
  onMouseDown(block: Block, event: MouseEvent) {
    if (!this.isGameActive()) return;
    event.preventDefault();
    this.startDrag(block, event.clientX, event.clientY);
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggedBlockId() !== null) {
      this.updateDrag(event.clientX, event.clientY);
    }
  }

  onMouseUp(targetBlock: Block) {
    if (!this.isGameActive()) return;
    this.endDrag(targetBlock);
  }

  onMouseLeave() {
    this.cancelDrag();
  }

  // Touch events
  onTouchStart(block: Block, event: TouchEvent) {
    if (!this.isGameActive()) return;
    event.preventDefault(); // Prevent scrolling
    const touch = event.touches[0];
    this.startDrag(block, touch.clientX, touch.clientY);
  }

  onTouchMove(event: TouchEvent) {
    if (this.draggedBlockId() !== null) {
      event.preventDefault(); // Prevent scrolling
      const touch = event.touches[0];
      this.updateDrag(touch.clientX, touch.clientY);
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isGameActive()) return;
    event.preventDefault();

    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find the block element and get its data
    const blockElement = element?.closest('[data-block-id]');
    if (blockElement) {
      const blockId = parseInt(blockElement.getAttribute('data-block-id') || '-1');
      const targetBlock = this.playerBlocks().find(b => b.id === blockId);
      if (targetBlock) {
        this.endDrag(targetBlock);
        return;
      }
    }

    this.cancelDrag();
  }

  // Common drag logic
  private startDrag(block: Block, x: number, y: number) {
    this.draggedBlockId.set(block.id);
    this.isDragging.set(false);
    this.dragIndicatorPos.set({ x, y });
  }

  private updateDrag(x: number, y: number) {
    this.isDragging.set(true);
    this.dragIndicatorPos.set({ x, y });
  }

  private endDrag(targetBlock: Block) {
    const draggedId = this.draggedBlockId();

    // Only swap if we were dragging and it's a different block
    if (draggedId !== null && this.isDragging() && draggedId !== targetBlock.id) {
      const draggedBlock = this.playerBlocks().find(b => b.id === draggedId);

      if (draggedBlock) {
        // Swap positions
        this.playerBlocks.update(blocks => {
          return blocks.map(b => {
            if (b.id === draggedId) {
              return { ...b, row: targetBlock.row, col: targetBlock.col };
            } else if (b.id === targetBlock.id) {
              return { ...b, row: draggedBlock.row, col: draggedBlock.col };
            }
            return b;
          });
        });

        // Update metrics
        this.metrics.update(m => ({ ...m, dragCount: m.dragCount + 1 }));

        // Check for completion
        this.checkCompletion();
      }
    }

    this.cancelDrag();
  }

  private cancelDrag() {
    this.draggedBlockId.set(null);
    this.isDragging.set(false);
    this.dragIndicatorPos.set(null);
  }

  getDraggedBlock(): Block | null {
    const id = this.draggedBlockId();
    if (id === null) return null;
    return this.playerBlocks().find(b => b.id === id) || null;
  }

  private checkCompletion() {
    const target = this.targetPattern();
    const player = this.playerBlocks();

    // Sort both arrays by row and col to compare
    const sortedTarget = [...target].sort((a, b) => a.row * 10 + a.col - (b.row * 10 + b.col));
    const sortedPlayer = [...player].sort((a, b) => a.row * 10 + a.col - (b.row * 10 + b.col));

    const isMatch = sortedTarget.every((t, i) => {
      const p = sortedPlayer[i];

      // Face index must always match
      if (t.faceIndex !== p.faceIndex) {
        return false;
      }

      // For solid color blocks (faceIndex 0-3), rotation doesn't matter
      const face = this.BLOCK_FACES[t.faceIndex];
      if (face.type === 'solid') {
        return true; // Solid blocks match regardless of rotation
      }

      // For diagonal blocks (faceIndex 4-5), rotation must match
      return t.rotation === p.rotation;
    });

    if (isMatch) {
      this.onGameComplete();
    }
  }

  private onGameComplete() {
    const m = this.metrics();
    const elapsedSeconds = m.startTime ? ((Date.now() - m.startTime) / 1000) : 0;

    // Let the user see their final move before showing the alert
    setTimeout(() => {
      console.log('FINISH');
      console.log('Metrics:', {
        timeSeconds: elapsedSeconds,
        rotations: m.rotationCount,
        drags: m.dragCount
      });

      // Save session to storage
      this.gameSessionService.completeSession({
        timeSeconds: elapsedSeconds,
        rotations: m.rotationCount,
        drags: m.dragCount
      });

      alert(`Finish at ${elapsedSeconds.toFixed(2)} seconds!\n\nRotations: ${m.rotationCount}\nDrags: ${m.dragCount}\n\nYour score has been saved!`);

      this.isGameActive.set(false);

      // Navigate back to menu
      this.router.navigate(['/']);
    }, 500);
  }

  goBackToMenu(): void {
    this.router.navigate(['/']);
  }

  blockX(block: Block, scale: number = 1) {
    return block.col * (this.cellSize * scale + this.gap * scale);
  }

  blockY(block: Block, scale: number = 1) {
    return block.row * (this.cellSize * scale + this.gap * scale);
  }

  getBlockFace(block: Block): BlockFace {
    return this.BLOCK_FACES[block.faceIndex];
  }

  getBlockColors(block: Block): ColorName[] {
    return this.getBlockFace(block).colors;
  }

  getSolidColor(block: Block): string {
    const colors = this.getBlockColors(block);
    return this.COLOR_MAP[colors[0]];
  }

  getDiagonalColors(block: Block): { color1: string; color2: string } {
    const colors = this.getBlockColors(block);
    return {
      color1: this.COLOR_MAP[colors[0]],
      color2: this.COLOR_MAP[colors[1]]
    };
  }

  center(scale: number = 1) {
    return (this.cellSize * scale) / 2;
  }
}
