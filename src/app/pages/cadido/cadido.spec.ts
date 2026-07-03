import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cadido } from './cadido';

describe('Cadido', () => {
  let component: Cadido;
  let fixture: ComponentFixture<Cadido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadido],
    }).compileComponents();

    fixture = TestBed.createComponent(Cadido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
