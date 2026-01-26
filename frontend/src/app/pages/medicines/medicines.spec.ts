import { TestBed } from '@angular/core/testing';
import { MedicinesPage } from './medicines';
import { MedicineService } from '../../data/medicine.service';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('MedicinesPage', () => {
  let component: MedicinesPage;
  let medicineServiceSpy: jasmine.SpyObj<MedicineService>;
  let storeSpy: Partial<MedicineStoreSignals>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    medicineServiceSpy = jasmine.createSpyObj('MedicineService', ['getPage', 'searchRemote']);
    storeSpy = {
      medicines: () => [],
      loading: () => false,
      error: () => null,
      stats: () => ({ total: 0 }) as any
    } as Partial<MedicineStoreSignals>;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MedicineService, useValue: medicineServiceSpy },
        { provide: MedicineStoreSignals, useValue: storeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    component = TestBed.inject(MedicinesPage);
  });

  it('should redirect to login when no token present', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/iniciar-sesion']);
  });

  it('loadPage should populate paginationState on success', (done) => {
    const fakeResponse = { items: [{ id: 1, nombre: 'X' }], total: 1, page: 1, pageSize: 10, totalPages: 1, hasMore: false } as any;
    medicineServiceSpy.getPage.and.returnValue(of(fakeResponse));

    // Simulate token present
    spyOn(localStorage, 'getItem').and.returnValue('token');
    component.ngOnInit();

    // Call loadPage directly
    component.loadPage(1);

    setTimeout(() => {
      expect(component.paginationState().items.length).toBe(1);
      expect(component.paginationState().total).toBe(1);
      done();
    }, 0);
  });
});
