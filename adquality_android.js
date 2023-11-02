/*jshint maxerr:1000 browser:true devel:true sub:true eqeqeq:true eqnull:true nonstandard:true */

/** Utility - check if an object is valid */
var isObjValid = function(obj) {
    if ((typeof(obj) != "undefined") && (obj != null)) return true;
    return false;
};

var isFunction = (obj) => {
    return typeof(obj) === 'function'
}

var isString = (obj) => {
    return typeof(obj) === 'string'
}

/** Declare Event Listeners here.*/
class AdQualityEventListner {
    constructor(event) {
        this.event = event;
        this.listeners = [];
    }

    add(func) {
        if(isFunction(func)) {
            this.listeners.push(func);
        } else {
            throw `Event listener ${func} is not a function`;
        }
    }

    remove(func) {
        this.listeners = this.listeners.filter((listener) => {
            return listener !== func;
        });
    }

    removeAll() {
        this.listeners = [];
    }

    broadcast(args) {
        this.listeners.forEach((listener) => {
            try {
                listener.apply({}, args);
            } catch (e) { 
                console.log('broadcast error: ' + e);
            }
        });
    }

    toString() {
        var out = [this.event, ':'];
        this.listeners.forEach((listener) => {
            out.push('|', String(listener), '|');
        });
        return out.join('');
    }
};
class EventListenerBase {
    constructor() {
        this.listeners = [];
    }

    /**
     * Use this method to listen for event state changes.
     * @param {string} evt The event name for registering your listener. Eg "pingSuccessful"
     * @param {function()} The function to be called for this event.
     */
    addEventListener(evt, listener) {
        try {
            if (typeof(evt) == 'string') {
                if (!this.listeners[evt]) {
                    this.listeners[evt] = new AdQualityEventListner();
                }
                this.listeners[evt].add(listener);
            } else {
                throw `Event name ${evt} is invalid`;
            }
        } catch (e) {
            console.log(`addEventListener error: ${e}`);
        }
    };

    /**
     * Use this method to remove your listeners for event state changes.
     * @param {string} evt The event name registered for your listener. Eg "pingSuccessful"
     * @param {function()} The function for this event.
     */
    removeEventListener(evt, listener) {
        try {
            let currentEvent = this.listeners[evt];
            if (isObjValid(listener)) {
                currentEvent.remove(listener);
            } else {
                currentEvent.removeAll();
            }
        } catch (e) {
            console.log(`removeEventListener error: ${e}`);
        }
    };
    /**
     * Use this method to broadcast an event.
     * @param {evt} The event name for which the broadcast will be made.
     */
    broadcastEvent(evt) {
        try {
            var args = new Array(arguments.length);
            for (var i = 1; i < arguments.length; i++) {
                args[i-1] = arguments[i];
            }
            this.listeners[evt]?.broadcast(args);
        } catch (e) {
            console.log(`broadcastEvent ${evt} error: ${e}`);
        }
    };

}//Meson custom AdQualityJS base.js
class MesonAdQualityBase extends EventListenerBase {
    constructor() {
        super();
    }

    jsonToBase64(jsonObject) {
        try {
            // Step 1: Convert JSON object to a JSON string
            var jsonString = JSON.stringify(jsonObject);
    
            // Step 2: Convert JSON string to Base64
            var base64String = btoa(jsonString);
    
            return base64String;
        } catch (error) {
            console.error("Error converting JSON to Base64: " + error);
            return null;
        }
    }
}
//Android Custom Mraid

const CUSTOM_ADQUALITY_BRIDGE_NAMESPACE = "mesonAdQuality";

class MesonAdQuality extends MesonAdQualityBase {
    constructor() {
        super();
    }

    getShowPrivacyButtonState() {
        return this.showPrivacyButtonState;
    };

    firePageReady() {
        try {
            sdkController.firePageReady(CUSTOM_ADQUALITY_BRIDGE_NAMESPACE);
        } catch (err) {
            console.log(`AdQualityJS - firePageReady - ${err}`)
        }
    }

    firePageFailed(error) {
        try {
            sdkController.firePageFailed(CUSTOM_ADQUALITY_BRIDGE_NAMESPACE, error);
        } catch (err) {
            console.log(`AdQualityJS - firePageFailed - ${err}`)
        }
    }

    close() {
        sdkController.close(CUSTOM_ADQUALITY_BRIDGE_NAMESPACE);
    }

    useCustomClose(customClose) {
        if (!isObjValid(customClose)) {
            this.broadcastEvent('error', 'Invalid custom close value', 'useCustomClose');
            return;
        }

        try {
            sdkController.useCustomClose(CUSTOM_ADQUALITY_BRIDGE_NAMESPACE, customClose);
        } catch (err) {
            console.log(`AdQualityJS - useCustomClose - ${err}`)
        }

    }

    reportClickOnPrivacyButton() {
        try {
            sdkController.clickOnPrivacyButton(CUSTOM_ADQUALITY_BRIDGE_NAMESPACE)
        } catch (err) {
            console.log(`AdQualityJS - clickOnPrivacyButton - ${err}`)
        }
    }

    sendAdReport(jsonObject) {
        var data = this.jsonToBase64(jsonObject)
        if (!isObjValid(data)) {
            this.broadcastEvent('error', 'Invalid data value', 'sendAdReport');
            return;
        }

        try {
            sdkController.sendAdReport(data)
        } catch (err) {
            console.log(`AdQualityJS - sendAdReport - ${err}`)
        }
    }

    log(value) {
        console.log(value);
    }

    objectToArray(object) {
        let args = [];
        for (const property in object) {
            args.push(...[property, object[property]]);
        }
        return args;
    }
}

const mesonAdQuality = window.mesonAdQuality = new MesonAdQuality();
