import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render with default classes', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
    expect(btn.nativeElement.classList).toContain('button');
    expect(btn.nativeElement.classList).toContain('button--primary');
    expect(btn.nativeElement.classList).toContain('button--md');
  });

  it('should emit clicked when clicked and not disabled', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    return new Promise<void>((resolve) => {
      component.clicked.subscribe((ev) => {
        expect(ev).toBeTruthy();
        resolve();
      });
      btn.triggerEventHandler('click', new MouseEvent('click'));
    });
  });

  it('should not emit when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    return new Promise<void>((resolve) => {
      let called = false;
      component.clicked.subscribe(() => called = true);
      const btn = fixture.debugElement.query(By.css('button'));
      btn.triggerEventHandler('click', new MouseEvent('click'));
      setTimeout(() => {
        expect(called).toBe(false);
        resolve();
      }, 50);
    });
  });

  it('should set aria-disabled and tabindex when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(btn.nativeElement.getAttribute('tabindex')).toBe('-1');
  });
});
