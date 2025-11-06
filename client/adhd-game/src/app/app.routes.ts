import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { KohsGameComponent } from './kohs-game/kohs-game.component';
import { AnalyticsComponent } from './analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'kohs-game', component: KohsGameComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: '**', redirectTo: '' }
];
