import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface Cell {
  index: number;
  row: number;
  col: number;
  angle: number;
  clicked: boolean;
};


@Component({
  selector: 'app-kohs-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kohs-game.component.html',
  styleUrl: './kohs-game.component.scss'
})
export class KohsGameComponent {
  readonly rows = 4;
  readonly cols = 4;
  readonly cellSize = 120;
  readonly gap = 8;

  private initCells(): Cell[] {
    const out: Cell[] = [];
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        out.push({ index: idx++, row: r, col: c, angle: 0, clicked: false });
      }
    }
    return out;
  }

  cells = signal<Cell[]>(this.initCells());

  boardSize = computed(() =>
    this.cols * this.cellSize + (this.cols - 1) * this.gap
  );

  onCellClick(cell: Cell) {
    cell.angle = (cell.angle + 90) % 360;

    if (!cell.clicked) {
      cell.clicked = true;
      console.log(`square no ${cell.index} was clicked`);
    }

    const allClicked = this.cells().every(c => c.clicked);
    if (allClicked) {
      console.log('all squares were clicked');
    }

    this.cells.update(arr => arr.map(c => (c.index === cell.index ? cell : c)));
  }

  cellX(cell: Cell) {
    return cell.col * (this.cellSize + this.gap);
  }
  cellY(cell: Cell) {
    return cell.row * (this.cellSize + this.gap);
  }
  center() {
    return this.cellSize / 2;
  }

  trianglePoints(): string {
    const w = this.cellSize;
    const baseLeftX = 0.2 * w;
    const baseRightX = 0.8 * w;
    const baseY = 0;
    const tipX = w / 2;
    const tipY = w / 2;
    return `${baseLeftX},${baseY} ${baseRightX},${baseY} ${tipX},${tipY}`;
  }

}
