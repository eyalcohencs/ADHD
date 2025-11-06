import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameSessionService, GameSession } from '../services/game-session.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  analytics = computed(() => this.gameSessionService.getAnalytics());
  allSessions = computed(() => this.gameSessionService.getAllSessions());

  constructor(
    private router: Router,
    private gameSessionService: GameSessionService
  ) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getGameName(session: GameSession): string {
    const names: Record<string, string> = {
      'kohs': 'Kohs Block Design',
      'stroop': 'Stroop Test',
      'go-no-go': 'Go/No-Go Task',
      'trail-making': 'Trail Making Test'
    };
    return names[session.gameType] || session.gameType;
  }

  getDifficultyBadge(difficulty: string): string {
    return difficulty.replace('-', ' ').toUpperCase();
  }

  clearData(): void {
    if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
      this.gameSessionService.clearAllData();
    }
  }
}
