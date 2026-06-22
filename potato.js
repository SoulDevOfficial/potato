// ==UserScript==
// @name         potato.js (Optimized)
// @namespace    potato.js
// @version      2.0
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
    * {
      background-image: url("${POTATO_SRC}") !important;
    }
    picture source, picture img {
      content: url("${POTATO_SRC}") !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  function potatoizeImg(img) {
    if (img.dataset && img.dataset.potatoized === "1") return;
    img.dataset.potatoized = "1";
    if (img.srcset) img.srcset = "";
    img.src = POTATO_SRC;
  }

  function potatoizeAll(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img').forEach(potatoizeImg);
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
          if (node.tagName === 'IMG') {
            potatoizeImg(node);
          } else {
            potatoizeAll(node);
          }
        });
      } else if (m.type === 'attributes' && m.target.tagName === 'IMG') {
        potatoizeImg(m.target);
      }
    }

    startObserving();
  });

  function startObserving() {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset']
    });
  }

  startObserving();
})();
