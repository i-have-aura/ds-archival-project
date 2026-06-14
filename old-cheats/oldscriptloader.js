// ==UserScript==
// @name         deadshot canvas
// @namespace    http://tampermonkey.net/
// @description  ds
// @version      1.0.3
// @author       me
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deadshot.io
// @match        *://deadshot.io/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      localhost
// @run-at       document-start
// @license MIT
// @downloadURL none
// ==/UserScript==

(() => {
    'use strict';
    console.log("hi");
    const TARGET_METHOD = '__wbg_eval_335a7ff6cdb2b16d';
    const CUSTOM_SCRIPT_URL = 'http://localhost:8001/2.js';

    let customCode = GM_getValue('cached_code', null);
    let isFirstTime = !customCode;

    const fetchAndCacheCode = () => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `${CUSTOM_SCRIPT_URL}?t=${Date.now()}`,
            onload: (res) => {
                if (res.status === 200 && res.responseText.length > 1000) {
                    const newCode = res.responseText;
                    GM_setValue('cached_code', newCode);
                    if (isFirstTime) {
                        location.reload();
                    }
                    customCode = newCode;
                }
            },
            onerror: (err) => console.error('err fetch:', err)
        });
    };

    fetchAndCacheCode();

    const patchImports = (importObject) => {
        for (const ns in importObject) {
            const mod = importObject[ns];
            if (mod?.[TARGET_METHOD]) {
                const original = mod[TARGET_METHOD];
                mod[TARGET_METHOD] = (...args) => {
                    if (customCode) {
                        try {
                            (0, eval)(customCode);
                            return;
                        } catch (e) {
                            console.error('err eval:', e);
                        }
                    }
                    return original.apply(this, args);
                };
            }
        }
    };

    const _origInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async (buffer, imports) => {
        if (imports) patchImports(imports);
        return _origInstantiate.call(WebAssembly, buffer, imports);
    };

    const _origStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async (source, imports) => {
        if (imports) patchImports(imports);
        return _origStreaming.call(WebAssembly, source, imports);
    };
})();