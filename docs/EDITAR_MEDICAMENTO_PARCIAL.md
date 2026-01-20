# Editar Medicamento Parcialmente (PATCH)

## ¿Cómo funciona?

Ahora puedes editar **solo los campos que necesites cambiar** sin tener que tocar los demás. El sistema detecta automáticamente qué campos cambiaron y solo envía esos al backend.

## Flujo Técnico

### 1. **Backend (Java)**
```java
// MedicamentoController.java - Nuevo endpoint PATCH
@PatchMapping("/{id}")
public ResponseEntity<MedicamentoDTO> patchMedicamento(@PathVariable Long id, @RequestBody MedicamentoDTO dto) {
    // Solo actualiza campos que no sean null
    if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
        medicamento.setNombre(dto.getNombre());
    }
    if (dto.getCantidadMg() != null) {
        medicamento.setCantidadMg(dto.getCantidadMg());
    }
    // ... etc para otros campos
}
```

### 2. **Frontend (Angular)**

#### Paso 1: Guardar datos originales
```typescript
// Al cargar el medicamento, guardamos una copia de los datos originales
private loadMedicineData(medicine: any): void {
  this.medicine = medicine;
  this.originalMedicine = JSON.parse(JSON.stringify(medicine)); // ← Copia profunda
}
```

#### Paso 2: Detectar cambios
```typescript
// Comparar valores original vs nuevo
private detectChanges(newData: any): any {
  const changes: any = {};
  
  for (const key in newData) {
    const originalValue = this.originalMedicine?.[key];
    const newValue = newData[key];
    
    // Solo incluir si cambió
    if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
      changes[key] = newValue;
    }
  }
  
  return changes;
}
```

#### Paso 3: Enviar solo cambios
```typescript
// En lugar de PUT (reemplazar todo), usamos PATCH
const changedFields = this.detectChanges(allMedicineData);

this.medicineService.patch(this.medicineId, changedFields).subscribe({
  // ... manejo de respuesta
});
```

## Ejemplos de Uso

### Ejemplo 1: Solo cambiar cantidad
```
Campo original    Campo nuevo    Se envía al backend?
─────────────────────────────────────────────────────
nombre: Ibuprofeno    Ibuprofeno    ❌ NO (sin cambios)
cantidadMg: 500       600           ✅ SÍ (cambió)
horaInicio: 08:00     08:00         ❌ NO (sin cambios)
fechaFin: 2026-02-01  2026-02-01    ❌ NO (sin cambios)
color: #FF0000        #FF0000       ❌ NO (sin cambios)

Request PATCH body:
{
  "cantidadMg": 600
}
```

### Ejemplo 2: Cambiar nombre y fecha fin
```
Request PATCH body:
{
  "nombre": "Ibuprofeno Fuerte",
  "fechaFin": "2026-03-15"
}
```

### Ejemplo 3: Sin cambios (usuario no modifica nada)
```
detectChanges() devuelve {}
→ Se cancela la solicitud y simplemente navega sin guardar
```

## Ventajas

✅ **Menor uso de ancho de banda** - Solo envía lo que cambió
✅ **Más eficiente** - El backend no revalida campos sin cambios
✅ **Mejor UX** - El usuario puede cambiar solo lo que necesite
✅ **Logging automático** - Muestra en consola qué campos cambiaron

## Debugging

Abre la consola del navegador (F12) para ver:

```javascript
[EditMedicinePage] Campos originales: {nombre: "Ibuprofeno", cantidadMg: 500, ...}
[EditMedicinePage] Campos nuevos: {nombre: "Ibuprofeno", cantidadMg: 600, ...}
[EditMedicinePage] Campos que cambiaron: {cantidadMg: 600}
[detectChanges] Campo "cantidadMg" cambió: "500" → "600"
```

## Archivos Modificados

- ✅ `backend/src/main/java/.../MedicamentoController.java` - Añadido @PatchMapping
- ✅ `frontend/src/app/pages/edit-medicine/edit-medicine.ts` - Detecta cambios y usa PATCH
- ✅ `frontend/src/app/pages/edit-medicine/edit-medicine.html` - Mensaje informativo

## Compatibilidad Regresiva

- **PUT sigue funcionando** para crear medicamentos nuevos
- **PATCH es automático** solo en la página de editar
- **Sin cambios en la UI** - Transparente para el usuario
