// Polyfills para compatibilidad cross-browser
// Este archivo se incluirá en el build si se referencia desde angular.json

// Zone JS is required by Angular
import 'zone.js';

// Promise.allSettled polyfill (Safari antiguas)
if (!Promise.allSettled) {
  (Promise as any).allSettled = function (promises: any[]) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p)
          .then((value) => ({ status: 'fulfilled', value }))
          .catch((reason) => ({ status: 'rejected', reason }))
      )
    );
  } as any;
}

// Element.closest polyfill
if (typeof Element !== 'undefined' && !Element.prototype.closest) {
  Element.prototype.closest = function (selectors: string) {
    let el: any = this;
    while (el) {
      if (el.matches && el.matches(selectors)) return el;
      el = el.parentElement;
    }
    return null;
  };
}

// matchMedia minimal fallback
if (typeof window !== 'undefined' && !window.matchMedia) {
  (window as any).matchMedia = function () {
    return { matches: false, addListener() {}, removeListener() {} };
  };
}

// Opcional: para proyectos que necesiten fetch en navegadores muy antiguos,
// agregar `import 'whatwg-fetch';` y añadir la dependencia.
