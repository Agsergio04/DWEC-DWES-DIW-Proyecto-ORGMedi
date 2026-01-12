import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show tooltip on mouse enter', () => {
    component.onMouseEnter();
    expect(component.showTooltip).toBe(true);
  });

  it('should hide tooltip on mouse leave', () => {
    component.showTooltip = true;
    component.onMouseLeave();
    expect(component.showTooltip).toBe(false);
  });

  it('should show tooltip on focus', () => {
    component.onFocus();
    expect(component.showTooltip).toBe(true);
  });

  it('should hide tooltip on blur', () => {
    component.showTooltip = true;
    component.onBlur();
    expect(component.showTooltip).toBe(false);
  });

  it('should have correct initial state', () => {
    expect(component.showTooltip).toBe(false);
    expect(component.text).toBe('');
    expect(component.position).toBe('top');
  });

  it('should toggle tooltip state correctly', () => {
    expect(component.showTooltip).toBe(false);
    component.onMouseEnter();
    expect(component.showTooltip).toBe(true);
    component.onMouseLeave();
    expect(component.showTooltip).toBe(false);
  });
});

