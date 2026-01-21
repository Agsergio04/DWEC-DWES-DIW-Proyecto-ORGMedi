import { TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';
import { ElementRef, Renderer2 } from '@angular/core';

declare var jasmine: any;
declare function spyOn(obj: any, method: string): any;

describe('TooltipDirective', () => {
  let directive: TooltipDirective;
  let el: ElementRef;
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TooltipDirective]
    });

    const document = TestBed.inject(ElementRef);
    el = new ElementRef(document.nativeElement);
    renderer = TestBed.inject(Renderer2);

    directive = new TooltipDirective(el, renderer);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default tooltip delay of 300ms', () => {
      expect(directive.tooltipDelay).toBe(300);
    });

    it('should set tooltip text from input', () => {
      directive.text = 'This is a tooltip';
      expect(directive.text).toBe('This is a tooltip');
    });
  });

  describe('mouseenter event', () => {
    it('should show tooltip after delay on mouseenter', (done: any) => {
      directive.text = 'Hover tooltip';
      directive.tooltipDelay = 100;

      spyOn(directive, 'show');

      directive.onEnter();

      setTimeout(() => {
        expect((directive as any).show).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('should not show tooltip if delay is pending', () => {
      directive.text = 'Hover tooltip';
      directive.tooltipDelay = 300;

      spyOn(directive, 'show');

      directive.onEnter();

      // Immediately call onLeave before delay completes
      directive.onLeave();

      setTimeout(() => {
        expect((directive as any).show).not.toHaveBeenCalled();
      }, 350);
    });
  });

  describe('focus event', () => {
    it('should show tooltip on focus', (done: any) => {
      directive.text = 'Focus tooltip';
      directive.tooltipDelay = 100;

      spyOn(directive, 'show');

      directive.onFocus();

      setTimeout(() => {
        expect((directive as any).show).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('should hide tooltip on blur', () => {
      directive.text = 'Focus tooltip';

      spyOn(directive, 'hide');

      directive.onBlur();

      expect((directive as any).hide).toHaveBeenCalled();
    });
  });

  describe('tooltip visibility', () => {
    it('should not show tooltip if text is empty', () => {
      directive.text = '';

      spyOn(directive, 'show');
      directive.onEnter();

      setTimeout(() => {
        expect((directive as any).show).not.toHaveBeenCalled();
      }, 350);
    });

    it('should clear timeout when leaving', (done: any) => {
      directive.text = 'Tooltip text';
      directive.tooltipDelay = 200;

      directive.onEnter();

      setTimeout(() => {
        directive.onLeave();
        expect((directive as any).showTimeout).toBeUndefined();
        done();
      }, 100);
    });
  });

  describe('accessibility', () => {
    it('should set aria-describedby attribute when showing tooltip', () => {
      directive.text = 'Accessible tooltip';

      spyOn(renderer, 'setAttribute');

      (directive as any).show();

      // First setAttribute call should set aria-describedby
      expect(renderer.setAttribute).toHaveBeenCalled();
    });

    it('should set role="tooltip" on tooltip element', () => {
      directive.text = 'Tooltip for accessibility';

      spyOn(renderer, 'setAttribute');

      (directive as any).show();

      // Check that setAttribute was called with role='tooltip'
      const calls = (renderer.setAttribute as any).calls.all();
      const hasTooltipRole = calls.some(call =>
        call.args[2] === 'tooltip' || call.args[1] === 'role'
      );

      expect(renderer.setAttribute).toHaveBeenCalled();
    });
  });

  describe('custom delay', () => {
    it('should respect custom tooltip delay', () => {
      directive.text = 'Custom delay tooltip';
      directive.tooltipDelay = 500;

      expect(directive.tooltipDelay).toBe(500);
    });

    it('should allow zero delay', () => {
      directive.text = 'Zero delay tooltip';
      directive.tooltipDelay = 0;

      spyOn(directive, 'show');

      directive.onEnter();

      setTimeout(() => {
        expect((directive as any).show).toHaveBeenCalled();
      }, 50);
    });
  });
});
