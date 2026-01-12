import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Clase base abstracta para gestionar automáticamente las suscripciones en componentes
 * 
 * Evita fugas de memoria al cancelar todas las suscripciones cuando el componente se destruye.
 * Utiliza el patrón takeUntil con destroy$ Subject.
 * 
 * USO:
 * 
 * 1. Hacer que tu componente herede de DestroyableComponent:
 * 
 * ```typescript
 * export class MyComponent extends DestroyableComponent implements OnInit {
 *   // ...
 * }
 * ```
 * 
 * 2. Usar destroy$ con el operador takeUntil en tus suscripciones:
 * 
 * ```typescript
 * ngOnInit() {
 *   this.myService.data$
 *     .pipe(takeUntil(this.destroy$))
 *     .subscribe(data => {
 *       // manejar datos
 *     });
 * }
 * ```
 * 
 * El Subject destroy$ emitirá automáticamente cuando el componente se destruya,
 * cancelando todas las suscripciones que usen takeUntil(this.destroy$).
 * 
 * NOTA: No necesitas llamar a super.ngOnDestroy() en tu componente.
 * Angular lo hace automáticamente.
 */
@Injectable()
export abstract class DestroyableComponent implements OnDestroy {
  /**
   * Subject que emite cuando el componente se destruye
   * Úsalo con takeUntil() para auto-cancelar suscripciones
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * Se ejecuta automáticamente cuando Angular destruye el componente
   * Emite en destroy$ y lo completa para liberar recursos
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Función helper para crear un destroy$ Subject y retornar su cleanup
 * Útil para componentes standalone que no pueden heredar de DestroyableComponent
 * 
 * USO EN COMPONENTES STANDALONE:
 * 
 * ```typescript
 * @Component({
 *   selector: 'app-my-component',
 *   standalone: true,
 *   // ...
 * })
 * export class MyComponent implements OnInit, OnDestroy {
 *   private readonly destroy$ = createDestroySubject();
 * 
 *   ngOnInit() {
 *     this.myService.data$
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(data => {
 *         // manejar datos
 *       });
 *   }
 * 
 *   ngOnDestroy() {
 *     destroySubject(this.destroy$);
 *   }
 * }
 * ```
 */
export function createDestroySubject(): Subject<void> {
  return new Subject<void>();
}

/**
 * Limpia el destroy$ Subject
 * Llama a esto en ngOnDestroy cuando uses createDestroySubject()
 */
export function destroySubject(destroy$: Subject<void>): void {
  destroy$.next();
  destroy$.complete();
}

/**
 * Alternativa: Función que retorna un DestroyRef Observable
 * Para Angular 16+ con la nueva API de DestroyRef
 * 
 * USO CON DESTROYREF (Angular 16+):
 * 
 * ```typescript
 * import { DestroyRef, inject } from '@angular/core';
 * import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
 * 
 * export class MyComponent implements OnInit {
 *   private destroyRef = inject(DestroyRef);
 * 
 *   ngOnInit() {
 *     this.myService.data$
 *       .pipe(takeUntilDestroyed(this.destroyRef))
 *       .subscribe(data => {
 *         // manejar datos
 *       });
 *   }
 * }
 * ```
 * 
 * ⚠️ IMPORTANTE: takeUntilDestroyed() debe llamarse en el contexto de inyección
 * (constructor o inicializadores de campo), NO en ngOnInit si no pasas DestroyRef.
 */
