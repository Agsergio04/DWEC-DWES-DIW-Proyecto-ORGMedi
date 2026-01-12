import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineCardComponent } from './medicine-card';

describe('MedicineCardComponent', () => {
  let component: MedicineCardComponent;
  let fixture: ComponentFixture<MedicineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

