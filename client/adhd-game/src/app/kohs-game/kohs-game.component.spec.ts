import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohsGameComponent } from './kohs-game.component';

describe('KohsGameComponent', () => {
  let component: KohsGameComponent;
  let fixture: ComponentFixture<KohsGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KohsGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohsGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
