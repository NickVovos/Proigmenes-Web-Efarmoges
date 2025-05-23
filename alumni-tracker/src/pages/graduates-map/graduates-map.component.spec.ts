import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraduatesMapComponent } from './graduates-map.component';

describe('GraduatesMapComponent', () => {
  let component: GraduatesMapComponent;
  let fixture: ComponentFixture<GraduatesMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraduatesMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraduatesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
