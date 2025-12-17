import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render basic variant with title and description', () => {
    component.title = 'Hola';
    component.description = 'Descripción de prueba';
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('article'));
    expect(article.nativeElement.classList).toContain('app-card');
    expect(article.nativeElement.classList).toContain('app-card--basic');
    const title = fixture.debugElement.query(By.css('.app-card__title'));
    expect(title.nativeElement.textContent.trim()).toBe('Hola');
  });

  it('should apply horizontal classes when variant is horizontal', () => {
    component.variant = 'horizontal';
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('article'));
    expect(article.nativeElement.classList).toContain('app-card--horizontal');
  });
});

