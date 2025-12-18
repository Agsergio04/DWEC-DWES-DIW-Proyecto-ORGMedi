import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab } from './tab';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss']
})
export class Tabs implements AfterContentInit {
  @ContentChildren(Tab) tabs!: QueryList<Tab>;
  @Input() activeIndex = 0;

  ngAfterContentInit() {
    this.updateActiveTabs();
  }

  selectTab(index: number) {
    this.activeIndex = index;
    this.updateActiveTabs();
  }

  private updateActiveTabs() {
    const arr = this.tabs.toArray();
    arr.forEach((t, i) => t.active = i === this.activeIndex);
  }
}

