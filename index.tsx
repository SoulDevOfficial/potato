/*
 * Ven-Potato
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import definePlugin from "@utils/types";

const POTATO_SRC = "https://i.imgur.com/5dJphbI.png"; // if for SOME REASON you don't want potatos, you can change this to whatever image you want
let observer: MutationObserver | null = null;
let style: HTMLStyleElement | null = null;

function potatoizeImg(img: HTMLImageElement | SVGImageElement) {
    if (img instanceof HTMLImageElement) {
        if (img.src === POTATO_SRC && (!img.srcset || img.srcset === "")) return;
        if (img.srcset) img.srcset = "";
        if (img.getAttribute('data-src')) img.setAttribute('data-src', POTATO_SRC);
        img.src = POTATO_SRC;
    } else if (img.tagName.toLowerCase() === 'image') {
        if (img.getAttribute('href') === POTATO_SRC) return;
        img.setAttribute('href', POTATO_SRC);
    }
}

function potatoizeBackground(el: HTMLElement) {
    if (el.style && el.style.backgroundImage === `url("${POTATO_SRC}")`) return;
    if (el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none') {
        el.style.backgroundImage = `url("${POTATO_SRC}")`;
    }
}

function potatoizeAll(root: HTMLElement | Document) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll<HTMLImageElement | SVGImageElement>('img, image').forEach(potatoizeImg);
    root.querySelectorAll<HTMLElement>('[style*="background"]').forEach(potatoizeBackground);
}

function startObserving() {
    if (!observer) return;
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'srcset', 'style', 'data-src', 'href']
    });
}

export default definePlugin({
    name: "Potatoizer",
    description: "Turns every image on every page into this potato without melting your CPU.",
    authors: [{ name: "potato.js", id: 0n }],
    settingsAboutComponent: () => (
        <Paragraph className={Margins.bottom16}>
            Turns every image on every page into this potato without melting your CPU.
        </Paragraph>
    ),

    start() {
        style = document.createElement('style');
        style.textContent = `
            [style*="background-image"], [style*="background"] {
                background-image: url("${POTATO_SRC}") !important;
            }
            picture source, picture img {
                content: url("${POTATO_SRC}") !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);

        potatoizeAll(document.documentElement);

        observer = new MutationObserver(mutations => {
            // Temporarily pause observer while changing elements to prevent loops
            observer!.disconnect();

            for (const m of mutations) {
                if (m.type === 'childList') {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return;
                        const el = node as HTMLElement;
                        if (el.tagName === 'IMG' || el.tagName === 'IMAGE') {
                            potatoizeImg(el as HTMLImageElement | SVGImageElement);
                        } else {
                            potatoizeAll(el);
                        }
                    });
                } else if (m.type === 'attributes') {
                    const target = m.target as HTMLElement;
                    if (target.tagName === 'IMG' || target.tagName === 'IMAGE') {
                        potatoizeImg(target as HTMLImageElement | SVGImageElement);
                    } else if (m.attributeName === 'style') {
                        potatoizeBackground(target);
                    }
                }
            }

            startObserving();
        });

        startObserving();
    },

    stop() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (style && style.parentNode) {
            style.parentNode.removeChild(style);
            style = null;
        }
    }
});
