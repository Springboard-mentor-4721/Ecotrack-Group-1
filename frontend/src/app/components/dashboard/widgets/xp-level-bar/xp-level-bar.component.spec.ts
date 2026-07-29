import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { XpLevelBarComponent } from './xp-level-bar.component';
import { CommonModule } from '@angular/common';

describe('XpLevelBarComponent', () => {
  let component: XpLevelBarComponent;
  let fixture: ComponentFixture<XpLevelBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, XpLevelBarComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(XpLevelBarComponent);
    component = fixture.componentInstance;
    // { currentLevel: 1, currentXp: 50, nextLevelXp: 100 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
