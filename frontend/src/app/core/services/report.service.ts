import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * Formato de reporte
 */
export type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

/**
 * Tipo de reporte
 */
export type ReportType = 'medicines' | 'users' | 'statistics' | 'activity';

/**
 * Metadata del reporte
 */
export interface ReportMetadata {
  id: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  generatedBy: string;
  size: number;
  fileName: string;
}

/**
 * Servicio de reportes
 * Gestiona generación y descarga de reportes con headers personalizados
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);
  private readonly clientVersion = 'web-1.0.0';

  /**
   * Genera y descarga un reporte de medicamentos
   * GET /reports/medicines
   * Headers: X-Report-Format, X-Client-Version
   * @param format Formato del reporte (pdf, csv, xlsx)
   * @param filters Filtros opcionales
   * @returns Observable<Blob>
   */
  generateMedicinesReport(
    format: ReportFormat = 'pdf',
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: 'active' | 'expired' | 'all';
    }
  ): Observable<Blob> {
    const customHeaders = {
      'X-Report-Format': format,
      'X-Client-Version': this.clientVersion,
      'X-Report-Type': 'medicines',
      'X-Request-Id': this.generateRequestId()
    };

    const params: Record<string, string> = {};
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;
    if (filters?.status) params['status'] = filters.status;

    const endpoint = 'reports/medicines';
    const options = {
      headers: this.api.buildHeaders(customHeaders),
      params: this.api.buildParams(params)
    };

    return this.api.getBlob(endpoint, options).pipe(
      tap(() => console.log(`Reporte de medicamentos generado en formato ${format}`)),
      catchError(err => {
        console.error('Error al generar reporte de medicamentos:', err);
        throw err;
      })
    );
  }

  /**
   * Genera un reporte de usuarios
   * GET /reports/users
   * @param format Formato del reporte
   * @param includeInactive Incluir usuarios inactivos
   * @returns Observable<Blob>
   */
  generateUsersReport(
    format: ReportFormat = 'csv',
    includeInactive: boolean = false
  ): Observable<Blob> {
    const customHeaders = {
      'X-Report-Format': format,
      'X-Client-Version': this.clientVersion,
      'X-Report-Type': 'users',
      'X-Request-Id': this.generateRequestId()
    };

    const params = {
      includeInactive: String(includeInactive)
    };

    const endpoint = 'reports/users';
    const options = {
      headers: this.api.buildHeaders(customHeaders),
      params: this.api.buildParams(params)
    };

    return this.api.getBlob(endpoint, options).pipe(
      tap(() => console.log(`Reporte de usuarios generado en formato ${format}`)),
      catchError(err => {
        console.error('Error al generar reporte de usuarios:', err);
        throw err;
      })
    );
  }

  /**
   * Obtiene metadata de un reporte sin descargarlo
   * HEAD /reports/:reportId
   * @param reportId ID del reporte
   * @returns Observable<ReportMetadata>
   */
  getReportMetadata(reportId: string): Observable<ReportMetadata> {
    const customHeaders = {
      'X-Client-Version': this.clientVersion,
      'X-Request-Id': this.generateRequestId()
    };

    return this.api.getWithHeaders<ReportMetadata>(
      `reports/${reportId}/metadata`,
      customHeaders
    ).pipe(
      catchError(err => {
        console.error('Error al obtener metadata del reporte:', err);
        throw err;
      })
    );
  }

  /**
   * Descarga un reporte previamente generado
   * GET /reports/:reportId/download
   * @param reportId ID del reporte
   * @returns Observable<Blob>
   */
  downloadReport(reportId: string): Observable<Blob> {
    const customHeaders = {
      'X-Client-Version': this.clientVersion,
      'X-Request-Id': this.generateRequestId()
    };

    const endpoint = `reports/${reportId}/download`;
    const options = {
      headers: this.api.buildHeaders(customHeaders)
    };

    return this.api.getBlob(endpoint, options).pipe(
      tap(() => console.log(`Descargando reporte ${reportId}`)),
      catchError(err => {
        console.error('Error al descargar reporte:', err);
        throw err;
      })
    );
  }

  /**
   * Exporta estadísticas en formato JSON
   * GET /reports/statistics
   * @param period Período de estadísticas
   * @returns Observable<any>
   */
  exportStatistics(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any> {
    const customHeaders = {
      'X-Report-Format': 'json',
      'X-Client-Version': this.clientVersion,
      'X-Report-Type': 'statistics',
      'X-Request-Id': this.generateRequestId(),
      'X-Statistics-Period': period
    };

    return this.api.getWithHeaders<any>('reports/statistics', customHeaders).pipe(
      tap(data => console.log(`Estadísticas ${period} exportadas:`, data)),
      catchError(err => {
        console.error('Error al exportar estadísticas:', err);
        throw err;
      })
    );
  }

  /**
   * Guarda el archivo blob descargado
   * Crea un enlace temporal y lo clickea para descargar
   * @param blob Contenido del archivo
   * @param fileName Nombre del archivo
   */
  saveBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Limpiar URL temporal después de la descarga
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Genera un ID único para la petición
   * Útil para tracking y debugging
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera nombre de archivo según formato y tipo
   * @param type Tipo de reporte
   * @param format Formato del archivo
   * @returns Nombre del archivo
   */
  generateFileName(type: ReportType, format: ReportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${type}-report-${timestamp}.${format}`;
  }
}
