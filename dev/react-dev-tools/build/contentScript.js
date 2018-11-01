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
    function handleMessageFromDevtools(message) {
        window.postMessage({
            source: "react-devtools-content-script",
            payload: message
        }, "*");
    }
    function handleMessageFromPage(evt) {
        evt.source === window && evt.data && "react-devtools-bridge" === evt.data.source && port.postMessage(evt.data.payload);
    }
    function handleDisconnect() {
        window.removeEventListener("message", handleMessageFromPage), window.postMessage({
            source: "react-devtools-content-script",
            payload: {
                type: "event",
                evt: "shutdown"
            }
        }, "*");
    }
    var port = chrome.runtime.connect({
        name: "content-script"
    });
    port.onMessage.addListener(handleMessageFromDevtools), port.onDisconnect.addListener(handleDisconnect), 
    window.addEventListener("message", handleMessageFromPage), window.postMessage({
        source: "react-devtools-content-script",
        hello: !0
    }, "*");
} ]);