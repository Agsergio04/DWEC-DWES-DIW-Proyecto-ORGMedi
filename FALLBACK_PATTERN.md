# Patrón de Fallback Selectivo

## Descripción
Implementa manejo inteligente de errores con fallback automático según el tipo de error HTTP.

## Patrones Implementados

### 1. Notificaciones (notifications.service.ts)
```typescript
catchError((error, caught) => {
  // 1️⃣ SIN INTERNET → Mock
  if (!navigator.onLine) {
    const mockNotifications = this.getMockNotifications();
    return of(mockNotifications);
  }

  // 2️⃣ SERVIDOR NO DISPONIBLE (503) → Reintentar
  if (error.status === 503) {
    return timer(2000).pipe(switchMap(() => caught));
  }

  // 3️⃣ NO ENCONTRADO (404) → Mock
  if (error.status === 404) {
    return of(this.getMockNotifications());
  }

  // 4️⃣ NO AUTORIZADO (401) → Error
  if (error.status === 401) {
    return throwError(() => error);
  }

  // 5️⃣ OTROS → Error
  return throwError(() => error);
})
```

### 2. Medicamentos (medicine.service.ts)
```typescript
catchError((error, caught) => {
  // 1️⃣ SIN INTERNET
  if (!navigator.onLine) {
    return of(this.getMockMedicines());
  }

  // 2️⃣ SERVIDOR NO DISPONIBLE
  if (error.status === 503) {
    return timer(3000).pipe(switchMap(() => caught));
  }

  // 3️⃣ TIMEOUT
  if (error.name === 'TimeoutError') {
    return of(this.getMockMedicines());
  }

  // 4️⃣ NO AUTORIZADO
  if (error.status === 401) {
    return throwError(() => error);
  }

  // 5️⃣ OTROS → Lista vacía (no rompe UI)
  return of([]);
})
```

## Comportamiento por Error

| Error | Acción | Fallback | UI |
|-------|--------|----------|-----|
| **Sin internet** (offline) | Usar mock | Datos de demo | Funcional |
| **503 Service Unavailable** | Reintentar en 2-3s | Automático | Espera |
| **404 Not Found** | Usar mock | Datos de demo | Funcional |
| **401 Unauthorized** | Propagar error | Login | Redirige |
| **Timeout** | Usar mock | Datos de demo | Funcional |
| **Otros errores** | Propagar/vacío | Depende | Degradado |

## Imports Necesarios

```typescript
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
```

## Métodos Mock Requeridos

### NotificationsService.getMockNotifications()
Retorna 4 notificaciones de ejemplo (éxito, advertencia, error, info)

### MedicineService.getMockMedicines()
Retorna 4 medicamentos de ejemplo (Paracetamol, Ibuprofeno, Amoxicilina, Vitamina C)

## Ventajas

✅ **Resiliencia**: La app funciona incluso sin backend  
✅ **UX mejorada**: No muestra errores críticos al usuario  
✅ **Desarrollo rápido**: Frontend puede avanzar sin backend  
✅ **Testing**: Fácil de testear con datos mock  
✅ **Debugging**: Logs detallados por cada tipo de error  

## Casos de Uso

- 📵 **Desarrollo offline**: Trabajar sin servidor
- 🚀 **Demostración**: Mostrar UI sin backend real
- 🔧 **Mantenimiento**: Servidor en reparación
- 🌐 **Conectividad débil**: Internet intermitente
- ⚡ **Timeout**: Servidor lento

## Instalación en Nuevo Servicio

1. **Agregar imports**:
```typescript
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
```

2. **Reemplazar catchError**:
```typescript
catchError((error, caught) => {
  if (!navigator.onLine) return of(this.getMock...());
  if (error.status === 503) return timer(2000).pipe(switchMap(() => caught));
  if (error.status === 404) return of(this.getMock...());
  if (error.status === 401) return throwError(() => error);
  return of([]); // o throwError
})
```

3. **Crear método mock**:
```typescript
private getMock...(): Type[] {
  return [ /* datos de ejemplo */ ];
}
```

## Testing

```typescript
it('should use mock when offline', () => {
  // Simular sin internet
  Object.defineProperty(window.navigator, 'onLine', { value: false });
  
  service.getAll().subscribe(data => {
    expect(data).toEqual(service.getMockNotifications());
  });
});
```
