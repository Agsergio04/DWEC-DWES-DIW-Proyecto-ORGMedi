import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    component.tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
      { id: 'tab3', label: 'Tab 3', disabled: true }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select tab and emit change event', () => {
    let emittedValue: string | undefined;
    component.tabChange.subscribe(value => {
      emittedValue = value;
    });

    component.selectTab('tab2');

    expect(component.activeTabId).toBe('tab2');
    expect(emittedValue).toBe('tab2');
  });

  it('should not select disabled tab', () => {
    let emittedValue: string | undefined;
    component.tabChange.subscribe(value => {
      emittedValue = value;
    });

    component.selectTab('tab3');

    expect(emittedValue).toBeUndefined();
  });

  it('should correctly identify active tab', () => {
    component.activeTabId = 'tab1';
    expect(component.isActive('tab1')).toBe(true);
    expect(component.isActive('tab2')).toBe(false);
  });

  it('should not select tab when disabled', () => {
    component.selectTab('tab3');
    expect(component.activeTabId).not.toBe('tab3');
  });
});

