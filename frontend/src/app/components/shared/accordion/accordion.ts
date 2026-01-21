import { Component, Input, HostListener, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.html',
  styleUrls: ['./accordion.scss']
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() allowMultiple = false;
  @ViewChildren('accordionButton') buttons!: QueryList<ElementRef<HTMLButtonElement>>;

  expandedItems: Set<string> = new Set();
  private currentFocusIndex = 0;

  toggleItem(itemId: string) {
    const item = this.items.find(i => i.id === itemId);
    if (item && !item.disabled) {
      if (!this.allowMultiple) {
        this.expandedItems.clear();
      }

      if (this.expandedItems.has(itemId)) {
        this.expandedItems.delete(itemId);
      } else {
        this.expandedItems.add(itemId);
      }
    }
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  /**
   * TrackBy para optimizar *ngFor de items del accordion
   */
  trackById(index: number, item: AccordionItem): string {
    return item.id;
  }

  /**
   * Maneja la navegación por teclado entre items del accordion
   */
  onKeyDown(event: KeyboardEvent, index: number) {
    const buttonsArray = this.buttons.toArray();
    const enabledButtons = buttonsArray.filter((btn, i) => !this.items[i].disabled);
    const enabledIndex = enabledButtons.findIndex(btn => btn.nativeElement === event.target);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (enabledIndex + 1) % enabledButtons.length;
        enabledButtons[nextIndex]?.nativeElement.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = enabledIndex === 0 ? enabledButtons.length - 1 : enabledIndex - 1;
        enabledButtons[prevIndex]?.nativeElement.focus();
        break;

      case 'Home':
        event.preventDefault();
        enabledButtons[0]?.nativeElement.focus();
        break;

      case 'End':
        event.preventDefault();
        enabledButtons[enabledButtons.length - 1]?.nativeElement.focus();
        break;
    }
  }
}

