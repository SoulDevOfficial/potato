// ==UserScript==
// @name         potato.js (Optimized)
// @namespace    potato.js
// @version      2.4
// @description  Turns every image on every page into this potato without melting your CPU.
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const POTATO_SRC = "https://i.imgur.com/5dJphbI.png"; // if for SOME REASON you don't want potatos, you can change this to whatever image you want
  const style = document.createElement('style');
  style.textContent = `
    [style*="background-image"], [style*="background"] {
      background-image: url("${POTATO_SRC}") !important;
    }
    picture source, picture img {
      content: url("${POTATO_SRC}") !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  function potatoizeImg(img) {
    if (img.src === POTATO_SRC && (!img.srcset || img.srcset === "")) return;

    if (img.srcset) img.srcset = "";
    if (img.getAttribute('data-src')) img.setAttribute('data-src', POTATO_SRC);
    if (img.getAttribute('href') && img.tagName.toLowerCase() === 'image') img.setAttribute('href', POTATO_SRC);
    img.src = POTATO_SRC;
  }

  function potatoizeBackground(el) {
    if (el.style && el.style.backgroundImage === `url("${POTATO_SRC}")`) return;
    if (el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none') {
      el.style.backgroundImage = `url("${POTATO_SRC}")`;
    }
  }

  function potatoizeAll(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img, image').forEach(potatoizeImg);
    root.querySelectorAll('[style*="background"]').forEach(potatoizeBackground);
  }

  function init() {
    potatoizeAll(document.documentElement);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const observer = new MutationObserver(mutations => {
    // Temporarily pause observer while changing elements to prevent loops
    observer.disconnect();

    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG' || node.tagName === 'IMAGE') {
            potatoizeImg(node);
          } else {
            potatoizeAll(node);
          }
        });
      } else if (m.type === 'attributes') {
        if (m.target.tagName === 'IMG' || m.target.tagName === 'IMAGE') {
          potatoizeImg(m.target);
        } else if (m.attributeName === 'style') {
          potatoizeBackground(m.target);
        }
      }
    }

    startObserving();
  });

  function startObserving() {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'style', 'data-src', 'href']
    });
  }

  startObserving();
})();
