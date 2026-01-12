import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionComponent } from './accordion';

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    component.items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1' },
      { id: 'item2', title: 'Item 2', content: 'Content 2' },
      { id: 'item3', title: 'Item 3', content: 'Content 3', disabled: true }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle item expansion', () => {
    component.toggleItem('item1');
    expect(component.isExpanded('item1')).toBe(true);
    component.toggleItem('item1');
    expect(component.isExpanded('item1')).toBe(false);
  });

  it('should not toggle disabled item', () => {
    component.toggleItem('item3');
    expect(component.isExpanded('item3')).toBe(false);
  });

  it('should collapse other items when allowMultiple is false', () => {
    component.allowMultiple = false;
    component.toggleItem('item1');
    expect(component.isExpanded('item1')).toBe(true);
    component.toggleItem('item2');
    expect(component.isExpanded('item1')).toBe(false);
    expect(component.isExpanded('item2')).toBe(true);
  });

  it('should allow multiple items when allowMultiple is true', () => {
    component.allowMultiple = true;
    component.toggleItem('item1');
    component.toggleItem('item2');
    expect(component.isExpanded('item1')).toBe(true);
    expect(component.isExpanded('item2')).toBe(true);
  });

  it('should have correct initial state', () => {
    expect(component.expandedItems.size).toBe(0);
    expect(component.allowMultiple).toBe(false);
  });

  it('should handle non-existent items gracefully', () => {
    expect(() => {
      component.toggleItem('nonexistent');
    }).not.toThrow();
  });
});

