import { Component } from '@angular/core';
import { KohsGameComponent } from './kohs-game/kohs-game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KohsGameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'adhd-game';
}
