import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosxperfilxtodoComponent } from './permisosxperfilxtodo.component';

describe('PermisosxperfilxtodoComponent', () => {
  let component: PermisosxperfilxtodoComponent;
  let fixture: ComponentFixture<PermisosxperfilxtodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisosxperfilxtodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisosxperfilxtodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
