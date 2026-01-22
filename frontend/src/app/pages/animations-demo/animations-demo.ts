import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-animations-demo',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './animations-demo.html',
  styleUrls: ['./animations-demo.scss'],
})
export class AnimationsDemoComponent {
  // Control de spinners
  showSpinner = false;
  spinnerVariant: 'small' | 'medium' | 'large' = 'medium';
  spinnerMessage = 'Cargando...';

  // Estados de micro-interacciones
  feedbackState: null | 'success' | 'error' | 'warning' = null;
  animatedItems = [
    { id: 1, label: 'Fade In', class: 'animate-fade-in', visible: false },
    { id: 2, label: 'Slide Up', class: 'animate-slide-in-up', visible: false },
    { id: 3, label: 'Bounce In', class: 'animate-bounce-in', visible: false },
    { id: 4, label: 'Scale In', class: 'animate-scale-in', visible: false },
    { id: 5, label: 'Slide Right', class: 'animate-slide-in-right', visible: false },
  ];

  toggleSpinner() {
    this.showSpinner = !this.showSpinner;
  }

  changeSpinnerVariant(size: 'small' | 'medium' | 'large') {
    this.spinnerVariant = size;
  }

  showFeedback(type: 'success' | 'error' | 'warning') {
    this.feedbackState = type;
    setTimeout(() => {
      this.feedbackState = null;
    }, 3000);
  }

  getFeedbackClass(): string {
    return this.feedbackState ? `feedback-${this.feedbackState} feedback-message` : '';
  }

  triggerAnimation(item: any) {
    item.visible = true;
    setTimeout(() => {
      item.visible = false;
    }, 1000);
  }

  triggerAllAnimations() {
    this.animatedItems.forEach((item, index) => {
      setTimeout(() => {
        item.visible = true;
        setTimeout(() => {
          item.visible = false;
        }, 800);
      }, index * 150);
    });
  }

  triggerBounce() {
    const element = document.getElementById('bounce-demo');
    if (element) {
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = 'bounce 0.6s';
      }, 10);
    }
  }

  triggerShake() {
    const element = document.getElementById('shake-demo');
    if (element) {
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = 'shake 0.4s';
      }, 10);
    }
  }
}
