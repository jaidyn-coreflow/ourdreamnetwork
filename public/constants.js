const CDN_HOST = 'https://cdn.ourdream.pics/';
window.CDN_LANDING_PAGES = `${CDN_HOST}landing-pages/`;
window.CDN_CREATE_VIDEOS = `${CDN_HOST}create-videos/`;
// back-compat alias — several landers reference window.CDN directly.
window.CDN = window.CDN_LANDING_PAGES;

// Resolved from this script's own src, so <img data-logo> works at any lander depth.
const LOGO_FILE = 'assets/OurDreamLogo.svg';
const _sc =
  document.currentScript ||
  (() => {
    const s = document.querySelectorAll('script[src$="constants.js"]');
    return s[s.length - 1];
  })();
window.LOGO =
  (_sc ? _sc.getAttribute('src').replace(/constants\.js$/, '') : '') +
  LOGO_FILE;

window.cdnVid = (file) => window.CDN_LANDING_PAGES + file;
window.cdnCreateVid = (file) => window.CDN_CREATE_VIDEOS + file;
window.cdnAsset = (file) => CDN_HOST + file;

(() => {
  function setVidSrc(el, url) {
    el.setAttribute('src', url);
    const v = el.tagName === 'VIDEO' ? el : el.closest('video');
    if (v?.load) {
      try {
        v.load();
      } catch (e) {}
    }
  }
  function apply() {
    document
      .querySelectorAll('[data-vid]')
      .forEach((el) =>
        setVidSrc(el, window.CDN_LANDING_PAGES + el.getAttribute('data-vid')),
      );
    document
      .querySelectorAll('[data-cvid]')
      .forEach((el) =>
        setVidSrc(el, window.cdnCreateVid(el.getAttribute('data-cvid'))),
      );
    document.querySelectorAll('[data-logo]').forEach((el) => {
      el.setAttribute('src', window.LOGO);
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
