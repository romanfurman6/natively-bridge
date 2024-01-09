
class Natively {

    isDebug: boolean = false;
    private injected: boolean = false;
    private appVersion: number = 0;
    private minAppVersion: number = 0;
    private actions: Action[] = [];

    isNativeApp() {
        return this.isIOSApp() || this.isAndroidApp();
    }

    isIOSApp() {
        return window.navigator.userAgent.includes("Natively/iOS");
    }

    isAndroidApp() {
        return window.navigator.userAgent.includes("Natively/Android");
    }

    setDebug(debug: boolean) {
        this.isDebug = debug;
    }

    sendMessage(message: string) {
        window.webkit.messageHandlers.messageHandler.postMessage(message);
    }

    receiveMessage(event: any) {
        // Check event.origin if needed for security
        console.log("Message received: ", event.data);
        // You can send a message back to the iOS app, if needed
    }

    constructor() {
        window.addEventListener("message", this.receiveMessage, false);
    }

    private notify(minAppVersion: number, appVersion: number) {
        this.minAppVersion = minAppVersion;
        this.appVersion = appVersion;
        this.injected = true;
        if (this.isDebug) { console.log(`Natively: Execute all actions ${this.actions.map((action) => action.name).join(",")} notified`); }
        while (this.actions.length > 0) {
            this.actions.shift()?.run();
        }
    }

    private addAction(action: Action) {
        if (this.injected) {
            action.run();
        } else {
            if (this.isDebug) { console.log(`Natively: Action ${action.name} added to queue`); }
            this.actions.push(action);
        }
    }

    private trigger(responseId: string | undefined, minVersion: number, callback: (() => void) | undefined, method: string, body: any) {
        if (this.isDebug) { console.log(`Natively: Trigger ${responseId} ${minVersion} ${method} ${JSON.stringify(body)}`); }
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
            if (this.isDebug) { console.log(`Natively: Trigger ${responseId} ${minVersion} ${method} ${JSON.stringify(body)} failed, app version too low`); }
            alert("To use this action, please update your app to the latest version");
            return;
        }
        if (callback) {
            let fullMethodName: string = method + "_" + "response";
            if (responseId) { fullMethodName += "_" + responseId; }
        }
        return
    }


}

type Action = {
    run: () => void;
    name: string;
}

declare global {
    interface Window {
      webkit: any;
    }
  }

export default new Natively();