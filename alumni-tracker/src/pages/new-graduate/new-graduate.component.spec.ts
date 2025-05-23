import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGraduateComponent } from './new-graduate.component';

describe('NewGraduateComponent', () => {
  let component: NewGraduateComponent;
  let fixture: ComponentFixture<NewGraduateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewGraduateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewGraduateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
