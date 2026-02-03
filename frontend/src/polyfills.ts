// Polyfills para compatibilidad cross-browser
// Este archivo se incluirá en el build si se referencia desde angular.json

// Zone JS is required by Angular
import 'zone.js';

// Promise.allSettled polyfill (Safari antiguas)
if (!Promise.allSettled) {
  Promise.allSettled = function (promises: PromiseLike<any>[]) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p)
          .then((value) => ({ status: 'fulfilled' as const, value }))
          .catch((reason) => ({ status: 'rejected' as const, reason }))
      )
    );
  };
}

// Element.closest polyfill
if (typeof Element !== 'undefined' && !Element.prototype.closest) {
  Element.prototype.closest = function (selectors: string) {
    let el: Element | null = this as Element;
    while (el) {
      if (el.matches && el.matches(selectors)) return el;
      el = el.parentElement;
    }
    return null;
  };
}

// matchMedia minimal fallback
if (typeof window !== 'undefined' && !window.matchMedia) {
  const fallbackMediaQueryList = {
    matches: false,
    media: '',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; }
  } as unknown as MediaQueryList;
  
  (window as unknown as { matchMedia: (query: string) => MediaQueryList }).matchMedia = function () {
    return fallbackMediaQueryList;
  };
}

// Opcional: para proyectos que necesiten fetch en navegadores muy antiguos,
// agregar `import 'whatwg-fetch';` y añadir la dependencia.
