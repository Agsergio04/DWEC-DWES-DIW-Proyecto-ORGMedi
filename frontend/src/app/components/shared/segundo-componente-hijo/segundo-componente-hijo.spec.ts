import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegundoComponenteHijo } from './segundo-componente-hijo';

describe('SegundoComponenteHijo', () => {
  let component: SegundoComponenteHijo;
  let fixture: ComponentFixture<SegundoComponenteHijo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegundoComponenteHijo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegundoComponenteHijo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
