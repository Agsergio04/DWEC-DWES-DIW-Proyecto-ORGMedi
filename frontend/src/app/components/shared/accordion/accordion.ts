import { Component, Input } from '@angular/core';
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

  expandedItems: Set<string> = new Set();

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
}

