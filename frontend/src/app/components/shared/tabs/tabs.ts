import { Component, Input, Output, EventEmitter } from '@angular/core';
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
}

