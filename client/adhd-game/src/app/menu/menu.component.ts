import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameSessionService } from '../services/game-session.service';

interface GameCard {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  status: 'available' | 'coming-soon';
  color: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  games: GameCard[] = [
    {
      id: 'kohs',
      title: 'Kohs Block Design',
      description: 'Spatial reasoning and pattern matching',
      route: '/kohs-game',
      icon: '🧩',
      status: 'available',
      color: '#667eea'
    },
    {
      id: 'stroop',
      title: 'Stroop Test',
      description: 'Attention and cognitive flexibility',
      route: '/stroop',
      icon: '🎨',
      status: 'coming-soon',
      color: '#f093fb'
    },
    {
      id: 'go-no-go',
      title: 'Go/No-Go Task',
      description: 'Impulse control and response inhibition',
      route: '/go-no-go',
      icon: '🚦',
      status: 'coming-soon',
      color: '#4facfe'
    },
    {
      id: 'trail-making',
      title: 'Trail Making Test',
      description: 'Visual attention and task switching',
      route: '/trail-making',
      icon: '🔗',
      status: 'coming-soon',
      color: '#43e97b'
    }
  ];

  constructor(
    private router: Router,
    public gameSessionService: GameSessionService
  ) {}

  navigateToGame(game: GameCard): void {
    if (game.status === 'available') {
      this.router.navigate([game.route]);
    }
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  getTotalGames(): number {
    return this.gameSessionService.getAnalytics().totalGames;
  }
}
