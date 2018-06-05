!function(modules) {
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: !1
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.loaded = !0, module.exports;
    }
    var installedModules = {};
    return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
    __webpack_require__.p = "", __webpack_require__(0);
}([ function(module, exports) {
    "use strict";
    function createPanelIfReactLoaded() {
        panelCreated || chrome.devtools.inspectedWindow.eval("!!(\n    (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && Object.keys(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).length) || window.React\n  )", function(pageHasReact, err) {
            pageHasReact && !panelCreated && (clearInterval(loadCheckInterval), panelCreated = !0, 
            chrome.devtools.panels.create("React", "", "panel.html", function(panel) {
                var reactPanel = null;
                panel.onShown.addListener(function(window) {
                    window.panel.getNewSelection(), reactPanel = window.panel, reactPanel.resumeTransfer();
                }), panel.onHidden.addListener(function() {
                    reactPanel && (reactPanel.hideHighlight(), reactPanel.pauseTransfer());
                });
            }));
        });
    }
    var panelCreated = !1;
    chrome.devtools.network.onNavigated.addListener(function() {
        createPanelIfReactLoaded();
    });
    var loadCheckInterval = setInterval(function() {
        createPanelIfReactLoaded();
    }, 1e3);
    createPanelIfReactLoaded();
} ]);