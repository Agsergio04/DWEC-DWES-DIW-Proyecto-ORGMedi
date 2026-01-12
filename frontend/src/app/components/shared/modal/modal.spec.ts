import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal';
import { DebugElement } from '@angular/core';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when closeModal is called', () => {
    let closeCalled = false;
    component.close.subscribe(() => {
      closeCalled = true;
    });
    component.closeModal();
    expect(closeCalled).toBe(true);
  });

  it('should set isOpen to false when closeModal is called', () => {
    component.isOpen = true;
    component.closeModal();
    expect(component.isOpen).toBe(false);
  });

  it('should close on escape key when isOpen is true', () => {
    component.isOpen = true;
    component.closable = true;

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(event);

    expect(component.isOpen).toBe(false);
  });

  it('should not close on escape key when not closable', () => {
    component.isOpen = true;
    component.closable = false;

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(event);

    expect(component.isOpen).toBe(true);
  });

  it('should close on backdrop click when closable', () => {
    component.isOpen = true;
    component.closable = true;

    const event = new MouseEvent('click');
    component.onBackdropClick(event as any);

    expect(component.isOpen).toBe(false);
  });

  it('should not close on backdrop click when not closable', () => {
    component.isOpen = true;
    component.closable = false;

    const event = new MouseEvent('click');
    component.onBackdropClick(event as any);

    expect(component.isOpen).toBe(true);
  });

  it('should execute onModalClick without errors', () => {
    const event = new MouseEvent('click');
    expect(() => {
      component.onModalClick(event);
    }).not.toThrow();
  });

  it('should have correct initial state', () => {
    expect(component.isOpen).toBe(false);
    expect(component.closable).toBe(true);
    expect(component.title).toBe('');
  });
});

