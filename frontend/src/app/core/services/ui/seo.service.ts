import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  private defaultMeta: PageMeta = {
    title: 'ORGMedi - Gestor de Medicamentos',
    description: 'Gestiona tus medicamentos de forma fácil, segura y personalizada. Sincroniza horarios, recibe recordatorios y organiza tu salud.',
    keywords: 'medicamentos, salud, farmacia, horarios medicinas, gestor medicamentos',
    image: 'https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/Icono App.svg',
    url: 'https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/'
  };

  /**
   * Actualiza los meta tags de la página
   */
  updateMeta(meta: Partial<PageMeta> = {}): void {
    const pageMeta = { ...this.defaultMeta, ...meta };

    // Título de la pestaña
    this.titleService.setTitle(pageMeta.title);

    // Meta tags
    this.updateMetaTag('description', pageMeta.description);
    this.updateMetaTag('keywords', pageMeta.keywords || this.defaultMeta.keywords || '');
    this.updateMetaTag('og:title', pageMeta.title);
    this.updateMetaTag('og:description', pageMeta.description);
    this.updateMetaTag('og:image', pageMeta.image || this.defaultMeta.image || '');
    this.updateMetaTag('og:url', pageMeta.url || this.defaultMeta.url || '');
    this.updateMetaTag('twitter:title', pageMeta.title);
    this.updateMetaTag('twitter:description', pageMeta.description);
    this.updateMetaTag('twitter:image', pageMeta.image || this.defaultMeta.image || '');
  }

  /**
   * Actualiza o crea un meta tag específico
   */
  private updateMetaTag(name: string, content: string): void {
    const existingTag = this.metaService.getTag(`name='${name}'`) || 
                        this.metaService.getTag(`property='${name}'`);

    if (existingTag) {
      this.metaService.updateTag({ name, content });
    } else {
      const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
      if (isProperty) {
        this.metaService.addTag({ property: name, content });
      } else {
        this.metaService.addTag({ name, content });
      }
    }
  }

  /**
   * Reset a valores por defecto
   */
  resetMeta(): void {
    this.updateMeta();
  }
}
