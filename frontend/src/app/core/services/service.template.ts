/**
 * PLANTILLA DE SERVICIO DE DOMINIO
 * 
 * Copia este archivo y personalízalo para cada entidad (Medicines, Users, etc.)
 * Reemplaza "Product" y "products" con tu entidad específica.
 */

import { Injectable, inject } from '@angular/core';
import { ApiService } from './data/api.service';
import { Observable } from 'rxjs';

/**
 * Interfaz de modelo para tu entidad
 * Define los datos exactamente como los envía el backend
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear un producto (sin id, ni timestamps
 */
export type CreateProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * DTO para actualizar un producto (todos los campos opcionales)
 */
export type UpdateProductRequest = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Respuesta paginada del servidor
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);
  private readonly endpoint = 'products';

  // ============================================================================
  // OPERACIONES BÁSICAS DE LECTURA (GET)
  // ============================================================================

  /**
   * Obtiene todos los productos
   * @returns Observable con array de productos
   */
  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>(this.endpoint);
  }

  /**
   * Obtiene un producto por ID
   * @param id - ID del producto
   * @returns Observable con el producto
   */
  getById(id: string): Observable<Product> {
    return this.api.get<Product>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene productos con paginación y filtros
   * @param page - Número de página (comienza en 1)
   * @param limit - Cantidad de elementos por página
   * @param filters - Filtros adicionales (category, name, etc.)
   * @returns Observable con respuesta paginada
   */
  getFiltered(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, string | number | boolean>
  ): Observable<PaginatedResponse<Product>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return this.api.getWithParams<PaginatedResponse<Product>>(this.endpoint, params);
  }

  /**
   * Busca productos por nombre
   * @param query - Texto a buscar
   * @returns Observable con array de productos encontrados
   */
  search(query: string): Observable<Product[]> {
    return this.api.getWithParams<Product[]>(this.endpoint, { search: query });
  }

  // ============================================================================
  // OPERACIONES DE ESCRITURA (POST, PUT, PATCH, DELETE)
  // ============================================================================

  /**
   * Crea un nuevo producto
   * @param product - Datos del producto a crear
   * @returns Observable con el producto creado (incluye ID asignado)
   */
  create(product: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>(this.endpoint, product);
  }

  /**
   * Actualiza completamente un producto (PUT)
   * Requiere todos los campos
   * @param id - ID del producto
   * @param product - Todos los datos del producto actualizado
   * @returns Observable con el producto actualizado
   */
  update(id: string, product: Product): Observable<Product> {
    return this.api.put<Product>(`${this.endpoint}/${id}`, product);
  }

  /**
   * Actualiza parcialmente un producto (PATCH)
   * Solo los campos proporcionados se actualizan
   * @param id - ID del producto
   * @param partialProduct - Datos parciales a actualizar
   * @returns Observable con el producto actualizado
   */
  patch(id: string, partialProduct: UpdateProductRequest): Observable<Product> {
    return this.api.patch<Product>(`${this.endpoint}/${id}`, partialProduct);
  }

  /**
   * Elimina un producto
   * @param id - ID del producto a eliminar
   * @returns Observable que completa sin datos
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Elimina múltiples productos
   * @param ids - Array de IDs a eliminar
   * @returns Observable que completa sin datos
   */
  deleteMany(ids: string[]): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/bulk-delete`, { ids });
  }

  // ============================================================================
  // OPERACIONES ESPECIALES (ARCHIVOS, ACCIONES PERSONALIZADAS)
  // ============================================================================

  /**
   * Sube una imagen para un producto
   * @param id - ID del producto
   * @param file - Archivo de imagen
   * @returns Observable con la respuesta del servidor
   */
  uploadImage(id: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.postFormData<{ imageUrl: string }>(`${this.endpoint}/${id}/image`, formData);
  }

  /**
   * Descarga un archivo de reporte
   * @param id - ID del producto
   * @returns Observable con Blob del archivo
   * 
   * EJEMPLO DE USO:
   * this.productService.downloadReport(id).subscribe(blob => {
   *   const url = window.URL.createObjectURL(blob);
   *   const a = document.createElement('a');
   *   a.href = url;
   *   a.download = 'reporte.pdf';
   *   a.click();
   * });
   */
  downloadReport(id: string): Observable<Blob> {
    return this.api.getBlob(`${this.endpoint}/${id}/report`);
  }

  /**
   * Acción personalizada: Marcar producto como favorito
   * @param id - ID del producto
   * @returns Observable con el producto actualizado
   */
  markAsFavorite(id: string): Observable<Product> {
    return this.api.post<Product>(`${this.endpoint}/${id}/favorite`, {});
  }

  /**
   * Acción personalizada: Obtener productos relacionados
   * @param id - ID del producto
   * @returns Observable con array de productos relacionados
   */
  getRelated(id: string): Observable<Product[]> {
    return this.api.get<Product[]>(`${this.endpoint}/${id}/related`);
  }

  /**
   * Acción personalizada: Obtener estadísticas
   * @returns Observable con objeto de estadísticas
   */
  getStats(): Observable<{ total: number; published: number; draft: number }> {
    return this.api.get<{ total: number; published: number; draft: number }>(
      `${this.endpoint}/stats`
    );
  }
}

// ============================================================================
// EJEMPLOS DE USO EN COMPONENTES
// ============================================================================

/*
EJEMPLO 1: Listar productos en un componente
--------------------------------------------

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  template: `...`
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private destroy$ = new Subject<void>();

  products: Product[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll()
      .pipe(
        takeUntil(this.destroy$)  // Desuscribirse automáticamente
      )
      .subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos';
          this.loading = false;
          console.error(err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

EJEMPLO 2: Crear producto
---------------------------

createProduct(formData: CreateProductRequest) {
  this.productService.create(formData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (newProduct) => {
        this.products.push(newProduct);
        this.toastService.success('Producto creado');
      },
      error: (err) => {
        this.toastService.error('Error al crear producto');
      }
    });
}

EJEMPLO 3: Actualizar producto
-------------------------------

updateProduct(id: string, updatedData: UpdateProductRequest) {
  this.productService.patch(id, updatedData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (updated) => {
        // Actualizar la lista localmente
        const index = this.products.findIndex(p => p.id === id);
        if (index >= 0) {
          this.products[index] = updated;
        }
      }
    });
}

EJEMPLO 4: Usar Observable directamente en el template (OnPush)
---------------------------------------------------------------

import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product-list',
  template: `
    <div *ngFor="let product of products$ | async">
      {{ product.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  private productService = inject(ProductService);
  products$ = this.productService.getAll();
}

EJEMPLO 5: Subir archivo
------------------------

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
    this.productService.uploadImage(productId, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
        }
      });
  }
}

*/
