"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Natively {
    isNativeApp() {
        return this.isIOSApp() || this.isAndroidApp();
    }
    isIOSApp() {
        return window.navigator.userAgent.includes("Natively/iOS");
    }
    isAndroidApp() {
        return window.navigator.userAgent.includes("Natively/Android");
    }
    setDebug(debug) {
        this.isDebug = debug;
    }
    sendMessage(message) {
        window.webkit.messageHandlers.messageHandler.postMessage(message);
    }
    receiveMessage(event) {
        // Check event.origin if needed for security
        console.log("Message received: ", event.data);
        // You can send a message back to the iOS app, if needed
    }
    constructor() {
        this.isDebug = false;
        this.injected = false;
        this.appVersion = 0;
        this.minAppVersion = 0;
        this.actions = [];
        window.addEventListener("message", this.receiveMessage, false);
    }
    notify(minAppVersion, appVersion) {
        var _a;
        this.minAppVersion = minAppVersion;
        this.appVersion = appVersion;
        this.injected = true;
        if (this.isDebug) {
            console.log(`Natively: Execute all actions ${this.actions.map((action) => action.name).join(",")} notified`);
        }
        while (this.actions.length > 0) {
            (_a = this.actions.shift()) === null || _a === void 0 ? void 0 : _a.run();
        }
    }
    addAction(action) {
        if (this.injected) {
            action.run();
        }
        else {
            if (this.isDebug) {
                console.log(`Natively: Action ${action.name} added to queue`);
            }
            this.actions.push(action);
        }
    }
    trigger(responseId, minVersion, callback, method, body) {
        if (this.isDebug) {
            console.log(`Natively: Trigger ${responseId} ${minVersion} ${method} ${JSON.stringify(body)}`);
        }
        if (!this.injected) {
            this.addAction({
                name: method,
                run: () => {
                    this.trigger(responseId, minVersion, callback, method, body);
                }
            });
            return;
        }
        if (minVersion > this.appVersion) {
            if (this.isDebug) {
                console.log(`Natively: Trigger ${responseId} ${minVersion} ${method} ${JSON.stringify(body)} failed, app version too low`);
            }
            alert("To use this action, please update your app to the latest version");
            return;
        }
        if (callback) {
            let fullMethodName = method + "_" + "response";
            if (responseId) {
                fullMethodName += "_" + responseId;
            }
        }
        return;
    }
}
exports.default = new Natively();
