import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss']
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId: string = '';
  @Output() tabChange = new EventEmitter<string>();

  @ViewChildren('tabButton') tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  selectTab(tabId: string) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTabId = tabId;
      this.tabChange.emit(tabId);
    }
  }

  isActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  /**
   * TrackBy para optimizar *ngFor de tabs
   */
  trackById(index: number, tab: Tab): string {
    return tab.id;
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const buttonsArray = this.tabButtons.toArray();
    const enabledTabs = this.tabs
      .map((tab, i) => ({ tab, index: i }))
      .filter(item => !item.tab.disabled);
    
    const currentEnabledIndex = enabledTabs.findIndex(item => item.index === index);
    if (currentEnabledIndex === -1) return;

    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = enabledTabs[(currentEnabledIndex + 1) % enabledTabs.length].index;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = enabledTabs[(currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length].index;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = enabledTabs[0].index;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabledTabs[enabledTabs.length - 1].index;
        break;
      default:
        return;
    }

    if (targetIndex !== -1) {
      buttonsArray[targetIndex].nativeElement.focus();
      this.selectTab(this.tabs[targetIndex].id);
    }
  }
}

