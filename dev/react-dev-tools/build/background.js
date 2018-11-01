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
    function isNumeric(str) {
        return +str + "" === str;
    }
    function installContentScript(tabId) {
        chrome.tabs.executeScript(tabId, {
            file: "/build/contentScript.js"
        }, function() {});
    }
    function doublePipe(one, two) {
        function lOne(message) {
            two.postMessage(message);
        }
        function lTwo(message) {
            one.postMessage(message);
        }
        function shutdown() {
            one.onMessage.removeListener(lOne), two.onMessage.removeListener(lTwo), one.disconnect(), 
            two.disconnect();
        }
        one.onMessage.addListener(lOne), two.onMessage.addListener(lTwo), one.onDisconnect.addListener(shutdown), 
        two.onDisconnect.addListener(shutdown);
    }
    function setIconAndPopup(reactBuildType, tabId) {
        chrome.browserAction.setIcon({
            tabId: tabId,
            path: {
                "16": "icons/16-" + reactBuildType + ".png",
                "32": "icons/32-" + reactBuildType + ".png",
                "48": "icons/48-" + reactBuildType + ".png",
                "128": "icons/128-" + reactBuildType + ".png"
            }
        }), chrome.browserAction.setPopup({
            tabId: tabId,
            popup: "popups/" + reactBuildType + ".html"
        });
    }
    var ports = {}, IS_FIREFOX = navigator.userAgent.indexOf("Firefox") >= 0;
    chrome.runtime.onConnect.addListener(function(port) {
        var tab = null, name = null;
        isNumeric(port.name) ? (tab = port.name, name = "devtools", installContentScript(+port.name)) : (tab = port.sender.tab.id, 
        name = "content-script"), ports[tab] || (ports[tab] = {
            devtools: null,
            "content-script": null
        }), ports[tab][name] = port, ports[tab].devtools && ports[tab]["content-script"] && doublePipe(ports[tab].devtools, ports[tab]["content-script"]);
    }), IS_FIREFOX && chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        tab.active && "loading" === changeInfo.status && setIconAndPopup("disabled", tabId);
    }), chrome.runtime.onMessage.addListener(function(req, sender) {
        if (req.hasDetectedReact && sender.tab) {
            var reactBuildType = req.reactBuildType;
            sender.url.indexOf("facebook.github.io/react") !== -1 && (reactBuildType = "production"), 
            setIconAndPopup(reactBuildType, sender.tab.id);
        }
    });
} ]);