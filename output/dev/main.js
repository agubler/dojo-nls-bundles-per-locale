(window["dojoWebpackJsonpnls_bundles_per_locale"] = window["dojoWebpackJsonpnls_bundles_per_locale"] || []).push([["main"],{

/***/ "./node_modules/@dojo/framework/core/Destroyable.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/framework/core/Destroyable.mjs ***!
  \***********************************************************/
/*! exports provided: Destroyable, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Destroyable", function() { return Destroyable; });
/* harmony import */ var _shim_Promise__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Promise */ "./node_modules/@dojo/framework/shim/Promise.mjs?c788");

/**
 * No op function used to replace a Destroyable instance's `destroy` method, once the instance has been destroyed
 */
function noop() {
    return _shim_Promise__WEBPACK_IMPORTED_MODULE_0__["default"].resolve(false);
}
/**
 * No op function used to replace a Destroyable instance's `own` method, once the instance has been destroyed
 */
function destroyed() {
    throw new Error('Call made to destroyed method');
}
class Destroyable {
    /**
     * @constructor
     */
    constructor() {
        this.handles = [];
    }
    /**
     * Register handles for the instance that will be destroyed when `this.destroy` is called
     *
     * @param {Handle} handle The handle to add for the instance
     * @returns {Handle} A wrapper Handle. When the wrapper Handle's `destroy` method is invoked, the original handle is
     *                   removed from the instance, and its `destroy` method is invoked.
     */
    own(handle) {
        const { handles: _handles } = this;
        _handles.push(handle);
        return {
            destroy() {
                _handles.splice(_handles.indexOf(handle));
                handle.destroy();
            }
        };
    }
    /**
     * Destroys all handlers registered for the instance
     *
     * @returns {Promise<any} A Promise that resolves once all handles have been destroyed
     */
    destroy() {
        return new _shim_Promise__WEBPACK_IMPORTED_MODULE_0__["default"]((resolve) => {
            this.handles.forEach((handle) => {
                handle && handle.destroy && handle.destroy();
            });
            this.destroy = noop;
            this.own = destroyed;
            resolve(true);
        });
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Destroyable);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/Evented.mjs":
/*!*******************************************************!*\
  !*** ./node_modules/@dojo/framework/core/Evented.mjs ***!
  \*******************************************************/
/*! exports provided: isGlobMatch, Evented, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isGlobMatch", function() { return isGlobMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Evented", function() { return Evented; });
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _Destroyable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Destroyable */ "./node_modules/@dojo/framework/core/Destroyable.mjs");


/**
 * Map of computed regular expressions, keyed by string
 */
const regexMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
/**
 * Determines if the event type glob has been matched
 *
 * @returns boolean that indicates if the glob is matched
 */
function isGlobMatch(globString, targetString) {
    if (typeof targetString === 'string' && typeof globString === 'string' && globString.indexOf('*') !== -1) {
        let regex;
        if (regexMap.has(globString)) {
            regex = regexMap.get(globString);
        }
        else {
            regex = new RegExp(`^${globString.replace(/\*/g, '.*')}$`);
            regexMap.set(globString, regex);
        }
        return regex.test(targetString);
    }
    else {
        return globString === targetString;
    }
}
/**
 * Event Class
 */
class Evented extends _Destroyable__WEBPACK_IMPORTED_MODULE_1__["Destroyable"] {
    constructor() {
        super(...arguments);
        /**
         * map of listeners keyed by event type
         */
        this.listenersMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
    }
    emit(event) {
        this.listenersMap.forEach((methods, type) => {
            if (isGlobMatch(type, event.type)) {
                [...methods].forEach((method) => {
                    method.call(this, event);
                });
            }
        });
    }
    on(type, listener) {
        if (Array.isArray(listener)) {
            const handles = listener.map((listener) => this._addListener(type, listener));
            return {
                destroy() {
                    handles.forEach((handle) => handle.destroy());
                }
            };
        }
        return this._addListener(type, listener);
    }
    _addListener(type, listener) {
        const listeners = this.listenersMap.get(type) || [];
        listeners.push(listener);
        this.listenersMap.set(type, listeners);
        return {
            destroy: () => {
                const listeners = this.listenersMap.get(type) || [];
                listeners.splice(listeners.indexOf(listener), 1);
            }
        };
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Evented);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/QueuingEvented.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/@dojo/framework/core/QueuingEvented.mjs ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _Evented__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");


/**
 * An implementation of the Evented class that queues up events when no listeners are
 * listening. When a listener is subscribed, the queue will be published to the listener.
 * When the queue is full, the oldest events will be discarded to make room for the newest ones.
 *
 * @property maxEvents  The number of events to queue before old events are discarded. If zero (default), an unlimited number of events is queued.
 */
class QueuingEvented extends _Evented__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor() {
        super(...arguments);
        this._queue = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.maxEvents = 0;
    }
    emit(event) {
        super.emit(event);
        let hasMatch = false;
        this.listenersMap.forEach((method, type) => {
            // Since `type` is generic, the compiler doesn't know what type it is and `isGlobMatch` requires `string | symbol`
            if (Object(_Evented__WEBPACK_IMPORTED_MODULE_1__["isGlobMatch"])(type, event.type)) {
                hasMatch = true;
            }
        });
        if (!hasMatch) {
            let queue = this._queue.get(event.type);
            if (!queue) {
                queue = [];
                this._queue.set(event.type, queue);
            }
            queue.push(event);
            if (this.maxEvents > 0) {
                while (queue.length > this.maxEvents) {
                    queue.shift();
                }
            }
        }
    }
    on(type, listener) {
        let handle = super.on(type, listener);
        this.listenersMap.forEach((method, listenerType) => {
            this._queue.forEach((events, queuedType) => {
                if (Object(_Evented__WEBPACK_IMPORTED_MODULE_1__["isGlobMatch"])(listenerType, queuedType)) {
                    events.forEach((event) => this.emit(event));
                    this._queue.delete(queuedType);
                }
            });
        });
        return handle;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (QueuingEvented);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/util.mjs":
/*!****************************************************!*\
  !*** ./node_modules/@dojo/framework/core/util.mjs ***!
  \****************************************************/
/*! exports provided: deepAssign, deepMixin, mixin, partial, guaranteeMinimumTimeout, debounce, throttle, uuid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deepAssign", function() { return deepAssign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deepMixin", function() { return deepMixin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mixin", function() { return mixin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "partial", function() { return partial; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "guaranteeMinimumTimeout", function() { return guaranteeMinimumTimeout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throttle", function() { return throttle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uuid", function() { return uuid; });
const slice = Array.prototype.slice;
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Type guard that ensures that the value can be coerced to Object
 * to weed out host objects that do not derive from Object.
 * This function is used to check if we want to deep copy an object or not.
 * Note: In ES6 it is possible to modify an object's Symbol.toStringTag property, which will
 * change the value returned by `toString`. This is a rare edge case that is difficult to handle,
 * so it is not handled here.
 * @param  value The value to check
 * @return       If the value is coercible into an Object
 */
function shouldDeepCopyObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function copyArray(array, inherited) {
    return array.map(function (item) {
        if (Array.isArray(item)) {
            return copyArray(item, inherited);
        }
        return !shouldDeepCopyObject(item)
            ? item
            : _mixin({
                deep: true,
                inherited: inherited,
                sources: [item],
                target: {}
            });
    });
}
function _mixin(kwArgs) {
    const deep = kwArgs.deep;
    const inherited = kwArgs.inherited;
    const target = kwArgs.target;
    const copied = kwArgs.copied || [];
    const copiedClone = [...copied];
    for (let i = 0; i < kwArgs.sources.length; i++) {
        const source = kwArgs.sources[i];
        if (source === null || source === undefined) {
            continue;
        }
        for (let key in source) {
            if (inherited || hasOwnProperty.call(source, key)) {
                let value = source[key];
                if (copiedClone.indexOf(value) !== -1) {
                    continue;
                }
                if (deep) {
                    if (Array.isArray(value)) {
                        value = copyArray(value, inherited);
                    }
                    else if (shouldDeepCopyObject(value)) {
                        const targetValue = target[key] || {};
                        copied.push(source);
                        value = _mixin({
                            deep: true,
                            inherited: inherited,
                            sources: [value],
                            target: targetValue,
                            copied
                        });
                    }
                }
                target[key] = value;
            }
        }
    }
    return target;
}
function deepAssign(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: false,
        sources: sources,
        target: target
    });
}
function deepMixin(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: true,
        sources: sources,
        target: target
    });
}
function mixin(target, ...sources) {
    return _mixin({
        deep: false,
        inherited: true,
        sources: sources,
        target: target
    });
}
/**
 * Returns a function which invokes the given function with the given arguments prepended to its argument list.
 * Like `Function.prototype.bind`, but does not alter execution context.
 *
 * @param targetFunction The function that needs to be bound
 * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
 * @return The bound function
 */
function partial(targetFunction, ...suppliedArgs) {
    return function () {
        const args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
        return targetFunction.apply(this, args);
    };
}
function guaranteeMinimumTimeout(callback, delay) {
    const startTime = Date.now();
    let timerId;
    function timeoutHandler() {
        const delta = Date.now() - startTime;
        if (delay == null || delta >= delay) {
            callback();
        }
        else {
            timerId = setTimeout(timeoutHandler, delay - delta);
        }
    }
    timerId = setTimeout(timeoutHandler, delay);
    return {
        destroy: () => {
            if (timerId != null) {
                clearTimeout(timerId);
                timerId = null;
            }
        }
    };
}
function debounce(callback, delay) {
    let timer;
    return function () {
        timer && timer.destroy();
        let context = this;
        let args = arguments;
        timer = guaranteeMinimumTimeout(function () {
            callback.apply(context, args);
            args = context = timer = null;
        }, delay);
    };
}
function throttle(callback, delay) {
    let ran;
    return function () {
        if (ran) {
            return;
        }
        ran = true;
        callback.apply(this, arguments);
        guaranteeMinimumTimeout(function () {
            ran = null;
        }, delay);
    };
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


/***/ }),

/***/ "./node_modules/@dojo/framework/i18n/cldr/load.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/framework/i18n/cldr/load.mjs ***!
  \*********************************************************/
/*! exports provided: mainPackages, supplementalPackages, isLoaded, default, reset */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mainPackages", function() { return mainPackages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supplementalPackages", function() { return supplementalPackages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isLoaded", function() { return isLoaded; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadCldrData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reset", function() { return reset; });
/* harmony import */ var cldrjs_dist_cldr_unresolved__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cldrjs/dist/cldr/unresolved */ "./node_modules/cldrjs/dist/cldr/unresolved.js");
/* harmony import */ var cldrjs_dist_cldr_unresolved__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cldrjs_dist_cldr_unresolved__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var globalize_dist_globalize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! globalize/dist/globalize */ "./node_modules/globalize/dist/globalize.js");
/* harmony import */ var globalize_dist_globalize__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(globalize_dist_globalize__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _locales__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./locales */ "./node_modules/@dojo/framework/i18n/cldr/locales.mjs");
/* harmony import */ var _util_main__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/main */ "./node_modules/@dojo/framework/i18n/util/main.mjs");
// required for Globalize/Cldr to properly resolve locales in the browser.




/**
 * A list of all required CLDR packages for an individual locale.
 */
const mainPackages = Object.freeze([
    'dates/calendars/gregorian',
    'dates/fields',
    'dates/timeZoneNames',
    'numbers',
    'numbers/currencies',
    'units'
]);
/**
 * A list of all required CLDR supplement packages.
 */
const supplementalPackages = Object.freeze([
    'currencyData',
    'likelySubtags',
    'numberingSystems',
    'plurals-type-cardinal',
    'plurals-type-ordinal',
    'timeData',
    'weekData'
]);
/**
 * @private
 * A simple map containing boolean flags indicating whether a particular CLDR package has been loaded.
 */
const loadCache = {
    main: Object.create(null),
    supplemental: generateSupplementalCache()
};
/**
 * @private
 * Generate the locale-specific data cache from a list of keys. Nested objects will be generated from
 * slash-separated strings.
 *
 * @param cache
 * An empty locale cache object.
 *
 * @param keys
 * The list of keys.
 */
function generateLocaleCache(cache, keys) {
    return keys.reduce((tree, key) => {
        const parts = key.split('/');
        if (parts.length === 1) {
            tree[key] = false;
            return tree;
        }
        parts.reduce((tree, key, i) => {
            if (typeof tree[key] !== 'object') {
                tree[key] = i === parts.length - 1 ? false : Object.create(null);
            }
            return tree[key];
        }, tree);
        return tree;
    }, cache);
}
/**
 * @private
 * Generate the supplemental data cache.
 */
function generateSupplementalCache() {
    return supplementalPackages.reduce((map, key) => {
        map[key] = false;
        return map;
    }, Object.create(null));
}
/**
 * @private
 * Recursively determine whether a list of packages have been loaded for the specified CLDR group.
 *
 * @param group
 * The CLDR group object (e.g., the supplemental data, or a specific locale group)
 *
 * @param args
 * A list of keys to recursively check from left to right. For example, if [ "en", "numbers" ],
 * then `group.en.numbers` must exist for the test to pass.
 *
 * @return
 * `true` if the deepest value exists; `false` otherwise.
 */
function isLoadedForGroup(group, args) {
    return args.every((arg) => {
        const next = group[arg];
        group = next;
        return Boolean(next);
    });
}
/**
 * @private
 * Recursively flag as loaded all recognized keys on the provided CLDR data object.
 *
 * @param cache
 * The load cache (either the entire object, or a nested segment of it).
 *
 * @param localeData
 * The CLDR data object being loaded (either the entire object, or a nested segment of it).
 */
function registerLocaleData(cache, localeData) {
    Object.keys(localeData).forEach((key) => {
        if (key in cache) {
            const value = cache[key];
            if (typeof value === 'boolean') {
                cache[key] = true;
            }
            else {
                registerLocaleData(value, localeData[key]);
            }
        }
    });
}
/**
 * @private
 * Flag all supplied CLDR packages for a specific locale as loaded.
 *
 * @param data
 * The `main` locale data.
 */
function registerMain(data) {
    if (!data) {
        return;
    }
    Object.keys(data).forEach((locale) => {
        if (_locales__WEBPACK_IMPORTED_MODULE_2__["default"].indexOf(locale) < 0) {
            return;
        }
        let loadedData = loadCache.main[locale];
        if (!loadedData) {
            loadedData = loadCache.main[locale] = generateLocaleCache(Object.create(null), mainPackages);
        }
        registerLocaleData(loadedData, data[locale]);
    });
}
/**
 * @private
 * Flag all supplied CLDR supplemental packages as loaded.
 *
 * @param data
 * The supplemental data.
 */
function registerSupplemental(data) {
    if (!data) {
        return;
    }
    const supplemental = loadCache.supplemental;
    Object.keys(data).forEach((key) => {
        if (key in supplemental) {
            supplemental[key] = true;
        }
    });
}
/**
 * Determine whether a particular CLDR package has been loaded.
 *
 * Example: to check that `supplemental.likelySubtags` has been loaded, `isLoaded` would be called as
 * `isLoaded('supplemental', 'likelySubtags')`.
 *
 * @param groupName
 * The group to check; either "main" or "supplemental".
 *
 * @param ...args
 * Any remaining keys in the path to the desired package.
 *
 * @return
 * `true` if the deepest value exists; `false` otherwise.
 */
function isLoaded(groupName, ...args) {
    let group = loadCache[groupName];
    if (groupName === 'main' && args.length > 0) {
        const locale = args[0];
        if (!Object(_util_main__WEBPACK_IMPORTED_MODULE_3__["validateLocale"])(locale)) {
            return false;
        }
        args = args.slice(1);
        return Object(_util_main__WEBPACK_IMPORTED_MODULE_3__["generateLocales"])(locale).some((locale) => {
            const next = group[locale];
            return next ? isLoadedForGroup(next, args) : false;
        });
    }
    return isLoadedForGroup(group, args);
}
/**
 * Load the specified CLDR data with the i18n ecosystem.
 *
 * @param data
 * A data object containing `main` and/or `supplemental` objects with CLDR data.
 */
function loadCldrData(data) {
    registerMain(data.main);
    registerSupplemental(data.supplemental);
    globalize_dist_globalize__WEBPACK_IMPORTED_MODULE_1__["load"](data);
    return Promise.resolve();
}
/**
 * Clear the load cache, either the entire cache for the specified group. After calling this method,
 * `isLoaded` will return false for keys within the specified group(s).
 *
 * @param group
 * An optional group name. If not provided, then both the "main" and "supplemental" caches will be cleared.
 */
function reset(group) {
    if (group !== 'supplemental') {
        loadCache.main = Object.create(null);
    }
    if (group !== 'main') {
        loadCache.supplemental = generateSupplementalCache();
    }
}


/***/ }),

/***/ "./node_modules/@dojo/framework/i18n/cldr/locales.mjs":
/*!************************************************************!*\
  !*** ./node_modules/@dojo/framework/i18n/cldr/locales.mjs ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * A list of `cldr-data/main` directories used to load the correct CLDR data for a given locale.
 */
const localesList = [
    'af-NA',
    'af',
    'agq',
    'ak',
    'am',
    'ar-AE',
    'ar-BH',
    'ar-DJ',
    'ar-DZ',
    'ar-EG',
    'ar-EH',
    'ar-ER',
    'ar-IL',
    'ar-IQ',
    'ar-JO',
    'ar-KM',
    'ar-KW',
    'ar-LB',
    'ar-LY',
    'ar-MA',
    'ar-MR',
    'ar-OM',
    'ar-PS',
    'ar-QA',
    'ar-SA',
    'ar-SD',
    'ar-SO',
    'ar-SS',
    'ar-SY',
    'ar-TD',
    'ar-TN',
    'ar-YE',
    'ar',
    'as',
    'asa',
    'ast',
    'az-Cyrl',
    'az-Latn',
    'az',
    'bas',
    'be',
    'bem',
    'bez',
    'bg',
    'bm',
    'bn-IN',
    'bn',
    'bo-IN',
    'bo',
    'br',
    'brx',
    'bs-Cyrl',
    'bs-Latn',
    'bs',
    'ca-AD',
    'ca-ES-VALENCIA',
    'ca-FR',
    'ca-IT',
    'ca',
    'ce',
    'cgg',
    'chr',
    'ckb-IR',
    'ckb',
    'cs',
    'cu',
    'cy',
    'da-GL',
    'da',
    'dav',
    'de-AT',
    'de-BE',
    'de-CH',
    'de-IT',
    'de-LI',
    'de-LU',
    'de',
    'dje',
    'dsb',
    'dua',
    'dyo',
    'dz',
    'ebu',
    'ee-TG',
    'ee',
    'el-CY',
    'el',
    'en-001',
    'en-150',
    'en-AG',
    'en-AI',
    'en-AS',
    'en-AT',
    'en-AU',
    'en-BB',
    'en-BE',
    'en-BI',
    'en-BM',
    'en-BS',
    'en-BW',
    'en-BZ',
    'en-CA',
    'en-CC',
    'en-CH',
    'en-CK',
    'en-CM',
    'en-CX',
    'en-CY',
    'en-DE',
    'en-DG',
    'en-DK',
    'en-DM',
    'en-ER',
    'en-FI',
    'en-FJ',
    'en-FK',
    'en-FM',
    'en-GB',
    'en-GD',
    'en-GG',
    'en-GH',
    'en-GI',
    'en-GM',
    'en-GU',
    'en-GY',
    'en-HK',
    'en-IE',
    'en-IL',
    'en-IM',
    'en-IN',
    'en-IO',
    'en-JE',
    'en-JM',
    'en-KE',
    'en-KI',
    'en-KN',
    'en-KY',
    'en-LC',
    'en-LR',
    'en-LS',
    'en-MG',
    'en-MH',
    'en-MO',
    'en-MP',
    'en-MS',
    'en-MT',
    'en-MU',
    'en-MW',
    'en-MY',
    'en-NA',
    'en-NF',
    'en-NG',
    'en-NL',
    'en-NR',
    'en-NU',
    'en-NZ',
    'en-PG',
    'en-PH',
    'en-PK',
    'en-PN',
    'en-PR',
    'en-PW',
    'en-RW',
    'en-SB',
    'en-SC',
    'en-SD',
    'en-SE',
    'en-SG',
    'en-SH',
    'en-SI',
    'en-SL',
    'en-SS',
    'en-SX',
    'en-SZ',
    'en-TC',
    'en-TK',
    'en-TO',
    'en-TT',
    'en-TV',
    'en-TZ',
    'en-UG',
    'en-UM',
    'en-US-POSIX',
    'en-VC',
    'en-VG',
    'en-VI',
    'en-VU',
    'en-WS',
    'en-ZA',
    'en-ZM',
    'en-ZW',
    'en',
    'eo',
    'es-419',
    'es-AR',
    'es-BO',
    'es-BR',
    'es-CL',
    'es-CO',
    'es-CR',
    'es-CU',
    'es-DO',
    'es-EA',
    'es-EC',
    'es-GQ',
    'es-GT',
    'es-HN',
    'es-IC',
    'es-MX',
    'es-NI',
    'es-PA',
    'es-PE',
    'es-PH',
    'es-PR',
    'es-PY',
    'es-SV',
    'es-US',
    'es-UY',
    'es-VE',
    'es',
    'et',
    'eu',
    'ewo',
    'fa-AF',
    'fa',
    'ff-CM',
    'ff-GN',
    'ff-MR',
    'ff',
    'fi',
    'fil',
    'fo-DK',
    'fo',
    'fr-BE',
    'fr-BF',
    'fr-BI',
    'fr-BJ',
    'fr-BL',
    'fr-CA',
    'fr-CD',
    'fr-CF',
    'fr-CG',
    'fr-CH',
    'fr-CI',
    'fr-CM',
    'fr-DJ',
    'fr-DZ',
    'fr-GA',
    'fr-GF',
    'fr-GN',
    'fr-GP',
    'fr-GQ',
    'fr-HT',
    'fr-KM',
    'fr-LU',
    'fr-MA',
    'fr-MC',
    'fr-MF',
    'fr-MG',
    'fr-ML',
    'fr-MQ',
    'fr-MR',
    'fr-MU',
    'fr-NC',
    'fr-NE',
    'fr-PF',
    'fr-PM',
    'fr-RE',
    'fr-RW',
    'fr-SC',
    'fr-SN',
    'fr-SY',
    'fr-TD',
    'fr-TG',
    'fr-TN',
    'fr-VU',
    'fr-WF',
    'fr-YT',
    'fr',
    'fur',
    'fy',
    'ga',
    'gd',
    'gl',
    'gsw-FR',
    'gsw-LI',
    'gsw',
    'gu',
    'guz',
    'gv',
    'ha-GH',
    'ha-NE',
    'ha',
    'haw',
    'he',
    'hi',
    'hr-BA',
    'hr',
    'hsb',
    'hu',
    'hy',
    'id',
    'ig',
    'ii',
    'is',
    'it-CH',
    'it-SM',
    'it',
    'ja',
    'jgo',
    'jmc',
    'ka',
    'kab',
    'kam',
    'kde',
    'kea',
    'khq',
    'ki',
    'kk',
    'kkj',
    'kl',
    'kln',
    'km',
    'kn',
    'ko-KP',
    'ko',
    'kok',
    'ks',
    'ksb',
    'ksf',
    'ksh',
    'kw',
    'ky',
    'lag',
    'lb',
    'lg',
    'lkt',
    'ln-AO',
    'ln-CF',
    'ln-CG',
    'ln',
    'lo',
    'lrc-IQ',
    'lrc',
    'lt',
    'lu',
    'luo',
    'luy',
    'lv',
    'mas-TZ',
    'mas',
    'mer',
    'mfe',
    'mg',
    'mgh',
    'mgo',
    'mk',
    'ml',
    'mn',
    'mr',
    'ms-BN',
    'ms-SG',
    'ms',
    'mt',
    'mua',
    'my',
    'mzn',
    'naq',
    'nb-SJ',
    'nb',
    'nd',
    'nds-NL',
    'nds',
    'ne-IN',
    'ne',
    'nl-AW',
    'nl-BE',
    'nl-BQ',
    'nl-CW',
    'nl-SR',
    'nl-SX',
    'nl',
    'nmg',
    'nn',
    'nnh',
    'nus',
    'nyn',
    'om-KE',
    'om',
    'or',
    'os-RU',
    'os',
    'pa-Arab',
    'pa-Guru',
    'pa',
    'pl',
    'prg',
    'ps',
    'pt-AO',
    'pt-CH',
    'pt-CV',
    'pt-GQ',
    'pt-GW',
    'pt-LU',
    'pt-MO',
    'pt-MZ',
    'pt-PT',
    'pt-ST',
    'pt-TL',
    'pt',
    'qu-BO',
    'qu-EC',
    'qu',
    'rm',
    'rn',
    'ro-MD',
    'ro',
    'rof',
    'root',
    'ru-BY',
    'ru-KG',
    'ru-KZ',
    'ru-MD',
    'ru-UA',
    'ru',
    'rw',
    'rwk',
    'sah',
    'saq',
    'sbp',
    'se-FI',
    'se-SE',
    'se',
    'seh',
    'ses',
    'sg',
    'shi-Latn',
    'shi-Tfng',
    'shi',
    'si',
    'sk',
    'sl',
    'smn',
    'sn',
    'so-DJ',
    'so-ET',
    'so-KE',
    'so',
    'sq-MK',
    'sq-XK',
    'sq',
    'sr-Cyrl-BA',
    'sr-Cyrl-ME',
    'sr-Cyrl-XK',
    'sr-Cyrl',
    'sr-Latn-BA',
    'sr-Latn-ME',
    'sr-Latn-XK',
    'sr-Latn',
    'sr',
    'sv-AX',
    'sv-FI',
    'sv',
    'sw-CD',
    'sw-KE',
    'sw-UG',
    'sw',
    'ta-LK',
    'ta-MY',
    'ta-SG',
    'ta',
    'te',
    'teo-KE',
    'teo',
    'th',
    'ti-ER',
    'ti',
    'tk',
    'to',
    'tr-CY',
    'tr',
    'twq',
    'tzm',
    'ug',
    'uk',
    'ur-IN',
    'ur',
    'uz-Arab',
    'uz-Cyrl',
    'uz-Latn',
    'uz',
    'vai-Latn',
    'vai-Vaii',
    'vai',
    'vi',
    'vo',
    'vun',
    'wae',
    'xog',
    'yav',
    'yi',
    'yo-BJ',
    'yo',
    'yue',
    'zgh',
    'zh-Hans-HK',
    'zh-Hans-MO',
    'zh-Hans-SG',
    'zh-Hans',
    'zh-Hant-HK',
    'zh-Hant-MO',
    'zh-Hant',
    'zh',
    'zu'
];
/* harmony default export */ __webpack_exports__["default"] = (localesList);


/***/ }),

/***/ "./node_modules/@dojo/framework/i18n/i18n.mjs":
/*!****************************************************!*\
  !*** ./node_modules/@dojo/framework/i18n/i18n.mjs ***!
  \****************************************************/
/*! exports provided: useDefault, formatMessage, getCachedMessages, getMessageFormatter, default, invalidate, observeLocale, setLocaleMessages, switchLocale, systemLocale */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useDefault", function() { return useDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatMessage", function() { return formatMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCachedMessages", function() { return getCachedMessages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMessageFormatter", function() { return getMessageFormatter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invalidate", function() { return invalidate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "observeLocale", function() { return observeLocale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLocaleMessages", function() { return setLocaleMessages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "switchLocale", function() { return switchLocale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "systemLocale", function() { return systemLocale; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shim_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _shim_iterator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shim/iterator */ "./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _core_Evented__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _core_util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/util */ "./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! globalize/dist/globalize/message */ "./node_modules/globalize/dist/globalize/message.js");
/* harmony import */ var globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _cldr_load__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cldr/load */ "./node_modules/@dojo/framework/i18n/cldr/load.mjs");
/* harmony import */ var _util_main__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./util/main */ "./node_modules/@dojo/framework/i18n/util/main.mjs");

/* tslint:disable:interface-name */









function useDefault(modules) {
    if (Object(_shim_iterator__WEBPACK_IMPORTED_MODULE_2__["isArrayLike"])(modules)) {
        let processedModules = [];
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            processedModules.push(module.__esModule && module.default ? module.default : module);
        }
        return processedModules;
    }
    else if (Object(_shim_iterator__WEBPACK_IMPORTED_MODULE_2__["isIterable"])(modules)) {
        let processedModules = [];
        for (const module of modules) {
            processedModules.push(module.__esModule && module.default ? module.default : module);
        }
        return processedModules;
    }
    else {
        return modules.__esModule && modules.default ? modules.default : modules;
    }
}
const TOKEN_PATTERN = /\{([a-z0-9_]+)\}/gi;
const bundleMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_3__["default"]();
const formatterMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_3__["default"]();
const localeProducer = new _core_Evented__WEBPACK_IMPORTED_MODULE_4__["default"]();
let rootLocale;
/**
 * Return the bundle's unique identifier, creating one if it does not already exist.
 *
 * @param bundle A message bundle
 * @return The bundle's unique identifier
 */
function getBundleId(bundle) {
    if (bundle.id) {
        return bundle.id;
    }
    const id = Object(_core_util__WEBPACK_IMPORTED_MODULE_6__["uuid"])();
    Object.defineProperty(bundle, 'id', {
        value: id
    });
    return id;
}
/**
 * @private
 * Return a function that formats an ICU-style message, and takes an optional value for token replacement.
 *
 * Usage:
 * const formatter = getMessageFormatter(bundle, 'guestInfo', 'fr');
 * const message = formatter({
 *   host: 'Miles',
 *   gender: 'male',
 *   guest: 'Oscar',
 *   guestCount: '15'
 * });
 *
 * @param id
 * The message's bundle id.
 *
 * @param key
 * The message's key.
 *
 * @param locale
 * An optional locale for the formatter. If no locale is supplied, or if the locale is not supported, the
 * default locale is used.
 *
 * @return
 * The message formatter.
 */
function getIcuMessageFormatter(id, key, locale) {
    locale = Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["normalizeLocale"])(locale || getRootLocale());
    const formatterKey = `${locale}:${id}:${key}`;
    let formatter = formatterMap.get(formatterKey);
    if (formatter) {
        return formatter;
    }
    const globalize = locale !== getRootLocale() ? new globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__(Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["normalizeLocale"])(locale)) : globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__;
    formatter = globalize.messageFormatter(`${id}/${key}`);
    const cached = bundleMap.get(id);
    if (cached && cached.get(locale)) {
        formatterMap.set(formatterKey, formatter);
    }
    return formatter;
}
/**
 * @private
 * Load the specified locale-specific bundles, mapping the default exports to simple `Messages` objects.
 */
function loadLocaleBundles(locales, supported) {
    return Promise.all(supported.map((locale) => locales[locale]())).then((bundles) => {
        return bundles.map((bundle) => useDefault(bundle));
    });
}
/**
 * @private
 * Return the root locale. Defaults to the system locale.
 */
function getRootLocale() {
    return rootLocale || systemLocale;
}
/**
 * @private
 * Retrieve a list of supported locales that can provide messages for the specified locale.
 *
 * @param locale
 * The target locale.
 *
 * @param supported
 * The locales that are supported by the bundle.
 *
 * @return
 * A list of supported locales that match the target locale.
 */
function getSupportedLocales(locale, supported = []) {
    return Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["generateLocales"])(locale).filter((locale) => supported.indexOf(locale) > -1);
}
/**
 * @private
 * Inject messages for the specified locale into the i18n system.
 *
 * @param id
 * The bundle's unique identifier
 *
 * @param messages
 * The messages to inject
 *
 * @param locale
 * An optional locale. If not specified, then it is assumed that the messages are the defaults for the given
 * bundle path.
 */
function loadMessages(id, messages, locale = 'root') {
    let cached = bundleMap.get(id);
    if (!cached) {
        cached = new _shim_Map__WEBPACK_IMPORTED_MODULE_3__["default"]();
        bundleMap.set(id, cached);
    }
    cached.set(locale, messages);
    globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__["loadMessages"]({
        [locale]: {
            [id]: messages
        }
    });
}
/**
 * Return a formatted message.
 *
 * If both the "supplemental/likelySubtags" and "supplemental/plurals-type-cardinal" CLDR data have been loaded, then
 * the ICU message format is supported. Otherwise, a simple token-replacement mechanism is used.
 *
 * Usage:
 * formatMessage(bundle, 'guestInfo', {
 *   host: 'Bill',
 *   guest: 'John'
 * }, 'fr');
 *
 * @param bundle
 * The bundle containing the target message.
 *
 * @param key
 * The message's key.
 *
 * @param options
 * An optional value used by the formatter to replace tokens with values.
 *
 * @param locale
 * An optional locale for the formatter. If no locale is supplied, or if the locale is not supported, the
 * default locale is used.
 *
 * @return
 * The formatted message.
 */
function formatMessage(bundle, key, options, locale) {
    return getMessageFormatter(bundle, key, locale)(options);
}
/**
 * Return the cached messages for the specified bundle and locale. If messages have not been previously loaded for the
 * specified locale, no value will be returned.
 *
 * @param bundle
 * The default bundle that is used to determine where the locale-specific bundles are located.
 *
 * @param locale
 * The locale of the desired messages.
 *
 * @return The cached messages object, if it exists.
 */
function getCachedMessages(bundle, locale) {
    const { id = getBundleId(bundle), locales, messages } = bundle;
    const cached = bundleMap.get(id);
    if (!cached) {
        loadMessages(id, messages);
    }
    else {
        const localeMessages = cached.get(locale);
        if (localeMessages) {
            return localeMessages;
        }
    }
    const supportedLocales = getSupportedLocales(locale, locales && Object.keys(locales));
    if (!supportedLocales.length) {
        return messages;
    }
    if (cached) {
        return cached.get(supportedLocales[supportedLocales.length - 1]);
    }
}
/**
 * Return a function that formats a specific message, and takes an optional value for token replacement.
 *
 * If both the "supplemental/likelySubtags" and "supplemental/plurals-type-cardinal" CLDR data have been loaded, then
 * the returned function will have ICU message format support. Otherwise, the returned function will perform a simple
 * token replacement on the message string.
 *
 * Usage:
 * const formatter = getMessageFormatter(bundle, 'guestInfo', 'fr');
 * const message = formatter({
 *   host: 'Miles',
 *   gender: 'male',
 *   guest: 'Oscar',
 *   guestCount: '15'
 * });
 *
 * @param bundle
 * The bundle containing the target message.
 *
 * @param key
 * The message's key.
 *
 * @param locale
 * An optional locale for the formatter. If no locale is supplied, or if the locale is not supported, the
 * default locale is used.
 *
 * @return
 * The message formatter.
 */
function getMessageFormatter(bundle, key, locale) {
    const { id = getBundleId(bundle) } = bundle;
    if (Object(_cldr_load__WEBPACK_IMPORTED_MODULE_8__["isLoaded"])('supplemental', 'likelySubtags') && Object(_cldr_load__WEBPACK_IMPORTED_MODULE_8__["isLoaded"])('supplemental', 'plurals-type-cardinal')) {
        return getIcuMessageFormatter(id, key, locale);
    }
    const cached = bundleMap.get(id);
    const messages = cached ? cached.get(locale || getRootLocale()) || cached.get('root') : null;
    if (!messages) {
        throw new Error(`The bundle has not been registered.`);
    }
    return function (options = Object.create(null)) {
        return messages[key].replace(TOKEN_PATTERN, (token, property) => {
            const value = options[property];
            if (typeof value === 'undefined') {
                throw new Error(`Missing property ${property}`);
            }
            return value;
        });
    };
}
/**
 * Load locale-specific messages for the specified bundle and locale.
 *
 * @param bundle
 * The default bundle that is used to determine where the locale-specific bundles are located.
 *
 * @param locale
 * An optional locale. If no locale is provided, then the current locale is assumed.
 *
 * @return A promise to the locale-specific messages.
 */
function i18n(bundle, locale) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
        const currentLocale = locale ? Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["normalizeLocale"])(locale) : getRootLocale();
        const cachedMessages = getCachedMessages(bundle, currentLocale);
        if (cachedMessages) {
            return cachedMessages;
        }
        const locales = bundle.locales;
        const supportedLocales = getSupportedLocales(currentLocale, Object.keys(locales));
        const bundles = yield loadLocaleBundles(locales, supportedLocales);
        return bundles.reduce((previous, partial) => {
            const localeMessages = Object.assign({}, previous, partial);
            loadMessages(getBundleId(bundle), Object.freeze(localeMessages), currentLocale);
            return localeMessages;
        }, bundle.messages);
    });
}
Object.defineProperty(i18n, 'locale', {
    get: getRootLocale
});
/* harmony default export */ __webpack_exports__["default"] = (i18n);
/**
 * Invalidate the cache for a particular bundle, or invalidate the entire cache. Note that cached messages for all
 * locales for a given bundle will be cleared.
 *
 * @param bundle
 * An optional bundle to invalidate. If no bundle is provided, then the cache is cleared for all bundles.
 */
function invalidate(bundle) {
    if (bundle) {
        bundle.id && bundleMap.delete(bundle.id);
    }
    else {
        bundleMap.clear();
    }
}
/**
 * Register an observer to be notified when the root locale changes.
 *
 * @param callback
 * A callback function which will receive the updated locale string on updates.
 *
 * @return
 * A handle object that can be used to unsubscribe from updates.
 */
const observeLocale = function (callback) {
    return localeProducer.on('change', (event) => {
        callback(event.target);
    });
};
/**
 * Pre-load locale-specific messages into the i18n system.
 *
 * @param bundle
 * The default bundle that is used to merge locale-specific messages with the default messages.
 *
 * @param messages
 * The messages to cache.
 *
 * @param locale
 * The locale for the messages
 */
function setLocaleMessages(bundle, localeMessages, locale) {
    const messages = Object.assign({}, bundle.messages, localeMessages);
    loadMessages(getBundleId(bundle), Object.freeze(messages), locale);
}
/**
 * Change the root locale, and notify any registered observers.
 *
 * @param locale
 * The new locale.
 */
function switchLocale(locale) {
    const previous = rootLocale;
    rootLocale = locale ? Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["normalizeLocale"])(locale) : '';
    if (previous !== rootLocale) {
        if (Object(_cldr_load__WEBPACK_IMPORTED_MODULE_8__["isLoaded"])('supplemental', 'likelySubtags')) {
            globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__["load"]({
                main: {
                    [rootLocale]: {}
                }
            });
            globalize_dist_globalize_message__WEBPACK_IMPORTED_MODULE_7__["locale"](rootLocale);
        }
        localeProducer.emit({ type: 'change', target: rootLocale });
    }
}
/**
 * The default environment locale.
 *
 * It should be noted that while the system locale will be normalized to a single
 * format when loading message bundles, this value represents the unaltered
 * locale returned directly by the environment.
 */
const systemLocale = (function () {
    let systemLocale = 'en';
    if (true) {
        const navigator = _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].navigator;
        systemLocale = navigator.language || navigator.userLanguage;
    }
    else {}
    return Object(_util_main__WEBPACK_IMPORTED_MODULE_9__["normalizeLocale"])(systemLocale);
})();


/***/ }),

/***/ "./node_modules/@dojo/framework/i18n/util/main.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/framework/i18n/util/main.mjs ***!
  \*********************************************************/
/*! exports provided: generateLocales, normalizeLocale, validateLocale */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateLocales", function() { return generateLocales; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeLocale", function() { return normalizeLocale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateLocale", function() { return validateLocale; });
// Matches an ISO 639.1/639.2 compatible language, followed by optional subtags.
const VALID_LOCALE_PATTERN = /^[a-z]{2,3}(-[a-z0-9\-\_]+)?$/i;
/**
 * Retrieve a list of locales that can provide substitute for the specified locale
 * (including itself).
 *
 * For example, if 'fr-CA' is specified, then `[ 'fr', 'fr-CA' ]` is returned.
 *
 * @param locale
 * The target locale.
 *
 * @return
 * A list of locales that match the target locale.
 */
function generateLocales(locale) {
    const normalized = normalizeLocale(locale);
    const parts = normalized.split('-');
    let current = parts[0];
    const result = [current];
    for (let i = 0; i < parts.length - 1; i += 1) {
        current += '-' + parts[i + 1];
        result.push(current);
    }
    return result;
}
/**
 * Normalize a locale so that it can be converted to a bundle path.
 *
 * @param locale
 * The target locale.
 *
 * @return The normalized locale.
 */
const normalizeLocale = (function () {
    function removeTrailingSeparator(value) {
        return value.replace(/(\-|_)$/, '');
    }
    function normalize(locale) {
        if (locale.indexOf('.') === -1) {
            return removeTrailingSeparator(locale);
        }
        return locale
            .split('.')
            .slice(0, -1)
            .map((part) => {
            return removeTrailingSeparator(part).replace(/_/g, '-');
        })
            .join('-');
    }
    return function (locale) {
        const normalized = normalize(locale);
        if (!validateLocale(normalized)) {
            throw new Error(`${normalized} is not a valid locale.`);
        }
        return normalized;
    };
})();
/**
 * Validates that the provided locale at least begins with a ISO 639.1/639.2 comptabile language subtag,
 * and that any additional subtags contain only valid characters.
 *
 * While locales should adhere to the guidelines set forth by RFC 5646 (https://tools.ietf.org/html/rfc5646),
 * only the language subtag is strictly enforced.
 *
 * @param locale
 * The locale to validate.
 *
 * @return
 * `true` if the locale is valid; `false` otherwise.
 */
function validateLocale(locale) {
    return VALID_LOCALE_PATTERN.test(locale);
}


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/ActiveLink.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/ActiveLink.mjs ***!
  \*************************************************************/
/*! exports provided: ActiveLink, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ActiveLink", function() { return ActiveLink; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../widget-core/decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var _Link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Link */ "./node_modules/@dojo/framework/routing/Link.mjs");





function paramsEqual(linkParams = {}, contextParams = {}) {
    return Object.keys(linkParams).every((key) => linkParams[key] === contextParams[key]);
}
class ActiveLink extends _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["default"] {
    _renderLink(isActive = false) {
        let _a = this.properties, { activeClasses, classes = [] } = _a, props = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["activeClasses", "classes"]);
        classes = Array.isArray(classes) ? classes : [classes];
        if (isActive) {
            classes = [...classes, ...activeClasses];
        }
        props = Object.assign({}, props, { classes });
        return Object(_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_Link__WEBPACK_IMPORTED_MODULE_4__["default"], props, this.children);
    }
    _onOutletPropertyChange(previous, current) {
        const { to, routerKey = 'router' } = current;
        const item = this.registry.getInjector(routerKey);
        if (this._outletHandle) {
            this._outletHandle.destroy();
            this._outletHandle = undefined;
        }
        if (item) {
            const router = item.injector();
            this._outletHandle = router.on('outlet', ({ outlet }) => {
                if (outlet.id === to) {
                    this.invalidate();
                }
            });
        }
    }
    render() {
        const { to, routerKey = 'router', params } = this.properties;
        const item = this.registry.getInjector(routerKey);
        if (!item) {
            return this._renderLink();
        }
        const router = item.injector();
        const context = router.getOutlet(to);
        const isActive = context && paramsEqual(params, context.params);
        return this._renderLink(isActive);
    }
}
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__["default"])('to')
], ActiveLink.prototype, "_onOutletPropertyChange", null);
/* harmony default export */ __webpack_exports__["default"] = (ActiveLink);


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Link.mjs":
/*!*******************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/Link.mjs ***!
  \*******************************************************/
/*! exports provided: Link, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Link", function() { return Link; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");



class Link extends _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"] {
    _getProperties() {
        let _a = this.properties, { routerKey = 'router', to, isOutlet = true, target, params = {}, onClick } = _a, props = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["routerKey", "to", "isOutlet", "target", "params", "onClick"]);
        const item = this.registry.getInjector(routerKey);
        let href = to;
        if (item) {
            const router = item.injector();
            if (isOutlet) {
                href = router.link(href, params);
            }
            const onclick = (event) => {
                onClick && onClick(event);
                if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !target) {
                    event.preventDefault();
                    href !== undefined && router.setPath(href);
                }
            };
            return Object.assign({}, props, { onclick, href });
        }
        return Object.assign({}, props, { href });
    }
    render() {
        return Object(_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('a', this._getProperties(), this.children);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Link);


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Outlet.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/Outlet.mjs ***!
  \*********************************************************/
/*! exports provided: Outlet, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Outlet", function() { return Outlet; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _widget_core_decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../widget-core/decorators/alwaysRender */ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");
/* harmony import */ var _widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../widget-core/decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");




let Outlet = class Outlet extends _widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"] {
    onRouterKeyChange(current, next) {
        const { routerKey = 'router' } = next;
        const item = this.registry.getInjector(routerKey);
        if (this._handle) {
            this._handle.destroy();
            this._handle = undefined;
        }
        if (item) {
            this._handle = item.invalidator.on('invalidate', () => {
                this.invalidate();
            });
            this.own(this._handle);
        }
    }
    onAttach() {
        if (!this._handle) {
            this.onRouterKeyChange(this.properties, this.properties);
        }
    }
    render() {
        const { renderer, id, routerKey = 'router' } = this.properties;
        const item = this.registry.getInjector(routerKey);
        if (item) {
            const router = item.injector();
            const outletContext = router.getOutlet(id);
            if (outletContext) {
                const { queryParams, params, type, isError, isExact } = outletContext;
                const result = renderer({ queryParams, params, type, isError, isExact, router });
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
};
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__["diffProperty"])('routerKey')
], Outlet.prototype, "onRouterKeyChange", null);
Outlet = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_widget_core_decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_2__["alwaysRender"])()
], Outlet);

/* harmony default export */ __webpack_exports__["default"] = (Outlet);


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Router.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/Router.mjs ***!
  \*********************************************************/
/*! exports provided: Router, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Router", function() { return Router; });
/* harmony import */ var _core_QueuingEvented__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/QueuingEvented */ "./node_modules/@dojo/framework/core/QueuingEvented.mjs");
/* harmony import */ var _history_HashHistory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./history/HashHistory */ "./node_modules/@dojo/framework/routing/history/HashHistory.mjs");


const PARAM = '__PARAM__';
const paramRegExp = new RegExp(/^{.+}$/);
const ROUTE_SEGMENT_SCORE = 7;
const DYNAMIC_SEGMENT_PENALTY = 2;
function matchingParams({ params: previousParams }, { params }) {
    const matching = Object.keys(previousParams).every((key) => previousParams[key] === params[key]);
    if (!matching) {
        return false;
    }
    return Object.keys(params).every((key) => previousParams[key] === params[key]);
}
class Router extends _core_QueuingEvented__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(config, options = {}) {
        super();
        this._routes = [];
        this._outletMap = Object.create(null);
        this._matchedOutlets = Object.create(null);
        this._currentParams = {};
        this._currentQueryParams = {};
        /**
         * Called on change of the route by the the registered history manager. Matches the path against
         * the registered outlets.
         *
         * @param requestedPath The path of the requested route
         */
        this._onChange = (requestedPath) => {
            requestedPath = this._stripLeadingSlash(requestedPath);
            const previousMatchedOutlets = this._matchedOutlets;
            this._matchedOutlets = Object.create(null);
            const [path, queryParamString] = requestedPath.split('?');
            this._currentQueryParams = this._getQueryParams(queryParamString);
            const segments = path.split('/');
            let routeConfigs = this._routes.map((route) => ({
                route,
                segments: [...segments],
                parent: undefined,
                params: {}
            }));
            let routeConfig;
            let matchedRoutes = [];
            while ((routeConfig = routeConfigs.pop())) {
                const { route, parent, segments, params } = routeConfig;
                let segmentIndex = 0;
                let type = 'index';
                let paramIndex = 0;
                let routeMatch = true;
                if (segments.length < route.segments.length) {
                    routeMatch = false;
                }
                else {
                    while (segments.length > 0) {
                        if (route.segments[segmentIndex] === undefined) {
                            type = 'partial';
                            break;
                        }
                        const segment = segments.shift();
                        if (route.segments[segmentIndex] === PARAM) {
                            params[route.params[paramIndex++]] = segment;
                            this._currentParams = Object.assign({}, this._currentParams, params);
                        }
                        else if (route.segments[segmentIndex] !== segment) {
                            routeMatch = false;
                            break;
                        }
                        segmentIndex++;
                    }
                }
                if (routeMatch) {
                    routeConfig.type = type;
                    matchedRoutes.push({ route, parent, type, params, segments: [] });
                    if (segments.length) {
                        routeConfigs = [
                            ...routeConfigs,
                            ...route.children.map((childRoute) => ({
                                route: childRoute,
                                segments: [...segments],
                                parent: routeConfig,
                                type,
                                params: Object.assign({}, params)
                            }))
                        ];
                    }
                }
            }
            let matchedOutletName = undefined;
            let matchedRoute = matchedRoutes.reduce((match, matchedRoute) => {
                if (!match) {
                    return matchedRoute;
                }
                if (match.route.score > matchedRoute.route.score) {
                    return match;
                }
                return matchedRoute;
            }, undefined);
            if (matchedRoute) {
                if (matchedRoute.type === 'partial') {
                    matchedRoute.type = 'error';
                }
                matchedOutletName = matchedRoute.route.outlet;
                while (matchedRoute) {
                    let { type, params, parent, route } = matchedRoute;
                    const matchedOutlet = {
                        id: route.outlet,
                        queryParams: this._currentQueryParams,
                        params,
                        type,
                        isError: () => type === 'error',
                        isExact: () => type === 'index'
                    };
                    const previousMatchedOutlet = previousMatchedOutlets[route.outlet];
                    this._matchedOutlets[route.outlet] = matchedOutlet;
                    if (!previousMatchedOutlet || !matchingParams(previousMatchedOutlet, matchedOutlet)) {
                        this.emit({ type: 'outlet', outlet: matchedOutlet, action: 'enter' });
                    }
                    matchedRoute = parent;
                }
            }
            else {
                this._matchedOutlets.errorOutlet = {
                    id: 'errorOutlet',
                    queryParams: {},
                    params: {},
                    isError: () => true,
                    isExact: () => false,
                    type: 'error'
                };
            }
            const previousMatchedOutletKeys = Object.keys(previousMatchedOutlets);
            for (let i = 0; i < previousMatchedOutletKeys.length; i++) {
                const key = previousMatchedOutletKeys[i];
                const matchedOutlet = this._matchedOutlets[key];
                if (!matchedOutlet || !matchingParams(previousMatchedOutlets[key], matchedOutlet)) {
                    this.emit({ type: 'outlet', outlet: previousMatchedOutlets[key], action: 'exit' });
                }
            }
            this.emit({
                type: 'nav',
                outlet: matchedOutletName,
                context: matchedOutletName ? this._matchedOutlets[matchedOutletName] : undefined
            });
        };
        const { HistoryManager = _history_HashHistory__WEBPACK_IMPORTED_MODULE_1__["HashHistory"], base, window } = options;
        this._register(config);
        this._history = new HistoryManager({ onChange: this._onChange, base, window });
        if (this._matchedOutlets.errorOutlet && this._defaultOutlet) {
            const path = this.link(this._defaultOutlet);
            if (path) {
                this.setPath(path);
            }
        }
    }
    /**
     * Sets the path against the registered history manager
     *
     * @param path The path to set on the history manager
     */
    setPath(path) {
        this._history.set(path);
    }
    /**
     * Generate a link for a given outlet identifier and optional params.
     *
     * @param outlet The outlet to generate a link for
     * @param params Optional Params for the generated link
     */
    link(outlet, params = {}) {
        const { _outletMap, _currentParams, _currentQueryParams } = this;
        let route = _outletMap[outlet];
        if (route === undefined) {
            return;
        }
        let linkPath = route.fullPath;
        if (route.fullQueryParams.length > 0) {
            let queryString = route.fullQueryParams.reduce((queryParamString, param, index) => {
                if (index > 0) {
                    return `${queryParamString}&${param}={${param}}`;
                }
                return `?${param}={${param}}`;
            }, '');
            linkPath = `${linkPath}${queryString}`;
        }
        params = Object.assign({}, route.defaultParams, _currentQueryParams, _currentParams, params);
        if (Object.keys(params).length === 0 && route.fullParams.length > 0) {
            return undefined;
        }
        const fullParams = [...route.fullParams, ...route.fullQueryParams];
        for (let i = 0; i < fullParams.length; i++) {
            const param = fullParams[i];
            if (params[param]) {
                linkPath = linkPath.replace(`{${param}}`, params[param]);
            }
            else {
                return undefined;
            }
        }
        return this._history.prefix(linkPath);
    }
    /**
     * Returns the outlet context for the outlet identifier if one has been matched
     *
     * @param outletIdentifier The outlet identifer
     */
    getOutlet(outletIdentifier) {
        return this._matchedOutlets[outletIdentifier];
    }
    /**
     * Returns all the params for the current matched outlets
     */
    get currentParams() {
        return this._currentParams;
    }
    /**
     * Strips the leading slash on a path if one exists
     *
     * @param path The path to strip a leading slash
     */
    _stripLeadingSlash(path) {
        if (path[0] === '/') {
            return path.slice(1);
        }
        return path;
    }
    /**
     * Registers the routing configuration
     *
     * @param config The configuration
     * @param routes The routes
     * @param parentRoute The parent route
     */
    _register(config, routes, parentRoute) {
        routes = routes ? routes : this._routes;
        for (let i = 0; i < config.length; i++) {
            let { path, outlet, children, defaultRoute = false, defaultParams = {} } = config[i];
            let [parsedPath, queryParamString] = path.split('?');
            let queryParams = [];
            parsedPath = this._stripLeadingSlash(parsedPath);
            const segments = parsedPath.split('/');
            const route = {
                params: [],
                outlet,
                path: parsedPath,
                segments,
                defaultParams: parentRoute ? Object.assign({}, parentRoute.defaultParams, defaultParams) : defaultParams,
                children: [],
                fullPath: parentRoute ? `${parentRoute.fullPath}/${parsedPath}` : parsedPath,
                fullParams: [],
                fullQueryParams: [],
                score: parentRoute ? parentRoute.score : 0
            };
            if (defaultRoute) {
                this._defaultOutlet = outlet;
            }
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                route.score += ROUTE_SEGMENT_SCORE;
                if (paramRegExp.test(segment)) {
                    route.score -= DYNAMIC_SEGMENT_PENALTY;
                    route.params.push(segment.replace('{', '').replace('}', ''));
                    segments[i] = PARAM;
                }
            }
            if (queryParamString) {
                queryParams = queryParamString.split('&').map((queryParam) => {
                    return queryParam.replace('{', '').replace('}', '');
                });
            }
            route.fullQueryParams = parentRoute ? [...parentRoute.fullQueryParams, ...queryParams] : queryParams;
            route.fullParams = parentRoute ? [...parentRoute.fullParams, ...route.params] : route.params;
            if (children && children.length > 0) {
                this._register(children, route.children, route);
            }
            this._outletMap[outlet] = route;
            routes.push(route);
        }
    }
    /**
     * Returns an object of query params
     *
     * @param queryParamString The string of query params, e.g `paramOne=one&paramTwo=two`
     */
    _getQueryParams(queryParamString) {
        const queryParams = {};
        if (queryParamString) {
            const queryParameters = queryParamString.split('&');
            for (let i = 0; i < queryParameters.length; i++) {
                const [key, value] = queryParameters[i].split('=');
                queryParams[key] = value;
            }
        }
        return queryParams;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Router);


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/RouterInjector.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/RouterInjector.mjs ***!
  \*****************************************************************/
/*! exports provided: registerRouterInjector */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerRouterInjector", function() { return registerRouterInjector; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Router */ "./node_modules/@dojo/framework/routing/Router.mjs");


/**
 * Creates a router instance for a specific History manager (default is `HashHistory`) and registers
 * the route configuration.
 *
 * @param config The route config to register for the router
 * @param registry An optional registry that defaults to the global registry
 * @param options The router injector options
 */
function registerRouterInjector(config, registry, options = {}) {
    const { key = 'router' } = options, routerOptions = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](options, ["key"]);
    if (registry.hasInjector(key)) {
        throw new Error('Router has already been defined');
    }
    const router = new _Router__WEBPACK_IMPORTED_MODULE_1__["Router"](config, routerOptions);
    registry.defineInjector(key, (invalidator) => {
        router.on('nav', () => invalidator());
        return () => router;
    });
    return router;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/routing/history/HashHistory.mjs":
/*!**********************************************************************!*\
  !*** ./node_modules/@dojo/framework/routing/history/HashHistory.mjs ***!
  \**********************************************************************/
/*! exports provided: HashHistory, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HashHistory", function() { return HashHistory; });
/* harmony import */ var _shim_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");

class HashHistory {
    constructor({ window = _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].window, onChange }) {
        this._onChange = () => {
            const path = this.normalizePath(this._window.location.hash);
            if (path !== this._current) {
                this._current = path;
                this._onChangeFunction(this._current);
            }
        };
        this._onChangeFunction = onChange;
        this._window = window;
        this._window.addEventListener('hashchange', this._onChange, false);
        this._current = this.normalizePath(this._window.location.hash);
        this._onChangeFunction(this._current);
    }
    normalizePath(path) {
        return path.replace('#', '');
    }
    prefix(path) {
        if (path[0] !== '#') {
            return `#${path}`;
        }
        return path;
    }
    set(path) {
        this._window.location.hash = this.prefix(path);
        this._onChange();
    }
    get current() {
        return this._current;
    }
    destroy() {
        this._window.removeEventListener('hashchange', this._onChange);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (HashHistory);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Map.mjs":
/*!***************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/Map.mjs ***!
  \***************************************************/
/*! exports provided: Map, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Map", function() { return Map; });
/* harmony import */ var _iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./iterator */ "./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _object__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object */ "./node_modules/@dojo/framework/shim/object.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");





let Map = _global__WEBPACK_IMPORTED_MODULE_1__["default"].Map;
if (false) {}
/* harmony default export */ __webpack_exports__["default"] = (Map);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Promise.mjs?c788":
/*!*******************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/Promise.mjs ***!
  \*******************************************************/
/*! exports provided: ShimPromise, isThenable, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShimPromise", function() { return ShimPromise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isThenable", function() { return isThenable; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _support_queue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./support/queue */ "./node_modules/@dojo/framework/shim/support/queue.mjs");
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");




let ShimPromise = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Promise;
const isThenable = function isThenable(value) {
    return value && typeof value.then === 'function';
};
if (false) {}
if (!Object(_has_has__WEBPACK_IMPORTED_MODULE_3__["default"])('es2018-promise-finally')) {
    _global__WEBPACK_IMPORTED_MODULE_0__["default"].Promise.prototype.finally = function (onFinally) {
        return this.then(onFinally && ((value) => Promise.resolve(onFinally()).then(() => value)), onFinally &&
            ((reason) => Promise.resolve(onFinally()).then(() => {
                throw reason;
            })));
    };
}
/* harmony default export */ __webpack_exports__["default"] = (ShimPromise);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Set.mjs":
/*!***************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/Set.mjs ***!
  \***************************************************/
/*! exports provided: Set, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Set", function() { return Set; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterator */ "./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");




let Set = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Set;
if (false) {}
/* harmony default export */ __webpack_exports__["default"] = (Set);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/WeakMap.mjs":
/*!*******************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/WeakMap.mjs ***!
  \*******************************************************/
/*! exports provided: WeakMap, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WeakMap", function() { return WeakMap; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterator */ "./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");




let WeakMap = _global__WEBPACK_IMPORTED_MODULE_0__["default"].WeakMap;
if (false) {}
/* harmony default export */ __webpack_exports__["default"] = (WeakMap);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/array.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/array.mjs ***!
  \*****************************************************/
/*! exports provided: from, of, copyWithin, fill, find, findIndex, includes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "from", function() { return from; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "of", function() { return of; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyWithin", function() { return copyWithin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fill", function() { return fill; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "find", function() { return find; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findIndex", function() { return findIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "includes", function() { return includes; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterator */ "./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var _number__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./number */ "./node_modules/@dojo/framework/shim/number.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _support_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./support/util */ "./node_modules/@dojo/framework/shim/support/util.mjs");





let from;
/**
 * Creates a new array from the function parameters.
 *
 * @param arguments Any number of arguments for the array
 * @return An array from the given arguments
 */
let of;
/* ES6 Array instance methods */
/**
 * Copies data internally within an array or array-like object.
 *
 * @param target The target array-like object
 * @param offset The index to start copying values to; if negative, it counts backwards from length
 * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
 * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
 * @return The target
 */
let copyWithin;
/**
 * Fills elements of an array-like object with the specified value.
 *
 * @param target The target to fill
 * @param value The value to fill each element of the target with
 * @param start The first index to fill
 * @param end The (exclusive) index at which to stop filling
 * @return The filled target
 */
let fill;
/**
 * Finds and returns the first instance matching the callback or undefined if one is not found.
 *
 * @param target An array-like object
 * @param callback A function returning if the current value matches a criteria
 * @param thisArg The execution context for the find function
 * @return The first element matching the callback, or undefined if one does not exist
 */
let find;
/**
 * Performs a linear search and returns the first index whose value satisfies the passed callback,
 * or -1 if no values satisfy it.
 *
 * @param target An array-like object
 * @param callback A function returning true if the current value satisfies its criteria
 * @param thisArg The execution context for the find function
 * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
 */
let findIndex;
/* ES7 Array instance methods */
/**
 * Determines whether an array includes a given value
 *
 * @param target the target array-like object
 * @param searchElement the item to search for
 * @param fromIndex the starting index to search from
 * @return `true` if the array includes the element, otherwise `false`
 */
let includes;
if (true) {
    from = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.from;
    of = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.of;
    copyWithin = Object(_support_util__WEBPACK_IMPORTED_MODULE_4__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.prototype.copyWithin);
    fill = Object(_support_util__WEBPACK_IMPORTED_MODULE_4__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.prototype.fill);
    find = Object(_support_util__WEBPACK_IMPORTED_MODULE_4__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.prototype.find);
    findIndex = Object(_support_util__WEBPACK_IMPORTED_MODULE_4__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.prototype.findIndex);
}
else {}
if (true) {
    includes = Object(_support_util__WEBPACK_IMPORTED_MODULE_4__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].Array.prototype.includes);
}
else {}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/iterator.mjs":
/*!********************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/iterator.mjs ***!
  \********************************************************/
/*! exports provided: ShimIterator, isIterable, isArrayLike, get, forOf */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShimIterator", function() { return ShimIterator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIterable", function() { return isIterable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArrayLike", function() { return isArrayLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return get; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forOf", function() { return forOf; });
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var _string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string */ "./node_modules/@dojo/framework/shim/string.mjs");


const staticDone = { done: true, value: undefined };
/**
 * A class that _shims_ an iterator interface on array like objects.
 */
class ShimIterator {
    constructor(list) {
        this._nextIndex = -1;
        if (isIterable(list)) {
            this._nativeIterator = list[Symbol.iterator]();
        }
        else {
            this._list = list;
        }
    }
    /**
     * Return the next iteration result for the Iterator
     */
    next() {
        if (this._nativeIterator) {
            return this._nativeIterator.next();
        }
        if (!this._list) {
            return staticDone;
        }
        if (++this._nextIndex < this._list.length) {
            return {
                done: false,
                value: this._list[this._nextIndex]
            };
        }
        return staticDone;
    }
    [Symbol.iterator]() {
        return this;
    }
}
/**
 * A type guard for checking if something has an Iterable interface
 *
 * @param value The value to type guard against
 */
function isIterable(value) {
    return value && typeof value[Symbol.iterator] === 'function';
}
/**
 * A type guard for checking if something is ArrayLike
 *
 * @param value The value to type guard against
 */
function isArrayLike(value) {
    return value && typeof value.length === 'number';
}
/**
 * Returns the iterator for an object
 *
 * @param iterable The iterable object to return the iterator for
 */
function get(iterable) {
    if (isIterable(iterable)) {
        return iterable[Symbol.iterator]();
    }
    else if (isArrayLike(iterable)) {
        return new ShimIterator(iterable);
    }
}
/**
 * Shims the functionality of `for ... of` blocks
 *
 * @param iterable The object the provides an interator interface
 * @param callback The callback which will be called for each item of the iterable
 * @param thisArg Optional scope to pass the callback
 */
function forOf(iterable, callback, thisArg) {
    let broken = false;
    function doBreak() {
        broken = true;
    }
    /* We need to handle iteration of double byte strings properly */
    if (isArrayLike(iterable) && typeof iterable === 'string') {
        const l = iterable.length;
        for (let i = 0; i < l; ++i) {
            let char = iterable[i];
            if (i + 1 < l) {
                const code = char.charCodeAt(0);
                if (code >= _string__WEBPACK_IMPORTED_MODULE_1__["HIGH_SURROGATE_MIN"] && code <= _string__WEBPACK_IMPORTED_MODULE_1__["HIGH_SURROGATE_MAX"]) {
                    char += iterable[++i];
                }
            }
            callback.call(thisArg, char, iterable, doBreak);
            if (broken) {
                return;
            }
        }
    }
    else {
        const iterator = get(iterable);
        if (iterator) {
            let result = iterator.next();
            while (!result.done) {
                callback.call(thisArg, result.value, iterable, doBreak);
                if (broken) {
                    return;
                }
                result = iterator.next();
            }
        }
    }
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/number.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/number.mjs ***!
  \******************************************************/
/*! exports provided: EPSILON, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, isNaN, isFinite, isInteger, isSafeInteger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EPSILON", function() { return EPSILON; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_SAFE_INTEGER", function() { return MAX_SAFE_INTEGER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MIN_SAFE_INTEGER", function() { return MIN_SAFE_INTEGER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNaN", function() { return isNaN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFinite", function() { return isFinite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInteger", function() { return isInteger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSafeInteger", function() { return isSafeInteger; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");

/**
 * The smallest interval between two representable numbers.
 */
const EPSILON = 1;
/**
 * The maximum safe integer in JavaScript
 */
const MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
/**
 * The minimum safe integer in JavaScript
 */
const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;
/**
 * Determines whether the passed value is NaN without coersion.
 *
 * @param value The value to test
 * @return true if the value is NaN, false if it is not
 */
function isNaN(value) {
    return typeof value === 'number' && _global__WEBPACK_IMPORTED_MODULE_0__["default"].isNaN(value);
}
/**
 * Determines whether the passed value is a finite number without coersion.
 *
 * @param value The value to test
 * @return true if the value is finite, false if it is not
 */
function isFinite(value) {
    return typeof value === 'number' && _global__WEBPACK_IMPORTED_MODULE_0__["default"].isFinite(value);
}
/**
 * Determines whether the passed value is an integer.
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isInteger(value) {
    return isFinite(value) && Math.floor(value) === value;
}
/**
 * Determines whether the passed value is an integer that is 'safe,' meaning:
 *   1. it can be expressed as an IEEE-754 double precision number
 *   2. it has a one-to-one mapping to a mathematical integer, meaning its
 *      IEEE-754 representation cannot be the result of rounding any other
 *      integer to fit the IEEE-754 representation
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isSafeInteger(value) {
    return isInteger(value) && Math.abs(value) <= MAX_SAFE_INTEGER;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/object.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/object.mjs ***!
  \******************************************************/
/*! exports provided: assign, getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols, is, keys, getOwnPropertyDescriptors, entries, values */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOwnPropertyDescriptor", function() { return getOwnPropertyDescriptor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOwnPropertyNames", function() { return getOwnPropertyNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOwnPropertySymbols", function() { return getOwnPropertySymbols; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "is", function() { return is; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keys", function() { return keys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOwnPropertyDescriptors", function() { return getOwnPropertyDescriptors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "entries", function() { return entries; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "values", function() { return values; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Symbol */ "./node_modules/@dojo/framework/shim/Symbol.mjs");



let assign;
/**
 * Gets the own property descriptor of the specified object.
 * An own property descriptor is one that is defined directly on the object and is not
 * inherited from the object's prototype.
 * @param o Object that contains the property.
 * @param p Name of the property.
 */
let getOwnPropertyDescriptor;
/**
 * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
 * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
 * @param o Object that contains the own properties.
 */
let getOwnPropertyNames;
/**
 * Returns an array of all symbol properties found directly on object o.
 * @param o Object to retrieve the symbols from.
 */
let getOwnPropertySymbols;
/**
 * Returns true if the values are the same value, false otherwise.
 * @param value1 The first value.
 * @param value2 The second value.
 */
let is;
/**
 * Returns the names of the enumerable properties and methods of an object.
 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
 */
let keys;
/* ES7 Object static methods */
let getOwnPropertyDescriptors;
let entries;
let values;
if (true) {
    const globalObject = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Object;
    assign = globalObject.assign;
    getOwnPropertyDescriptor = globalObject.getOwnPropertyDescriptor;
    getOwnPropertyNames = globalObject.getOwnPropertyNames;
    getOwnPropertySymbols = globalObject.getOwnPropertySymbols;
    is = globalObject.is;
    keys = globalObject.keys;
}
else {}
if (true) {
    const globalObject = _global__WEBPACK_IMPORTED_MODULE_0__["default"].Object;
    getOwnPropertyDescriptors = globalObject.getOwnPropertyDescriptors;
    entries = globalObject.entries;
    values = globalObject.values;
}
else {}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/string.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/framework/shim/string.mjs ***!
  \******************************************************/
/*! exports provided: HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX, LOW_SURROGATE_MIN, LOW_SURROGATE_MAX, fromCodePoint, raw, codePointAt, endsWith, includes, normalize, repeat, startsWith, padEnd, padStart */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HIGH_SURROGATE_MIN", function() { return HIGH_SURROGATE_MIN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HIGH_SURROGATE_MAX", function() { return HIGH_SURROGATE_MAX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOW_SURROGATE_MIN", function() { return LOW_SURROGATE_MIN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOW_SURROGATE_MAX", function() { return LOW_SURROGATE_MAX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromCodePoint", function() { return fromCodePoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "raw", function() { return raw; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "codePointAt", function() { return codePointAt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "endsWith", function() { return endsWith; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "includes", function() { return includes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "repeat", function() { return repeat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startsWith", function() { return startsWith; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "padEnd", function() { return padEnd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "padStart", function() { return padStart; });
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _support_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./support/util */ "./node_modules/@dojo/framework/shim/support/util.mjs");



/**
 * The minimum location of high surrogates
 */
const HIGH_SURROGATE_MIN = 0xd800;
/**
 * The maximum location of high surrogates
 */
const HIGH_SURROGATE_MAX = 0xdbff;
/**
 * The minimum location of low surrogates
 */
const LOW_SURROGATE_MIN = 0xdc00;
/**
 * The maximum location of low surrogates
 */
const LOW_SURROGATE_MAX = 0xdfff;
/* ES6 static methods */
/**
 * Return the String value whose elements are, in order, the elements in the List elements.
 * If length is 0, the empty string is returned.
 * @param codePoints The code points to generate the string
 */
let fromCodePoint;
/**
 * `raw` is intended for use as a tag function of a Tagged Template String. When called
 * as such the first argument will be a well formed template call site object and the rest
 * parameter will contain the substitution values.
 * @param template A well-formed template string call site representation.
 * @param substitutions A set of substitution values.
 */
let raw;
/* ES6 instance methods */
/**
 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
 * value of the UTF-16 encoded code point starting at the string element at position pos in
 * the String resulting from converting this object to a String.
 * If there is no element at that position, the result is undefined.
 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
 */
let codePointAt;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * endPosition – length(this). Otherwise returns false.
 */
let endsWith;
/**
 * Returns true if searchString appears as a substring of the result of converting this
 * object to a String, at one or more positions that are
 * greater than or equal to position; otherwise, returns false.
 * @param target The target string
 * @param searchString search string
 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
 */
let includes;
/**
 * Returns the String value result of normalizing the string into the normalization form
 * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 * @param target The target string
 * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
 * is "NFC"
 */
let normalize;
/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * T is the empty String is returned.
 * @param count number of copies to append
 */
let repeat;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
let startsWith;
/* ES7 instance methods */
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padEnd;
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padStart;
if (true) {
    fromCodePoint = _global__WEBPACK_IMPORTED_MODULE_0__["default"].String.fromCodePoint;
    raw = _global__WEBPACK_IMPORTED_MODULE_0__["default"].String.raw;
    codePointAt = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.codePointAt);
    endsWith = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.endsWith);
    includes = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.includes);
    normalize = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.normalize);
    repeat = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.repeat);
    startsWith = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.startsWith);
}
else {}
if (true) {
    padEnd = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.padEnd);
    padStart = Object(_support_util__WEBPACK_IMPORTED_MODULE_2__["wrapNative"])(_global__WEBPACK_IMPORTED_MODULE_0__["default"].String.prototype.padStart);
}
else {}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Container.mjs":
/*!****************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/Container.mjs ***!
  \****************************************************************/
/*! exports provided: Container, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Container", function() { return Container; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _decorators_inject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./decorators/inject */ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var _d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./decorators/alwaysRender */ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");





function Container(component, name, { getProperties }) {
    let WidgetContainer = class WidgetContainer extends _WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"] {
        render() {
            return Object(_d__WEBPACK_IMPORTED_MODULE_3__["w"])(component, this.properties, this.children);
        }
    };
    WidgetContainer = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_4__["alwaysRender"])(),
        Object(_decorators_inject__WEBPACK_IMPORTED_MODULE_2__["inject"])({ name, getProperties })
    ], WidgetContainer);
    return WidgetContainer;
}
/* harmony default export */ __webpack_exports__["default"] = (Container);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Injector.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/Injector.mjs ***!
  \***************************************************************/
/*! exports provided: Injector, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Injector", function() { return Injector; });
/* harmony import */ var _core_Evented__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");

class Injector extends _core_Evented__WEBPACK_IMPORTED_MODULE_0__["Evented"] {
    constructor(payload) {
        super();
        this._payload = payload;
    }
    setInvalidator(invalidator) {
        this._invalidator = invalidator;
    }
    get() {
        return this._payload;
    }
    set(payload) {
        this._payload = payload;
        if (this._invalidator) {
            this._invalidator();
        }
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Injector);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/NodeHandler.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/NodeHandler.mjs ***!
  \******************************************************************/
/*! exports provided: NodeEventType, NodeHandler, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NodeEventType", function() { return NodeEventType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NodeHandler", function() { return NodeHandler; });
/* harmony import */ var _core_Evented__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");


/**
 * Enum to identify the type of event.
 * Listening to 'Projector' will notify when projector is created or updated
 * Listening to 'Widget' will notify when widget root is created or updated
 */
var NodeEventType;
(function (NodeEventType) {
    NodeEventType["Projector"] = "Projector";
    NodeEventType["Widget"] = "Widget";
})(NodeEventType || (NodeEventType = {}));
class NodeHandler extends _core_Evented__WEBPACK_IMPORTED_MODULE_0__["Evented"] {
    constructor() {
        super(...arguments);
        this._nodeMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_1__["default"]();
    }
    get(key) {
        return this._nodeMap.get(key);
    }
    has(key) {
        return this._nodeMap.has(key);
    }
    add(element, key) {
        this._nodeMap.set(key, element);
        this.emit({ type: key });
    }
    addRoot() {
        this.emit({ type: NodeEventType.Widget });
    }
    addProjector() {
        this.emit({ type: NodeEventType.Projector });
    }
    clear() {
        this._nodeMap.clear();
    }
}
/* harmony default export */ __webpack_exports__["default"] = (NodeHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Registry.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/Registry.mjs ***!
  \***************************************************************/
/*! exports provided: WIDGET_BASE_TYPE, isWidgetBaseConstructor, isWidgetConstructorDefaultExport, Registry, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WIDGET_BASE_TYPE", function() { return WIDGET_BASE_TYPE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWidgetBaseConstructor", function() { return isWidgetBaseConstructor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWidgetConstructorDefaultExport", function() { return isWidgetConstructorDefaultExport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Registry", function() { return Registry; });
/* harmony import */ var _shim_Promise__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Promise */ "./node_modules/@dojo/framework/shim/Promise.mjs?c788");
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _core_Evented__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");



/**
 * Widget base type
 */
const WIDGET_BASE_TYPE = '__widget_base_type';
/**
 * Checks is the item is a subclass of WidgetBase (or a WidgetBase)
 *
 * @param item the item to check
 * @returns true/false indicating if the item is a WidgetBaseConstructor
 */
function isWidgetBaseConstructor(item) {
    return Boolean(item && item._type === WIDGET_BASE_TYPE);
}
function isWidgetConstructorDefaultExport(item) {
    return Boolean(item &&
        item.hasOwnProperty('__esModule') &&
        item.hasOwnProperty('default') &&
        isWidgetBaseConstructor(item.default));
}
/**
 * The Registry implementation
 */
class Registry extends _core_Evented__WEBPACK_IMPORTED_MODULE_2__["Evented"] {
    /**
     * Emit loaded event for registry label
     */
    emitLoadedEvent(widgetLabel, item) {
        this.emit({
            type: widgetLabel,
            action: 'loaded',
            item
        });
    }
    define(label, item) {
        if (this._widgetRegistry === undefined) {
            this._widgetRegistry = new _shim_Map__WEBPACK_IMPORTED_MODULE_1__["default"]();
        }
        if (this._widgetRegistry.has(label)) {
            throw new Error(`widget has already been registered for '${label.toString()}'`);
        }
        this._widgetRegistry.set(label, item);
        if (item instanceof _shim_Promise__WEBPACK_IMPORTED_MODULE_0__["default"]) {
            item.then((widgetCtor) => {
                this._widgetRegistry.set(label, widgetCtor);
                this.emitLoadedEvent(label, widgetCtor);
                return widgetCtor;
            }, (error) => {
                throw error;
            });
        }
        else if (isWidgetBaseConstructor(item)) {
            this.emitLoadedEvent(label, item);
        }
    }
    defineInjector(label, injectorFactory) {
        if (this._injectorRegistry === undefined) {
            this._injectorRegistry = new _shim_Map__WEBPACK_IMPORTED_MODULE_1__["default"]();
        }
        if (this._injectorRegistry.has(label)) {
            throw new Error(`injector has already been registered for '${label.toString()}'`);
        }
        const invalidator = new _core_Evented__WEBPACK_IMPORTED_MODULE_2__["Evented"]();
        const injectorItem = {
            injector: injectorFactory(() => invalidator.emit({ type: 'invalidate' })),
            invalidator
        };
        this._injectorRegistry.set(label, injectorItem);
        this.emitLoadedEvent(label, injectorItem);
    }
    get(label) {
        if (!this._widgetRegistry || !this.has(label)) {
            return null;
        }
        const item = this._widgetRegistry.get(label);
        if (isWidgetBaseConstructor(item)) {
            return item;
        }
        if (item instanceof _shim_Promise__WEBPACK_IMPORTED_MODULE_0__["default"]) {
            return null;
        }
        const promise = item();
        this._widgetRegistry.set(label, promise);
        promise.then((widgetCtor) => {
            if (isWidgetConstructorDefaultExport(widgetCtor)) {
                widgetCtor = widgetCtor.default;
            }
            this._widgetRegistry.set(label, widgetCtor);
            this.emitLoadedEvent(label, widgetCtor);
            return widgetCtor;
        }, (error) => {
            throw error;
        });
        return null;
    }
    getInjector(label) {
        if (!this._injectorRegistry || !this.hasInjector(label)) {
            return null;
        }
        return this._injectorRegistry.get(label);
    }
    has(label) {
        return Boolean(this._widgetRegistry && this._widgetRegistry.has(label));
    }
    hasInjector(label) {
        return Boolean(this._injectorRegistry && this._injectorRegistry.has(label));
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Registry);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs":
/*!**********************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs ***!
  \**********************************************************************/
/*! exports provided: RegistryHandler, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegistryHandler", function() { return RegistryHandler; });
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _core_Evented__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Evented */ "./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var _Registry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");



class RegistryHandler extends _core_Evented__WEBPACK_IMPORTED_MODULE_1__["Evented"] {
    constructor() {
        super();
        this._registry = new _Registry__WEBPACK_IMPORTED_MODULE_2__["Registry"]();
        this._registryWidgetLabelMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["Map"]();
        this._registryInjectorLabelMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["Map"]();
        this.own(this._registry);
        const destroy = () => {
            if (this.baseRegistry) {
                this._registryWidgetLabelMap.delete(this.baseRegistry);
                this._registryInjectorLabelMap.delete(this.baseRegistry);
                this.baseRegistry = undefined;
            }
        };
        this.own({ destroy });
    }
    set base(baseRegistry) {
        if (this.baseRegistry) {
            this._registryWidgetLabelMap.delete(this.baseRegistry);
            this._registryInjectorLabelMap.delete(this.baseRegistry);
        }
        this.baseRegistry = baseRegistry;
    }
    define(label, widget) {
        this._registry.define(label, widget);
    }
    defineInjector(label, injector) {
        this._registry.defineInjector(label, injector);
    }
    has(label) {
        return this._registry.has(label) || Boolean(this.baseRegistry && this.baseRegistry.has(label));
    }
    hasInjector(label) {
        return this._registry.hasInjector(label) || Boolean(this.baseRegistry && this.baseRegistry.hasInjector(label));
    }
    get(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'get', this._registryWidgetLabelMap);
    }
    getInjector(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'getInjector', this._registryInjectorLabelMap);
    }
    _get(label, globalPrecedence, getFunctionName, labelMap) {
        const registries = globalPrecedence ? [this.baseRegistry, this._registry] : [this._registry, this.baseRegistry];
        for (let i = 0; i < registries.length; i++) {
            const registry = registries[i];
            if (!registry) {
                continue;
            }
            const item = registry[getFunctionName](label);
            const registeredLabels = labelMap.get(registry) || [];
            if (item) {
                return item;
            }
            else if (registeredLabels.indexOf(label) === -1) {
                const handle = registry.on(label, (event) => {
                    if (event.action === 'loaded' &&
                        this[getFunctionName](label, globalPrecedence) === event.item) {
                        this.emit({ type: 'invalidate' });
                    }
                });
                this.own(handle);
                labelMap.set(registry, [...registeredLabels, label]);
            }
        }
        return null;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (RegistryHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/WidgetBase.mjs ***!
  \*****************************************************************/
/*! exports provided: widgetInstanceMap, noBind, WidgetBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "widgetInstanceMap", function() { return widgetInstanceMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noBind", function() { return noBind; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WidgetBase", function() { return WidgetBase; });
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shim/WeakMap */ "./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var _d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _diff__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var _RegistryHandler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./RegistryHandler */ "./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs");
/* harmony import */ var _NodeHandler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./NodeHandler */ "./node_modules/@dojo/framework/widget-core/NodeHandler.mjs");
/* harmony import */ var _Registry__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");







let lazyWidgetId = 0;
const lazyWidgetIdMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__["default"]();
const decoratorMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__["default"]();
const builtDecoratorMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__["default"]();
const widgetInstanceMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__["default"]();
const boundAuto = _diff__WEBPACK_IMPORTED_MODULE_3__["auto"].bind(null);
const noBind = '__dojo_no_bind';
function toTextVNode(data) {
    return {
        tag: '',
        properties: {},
        children: undefined,
        text: `${data}`,
        type: _d__WEBPACK_IMPORTED_MODULE_2__["VNODE"]
    };
}
function isLazyDefine(item) {
    return Boolean(item && item.label);
}
function isDomMeta(meta) {
    return Boolean(meta.afterRender);
}
/**
 * Main widget base for all widgets to extend
 */
class WidgetBase {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Indicates if it is the initial set properties cycle
         */
        this._initialProperties = true;
        /**
         * Array of property keys considered changed from the previous set properties
         */
        this._changedPropertyKeys = [];
        this._nodeHandler = new _NodeHandler__WEBPACK_IMPORTED_MODULE_5__["default"]();
        this._handles = [];
        this._children = [];
        this._decoratorCache = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this._properties = {};
        this._boundRenderFunc = this.render.bind(this);
        this._boundInvalidate = this.invalidate.bind(this);
        widgetInstanceMap.set(this, {
            dirty: true,
            onAttach: () => {
                this.onAttach();
            },
            onDetach: () => {
                this.onDetach();
                this.destroy();
            },
            nodeHandler: this._nodeHandler,
            rendering: false,
            inputProperties: {}
        });
        this.own({
            destroy: () => {
                widgetInstanceMap.delete(this);
                this._nodeHandler.clear();
                this._nodeHandler.destroy();
            }
        });
        this._runAfterConstructors();
    }
    meta(MetaType) {
        if (this._metaMap === undefined) {
            this._metaMap = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
        }
        let cached = this._metaMap.get(MetaType);
        if (!cached) {
            cached = new MetaType({
                invalidate: this._boundInvalidate,
                nodeHandler: this._nodeHandler,
                bind: this
            });
            this.own(cached);
            this._metaMap.set(MetaType, cached);
        }
        return cached;
    }
    onAttach() {
        // Do nothing by default.
    }
    onDetach() {
        // Do nothing by default.
    }
    get properties() {
        return this._properties;
    }
    get changedPropertyKeys() {
        return [...this._changedPropertyKeys];
    }
    __setProperties__(originalProperties, bind) {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.inputProperties = originalProperties;
        }
        const properties = this._runBeforeProperties(originalProperties);
        const registeredDiffPropertyNames = this.getDecorator('registeredDiffProperty');
        const changedPropertyKeys = [];
        const propertyNames = Object.keys(properties);
        if (this._initialProperties === false || registeredDiffPropertyNames.length !== 0) {
            const allProperties = [...propertyNames, ...Object.keys(this._properties)];
            const checkedProperties = [];
            const diffPropertyResults = {};
            let runReactions = false;
            for (let i = 0; i < allProperties.length; i++) {
                const propertyName = allProperties[i];
                if (checkedProperties.indexOf(propertyName) !== -1) {
                    continue;
                }
                checkedProperties.push(propertyName);
                const previousProperty = this._properties[propertyName];
                const newProperty = this._bindFunctionProperty(properties[propertyName], bind);
                if (registeredDiffPropertyNames.indexOf(propertyName) !== -1) {
                    runReactions = true;
                    const diffFunctions = this.getDecorator(`diffProperty:${propertyName}`);
                    for (let i = 0; i < diffFunctions.length; i++) {
                        const result = diffFunctions[i](previousProperty, newProperty);
                        if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                            changedPropertyKeys.push(propertyName);
                        }
                        if (propertyName in properties) {
                            diffPropertyResults[propertyName] = result.value;
                        }
                    }
                }
                else {
                    const result = boundAuto(previousProperty, newProperty);
                    if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                        changedPropertyKeys.push(propertyName);
                    }
                    if (propertyName in properties) {
                        diffPropertyResults[propertyName] = result.value;
                    }
                }
            }
            if (runReactions) {
                const reactionFunctions = this.getDecorator('diffReaction');
                const executedReactions = [];
                reactionFunctions.forEach(({ reaction, propertyName }) => {
                    const propertyChanged = changedPropertyKeys.indexOf(propertyName) !== -1;
                    const reactionRun = executedReactions.indexOf(reaction) !== -1;
                    if (propertyChanged && !reactionRun) {
                        reaction.call(this, this._properties, diffPropertyResults);
                        executedReactions.push(reaction);
                    }
                });
            }
            this._properties = diffPropertyResults;
            this._changedPropertyKeys = changedPropertyKeys;
        }
        else {
            this._initialProperties = false;
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (typeof properties[propertyName] === 'function') {
                    properties[propertyName] = this._bindFunctionProperty(properties[propertyName], bind);
                }
                else {
                    changedPropertyKeys.push(propertyName);
                }
            }
            this._changedPropertyKeys = changedPropertyKeys;
            this._properties = Object.assign({}, properties);
        }
        if (this._changedPropertyKeys.length > 0) {
            this.invalidate();
        }
    }
    get children() {
        return this._children;
    }
    __setChildren__(children) {
        if (this._children.length > 0 || children.length > 0) {
            this._children = children;
            this.invalidate();
        }
    }
    _filterAndConvert(nodes) {
        const isArray = Array.isArray(nodes);
        const filteredNodes = Array.isArray(nodes) ? nodes : [nodes];
        const convertedNodes = [];
        for (let i = 0; i < filteredNodes.length; i++) {
            const node = filteredNodes[i];
            if (!node || node === true) {
                continue;
            }
            if (typeof node === 'string') {
                convertedNodes.push(toTextVNode(node));
                continue;
            }
            if (Object(_d__WEBPACK_IMPORTED_MODULE_2__["isVNode"])(node) && node.deferredPropertiesCallback) {
                const properties = node.deferredPropertiesCallback(false);
                node.originalProperties = node.properties;
                node.properties = Object.assign({}, properties, node.properties);
            }
            if (Object(_d__WEBPACK_IMPORTED_MODULE_2__["isWNode"])(node) && !Object(_Registry__WEBPACK_IMPORTED_MODULE_6__["isWidgetBaseConstructor"])(node.widgetConstructor)) {
                if (typeof node.widgetConstructor === 'function') {
                    let id = lazyWidgetIdMap.get(node.widgetConstructor);
                    if (!id) {
                        id = `__lazy_widget_${lazyWidgetId++}`;
                        lazyWidgetIdMap.set(node.widgetConstructor, id);
                        this.registry.define(id, node.widgetConstructor);
                    }
                    node.widgetConstructor = id;
                }
                else if (isLazyDefine(node.widgetConstructor)) {
                    const { label, registryItem } = node.widgetConstructor;
                    if (!this.registry.has(label)) {
                        this.registry.define(label, registryItem);
                    }
                    node.widgetConstructor = label;
                }
                node.widgetConstructor =
                    this.registry.get(node.widgetConstructor) || node.widgetConstructor;
            }
            if (!node.bind) {
                node.bind = this;
            }
            convertedNodes.push(node);
            if (node.children && node.children.length) {
                node.children = this._filterAndConvert(node.children);
            }
        }
        return isArray ? convertedNodes : convertedNodes[0];
    }
    __render__() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.dirty = false;
        }
        const render = this._runBeforeRenders();
        const dNode = this._filterAndConvert(this._runAfterRenders(render()));
        this._nodeHandler.clear();
        return dNode;
    }
    invalidate() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData && instanceData.invalidate) {
            instanceData.invalidate();
        }
    }
    render() {
        return Object(_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', {}, this.children);
    }
    /**
     * Function to add decorators to WidgetBase
     *
     * @param decoratorKey The key of the decorator
     * @param value The value of the decorator
     */
    addDecorator(decoratorKey, value) {
        value = Array.isArray(value) ? value : [value];
        if (this.hasOwnProperty('constructor')) {
            let decoratorList = decoratorMap.get(this.constructor);
            if (!decoratorList) {
                decoratorList = new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
                decoratorMap.set(this.constructor, decoratorList);
            }
            let specificDecoratorList = decoratorList.get(decoratorKey);
            if (!specificDecoratorList) {
                specificDecoratorList = [];
                decoratorList.set(decoratorKey, specificDecoratorList);
            }
            specificDecoratorList.push(...value);
        }
        else {
            const decorators = this.getDecorator(decoratorKey);
            this._decoratorCache.set(decoratorKey, [...decorators, ...value]);
        }
    }
    /**
     * Function to build the list of decorators from the global decorator map.
     *
     * @param decoratorKey  The key of the decorator
     * @return An array of decorator values
     * @private
     */
    _buildDecoratorList(decoratorKey) {
        const allDecorators = [];
        let constructor = this.constructor;
        while (constructor) {
            const instanceMap = decoratorMap.get(constructor);
            if (instanceMap) {
                const decorators = instanceMap.get(decoratorKey);
                if (decorators) {
                    allDecorators.unshift(...decorators);
                }
            }
            constructor = Object.getPrototypeOf(constructor);
        }
        const buildDecorators = builtDecoratorMap.get(this.constructor) || new _shim_Map__WEBPACK_IMPORTED_MODULE_0__["default"]();
        buildDecorators.set(decoratorKey, allDecorators);
        builtDecoratorMap.set(this.constructor, buildDecorators);
        return allDecorators;
    }
    /**
     * Function to retrieve decorator values
     *
     * @param decoratorKey The key of the decorator
     * @returns An array of decorator values
     */
    getDecorator(decoratorKey) {
        let decoratorCache = builtDecoratorMap.get(this.constructor);
        let allDecorators = this._decoratorCache.get(decoratorKey) || (decoratorCache && decoratorCache.get(decoratorKey));
        if (allDecorators !== undefined) {
            return allDecorators;
        }
        allDecorators = this._buildDecoratorList(decoratorKey);
        allDecorators = [...allDecorators];
        this._decoratorCache.set(decoratorKey, allDecorators);
        return allDecorators;
    }
    /**
     * Binds unbound property functions to the specified `bind` property
     *
     * @param properties properties to check for functions
     */
    _bindFunctionProperty(property, bind) {
        if (typeof property === 'function' && !property[noBind] && Object(_Registry__WEBPACK_IMPORTED_MODULE_6__["isWidgetBaseConstructor"])(property) === false) {
            if (this._bindFunctionPropertyMap === undefined) {
                this._bindFunctionPropertyMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_1__["default"]();
            }
            const bindInfo = this._bindFunctionPropertyMap.get(property) || {};
            let { boundFunc, scope } = bindInfo;
            if (boundFunc === undefined || scope !== bind) {
                boundFunc = property.bind(bind);
                this._bindFunctionPropertyMap.set(property, { boundFunc, scope: bind });
            }
            return boundFunc;
        }
        return property;
    }
    get registry() {
        if (this._registry === undefined) {
            this._registry = new _RegistryHandler__WEBPACK_IMPORTED_MODULE_4__["default"]();
            this.own(this._registry);
            this.own(this._registry.on('invalidate', this._boundInvalidate));
        }
        return this._registry;
    }
    _runBeforeProperties(properties) {
        const beforeProperties = this.getDecorator('beforeProperties');
        if (beforeProperties.length > 0) {
            return beforeProperties.reduce((properties, beforePropertiesFunction) => {
                return Object.assign({}, properties, beforePropertiesFunction.call(this, properties));
            }, Object.assign({}, properties));
        }
        return properties;
    }
    /**
     * Run all registered before renders and return the updated render method
     */
    _runBeforeRenders() {
        const beforeRenders = this.getDecorator('beforeRender');
        if (beforeRenders.length > 0) {
            return beforeRenders.reduce((render, beforeRenderFunction) => {
                const updatedRender = beforeRenderFunction.call(this, render, this._properties, this._children);
                if (!updatedRender) {
                    console.warn('Render function not returned from beforeRender, using previous render');
                    return render;
                }
                return updatedRender;
            }, this._boundRenderFunc);
        }
        return this._boundRenderFunc;
    }
    /**
     * Run all registered after renders and return the decorated DNodes
     *
     * @param dNode The DNodes to run through the after renders
     */
    _runAfterRenders(dNode) {
        const afterRenders = this.getDecorator('afterRender');
        if (afterRenders.length > 0) {
            dNode = afterRenders.reduce((dNode, afterRenderFunction) => {
                return afterRenderFunction.call(this, dNode);
            }, dNode);
        }
        if (this._metaMap !== undefined) {
            this._metaMap.forEach((meta) => {
                isDomMeta(meta) && meta.afterRender();
            });
        }
        return dNode;
    }
    _runAfterConstructors() {
        const afterConstructors = this.getDecorator('afterConstructor');
        if (afterConstructors.length > 0) {
            afterConstructors.forEach((afterConstructor) => afterConstructor.call(this));
        }
    }
    own(handle) {
        this._handles.push(handle);
    }
    destroy() {
        while (this._handles.length > 0) {
            const handle = this._handles.pop();
            if (handle) {
                handle.destroy();
            }
        }
    }
}
/**
 * static identifier
 */
WidgetBase._type = _Registry__WEBPACK_IMPORTED_MODULE_6__["WIDGET_BASE_TYPE"];
/* harmony default export */ __webpack_exports__["default"] = (WidgetBase);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs":
/*!********************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
let browserSpecificTransitionEndEventName = '';
let browserSpecificAnimationEndEventName = '';
function determineBrowserStyleNames(element) {
    if ('WebkitTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
        browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
    }
    else if ('transition' in element.style || 'MozTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'transitionend';
        browserSpecificAnimationEndEventName = 'animationend';
    }
    else {
        throw new Error('Your browser is not supported');
    }
}
function initialize(element) {
    if (browserSpecificAnimationEndEventName === '') {
        determineBrowserStyleNames(element);
    }
}
function runAndCleanUp(element, startAnimation, finishAnimation) {
    initialize(element);
    let finished = false;
    let transitionEnd = function () {
        if (!finished) {
            finished = true;
            element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
            finishAnimation();
        }
    };
    startAnimation();
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
}
function exit(node, properties, exitAnimation, removeNode) {
    const activeClass = properties.exitAnimationActive || `${exitAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(exitAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        removeNode();
    });
}
function enter(node, properties, enterAnimation) {
    const activeClass = properties.enterAnimationActive || `${enterAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(enterAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        node.classList.remove(enterAnimation);
        node.classList.remove(activeClass);
    });
}
/* harmony default export */ __webpack_exports__["default"] = ({
    enter,
    exit
});


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/d.mjs":
/*!********************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/d.mjs ***!
  \********************************************************/
/*! exports provided: WNODE, VNODE, DOMVNODE, isWNode, isVNode, isDomVNode, isElementNode, decorate, w, v, dom */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WNODE", function() { return WNODE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VNODE", function() { return VNODE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DOMVNODE", function() { return DOMVNODE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWNode", function() { return isWNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVNode", function() { return isVNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDomVNode", function() { return isDomVNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isElementNode", function() { return isElementNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decorate", function() { return decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dom", function() { return dom; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);

/**
 * The identifier for a WNode type
 */
const WNODE = '__WNODE_TYPE';
/**
 * The identifier for a VNode type
 */
const VNODE = '__VNODE_TYPE';
/**
 * The identifier for a VNode type created using dom()
 */
const DOMVNODE = '__DOMVNODE_TYPE';
/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
function isWNode(child) {
    return Boolean(child && child !== true && typeof child !== 'string' && child.type === WNODE);
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
function isVNode(child) {
    return Boolean(child && child !== true && typeof child !== 'string' && (child.type === VNODE || child.type === DOMVNODE));
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` created with `dom()` using the `type` property
 */
function isDomVNode(child) {
    return Boolean(child && child !== true && typeof child !== 'string' && child.type === DOMVNODE);
}
function isElementNode(value) {
    return !!value.tagName;
}
function decorate(dNodes, optionsOrModifier, predicate) {
    let shallow = false;
    let modifier;
    if (typeof optionsOrModifier === 'function') {
        modifier = optionsOrModifier;
    }
    else {
        modifier = optionsOrModifier.modifier;
        predicate = optionsOrModifier.predicate;
        shallow = optionsOrModifier.shallow || false;
    }
    let nodes = Array.isArray(dNodes) ? [...dNodes] : [dNodes];
    function breaker() {
        nodes = [];
    }
    while (nodes.length) {
        const node = nodes.shift();
        if (node && node !== true) {
            if (!shallow && (isWNode(node) || isVNode(node)) && node.children) {
                nodes = [...nodes, ...node.children];
            }
            if (!predicate || predicate(node)) {
                modifier(node, breaker);
            }
        }
    }
    return dNodes;
}
function w(widgetConstructorOrNode, properties, children) {
    if (isWNode(widgetConstructorOrNode)) {
        properties = Object.assign({}, widgetConstructorOrNode.properties, properties);
        children = children ? children : widgetConstructorOrNode.children;
        widgetConstructorOrNode = widgetConstructorOrNode.widgetConstructor;
    }
    return {
        children: children || [],
        widgetConstructor: widgetConstructorOrNode,
        properties,
        type: WNODE
    };
}
function v(tag, propertiesOrChildren = {}, children = undefined) {
    let properties = propertiesOrChildren;
    let deferredPropertiesCallback;
    if (Array.isArray(propertiesOrChildren)) {
        children = propertiesOrChildren;
        properties = {};
    }
    if (typeof properties === 'function') {
        deferredPropertiesCallback = properties;
        properties = {};
    }
    if (isVNode(tag)) {
        let { classes = [], styles = {} } = properties, newProperties = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](properties, ["classes", "styles"]);
        let _a = tag.properties, { classes: nodeClasses = [], styles: nodeStyles = {} } = _a, nodeProperties = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["classes", "styles"]);
        nodeClasses = Array.isArray(nodeClasses) ? nodeClasses : [nodeClasses];
        classes = Array.isArray(classes) ? classes : [classes];
        styles = Object.assign({}, nodeStyles, styles);
        properties = Object.assign({}, nodeProperties, newProperties, { classes: [...nodeClasses, ...classes], styles });
        children = children ? children : tag.children;
        tag = tag.tag;
    }
    return {
        tag,
        deferredPropertiesCallback,
        originalProperties: {},
        children,
        properties,
        type: VNODE
    };
}
/**
 * Create a VNode for an existing DOM Node.
 */
function dom({ node, attrs = {}, props = {}, on = {}, diffType = 'none', onAttach }, children) {
    return {
        tag: isElementNode(node) ? node.tagName.toLowerCase() : '',
        properties: props,
        attributes: attrs,
        events: on,
        children,
        type: DOMVNODE,
        domNode: node,
        text: isElementNode(node) ? undefined : node.data,
        diffType,
        onAttach
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/afterRender.mjs":
/*!*****************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/afterRender.mjs ***!
  \*****************************************************************************/
/*! exports provided: afterRender, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "afterRender", function() { return afterRender; });
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function afterRender(method) {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_0__["handleDecorator"])((target, propertyKey) => {
        target.addDecorator('afterRender', propertyKey ? target[propertyKey] : method);
    });
}
/* harmony default export */ __webpack_exports__["default"] = (afterRender);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs":
/*!******************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs ***!
  \******************************************************************************/
/*! exports provided: alwaysRender, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "alwaysRender", function() { return alwaysRender; });
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var _beforeProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./beforeProperties */ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");


function alwaysRender() {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_0__["handleDecorator"])((target, propertyKey) => {
        Object(_beforeProperties__WEBPACK_IMPORTED_MODULE_1__["beforeProperties"])(function () {
            this.invalidate();
        })(target);
    });
}
/* harmony default export */ __webpack_exports__["default"] = (alwaysRender);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs":
/*!**********************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs ***!
  \**********************************************************************************/
/*! exports provided: beforeProperties, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "beforeProperties", function() { return beforeProperties; });
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function beforeProperties(method) {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_0__["handleDecorator"])((target, propertyKey) => {
        target.addDecorator('beforeProperties', propertyKey ? target[propertyKey] : method);
    });
}
/* harmony default export */ __webpack_exports__["default"] = (beforeProperties);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs":
/*!*******************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs ***!
  \*******************************************************************************/
/*! exports provided: customElement, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "customElement", function() { return customElement; });
/* harmony import */ var _registerCustomElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../registerCustomElement */ "./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs");
/* harmony import */ var _Registry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");


/**
 * This Decorator is provided properties that define the behavior of a custom element, and
 * registers that custom element.
 */
function customElement({ tag, properties = [], attributes = [], events = [], childType = _registerCustomElement__WEBPACK_IMPORTED_MODULE_0__["CustomElementChildType"].DOJO, registryFactory = () => new _Registry__WEBPACK_IMPORTED_MODULE_1__["default"]() }) {
    return function (target) {
        target.prototype.__customElementDescriptor = {
            tagName: tag,
            attributes,
            properties,
            events,
            childType,
            registryFactory
        };
    };
}
/* harmony default export */ __webpack_exports__["default"] = (customElement);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs":
/*!******************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs ***!
  \******************************************************************************/
/*! exports provided: diffProperty, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diffProperty", function() { return diffProperty; });
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var _diff__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");


/**
 * Decorator that can be used to register a function as a specific property diff
 *
 * @param propertyName  The name of the property of which the diff function is applied
 * @param diffType      The diff type, default is DiffType.AUTO.
 * @param diffFunction  A diff function to run if diffType if DiffType.CUSTOM
 */
function diffProperty(propertyName, diffFunction = _diff__WEBPACK_IMPORTED_MODULE_1__["auto"], reactionFunction) {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_0__["handleDecorator"])((target, propertyKey) => {
        target.addDecorator(`diffProperty:${propertyName}`, diffFunction.bind(null));
        target.addDecorator('registeredDiffProperty', propertyName);
        if (reactionFunction || propertyKey) {
            target.addDecorator('diffReaction', {
                propertyName,
                reaction: propertyKey ? target[propertyKey] : reactionFunction
            });
        }
    });
}
/* harmony default export */ __webpack_exports__["default"] = (diffProperty);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs ***!
  \*********************************************************************************/
/*! exports provided: handleDecorator, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleDecorator", function() { return handleDecorator; });
/**
 * Generic decorator handler to take care of whether or not the decorator was called at the class level
 * or the method level.
 *
 * @param handler
 */
function handleDecorator(handler) {
    return function (target, propertyKey, descriptor) {
        if (typeof target === 'function') {
            handler(target.prototype, undefined);
        }
        else {
            handler(target, propertyKey);
        }
    };
}
/* harmony default export */ __webpack_exports__["default"] = (handleDecorator);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs":
/*!************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/inject.mjs ***!
  \************************************************************************/
/*! exports provided: inject, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inject", function() { return inject; });
/* harmony import */ var _shim_WeakMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shim/WeakMap */ "./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var _beforeProperties__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./beforeProperties */ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");



/**
 * Map of instances against registered injectors.
 */
const registeredInjectorsMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_0__["default"]();
/**
 * Decorator retrieves an injector from an available registry using the name and
 * calls the `getProperties` function with the payload from the injector
 * and current properties with the the injected properties returned.
 *
 * @param InjectConfig the inject configuration
 */
function inject({ name, getProperties }) {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_1__["handleDecorator"])((target, propertyKey) => {
        Object(_beforeProperties__WEBPACK_IMPORTED_MODULE_2__["beforeProperties"])(function (properties) {
            const injectorItem = this.registry.getInjector(name);
            if (injectorItem) {
                const { injector, invalidator } = injectorItem;
                const registeredInjectors = registeredInjectorsMap.get(this) || [];
                if (registeredInjectors.length === 0) {
                    registeredInjectorsMap.set(this, registeredInjectors);
                }
                if (registeredInjectors.indexOf(injectorItem) === -1) {
                    this.own(invalidator.on('invalidate', () => {
                        this.invalidate();
                    }));
                    registeredInjectors.push(injectorItem);
                }
                return getProperties(injector(), properties);
            }
        })(target);
    });
}
/* harmony default export */ __webpack_exports__["default"] = (inject);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/watch.mjs":
/*!***********************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/decorators/watch.mjs ***!
  \***********************************************************************/
/*! exports provided: watch, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "watch", function() { return watch; });
/* harmony import */ var _handleDecorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function watch() {
    return Object(_handleDecorator__WEBPACK_IMPORTED_MODULE_0__["default"])((target, propertyKey) => {
        target.addDecorator('afterConstructor', function () {
            if (propertyKey) {
                let _value = this[propertyKey];
                Object.defineProperty(this, propertyKey, {
                    set(value) {
                        _value = value;
                        this.invalidate();
                    },
                    get() {
                        return _value;
                    }
                });
            }
        });
    });
}
/* harmony default export */ __webpack_exports__["default"] = (watch);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/diff.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/diff.mjs ***!
  \***********************************************************/
/*! exports provided: always, ignore, reference, shallow, auto */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "always", function() { return always; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ignore", function() { return ignore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reference", function() { return reference; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shallow", function() { return shallow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "auto", function() { return auto; });
/* harmony import */ var _Registry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");

function isObjectOrArray(value) {
    return Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value);
}
function always(previousProperty, newProperty) {
    return {
        changed: true,
        value: newProperty
    };
}
function ignore(previousProperty, newProperty) {
    return {
        changed: false,
        value: newProperty
    };
}
function reference(previousProperty, newProperty) {
    return {
        changed: previousProperty !== newProperty,
        value: newProperty
    };
}
function shallow(previousProperty, newProperty) {
    let changed = false;
    const validOldProperty = previousProperty && isObjectOrArray(previousProperty);
    const validNewProperty = newProperty && isObjectOrArray(newProperty);
    if (!validOldProperty || !validNewProperty) {
        return {
            changed: true,
            value: newProperty
        };
    }
    const previousKeys = Object.keys(previousProperty);
    const newKeys = Object.keys(newProperty);
    if (previousKeys.length !== newKeys.length) {
        changed = true;
    }
    else {
        changed = newKeys.some((key) => {
            return newProperty[key] !== previousProperty[key];
        });
    }
    return {
        changed,
        value: newProperty
    };
}
function auto(previousProperty, newProperty) {
    let result;
    if (typeof newProperty === 'function') {
        if (newProperty._type === _Registry__WEBPACK_IMPORTED_MODULE_0__["WIDGET_BASE_TYPE"]) {
            result = reference(previousProperty, newProperty);
        }
        else {
            result = ignore(previousProperty, newProperty);
        }
    }
    else if (isObjectOrArray(newProperty)) {
        result = shallow(previousProperty, newProperty);
    }
    else {
        result = reference(previousProperty, newProperty);
    }
    return result;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs":
/*!****************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/meta/Base.mjs ***!
  \****************************************************************/
/*! exports provided: Base, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Base", function() { return Base; });
/* harmony import */ var _core_Destroyable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Destroyable */ "./node_modules/@dojo/framework/core/Destroyable.mjs");
/* harmony import */ var _shim_Set__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shim/Set */ "./node_modules/@dojo/framework/shim/Set.mjs");


class Base extends _core_Destroyable__WEBPACK_IMPORTED_MODULE_0__["Destroyable"] {
    constructor(properties) {
        super();
        this._requestedNodeKeys = new _shim_Set__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this._invalidate = properties.invalidate;
        this.nodeHandler = properties.nodeHandler;
        if (properties.bind) {
            this._bind = properties.bind;
        }
    }
    has(key) {
        return this.nodeHandler.has(key);
    }
    getNode(key) {
        const stringKey = `${key}`;
        const node = this.nodeHandler.get(stringKey);
        if (!node && !this._requestedNodeKeys.has(stringKey)) {
            const handle = this.nodeHandler.on(stringKey, () => {
                handle.destroy();
                this._requestedNodeKeys.delete(stringKey);
                this.invalidate();
            });
            this.own(handle);
            this._requestedNodeKeys.add(stringKey);
        }
        return node;
    }
    invalidate() {
        this._invalidate();
    }
    afterRender() {
        // Do nothing by default.
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Base);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Dimensions.mjs":
/*!**********************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/meta/Dimensions.mjs ***!
  \**********************************************************************/
/*! exports provided: Dimensions, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Dimensions", function() { return Dimensions; });
/* harmony import */ var _Base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Base */ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var _core_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/util */ "./node_modules/@dojo/framework/core/util.mjs");


const defaultDimensions = {
    client: {
        height: 0,
        left: 0,
        top: 0,
        width: 0
    },
    offset: {
        height: 0,
        left: 0,
        top: 0,
        width: 0
    },
    position: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
    },
    scroll: {
        height: 0,
        left: 0,
        top: 0,
        width: 0
    },
    size: {
        width: 0,
        height: 0
    }
};
class Dimensions extends _Base__WEBPACK_IMPORTED_MODULE_0__["Base"] {
    get(key) {
        const node = this.getNode(key);
        if (!node) {
            return Object(_core_util__WEBPACK_IMPORTED_MODULE_1__["deepAssign"])({}, defaultDimensions);
        }
        const boundingDimensions = node.getBoundingClientRect();
        return {
            client: {
                height: node.clientHeight,
                left: node.clientLeft,
                top: node.clientTop,
                width: node.clientWidth
            },
            offset: {
                height: node.offsetHeight,
                left: node.offsetLeft,
                top: node.offsetTop,
                width: node.offsetWidth
            },
            position: {
                bottom: boundingDimensions.bottom,
                left: boundingDimensions.left,
                right: boundingDimensions.right,
                top: boundingDimensions.top
            },
            scroll: {
                height: node.scrollHeight,
                left: node.scrollLeft,
                top: node.scrollTop,
                width: node.scrollWidth
            },
            size: {
                width: boundingDimensions.width,
                height: boundingDimensions.height
            }
        };
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Dimensions);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Focus.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/meta/Focus.mjs ***!
  \*****************************************************************/
/*! exports provided: Focus, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Focus", function() { return Focus; });
/* harmony import */ var _Base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Base */ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var _shim_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");


const defaultResults = {
    active: false,
    containsFocus: false
};
class Focus extends _Base__WEBPACK_IMPORTED_MODULE_0__["Base"] {
    constructor() {
        super(...arguments);
        this._onFocusChange = () => {
            this._activeElement = _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.activeElement;
            this.invalidate();
        };
    }
    get(key) {
        const node = this.getNode(key);
        if (!node) {
            return Object.assign({}, defaultResults);
        }
        if (!this._activeElement) {
            this._activeElement = _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.activeElement;
            this._createListener();
        }
        return {
            active: node === this._activeElement,
            containsFocus: !!this._activeElement && node.contains(this._activeElement)
        };
    }
    set(key) {
        const node = this.getNode(key);
        node && node.focus();
    }
    _createListener() {
        _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.addEventListener('focusin', this._onFocusChange);
        _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.addEventListener('focusout', this._onFocusChange);
        this.own({
            destroy: () => {
                this._removeListener();
            }
        });
    }
    _removeListener() {
        _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.removeEventListener('focusin', this._onFocusChange);
        _shim_global__WEBPACK_IMPORTED_MODULE_1__["default"].document.removeEventListener('focusout', this._onFocusChange);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Focus);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs":
/*!*******************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs ***!
  \*******************************************************************/
/*! exports provided: FocusMixin, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FocusMixin", function() { return FocusMixin; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _decorators_diffProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");


function diffFocus(previousProperty, newProperty) {
    const result = newProperty && newProperty();
    return {
        changed: result,
        value: newProperty
    };
}
function FocusMixin(Base) {
    class Focus extends Base {
        constructor() {
            super(...arguments);
            this._currentToken = 0;
            this._previousToken = 0;
            this.shouldFocus = () => {
                const result = this._currentToken !== this._previousToken;
                this._previousToken = this._currentToken;
                return result;
            };
        }
        isFocusedReaction() {
            this._currentToken++;
        }
        focus() {
            this._currentToken++;
            this.invalidate();
        }
    }
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_1__["diffProperty"])('focus', diffFocus)
    ], Focus.prototype, "isFocusedReaction", null);
    return Focus;
}
/* harmony default export */ __webpack_exports__["default"] = (FocusMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs ***!
  \******************************************************************/
/*! exports provided: INJECTOR_KEY, registerI18nInjector, I18nMixin, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INJECTOR_KEY", function() { return INJECTOR_KEY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerI18nInjector", function() { return registerI18nInjector; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I18nMixin", function() { return I18nMixin; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _i18n_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../i18n/i18n */ "./node_modules/@dojo/framework/i18n/i18n.mjs");
/* harmony import */ var _shim_Map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shim/Map */ "./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var _d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _decorators_afterRender__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../decorators/afterRender */ "./node_modules/@dojo/framework/widget-core/decorators/afterRender.mjs");
/* harmony import */ var _decorators_inject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./../decorators/inject */ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var _Injector__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./../Injector */ "./node_modules/@dojo/framework/widget-core/Injector.mjs");

/* tslint:disable:interface-name */






const INJECTOR_KEY = '__i18n_injector';
function registerI18nInjector(localeData, registry) {
    const injector = new _Injector__WEBPACK_IMPORTED_MODULE_6__["Injector"](localeData);
    registry.defineInjector(INJECTOR_KEY, (invalidator) => {
        injector.setInvalidator(invalidator);
        return () => injector.get();
    });
    return injector;
}
function I18nMixin(Base) {
    let I18n = class I18n extends Base {
        /**
         * Return a localized messages object for the provided bundle, deferring to the `i18nBundle` property
         * when present. If the localized messages have not yet been loaded, return either a blank bundle or the
         * default messages.
         *
         * @param bundle
         * The bundle to localize
         *
         * @param useDefaults
         * If `true`, the default messages will be used when the localized messages have not yet been loaded. If `false`
         * (the default), then a blank bundle will be returned (i.e., each key's value will be an empty string).
         */
        localizeBundle(baseBundle, useDefaults = false) {
            const bundle = this._resolveBundle(baseBundle);
            const messages = this._getLocaleMessages(bundle);
            const isPlaceholder = !messages;
            const { locale } = this.properties;
            const format = isPlaceholder && !useDefaults
                ? (key, options) => ''
                : (key, options) => Object(_i18n_i18n__WEBPACK_IMPORTED_MODULE_1__["formatMessage"])(bundle, key, options, locale);
            return Object.create({
                format,
                isPlaceholder,
                messages: messages || (useDefaults ? bundle.messages : this._getBlankMessages(bundle))
            });
        }
        renderDecorator(result) {
            Object(_d__WEBPACK_IMPORTED_MODULE_3__["decorate"])(result, {
                modifier: (node, breaker) => {
                    const { locale, rtl } = this.properties;
                    const properties = {};
                    if (typeof rtl === 'boolean') {
                        properties['dir'] = rtl ? 'rtl' : 'ltr';
                    }
                    if (locale) {
                        properties['lang'] = locale;
                    }
                    node.properties = Object.assign({}, node.properties, properties);
                    breaker();
                },
                predicate: _d__WEBPACK_IMPORTED_MODULE_3__["isVNode"]
            });
            return result;
        }
        /**
         * @private
         * Return a message bundle containing an empty string for each key in the provided bundle.
         *
         * @param bundle
         * The message bundle
         *
         * @return
         * The blank message bundle
         */
        _getBlankMessages(bundle) {
            const blank = {};
            return Object.keys(bundle.messages).reduce((blank, key) => {
                blank[key] = '';
                return blank;
            }, blank);
        }
        /**
         * @private
         * Return the cached dictionary for the specified bundle and locale, if it exists. If the requested dictionary does not
         * exist, then load it and update the instance's state with the appropriate messages.
         *
         * @param bundle
         * The bundle for which to load a locale-specific dictionary.
         *
         * @return
         * The locale-specific dictionary, if it has already been loaded and cached.
         */
        _getLocaleMessages(bundle) {
            const { properties } = this;
            const locale = properties.locale || _i18n_i18n__WEBPACK_IMPORTED_MODULE_1__["default"].locale;
            const localeMessages = Object(_i18n_i18n__WEBPACK_IMPORTED_MODULE_1__["getCachedMessages"])(bundle, locale);
            if (localeMessages) {
                return localeMessages;
            }
            Object(_i18n_i18n__WEBPACK_IMPORTED_MODULE_1__["default"])(bundle, locale).then(() => {
                this.invalidate();
            });
        }
        /**
         * @private
         * Resolve the bundle to use for the widget's messages to either the provided bundle or to the
         * `i18nBundle` property.
         *
         * @param bundle
         * The base bundle
         *
         * @return
         * Either override bundle or the original bundle.
         */
        _resolveBundle(bundle) {
            let { i18nBundle } = this.properties;
            if (i18nBundle) {
                if (i18nBundle instanceof _shim_Map__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                    i18nBundle = i18nBundle.get(bundle);
                    if (!i18nBundle) {
                        return bundle;
                    }
                }
                return i18nBundle;
            }
            return bundle;
        }
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_afterRender__WEBPACK_IMPORTED_MODULE_4__["afterRender"])()
    ], I18n.prototype, "renderDecorator", null);
    I18n = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_inject__WEBPACK_IMPORTED_MODULE_5__["inject"])({
            name: INJECTOR_KEY,
            getProperties: (localeData, properties) => {
                const { locale = localeData.locale, rtl = localeData.rtl } = properties;
                return { locale, rtl };
            }
        })
    ], I18n);
    return I18n;
}
/* harmony default export */ __webpack_exports__["default"] = (I18nMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs":
/*!********************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs ***!
  \********************************************************************/
/*! exports provided: INJECTED_THEME_KEY, theme, registerThemeInjector, ThemedMixin, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INJECTED_THEME_KEY", function() { return INJECTED_THEME_KEY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "theme", function() { return theme; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerThemeInjector", function() { return registerThemeInjector; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedMixin", function() { return ThemedMixin; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Injector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../Injector */ "./node_modules/@dojo/framework/widget-core/Injector.mjs");
/* harmony import */ var _decorators_inject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../decorators/inject */ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var _decorators_handleDecorator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../decorators/handleDecorator */ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var _decorators_diffProperty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var _diff__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./../diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");






const THEME_KEY = ' _key';
const INJECTED_THEME_KEY = '__theme_injector';
/**
 * Decorator for base css classes
 */
function theme(theme) {
    return Object(_decorators_handleDecorator__WEBPACK_IMPORTED_MODULE_3__["handleDecorator"])((target) => {
        target.addDecorator('baseThemeClasses', theme);
    });
}
/**
 * Creates a reverse lookup for the classes passed in via the `theme` function.
 *
 * @param classes The baseClasses object
 * @requires
 */
function createThemeClassesLookup(classes) {
    return classes.reduce((currentClassNames, baseClass) => {
        Object.keys(baseClass).forEach((key) => {
            currentClassNames[baseClass[key]] = key;
        });
        return currentClassNames;
    }, {});
}
/**
 * Convenience function that is given a theme and an optional registry, the theme
 * injector is defined against the registry, returning the theme.
 *
 * @param theme the theme to set
 * @param themeRegistry registry to define the theme injector against. Defaults
 * to the global registry
 *
 * @returns the theme injector used to set the theme
 */
function registerThemeInjector(theme, themeRegistry) {
    const themeInjector = new _Injector__WEBPACK_IMPORTED_MODULE_1__["Injector"](theme);
    themeRegistry.defineInjector(INJECTED_THEME_KEY, (invalidator) => {
        themeInjector.setInvalidator(invalidator);
        return () => themeInjector.get();
    });
    return themeInjector;
}
/**
 * Function that returns a class decorated with with Themed functionality
 */
function ThemedMixin(Base) {
    let Themed = class Themed extends Base {
        constructor() {
            super(...arguments);
            /**
             * Registered base theme keys
             */
            this._registeredBaseThemeKeys = [];
            /**
             * Indicates if classes meta data need to be calculated.
             */
            this._recalculateClasses = true;
            /**
             * Loaded theme
             */
            this._theme = {};
        }
        theme(classes) {
            if (this._recalculateClasses) {
                this._recalculateThemeClasses();
            }
            if (Array.isArray(classes)) {
                return classes.map((className) => this._getThemeClass(className));
            }
            return this._getThemeClass(classes);
        }
        /**
         * Function fired when `theme` or `extraClasses` are changed.
         */
        onPropertiesChanged() {
            this._recalculateClasses = true;
        }
        _getThemeClass(className) {
            if (className === undefined || className === null || className === false || className === true) {
                return className;
            }
            const extraClasses = this.properties.extraClasses || {};
            const themeClassName = this._baseThemeClassesReverseLookup[className];
            let resultClassNames = [];
            if (!themeClassName) {
                console.warn(`Class name: '${className}' not found in theme`);
                return null;
            }
            if (this._classes) {
                const classes = Object.keys(this._classes).reduce((classes, key) => {
                    const classNames = Object.keys(this._classes[key]);
                    for (let i = 0; i < classNames.length; i++) {
                        const extraClass = this._classes[key][classNames[i]];
                        if (classNames[i] === themeClassName && extraClass) {
                            extraClass.forEach((className) => {
                                if (className && className !== true) {
                                    classes.push(className);
                                }
                            });
                            break;
                        }
                    }
                    return classes;
                }, []);
                resultClassNames.push(...classes);
            }
            if (extraClasses[themeClassName]) {
                resultClassNames.push(extraClasses[themeClassName]);
            }
            if (this._theme[themeClassName]) {
                resultClassNames.push(this._theme[themeClassName]);
            }
            else {
                resultClassNames.push(this._registeredBaseTheme[themeClassName]);
            }
            return resultClassNames.join(' ');
        }
        _recalculateThemeClasses() {
            const { theme = {}, classes = {} } = this.properties;
            if (!this._registeredBaseTheme) {
                const baseThemes = this.getDecorator('baseThemeClasses');
                if (baseThemes.length === 0) {
                    console.warn('A base theme has not been provided to this widget. Please use the @theme decorator to add a theme.');
                }
                this._registeredBaseTheme = baseThemes.reduce((finalBaseTheme, baseTheme) => {
                    const _a = THEME_KEY, key = baseTheme[_a], classes = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](baseTheme, [typeof _a === "symbol" ? _a : _a + ""]);
                    this._registeredBaseThemeKeys.push(key);
                    return Object.assign({}, finalBaseTheme, classes);
                }, {});
                this._baseThemeClassesReverseLookup = createThemeClassesLookup(baseThemes);
            }
            this._theme = this._registeredBaseThemeKeys.reduce((baseTheme, themeKey) => {
                return Object.assign({}, baseTheme, theme[themeKey]);
            }, {});
            this._classes = Object.keys(classes).reduce((computed, key) => {
                if (this._registeredBaseThemeKeys.indexOf(key) > -1) {
                    computed = Object.assign({}, computed, { [key]: classes[key] });
                }
                return computed;
            }, {});
            this._recalculateClasses = false;
        }
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_4__["diffProperty"])('theme', _diff__WEBPACK_IMPORTED_MODULE_5__["shallow"]),
        Object(_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_4__["diffProperty"])('extraClasses', _diff__WEBPACK_IMPORTED_MODULE_5__["shallow"]),
        Object(_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_4__["diffProperty"])('classes', _diff__WEBPACK_IMPORTED_MODULE_5__["shallow"])
    ], Themed.prototype, "onPropertiesChanged", null);
    Themed = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_inject__WEBPACK_IMPORTED_MODULE_2__["inject"])({
            name: INJECTED_THEME_KEY,
            getProperties: (theme, properties) => {
                if (!properties.theme) {
                    return { theme };
                }
                return {};
            }
        })
    ], Themed);
    return Themed;
}
/* harmony default export */ __webpack_exports__["default"] = (ThemedMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs":
/*!****************************************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs ***!
  \****************************************************************************/
/*! exports provided: CustomElementChildType, DomToWidgetWrapper, create, register, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomElementChildType", function() { return CustomElementChildType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomToWidgetWrapper", function() { return DomToWidgetWrapper; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _vdom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vdom */ "./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var _shim_array__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shim/array */ "./node_modules/@dojo/framework/shim/array.mjs");
/* harmony import */ var _d__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _shim_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _mixins_Themed__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./decorators/alwaysRender */ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");








var CustomElementChildType;
(function (CustomElementChildType) {
    CustomElementChildType["DOJO"] = "DOJO";
    CustomElementChildType["NODE"] = "NODE";
    CustomElementChildType["TEXT"] = "TEXT";
})(CustomElementChildType || (CustomElementChildType = {}));
function DomToWidgetWrapper(domNode) {
    let DomToWidgetWrapper = class DomToWidgetWrapper extends _WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"] {
        render() {
            const properties = Object.keys(this.properties).reduce((props, key) => {
                const value = this.properties[key];
                if (key.indexOf('on') === 0) {
                    key = `__${key}`;
                }
                props[key] = value;
                return props;
            }, {});
            return Object(_d__WEBPACK_IMPORTED_MODULE_4__["dom"])({ node: domNode, props: properties, diffType: 'dom' });
        }
        static get domNode() {
            return domNode;
        }
    };
    DomToWidgetWrapper = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_decorators_alwaysRender__WEBPACK_IMPORTED_MODULE_7__["alwaysRender"])()
    ], DomToWidgetWrapper);
    return DomToWidgetWrapper;
}
function create(descriptor, WidgetConstructor) {
    const { attributes, childType, registryFactory } = descriptor;
    const attributeMap = {};
    attributes.forEach((propertyName) => {
        const attributeName = propertyName.toLowerCase();
        attributeMap[attributeName] = propertyName;
    });
    return class extends HTMLElement {
        constructor() {
            super(...arguments);
            this._properties = {};
            this._children = [];
            this._eventProperties = {};
            this._initialised = false;
        }
        connectedCallback() {
            if (this._initialised) {
                return;
            }
            const domProperties = {};
            const { attributes, properties, events } = descriptor;
            this._properties = Object.assign({}, this._properties, this._attributesToProperties(attributes));
            [...attributes, ...properties].forEach((propertyName) => {
                const value = this[propertyName];
                const filteredPropertyName = propertyName.replace(/^on/, '__');
                if (value !== undefined) {
                    this._properties[propertyName] = value;
                }
                if (filteredPropertyName !== propertyName) {
                    domProperties[filteredPropertyName] = {
                        get: () => this._getProperty(propertyName),
                        set: (value) => this._setProperty(propertyName, value)
                    };
                }
                domProperties[propertyName] = {
                    get: () => this._getProperty(propertyName),
                    set: (value) => this._setProperty(propertyName, value)
                };
            });
            events.forEach((propertyName) => {
                const eventName = propertyName.replace(/^on/, '').toLowerCase();
                const filteredPropertyName = propertyName.replace(/^on/, '__on');
                domProperties[filteredPropertyName] = {
                    get: () => this._getEventProperty(propertyName),
                    set: (value) => this._setEventProperty(propertyName, value)
                };
                this._eventProperties[propertyName] = undefined;
                this._properties[propertyName] = (...args) => {
                    const eventCallback = this._getEventProperty(propertyName);
                    if (typeof eventCallback === 'function') {
                        eventCallback(...args);
                    }
                    this.dispatchEvent(new CustomEvent(eventName, {
                        bubbles: false,
                        detail: args
                    }));
                };
            });
            Object.defineProperties(this, domProperties);
            const children = childType === CustomElementChildType.TEXT ? this.childNodes : this.children;
            Object(_shim_array__WEBPACK_IMPORTED_MODULE_3__["from"])(children).forEach((childNode) => {
                if (childType === CustomElementChildType.DOJO) {
                    childNode.addEventListener('dojo-ce-render', () => this._render());
                    childNode.addEventListener('dojo-ce-connected', () => this._render());
                    this._children.push(DomToWidgetWrapper(childNode));
                }
                else {
                    this._children.push(Object(_d__WEBPACK_IMPORTED_MODULE_4__["dom"])({ node: childNode, diffType: 'dom' }));
                }
            });
            this.addEventListener('dojo-ce-connected', (e) => this._childConnected(e));
            const widgetProperties = this._properties;
            const renderChildren = () => this.__children__();
            const Wrapper = class extends _WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"] {
                render() {
                    return Object(_d__WEBPACK_IMPORTED_MODULE_4__["w"])(WidgetConstructor, widgetProperties, renderChildren());
                }
            };
            const registry = registryFactory();
            const themeContext = Object(_mixins_Themed__WEBPACK_IMPORTED_MODULE_6__["registerThemeInjector"])(this._getTheme(), registry);
            _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].addEventListener('dojo-theme-set', () => themeContext.set(this._getTheme()));
            const r = Object(_vdom__WEBPACK_IMPORTED_MODULE_2__["renderer"])(() => Object(_d__WEBPACK_IMPORTED_MODULE_4__["w"])(Wrapper, {}));
            this._renderer = r;
            r.mount({ domNode: this, merge: false, registry });
            const root = this.children[0];
            if (root) {
                const { display = 'block' } = _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].getComputedStyle(root);
                this.style.display = display;
            }
            this._initialised = true;
            this.dispatchEvent(new CustomEvent('dojo-ce-connected', {
                bubbles: true,
                detail: this
            }));
        }
        _getTheme() {
            if (_shim_global__WEBPACK_IMPORTED_MODULE_5__["default"] && _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].dojoce && _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].dojoce.theme) {
                return _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].dojoce.themes[_shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].dojoce.theme];
            }
        }
        _childConnected(e) {
            const node = e.detail;
            if (node.parentNode === this) {
                const exists = this._children.some((child) => child.domNode === node);
                if (!exists) {
                    node.addEventListener('dojo-ce-render', () => this._render());
                    this._children.push(DomToWidgetWrapper(node));
                    this._render();
                }
            }
        }
        _render() {
            if (this._renderer) {
                this._renderer.invalidate();
                this.dispatchEvent(new CustomEvent('dojo-ce-render', {
                    bubbles: false,
                    detail: this
                }));
            }
        }
        __properties__() {
            return Object.assign({}, this._properties, this._eventProperties);
        }
        __children__() {
            if (childType === CustomElementChildType.DOJO) {
                return this._children.filter((Child) => Child.domNode.isWidget).map((Child) => {
                    const { domNode } = Child;
                    return Object(_d__WEBPACK_IMPORTED_MODULE_4__["w"])(Child, Object.assign({}, domNode.__properties__()), [...domNode.__children__()]);
                });
            }
            else {
                return this._children;
            }
        }
        attributeChangedCallback(name, oldValue, value) {
            const propertyName = attributeMap[name];
            this._setProperty(propertyName, value);
        }
        _setEventProperty(propertyName, value) {
            this._eventProperties[propertyName] = value;
        }
        _getEventProperty(propertyName) {
            return this._eventProperties[propertyName];
        }
        _setProperty(propertyName, value) {
            if (typeof value === 'function') {
                value[_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["noBind"]] = true;
            }
            this._properties[propertyName] = value;
            this._render();
        }
        _getProperty(propertyName) {
            return this._properties[propertyName];
        }
        _attributesToProperties(attributes) {
            return attributes.reduce((properties, propertyName) => {
                const attributeName = propertyName.toLowerCase();
                const value = this.getAttribute(attributeName);
                if (value !== null) {
                    properties[propertyName] = value;
                }
                return properties;
            }, {});
        }
        static get observedAttributes() {
            return Object.keys(attributeMap);
        }
        get isWidget() {
            return true;
        }
    };
}
function register(WidgetConstructor) {
    const descriptor = WidgetConstructor.prototype && WidgetConstructor.prototype.__customElementDescriptor;
    if (!descriptor) {
        throw new Error('Cannot get descriptor for Custom Element, have you added the @customElement decorator to your Widget?');
    }
    _shim_global__WEBPACK_IMPORTED_MODULE_5__["default"].customElements.define(descriptor.tagName, create(descriptor, WidgetConstructor));
}
/* harmony default export */ __webpack_exports__["default"] = (register);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/vdom.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/framework/widget-core/vdom.mjs ***!
  \***********************************************************/
/*! exports provided: renderer, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renderer", function() { return renderer; });
/* harmony import */ var _shim_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _has_has__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../has/has */ "./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shim/WeakMap */ "./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var _animations_cssTransitions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./animations/cssTransitions */ "./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs");
/* harmony import */ var _d__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _Registry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var _WidgetBase__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");







const EMPTY_ARRAY = [];
const nodeOperations = ['focus', 'blur', 'scrollIntoView', 'click'];
const NAMESPACE_W3 = 'http://www.w3.org/';
const NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
const NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
function isWNodeWrapper(child) {
    return child && Object(_d__WEBPACK_IMPORTED_MODULE_4__["isWNode"])(child.node);
}
function isVNodeWrapper(child) {
    return !!child && Object(_d__WEBPACK_IMPORTED_MODULE_4__["isVNode"])(child.node);
}
function isAttachApplication(value) {
    return !!value.type;
}
function updateAttributes(domNode, previousAttributes, attributes, namespace) {
    const attrNames = Object.keys(attributes);
    const attrCount = attrNames.length;
    for (let i = 0; i < attrCount; i++) {
        const attrName = attrNames[i];
        const attrValue = attributes[attrName];
        const previousAttrValue = previousAttributes[attrName];
        if (attrValue !== previousAttrValue) {
            updateAttribute(domNode, attrName, attrValue, namespace);
        }
    }
}
function buildPreviousProperties(domNode, current, next) {
    const { node: { diffType, properties, attributes } } = current;
    if (!diffType || diffType === 'vdom') {
        return {
            properties: current.node.properties,
            attributes: current.node.attributes,
            events: current.node.events
        };
    }
    else if (diffType === 'none') {
        return { properties: {}, attributes: current.node.attributes ? {} : undefined, events: current.node.events };
    }
    let newProperties = {
        properties: {}
    };
    if (attributes) {
        newProperties.attributes = {};
        newProperties.events = current.node.events;
        Object.keys(properties).forEach((propName) => {
            newProperties.properties[propName] = domNode[propName];
        });
        Object.keys(attributes).forEach((attrName) => {
            newProperties.attributes[attrName] = domNode.getAttribute(attrName);
        });
        return newProperties;
    }
    newProperties.properties = Object.keys(properties).reduce((props, property) => {
        props[property] = domNode.getAttribute(property) || domNode[property];
        return props;
    }, {});
    return newProperties;
}
function checkDistinguishable(wrappers, index, parentWNodeWrapper) {
    const wrapperToCheck = wrappers[index];
    if (isVNodeWrapper(wrapperToCheck) && !wrapperToCheck.node.tag) {
        return;
    }
    const { key } = wrapperToCheck.node.properties;
    let parentName = 'unknown';
    if (parentWNodeWrapper) {
        const { node: { widgetConstructor } } = parentWNodeWrapper;
        parentName = widgetConstructor.name || 'unknown';
    }
    if (key === undefined || key === null) {
        for (let i = 0; i < wrappers.length; i++) {
            if (i !== index) {
                const wrapper = wrappers[i];
                if (same(wrapper, wrapperToCheck)) {
                    let nodeIdentifier;
                    if (isWNodeWrapper(wrapper)) {
                        nodeIdentifier = wrapper.node.widgetConstructor.name || 'unknown';
                    }
                    else {
                        nodeIdentifier = wrapper.node.tag;
                    }
                    console.warn(`A widget (${parentName}) has had a child added or removed, but they were not able to uniquely identified. It is recommended to provide a unique 'key' property when using the same widget or element (${nodeIdentifier}) multiple times as siblings`);
                    break;
                }
            }
        }
    }
}
function same(dnode1, dnode2) {
    if (isVNodeWrapper(dnode1) && isVNodeWrapper(dnode2)) {
        if (Object(_d__WEBPACK_IMPORTED_MODULE_4__["isDomVNode"])(dnode1.node) && Object(_d__WEBPACK_IMPORTED_MODULE_4__["isDomVNode"])(dnode2.node)) {
            if (dnode1.node.domNode !== dnode2.node.domNode) {
                return false;
            }
        }
        if (dnode1.node.tag !== dnode2.node.tag) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    else if (isWNodeWrapper(dnode1) && isWNodeWrapper(dnode2)) {
        if (dnode1.instance === undefined && typeof dnode2.node.widgetConstructor === 'string') {
            return false;
        }
        if (dnode1.node.widgetConstructor !== dnode2.node.widgetConstructor) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    return false;
}
function findIndexOfChild(children, sameAs, start) {
    for (let i = start; i < children.length; i++) {
        if (same(children[i], sameAs)) {
            return i;
        }
    }
    return -1;
}
function createClassPropValue(classes = []) {
    classes = Array.isArray(classes) ? classes : [classes];
    return classes
        .filter((className) => className && className !== true)
        .join(' ')
        .trim();
}
function updateAttribute(domNode, attrName, attrValue, namespace) {
    if (namespace === NAMESPACE_SVG && attrName === 'href' && attrValue) {
        domNode.setAttributeNS(NAMESPACE_XLINK, attrName, attrValue);
    }
    else if ((attrName === 'role' && attrValue === '') || attrValue === undefined) {
        domNode.removeAttribute(attrName);
    }
    else {
        domNode.setAttribute(attrName, attrValue);
    }
}
function runEnterAnimation(next, transitions) {
    const { domNode, node: { properties }, node: { properties: { enterAnimation } } } = next;
    if (enterAnimation && enterAnimation !== true) {
        if (typeof enterAnimation === 'function') {
            return enterAnimation(domNode, properties);
        }
        transitions.enter(domNode, properties, enterAnimation);
    }
}
function runExitAnimation(current, transitions, exitAnimation) {
    const { domNode, node: { properties } } = current;
    const removeDomNode = () => {
        domNode && domNode.parentNode && domNode.parentNode.removeChild(domNode);
        current.domNode = undefined;
    };
    if (typeof exitAnimation === 'function') {
        return exitAnimation(domNode, removeDomNode, properties);
    }
    transitions.exit(domNode, properties, exitAnimation, removeDomNode);
}
function arrayFrom(arr) {
    return Array.prototype.slice.call(arr);
}
function wrapNodes(renderer) {
    return class extends _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["WidgetBase"] {
        constructor() {
            super(...arguments);
            this.isWNodeWrapper = true;
        }
        render() {
            const result = renderer();
            this.isWNodeWrapper = Object(_d__WEBPACK_IMPORTED_MODULE_4__["isWNode"])(result);
            return result;
        }
    };
}
function renderer(renderer) {
    let _mountOptions = {
        sync: false,
        merge: true,
        transition: _animations_cssTransitions__WEBPACK_IMPORTED_MODULE_3__["default"],
        domNode: _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].document.body,
        registry: null
    };
    let _invalidationQueue = [];
    let _processQueue = [];
    let _applicationQueue = [];
    let _eventMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__["WeakMap"]();
    let _instanceToWrapperMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__["WeakMap"]();
    let _parentWrapperMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__["WeakMap"]();
    let _wrapperSiblingMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__["WeakMap"]();
    let _insertBeforeMap = new _shim_WeakMap__WEBPACK_IMPORTED_MODULE_2__["WeakMap"]();
    let _renderScheduled;
    let _afterRenderCallbacks = [];
    let _deferredRenderCallbacks = [];
    let parentInvalidate;
    let _allMergedNodes = [];
    function nodeOperation(propName, propValue, previousValue, domNode) {
        let result = propValue && !previousValue;
        if (typeof propValue === 'function') {
            result = propValue();
        }
        if (result === true) {
            _afterRenderCallbacks.push(() => {
                domNode[propName]();
            });
        }
    }
    function updateEvent(domNode, eventName, currentValue, bind, previousValue) {
        if (previousValue) {
            const previousEvent = _eventMap.get(previousValue);
            domNode.removeEventListener(eventName, previousEvent);
        }
        let callback = currentValue.bind(bind);
        if (eventName === 'input') {
            callback = function (evt) {
                currentValue.call(this, evt);
                evt.target['oninput-value'] = evt.target.value;
            }.bind(bind);
        }
        domNode.addEventListener(eventName, callback);
        _eventMap.set(currentValue, callback);
    }
    function removeOrphanedEvents(domNode, previousProperties, properties, onlyEvents = false) {
        Object.keys(previousProperties).forEach((propName) => {
            const isEvent = propName.substr(0, 2) === 'on' || onlyEvents;
            const eventName = onlyEvents ? propName : propName.substr(2);
            if (isEvent && !properties[propName]) {
                const eventCallback = _eventMap.get(previousProperties[propName]);
                if (eventCallback) {
                    domNode.removeEventListener(eventName, eventCallback);
                }
            }
        });
    }
    function renderedToWrapper(rendered, parent, currentParent) {
        const { requiresInsertBefore, hasPreviousSiblings, namespace, depth } = parent;
        const wrappedRendered = [];
        const hasParentWNode = isWNodeWrapper(parent);
        const currentParentChildren = (isVNodeWrapper(currentParent) && currentParent.childrenWrappers) || [];
        const hasCurrentParentChildren = currentParentChildren.length > 0;
        const insertBefore = ((requiresInsertBefore || hasPreviousSiblings !== false) && hasParentWNode) ||
            (hasCurrentParentChildren && rendered.length > 1);
        let previousItem;
        for (let i = 0; i < rendered.length; i++) {
            const renderedItem = rendered[i];
            const wrapper = {
                node: renderedItem,
                depth: depth + 1,
                order: i,
                requiresInsertBefore: insertBefore,
                hasParentWNode,
                namespace: namespace
            };
            if (Object(_d__WEBPACK_IMPORTED_MODULE_4__["isVNode"])(renderedItem) && renderedItem.properties.exitAnimation) {
                parent.hasAnimations = true;
                let nextParent = _parentWrapperMap.get(parent);
                while (nextParent) {
                    if (nextParent.hasAnimations) {
                        break;
                    }
                    nextParent.hasAnimations = true;
                    nextParent = _parentWrapperMap.get(nextParent);
                }
            }
            _parentWrapperMap.set(wrapper, parent);
            if (previousItem) {
                _wrapperSiblingMap.set(previousItem, wrapper);
            }
            wrappedRendered.push(wrapper);
            previousItem = wrapper;
        }
        return wrappedRendered;
    }
    function findParentWNodeWrapper(currentNode) {
        let parentWNodeWrapper;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentWNodeWrapper && parentWrapper) {
            if (!parentWNodeWrapper && isWNodeWrapper(parentWrapper)) {
                parentWNodeWrapper = parentWrapper;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentWNodeWrapper;
    }
    function findParentDomNode(currentNode) {
        let parentDomNode;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentDomNode && parentWrapper) {
            if (!parentDomNode && isVNodeWrapper(parentWrapper) && parentWrapper.domNode) {
                parentDomNode = parentWrapper.domNode;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentDomNode;
    }
    function runDeferredProperties(next) {
        if (next.node.deferredPropertiesCallback) {
            const properties = next.node.properties;
            next.node.properties = Object.assign({}, next.node.deferredPropertiesCallback(true), next.node.originalProperties);
            _afterRenderCallbacks.push(() => {
                processProperties(next, { properties });
            });
        }
    }
    function findInsertBefore(next) {
        let insertBefore = null;
        let searchNode = next;
        while (!insertBefore) {
            const nextSibling = _wrapperSiblingMap.get(searchNode);
            if (nextSibling) {
                if (isVNodeWrapper(nextSibling)) {
                    if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                        insertBefore = nextSibling.domNode;
                        break;
                    }
                    searchNode = nextSibling;
                    continue;
                }
                if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                    insertBefore = nextSibling.domNode;
                    break;
                }
                searchNode = nextSibling;
                continue;
            }
            searchNode = _parentWrapperMap.get(searchNode);
            if (!searchNode || isVNodeWrapper(searchNode)) {
                break;
            }
        }
        return insertBefore;
    }
    function setValue(domNode, propValue, previousValue) {
        const domValue = domNode.value;
        const onInputValue = domNode['oninput-value'];
        const onSelectValue = domNode['select-value'];
        if (onSelectValue && domValue !== onSelectValue) {
            domNode.value = onSelectValue;
            if (domNode.value === onSelectValue) {
                domNode['select-value'] = undefined;
            }
        }
        else if ((onInputValue && domValue === onInputValue) || propValue !== previousValue) {
            domNode.value = propValue;
            domNode['oninput-value'] = undefined;
        }
    }
    function setProperties(domNode, currentProperties = {}, nextWrapper, includesEventsAndAttributes = true) {
        const propNames = Object.keys(nextWrapper.node.properties);
        const propCount = propNames.length;
        if (propNames.indexOf('classes') === -1 && currentProperties.classes) {
            domNode.removeAttribute('class');
        }
        includesEventsAndAttributes && removeOrphanedEvents(domNode, currentProperties, nextWrapper.node.properties);
        for (let i = 0; i < propCount; i++) {
            const propName = propNames[i];
            let propValue = nextWrapper.node.properties[propName];
            const previousValue = currentProperties[propName];
            if (propName === 'classes') {
                const previousClassString = createClassPropValue(previousValue);
                let currentClassString = createClassPropValue(propValue);
                if (previousClassString !== currentClassString) {
                    if (currentClassString) {
                        if (nextWrapper.merged) {
                            const domClasses = (domNode.getAttribute('class') || '').split(' ');
                            for (let i = 0; i < domClasses.length; i++) {
                                if (currentClassString.indexOf(domClasses[i]) === -1) {
                                    currentClassString = `${domClasses[i]} ${currentClassString}`;
                                }
                            }
                        }
                        domNode.setAttribute('class', currentClassString);
                    }
                    else {
                        domNode.removeAttribute('class');
                    }
                }
            }
            else if (nodeOperations.indexOf(propName) !== -1) {
                nodeOperation(propName, propValue, previousValue, domNode);
            }
            else if (propName === 'styles') {
                const styleNames = Object.keys(propValue);
                const styleCount = styleNames.length;
                for (let j = 0; j < styleCount; j++) {
                    const styleName = styleNames[j];
                    const newStyleValue = propValue[styleName];
                    const oldStyleValue = previousValue && previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    domNode.style[styleName] = newStyleValue || '';
                }
            }
            else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    if (domNode.tagName === 'SELECT') {
                        domNode['select-value'] = propValue;
                    }
                    setValue(domNode, propValue, previousValue);
                }
                else if (propName !== 'key' && propValue !== previousValue) {
                    const type = typeof propValue;
                    if (type === 'function' && propName.lastIndexOf('on', 0) === 0 && includesEventsAndAttributes) {
                        updateEvent(domNode, propName.substr(2), propValue, nextWrapper.node.bind, previousValue);
                    }
                    else if (type === 'string' && propName !== 'innerHTML' && includesEventsAndAttributes) {
                        updateAttribute(domNode, propName, propValue, nextWrapper.namespace);
                    }
                    else if (propName === 'scrollLeft' || propName === 'scrollTop') {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    else {
                        domNode[propName] = propValue;
                    }
                }
            }
        }
    }
    function runDeferredRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _deferredRenderCallbacks;
        _deferredRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].requestAnimationFrame(run);
            }
        }
    }
    function runAfterRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _afterRenderCallbacks;
        _afterRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                if (_shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].requestIdleCallback) {
                    _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].requestIdleCallback(run);
                }
                else {
                    setTimeout(run);
                }
            }
        }
    }
    function processProperties(next, previousProperties) {
        if (next.node.attributes && next.node.events) {
            updateAttributes(next.domNode, previousProperties.attributes || {}, next.node.attributes, next.namespace);
            setProperties(next.domNode, previousProperties.properties, next, false);
            const events = next.node.events || {};
            if (previousProperties.events) {
                removeOrphanedEvents(next.domNode, previousProperties.events || {}, next.node.events, true);
            }
            previousProperties.events = previousProperties.events || {};
            Object.keys(events).forEach((event) => {
                updateEvent(next.domNode, event, events[event], next.node.bind, previousProperties.events[event]);
            });
        }
        else {
            setProperties(next.domNode, previousProperties.properties, next);
        }
    }
    function mount(mountOptions = {}) {
        _mountOptions = Object.assign({}, _mountOptions, mountOptions);
        const { domNode } = _mountOptions;
        const renderResult = Object(_d__WEBPACK_IMPORTED_MODULE_4__["w"])(wrapNodes(renderer), {});
        const nextWrapper = {
            node: renderResult,
            order: 0,
            depth: 1
        };
        _parentWrapperMap.set(nextWrapper, { depth: 0, order: 0, domNode, node: Object(_d__WEBPACK_IMPORTED_MODULE_4__["v"])('fake') });
        _processQueue.push({
            current: [],
            next: [nextWrapper],
            meta: { mergeNodes: arrayFrom(domNode.childNodes) }
        });
        _runProcessQueue();
        let mergedNode;
        while ((mergedNode = _allMergedNodes.pop())) {
            mergedNode.parentNode && mergedNode.parentNode.removeChild(mergedNode);
        }
        _runDomInstructionQueue();
        _mountOptions.merge = false;
        _insertBeforeMap = undefined;
        _runCallbacks();
    }
    function invalidate() {
        parentInvalidate && parentInvalidate();
    }
    function _schedule() {
        const { sync } = _mountOptions;
        if (sync) {
            _runInvalidationQueue();
        }
        else if (!_renderScheduled) {
            _renderScheduled = _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].requestAnimationFrame(() => {
                _runInvalidationQueue();
            });
        }
    }
    function _runInvalidationQueue() {
        _renderScheduled = undefined;
        const invalidationQueue = [..._invalidationQueue];
        const previouslyRendered = [];
        _invalidationQueue = [];
        invalidationQueue.sort((a, b) => {
            let result = b.depth - a.depth;
            if (result === 0) {
                result = b.order - a.order;
            }
            return result;
        });
        let item;
        while ((item = invalidationQueue.pop())) {
            let { instance } = item;
            if (previouslyRendered.indexOf(instance) === -1 && _instanceToWrapperMap.has(instance)) {
                previouslyRendered.push(instance);
                const current = _instanceToWrapperMap.get(instance);
                const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(instance);
                const parent = _parentWrapperMap.get(current);
                const sibling = _wrapperSiblingMap.get(current);
                const { constructor, children } = instance;
                const next = {
                    node: {
                        type: _d__WEBPACK_IMPORTED_MODULE_4__["WNODE"],
                        widgetConstructor: constructor,
                        properties: instanceData.inputProperties,
                        children: children,
                        bind: current.node.bind
                    },
                    instance,
                    depth: current.depth,
                    order: current.order
                };
                parent && _parentWrapperMap.set(next, parent);
                sibling && _wrapperSiblingMap.set(next, sibling);
                const { item } = _updateWidget({ current, next });
                if (item) {
                    _processQueue.push(item);
                    instance && _instanceToWrapperMap.set(instance, next);
                    _runProcessQueue();
                }
            }
        }
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function _runProcessQueue() {
        let item;
        while ((item = _processQueue.pop())) {
            if (isAttachApplication(item)) {
                _applicationQueue.push(item);
            }
            else {
                const { current, next, meta } = item;
                _process(current || EMPTY_ARRAY, next || EMPTY_ARRAY, meta);
            }
        }
    }
    function _runDomInstructionQueue() {
        _applicationQueue.reverse();
        let item;
        while ((item = _applicationQueue.pop())) {
            if (item.type === 'create') {
                const { parentDomNode, next, next: { domNode, merged, requiresInsertBefore, node: { properties } } } = item;
                processProperties(next, { properties: {} });
                runDeferredProperties(next);
                if (!merged) {
                    let insertBefore;
                    if (requiresInsertBefore) {
                        insertBefore = findInsertBefore(next);
                    }
                    else if (_insertBeforeMap) {
                        insertBefore = _insertBeforeMap.get(next);
                    }
                    parentDomNode.insertBefore(domNode, insertBefore);
                    if (Object(_d__WEBPACK_IMPORTED_MODULE_4__["isDomVNode"])(next.node) && next.node.onAttach) {
                        next.node.onAttach();
                    }
                }
                if (domNode.tagName === 'OPTION' && domNode.parentElement) {
                    setValue(domNode.parentElement);
                }
                runEnterAnimation(next, _mountOptions.transition);
                const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(next.node.bind);
                if (properties.key != null && instanceData) {
                    instanceData.nodeHandler.add(domNode, `${properties.key}`);
                }
                item.next.inserted = true;
            }
            else if (item.type === 'update') {
                const { next, next: { domNode, node }, current } = item;
                const parent = _parentWrapperMap.get(next);
                if (parent && isWNodeWrapper(parent) && parent.instance) {
                    const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(parent.instance);
                    instanceData && instanceData.nodeHandler.addRoot();
                }
                const previousProperties = buildPreviousProperties(domNode, current, next);
                const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(next.node.bind);
                processProperties(next, previousProperties);
                runDeferredProperties(next);
                if (instanceData && node.properties.key != null) {
                    instanceData.nodeHandler.add(next.domNode, `${node.properties.key}`);
                }
            }
            else if (item.type === 'delete') {
                const { current } = item;
                const { exitAnimation } = current.node.properties;
                if (exitAnimation && exitAnimation !== true) {
                    runExitAnimation(current, _mountOptions.transition, exitAnimation);
                }
                else {
                    current.domNode.parentNode.removeChild(current.domNode);
                    current.domNode = undefined;
                }
            }
            else if (item.type === 'attach') {
                const { instance, attached } = item;
                const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(instance);
                instanceData.nodeHandler.addRoot();
                attached && instanceData.onAttach();
            }
            else if (item.type === 'detach') {
                if (item.current.instance) {
                    const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(item.current.instance);
                    instanceData && instanceData.onDetach();
                }
                item.current.domNode = undefined;
                item.current.node.bind = undefined;
                item.current.instance = undefined;
            }
        }
    }
    function _runCallbacks() {
        runAfterRenderCallbacks();
        runDeferredRenderCallbacks();
    }
    function _processMergeNodes(next, mergeNodes) {
        const { merge } = _mountOptions;
        if (merge && mergeNodes.length) {
            if (isVNodeWrapper(next)) {
                let { node: { tag } } = next;
                for (let i = 0; i < mergeNodes.length; i++) {
                    const domElement = mergeNodes[i];
                    if (tag.toUpperCase() === (domElement.tagName || '')) {
                        const mergeNodeIndex = _allMergedNodes.indexOf(domElement);
                        if (mergeNodeIndex !== -1) {
                            _allMergedNodes.splice(mergeNodeIndex, 1);
                        }
                        mergeNodes.splice(i, 1);
                        next.domNode = domElement;
                        break;
                    }
                }
            }
            else {
                next.mergeNodes = mergeNodes;
            }
        }
    }
    function registerDistinguishableCallback(childNodes, index) {
        _afterRenderCallbacks.push(() => {
            const parentWNodeWrapper = findParentWNodeWrapper(childNodes[index]);
            checkDistinguishable(childNodes, index, parentWNodeWrapper);
        });
    }
    function _process(current, next, meta = {}) {
        let { mergeNodes = [], oldIndex = 0, newIndex = 0 } = meta;
        const currentLength = current.length;
        const nextLength = next.length;
        const hasPreviousSiblings = currentLength > 1 || (currentLength > 0 && currentLength < nextLength);
        const instructions = [];
        if (newIndex < nextLength) {
            let currentWrapper = oldIndex < currentLength ? current[oldIndex] : undefined;
            const nextWrapper = next[newIndex];
            nextWrapper.hasPreviousSiblings = hasPreviousSiblings;
            _processMergeNodes(nextWrapper, mergeNodes);
            if (currentWrapper && same(currentWrapper, nextWrapper)) {
                oldIndex++;
                newIndex++;
                if (isVNodeWrapper(currentWrapper) && isVNodeWrapper(nextWrapper)) {
                    nextWrapper.inserted = currentWrapper.inserted;
                }
                instructions.push({ current: currentWrapper, next: nextWrapper });
            }
            else if (!currentWrapper || findIndexOfChild(current, nextWrapper, oldIndex + 1) === -1) {
                 true && current.length && registerDistinguishableCallback(next, newIndex);
                instructions.push({ current: undefined, next: nextWrapper });
                newIndex++;
            }
            else if (findIndexOfChild(next, currentWrapper, newIndex + 1) === -1) {
                 true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                oldIndex++;
            }
            else {
                 true && registerDistinguishableCallback(next, newIndex);
                 true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                instructions.push({ current: undefined, next: nextWrapper });
                oldIndex++;
                newIndex++;
            }
        }
        if (newIndex < nextLength) {
            _processQueue.push({ current, next, meta: { mergeNodes, oldIndex, newIndex } });
        }
        if (currentLength > oldIndex && newIndex >= nextLength) {
            for (let i = oldIndex; i < currentLength; i++) {
                 true && registerDistinguishableCallback(current, i);
                instructions.push({ current: current[i], next: undefined });
            }
        }
        for (let i = 0; i < instructions.length; i++) {
            const { item, dom, widget } = _processOne(instructions[i]);
            widget && _processQueue.push(widget);
            item && _processQueue.push(item);
            dom && _applicationQueue.push(dom);
        }
    }
    function _processOne({ current, next }) {
        if (current !== next) {
            if (!current && next) {
                if (isVNodeWrapper(next)) {
                    return _createDom({ next });
                }
                else {
                    return _createWidget({ next });
                }
            }
            else if (current && next) {
                if (isVNodeWrapper(current) && isVNodeWrapper(next)) {
                    return _updateDom({ current, next });
                }
                else if (isWNodeWrapper(current) && isWNodeWrapper(next)) {
                    return _updateWidget({ current, next });
                }
            }
            else if (current && !next) {
                if (isVNodeWrapper(current)) {
                    return _removeDom({ current });
                }
                else if (isWNodeWrapper(current)) {
                    return _removeWidget({ current });
                }
            }
        }
        return {};
    }
    function _createWidget({ next }) {
        let { node: { widgetConstructor } } = next;
        let { registry } = _mountOptions;
        if (!Object(_Registry__WEBPACK_IMPORTED_MODULE_5__["isWidgetBaseConstructor"])(widgetConstructor)) {
            return {};
        }
        const instance = new widgetConstructor();
        if (registry) {
            instance.registry.base = registry;
        }
        const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(instance);
        instanceData.invalidate = () => {
            instanceData.dirty = true;
            if (!instanceData.rendering && _instanceToWrapperMap.has(instance)) {
                _invalidationQueue.push({ instance, depth: next.depth, order: next.order });
                _schedule();
            }
        };
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        next.instance = instance;
        let rendered = instance.__render__();
        instanceData.rendering = false;
        if (rendered) {
            rendered = Array.isArray(rendered) ? rendered : [rendered];
            next.childrenWrappers = renderedToWrapper(rendered, next, null);
        }
        if (next.instance) {
            _instanceToWrapperMap.set(next.instance, next);
            if (!parentInvalidate && !next.instance.isWNodeWrapper) {
                parentInvalidate = next.instance.invalidate.bind(next.instance);
            }
        }
        return {
            item: { next: next.childrenWrappers, meta: { mergeNodes: next.mergeNodes } },
            widget: { type: 'attach', instance, attached: true }
        };
    }
    function _updateWidget({ current, next }) {
        current = (current.instance && _instanceToWrapperMap.get(current.instance)) || current;
        const { instance, domNode, hasAnimations } = current;
        if (!instance) {
            return [];
        }
        const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(instance);
        next.instance = instance;
        next.domNode = domNode;
        next.hasAnimations = hasAnimations;
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        _instanceToWrapperMap.set(next.instance, next);
        if (instanceData.dirty) {
            let rendered = instance.__render__();
            instanceData.rendering = false;
            if (rendered) {
                rendered = Array.isArray(rendered) ? rendered : [rendered];
                next.childrenWrappers = renderedToWrapper(rendered, next, current);
            }
            return {
                item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
                widget: { type: 'attach', instance, attached: false }
            };
        }
        instanceData.rendering = false;
        next.childrenWrappers = current.childrenWrappers;
        return {
            widget: { type: 'attach', instance, attached: false }
        };
    }
    function _removeWidget({ current }) {
        current = current.instance ? _instanceToWrapperMap.get(current.instance) : current;
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        _instanceToWrapperMap.delete(current.instance);
        return {
            item: { current: current.childrenWrappers, meta: {} },
            widget: { type: 'detach', current }
        };
    }
    function _createDom({ next }) {
        let mergeNodes = [];
        const parentDomNode = findParentDomNode(next);
        if (!next.domNode) {
            if (next.node.domNode) {
                next.domNode = next.node.domNode;
            }
            else {
                if (next.node.tag === 'svg') {
                    next.namespace = NAMESPACE_SVG;
                }
                if (next.node.tag) {
                    if (next.namespace) {
                        next.domNode = _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].document.createElementNS(next.namespace, next.node.tag);
                    }
                    else {
                        next.domNode = _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].document.createElement(next.node.tag);
                    }
                }
                else if (next.node.text != null) {
                    next.domNode = _shim_global__WEBPACK_IMPORTED_MODULE_0__["default"].document.createTextNode(next.node.text);
                }
            }
            if (_insertBeforeMap && _allMergedNodes.length) {
                if (parentDomNode === _allMergedNodes[0].parentNode) {
                    _insertBeforeMap.set(next, _allMergedNodes[0]);
                }
            }
        }
        else {
            if (_mountOptions.merge) {
                mergeNodes = arrayFrom(next.domNode.childNodes);
                _allMergedNodes = [..._allMergedNodes, ...mergeNodes];
            }
            next.merged = true;
        }
        if (next.domNode) {
            if (next.node.children) {
                next.childrenWrappers = renderedToWrapper(next.node.children, next, null);
            }
        }
        const parentWNodeWrapper = findParentWNodeWrapper(next);
        if (parentWNodeWrapper && !parentWNodeWrapper.domNode) {
            parentWNodeWrapper.domNode = next.domNode;
        }
        const dom = {
            next: next,
            parentDomNode: parentDomNode,
            type: 'create'
        };
        if (next.childrenWrappers) {
            return {
                item: { current: [], next: next.childrenWrappers, meta: { mergeNodes } },
                dom
            };
        }
        return { dom };
    }
    function _updateDom({ current, next }) {
        const parentDomNode = findParentDomNode(current);
        next.domNode = current.domNode;
        next.namespace = current.namespace;
        if (next.node.text && next.node.text !== current.node.text) {
            const updatedTextNode = parentDomNode.ownerDocument.createTextNode(next.node.text);
            parentDomNode.replaceChild(updatedTextNode, next.domNode);
            next.domNode = updatedTextNode;
        }
        else if (next.node.children) {
            const children = renderedToWrapper(next.node.children, next, current);
            next.childrenWrappers = children;
        }
        return {
            item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
            dom: { type: 'update', next, current }
        };
    }
    function _removeDom({ current }) {
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        current.node.bind = undefined;
        if (current.hasAnimations) {
            return {
                item: { current: current.childrenWrappers, meta: {} },
                dom: { type: 'delete', current }
            };
        }
        if (current.childrenWrappers) {
            _afterRenderCallbacks.push(() => {
                let wrappers = current.childrenWrappers || [];
                let wrapper;
                while ((wrapper = wrappers.pop())) {
                    if (wrapper.childrenWrappers) {
                        wrappers.push(...wrapper.childrenWrappers);
                        wrapper.childrenWrappers = undefined;
                    }
                    if (isWNodeWrapper(wrapper)) {
                        if (wrapper.instance) {
                            _instanceToWrapperMap.delete(wrapper.instance);
                            const instanceData = _WidgetBase__WEBPACK_IMPORTED_MODULE_6__["widgetInstanceMap"].get(wrapper.instance);
                            instanceData && instanceData.onDetach();
                        }
                        wrapper.instance = undefined;
                    }
                    _wrapperSiblingMap.delete(wrapper);
                    _parentWrapperMap.delete(wrapper);
                    wrapper.domNode = undefined;
                    wrapper.node.bind = undefined;
                }
            });
        }
        return {
            dom: { type: 'delete', current }
        };
    }
    return {
        mount,
        invalidate
    };
}
/* harmony default export */ __webpack_exports__["default"] = (renderer);


/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.css":
/*!**************************************************!*\
  !*** ./node_modules/@dojo/themes/dojo/index.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.js":
/*!*************************************************!*\
  !*** ./node_modules/@dojo/themes/dojo/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

!function(_,e){ true?module.exports=e():undefined}(this,function(){return function(_){var e={};function o(t){if(e[t])return e[t].exports;var i=e[t]={i:t,l:!1,exports:{}};return _[t].call(i.exports,i,i.exports,o),i.l=!0,i.exports}return o.m=_,o.c=e,o.d=function(_,e,t){o.o(_,e)||Object.defineProperty(_,e,{configurable:!1,enumerable:!0,get:t})},o.n=function(_){var e=_&&_.__esModule?function(){return _.default}:function(){return _};return o.d(e,"a",e),e},o.o=function(_,e){return Object.prototype.hasOwnProperty.call(_,e)},o.p="",o(o.s=0)}([function(_,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var t=o(1),i=o(2),n=o(3),r=o(4),d=o(5),a=o(6),l=o(7),c=o(8),m=o(9),s=o(10),p=o(11),u=o(12),b=o(13),g=o(14),h=o(15),x=o(16),f=o(17),j=o(18),y=o(19),k=o(20),v=o(21),I=o(22),w=o(23),T=o(24),A=o(25),L=o(26),R=o(27),B=o(28),O=o(29),W=o(30),G=o(31);e.default={"@dojo/widgets/accordion-pane":t,"@dojo/widgets/button":i,"@dojo/widgets/calendar":n,"@dojo/widgets/checkbox":r,"@dojo/widgets/combobox":d,"@dojo/widgets/dialog":a,"@dojo/widgets/icon":l,"@dojo/widgets/grid":c,"@dojo/widgets/grid-body":m,"@dojo/widgets/grid-cell":s,"@dojo/widgets/grid-footer":p,"@dojo/widgets/grid-header":u,"@dojo/widgets/grid-placeholder-row":b,"@dojo/widgets/grid-row":g,"@dojo/widgets/label":h,"@dojo/widgets/listbox":x,"@dojo/widgets/progress":f,"@dojo/widgets/radio":j,"@dojo/widgets/range-slider":y,"@dojo/widgets/select":k,"@dojo/widgets/slide-pane":v,"@dojo/widgets/slider":I,"@dojo/widgets/split-pane":w,"@dojo/widgets/tab-controller":T,"@dojo/widgets/text-area":A,"@dojo/widgets/text-input":L,"@dojo/widgets/enhanced-text-input":R,"@dojo/widgets/time-picker":B,"@dojo/widgets/title-pane":O,"@dojo/widgets/toolbar":W,"@dojo/widgets/tooltip":G}},function(_,e){_.exports={" _key":"@dojo/themes/accordion-pane",root:"accordion-pane-m__root__bM7L-"}},function(_,e){_.exports={" _key":"@dojo/themes/button",root:"button-m__root__12yR4",addon:"button-m__addon__1vLjS",pressed:"button-m__pressed__25bT9",popup:"button-m__popup__3TLBT",disabled:"button-m__disabled__2g1Eh"}},function(_,e){_.exports={" _key":"@dojo/themes/calendar",root:"calendar-m__root__8g8XM",dateGrid:"calendar-m__dateGrid__1fGQc",weekday:"calendar-m__weekday__2pA6h",date:"calendar-m__date__3YFf3",todayDate:"calendar-m__todayDate__d0AjQ",inactiveDate:"calendar-m__inactiveDate__2tjvq",selectedDate:"calendar-m__selectedDate__37_5N",topMatter:"calendar-m__topMatter__1IRSP",monthTrigger:"calendar-m__monthTrigger__cY71W",yearTrigger:"calendar-m__yearTrigger__28wTL",previous:"calendar-m__previous__2xwjK",next:"calendar-m__next__2LzTA",monthTriggerActive:"calendar-m__monthTriggerActive__3Qfvx",yearTriggerActive:"calendar-m__yearTriggerActive__3fD7T",monthGrid:"calendar-m__monthGrid__mZE0B",yearGrid:"calendar-m__yearGrid__3z6tZ",monthFields:"calendar-m__monthFields__343XA",yearFields:"calendar-m__yearFields__2ulJ9",monthRadio:"calendar-m__monthRadio__2CPSG",yearRadio:"calendar-m__yearRadio__2w-dx",monthRadioLabel:"calendar-m__monthRadioLabel__3oTer",yearRadioLabel:"calendar-m__yearRadioLabel__2IkO4",monthRadioChecked:"calendar-m__monthRadioChecked__3pYfv",yearRadioChecked:"calendar-m__yearRadioChecked__2b05y",monthRadioInput:"calendar-m__monthRadioInput__wTydQ",yearRadioInput:"calendar-m__yearRadioInput__1b6Vu"}},function(_,e){_.exports={" _key":"@dojo/themes/checkbox",root:"checkbox-m__root__2mazd",input:"checkbox-m__input__1R4a3",inputWrapper:"checkbox-m__inputWrapper__2n2Je icon-m__checkIcon__Qkzz_ icon-m__icon__29Rvx",checked:"checkbox-m__checked__36C34",toggle:"checkbox-m__toggle__zLu9M",toggleSwitch:"checkbox-m__toggleSwitch__1mp-p",onLabel:"checkbox-m__onLabel__3XdpR",offLabel:"checkbox-m__offLabel__2G79d",focused:"checkbox-m__focused__1XkzL",disabled:"checkbox-m__disabled__3De6r",readonly:"checkbox-m__readonly__1bP6U",invalid:"checkbox-m__invalid__3CVcp",valid:"checkbox-m__valid__1Sz1d"}},function(_,e){_.exports={" _key":"@dojo/themes/combobox",root:"combobox-m__root__1Ll10",clearable:"combobox-m__clearable__2vbMC",trigger:"combobox-m__trigger__2eaaN",dropdown:"combobox-m__dropdown__3RBvx",open:"combobox-m__open__ks_mj",option:"combobox-m__option__2bV5j",selected:"combobox-m__selected__agfWS",invalid:"combobox-m__invalid__1Tpl5",valid:"combobox-m__valid__8WTtx",clear:"combobox-m__clear__2afgf"}},function(_,e){_.exports={" _key":"@dojo/themes/dialog",root:"dialog-m__root__3AJLL",main:"dialog-m__main__JQSA6",underlayVisible:"dialog-m__underlayVisible__1UOuO",title:"dialog-m__title__2ikv3",content:"dialog-m__content__34Znr",close:"dialog-m__close__jzTjA"}},function(_,e){_.exports={" _key":"@dojo/themes/icon",icon:"icon-m__icon__29Rvx",plusIcon:"icon-m__plusIcon__3FXI0",minusIcon:"icon-m__minusIcon__Zo76x",checkIcon:"icon-m__checkIcon__Qkzz_",closeIcon:"icon-m__closeIcon__2ON_e",leftIcon:"icon-m__leftIcon__uPd4-",rightIcon:"icon-m__rightIcon__3AdyL",upIcon:"icon-m__upIcon__dNdUa",downIcon:"icon-m__downIcon__3IYHD",upAltIcon:"icon-m__upAltIcon__2uO_H",downAltIcon:"icon-m__downAltIcon__1v0n4",searchIcon:"icon-m__searchIcon__3GJXc",barsIcon:"icon-m__barsIcon__1ESjA",settingsIcon:"icon-m__settingsIcon__3v3Yu",alertIcon:"icon-m__alertIcon__UDaN8",helpIcon:"icon-m__helpIcon__3N5SV",infoIcon:"icon-m__infoIcon__1Cyl0",phoneIcon:"icon-m__phoneIcon__1IoIV",editIcon:"icon-m__editIcon__3kKJu",dateIcon:"icon-m__dateIcon__RzS7O",linkIcon:"icon-m__linkIcon__2dV4J",locationIcon:"icon-m__locationIcon__3QiGp",secureIcon:"icon-m__secureIcon__1Bn76",mailIcon:"icon-m__mailIcon__3oHWt"}},function(_,e){_.exports={" _key":"@dojo/themes/grid",root:"grid-m__root__2K83D",header:"grid-m__header__3hUdG",filterGroup:"grid-m__filterGroup__AQQ0d"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-body",root:"grid-body-m__root__JP88A"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-cell",root:"grid-cell-m__root__2bSUs",input:"grid-cell-m__input__KUuUA",edit:"grid-cell-m__edit__1CjFq"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-footer",root:"grid-footer-m__root__2Ijyk"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-header",root:"grid-header-m__root__2dIwu",cell:"grid-header-m__cell__1te9J",sortable:"grid-header-m__sortable__4znER",sorted:"grid-header-m__sorted__1K99V",sort:"grid-header-m__sort__YGGb-",filter:"grid-header-m__filter__1g3i5"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-placeholder-row",root:"grid-placeholder-row-m__root__1wxj1 grid-row-m__root__36_XU",loading:"grid-placeholder-row-m__loading__1-LX1",spin:"grid-placeholder-row-m__spin__FCJF0"}},function(_,e){_.exports={" _key":"@dojo/themes/grid-row",root:"grid-row-m__root__36_XU"}},function(_,e){_.exports={" _key":"@dojo/themes/label",root:"label-m__root__IUInj",secondary:"label-m__secondary__3CX03",required:"label-m__required__UvKrc"}},function(_,e){_.exports={" _key":"@dojo/themes/listbox",root:"listbox-m__root__HcZvV",option:"listbox-m__option__KnxUU",focused:"listbox-m__focused__2CirT",activeOption:"listbox-m__activeOption__3l1VA",disabledOption:"listbox-m__disabledOption__222BT",selectedOption:"listbox-m__selectedOption__eEoO_ icon-m__checkIcon__Qkzz_"}},function(_,e){_.exports={" _key":"@dojo/themes/progress",output:"progress-m__output__1S6I1",bar:"progress-m__bar__2WdiU",progress:"progress-m__progress__27qhP"}},function(_,e){_.exports={" _key":"@dojo/themes/radio",root:"radio-m__root__3IL-l",input:"radio-m__input__2Jz8g",inputWrapper:"radio-m__inputWrapper__1dlq4",focused:"radio-m__focused__2XTkW",checked:"radio-m__checked__36l7N",disabled:"radio-m__disabled__R3Lzk",readonly:"radio-m__readonly__1cp5u",required:"radio-m__required__vN9sq",invalid:"radio-m__invalid__-yZCT",valid:"radio-m__valid__1QF-n"}},function(_,e){_.exports={" _key":"@dojo/themes/range-slider",root:"range-slider-m__root__3YTMP",inputWrapper:"range-slider-m__inputWrapper__Wxdu8",filled:"range-slider-m__filled__1eseq",thumb:"range-slider-m__thumb__jp_yW",input:"range-slider-m__input__VKeZp",focused:"range-slider-m__focused__28vL2",hasOutput:"range-slider-m__hasOutput__QORMJ",outputTooltip:"range-slider-m__outputTooltip__19xMO",output:"range-slider-m__output__1Fj1P",disabled:"range-slider-m__disabled__3lTQ_",readonly:"range-slider-m__readonly__2GxMc",invalid:"range-slider-m__invalid__3-06_"}},function(_,e){_.exports={" _key":"@dojo/themes/select",root:"select-m__root__26Kq_",inputWrapper:"select-m__inputWrapper__2BMKU",trigger:"select-m__trigger__2s_Ja",placeholder:"select-m__placeholder__2GUfD",arrow:"select-m__arrow__2x1Fv",dropdown:"select-m__dropdown__1Bwjz",open:"select-m__open__1cgTL",input:"select-m__input__2FjBi",disabled:"select-m__disabled__jq5IA",readonly:"select-m__readonly__3W31j",invalid:"select-m__invalid__1ptBm",valid:"select-m__valid__3Aknn"}},function(_,e){_.exports={" _key":"@dojo/themes/slide-pane",root:"slide-pane-m__root__1EHLR",underlayVisible:"slide-pane-m__underlayVisible__ArceX",pane:"slide-pane-m__pane__1bSbK",content:"slide-pane-m__content__1IFp8",title:"slide-pane-m__title__15zoz",close:"slide-pane-m__close__2VdzM",left:"slide-pane-m__left__15D6J",right:"slide-pane-m__right__2B-4A",top:"slide-pane-m__top__2YMft",bottom:"slide-pane-m__bottom__2AKwb",slideIn:"slide-pane-m__slideIn__2Lp8d",slideOut:"slide-pane-m__slideOut__2OjVj",open:"slide-pane-m__open__3SMPY"}},function(_,e){_.exports={" _key":"@dojo/themes/slider",root:"slider-m__root__1RGAu",inputWrapper:"slider-m__inputWrapper__2YSMI",track:"slider-m__track__3AQ0b",fill:"slider-m__fill__2oeLf",thumb:"slider-m__thumb__Ugyi1",input:"slider-m__input__2oQNc",outputTooltip:"slider-m__outputTooltip__1Xl0A",output:"slider-m__output__3uXPM",vertical:"slider-m__vertical__GdaBF",disabled:"slider-m__disabled__2IKl_",readonly:"slider-m__readonly__2pqiY",invalid:"slider-m__invalid__2EM0U",valid:"slider-m__valid__2okjY"}},function(_,e){_.exports={" _key":"@dojo/themes/split-pane",root:"split-pane-m__root__31jlU",divider:"split-pane-m__divider__3BweO",row:"split-pane-m__row__2MC6H",column:"split-pane-m__column__cnVlo"}},function(_,e){_.exports={" _key":"@dojo/themes/tab-controller",root:"tab-controller-m__root__2_aGQ",tabButtons:"tab-controller-m__tabButtons__3LfvE",tabButton:"tab-controller-m__tabButton__EnWBC",disabledTabButton:"tab-controller-m__disabledTabButton__2KI7e",activeTabButton:"tab-controller-m__activeTabButton__XObce",close:"tab-controller-m__close__rEsae",closeable:"tab-controller-m__closeable__10d6O",tab:"tab-controller-m__tab__1l0fc",alignLeft:"tab-controller-m__alignLeft__aSEjU",tabs:"tab-controller-m__tabs__2UZtw",alignRight:"tab-controller-m__alignRight__VIwmx",alignBottom:"tab-controller-m__alignBottom__iK1Ie"}},function(_,e){_.exports={" _key":"@dojo/themes/text-area",root:"text-area-m__root__1sG4A",input:"text-area-m__input__2jXv4",disabled:"text-area-m__disabled__3FFoi",readonly:"text-area-m__readonly__2k5Qt",invalid:"text-area-m__invalid__3skJE",valid:"text-area-m__valid__pXrLF"}},function(_,e){_.exports={" _key":"@dojo/themes/text-input",root:"text-input-m__root__32FMV",input:"text-input-m__input__3w7ig",inputWrapper:"text-input-m__inputWrapper__2QZvb",disabled:"text-input-m__disabled__3g9Iy",readonly:"text-input-m__readonly__D8rTe",invalid:"text-input-m__invalid__2kJsD",valid:"text-input-m__valid__YQsgJ"}},function(_,e){_.exports={" _key":"@dojo/themes/enhanced-text-input",addon:"enhanced-text-input-m__addon__2RPxq",addonAfter:"enhanced-text-input-m__addonAfter__3epWT",addonBefore:"enhanced-text-input-m__addonBefore__23LY4",input:"enhanced-text-input-m__input__2hPpj text-input-m__input__3w7ig",inputWrapper:"enhanced-text-input-m__inputWrapper__18Dzs text-input-m__inputWrapper__2QZvb",focused:"enhanced-text-input-m__focused__CkcKJ"}},function(_,e){_.exports={" _key":"@dojo/themes/time-picker",root:"time-picker-m__root__3ErGo",input:"time-picker-m__input__Zvi8j",disabled:"time-picker-m__disabled__8SmXq",readonly:"time-picker-m__readonly__22nOd",invalid:"time-picker-m__invalid__1w_rb",valid:"time-picker-m__valid__3AKOy"}},function(_,e){_.exports={" _key":"@dojo/themes/title-pane",root:"title-pane-m__root__YjYfy",titleButton:"title-pane-m__titleButton__slFPn",content:"title-pane-m__content__12qlc",contentTransition:"title-pane-m__contentTransition__3sB3r",open:"title-pane-m__open__1Jisn",arrow:"title-pane-m__arrow__1S3QP"}},function(_,e){_.exports={" _key":"@dojo/themes/toolbar",root:"toolbar-m__root__zQuGH",title:"toolbar-m__title__3F385",menuButton:"toolbar-m__menuButton__1-lsg"}},function(_,e){_.exports={" _key":"@dojo/themes/tooltip",root:"tooltip-m__root__2i3mJ",content:"tooltip-m__content__38GZB",bottom:"tooltip-m__bottom__kAxkX",top:"tooltip-m__top__1KcTt",left:"tooltip-m__left__hfN_F",right:"tooltip-m__right__2oqgn"}}])});


/***/ }),

/***/ "./node_modules/@dojo/widgets/common/nls/common.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/nls/common.mjs ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const locales = {};
const messages = {
    sunShort: 'Sun',
    monShort: 'Mon',
    tueShort: 'Tue',
    wedShort: 'Wed',
    thuShort: 'Thu',
    friShort: 'Fri',
    satShort: 'Sat',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    janShort: 'Jan',
    febShort: 'Feb',
    marShort: 'Mar',
    aprShort: 'Apr',
    mayShort: 'May',
    junShort: 'Jun',
    julShort: 'Jul',
    augShort: 'Aug',
    sepShort: 'Sep',
    octShort: 'Oct',
    novShort: 'Nov',
    decShort: 'Dec',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    clear: 'clear',
    close: 'close',
    open: 'open'
};
/* harmony default export */ __webpack_exports__["default"] = ({ locales, messages });


/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/animations.m.css":
/*!*******************************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/styles/animations.m.css ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/animations.m.css.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/styles/animations.m.css.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/common/styles/animations.m.css */ "./node_modules/@dojo/widgets/common/styles/animations.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"fadeIn":"_1GpxvABe","fadeOut":"ClAlvWcr"," _key":"@dojo/widgets/animations"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css":
/*!*************************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/styles/base.m.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css.js":
/*!****************************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/styles/base.m.css.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/common/styles/base.m.css */ "./node_modules/@dojo/widgets/common/styles/base.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"visuallyHidden":"_1AeWeApr","focusable":"_1_qANqXi","hidden":"_3QddUiBU"," _key":"@dojo/widgets/base"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/util.mjs":
/*!****************************************************!*\
  !*** ./node_modules/@dojo/widgets/common/util.mjs ***!
  \****************************************************/
/*! exports provided: Keys, formatAriaProperties */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Keys", function() { return Keys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatAriaProperties", function() { return formatAriaProperties; });
var Keys;
(function (Keys) {
    Keys[Keys["Down"] = 40] = "Down";
    Keys[Keys["End"] = 35] = "End";
    Keys[Keys["Enter"] = 13] = "Enter";
    Keys[Keys["Escape"] = 27] = "Escape";
    Keys[Keys["Home"] = 36] = "Home";
    Keys[Keys["Left"] = 37] = "Left";
    Keys[Keys["PageDown"] = 34] = "PageDown";
    Keys[Keys["PageUp"] = 33] = "PageUp";
    Keys[Keys["Right"] = 39] = "Right";
    Keys[Keys["Space"] = 32] = "Space";
    Keys[Keys["Tab"] = 9] = "Tab";
    Keys[Keys["Up"] = 38] = "Up";
})(Keys || (Keys = {}));
function formatAriaProperties(aria) {
    const formattedAria = Object.keys(aria).reduce((a, key) => {
        a[`aria-${key.toLowerCase()}`] = aria[key];
        return a;
    }, {});
    return formattedAria;
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/global-event/index.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/widgets/global-event/index.mjs ***!
  \***********************************************************/
/*! exports provided: GlobalEvent, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalEvent", function() { return GlobalEvent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/shim/global */ "./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");





class GlobalEvent extends _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_2__["default"] {
    constructor() {
        super(...arguments);
        this._listeners = {
            window: {},
            document: {}
        };
    }
    _registerListeners(type, previousListeners, newListeners) {
        const registeredListeners = {};
        previousListeners[type] && Object.keys(previousListeners[type]).forEach((eventName) => {
            const newListener = newListeners[type][eventName];
            if (newListener === undefined) {
                _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__["default"][type].removeEventListener(eventName, this._listeners[type][eventName]);
            }
            else if (previousListeners[type][eventName] !== newListener) {
                _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__["default"][type].removeEventListener(eventName, this._listeners[type][eventName]);
                _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__["default"][type].addEventListener(eventName, newListener);
                registeredListeners[eventName] = newListener;
            }
            else {
                registeredListeners[eventName] = newListener;
            }
        });
        newListeners[type] && Object.keys(newListeners[type]).forEach((eventName) => {
            if (previousListeners[type] === undefined || previousListeners[type][eventName] === undefined) {
                _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__["default"][type].addEventListener(eventName, newListeners[type][eventName]);
                registeredListeners[eventName] = newListeners[type][eventName];
            }
        });
        this._listeners[type] = registeredListeners;
    }
    _removeAllRegisteredListeners(type) {
        Object.keys(this._listeners[type]).forEach((eventName) => {
            _dojo_framework_shim_global__WEBPACK_IMPORTED_MODULE_1__["default"][type].removeEventListener(eventName, this._listeners[type][eventName]);
        });
    }
    onWindowListenersChange(previousListeners, newListeners) {
        this._registerListeners('window', previousListeners, newListeners);
    }
    onDocumentListenersChange(previousListeners, newListeners) {
        this._registerListeners('document', previousListeners, newListeners);
    }
    onDetach() {
        this._removeAllRegisteredListeners('window');
        this._removeAllRegisteredListeners('document');
    }
    render() {
        if (this.children.length > 0) {
            return this.children;
        }
        return null;
    }
}
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__["diffProperty"])('window', _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_4__["shallow"]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Function),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object, Object]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:returntype", void 0)
], GlobalEvent.prototype, "onWindowListenersChange", null);
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_3__["diffProperty"])('document', _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_4__["shallow"]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Function),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object, Object]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:returntype", void 0)
], GlobalEvent.prototype, "onDocumentListenersChange", null);
/* harmony default export */ __webpack_exports__["default"] = (GlobalEvent);


/***/ }),

/***/ "./node_modules/@dojo/widgets/icon/index.mjs":
/*!***************************************************!*\
  !*** ./node_modules/@dojo/widgets/icon/index.mjs ***!
  \***************************************************/
/*! exports provided: ThemedBase, IconBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IconBase", function() { return IconBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Icon; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/util */ "./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var _theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../theme/icon.m.css */ "./node_modules/@dojo/widgets/theme/icon.m.css.js");
/* harmony import */ var _theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/styles/base.m.css */ "./node_modules/@dojo/widgets/common/styles/base.m.css.js");
/* harmony import */ var _common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");








const ThemedBase = Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__["ThemedMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"]);
let IconBase = class IconBase extends ThemedBase {
    renderAltText(altText) {
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__["v"])('span', { classes: [_common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__["visuallyHidden"]] }, [altText]);
    }
    render() {
        const { aria = {
            hidden: 'true'
        }, type, altText } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__["v"])('span', { classes: this.theme(_theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__["root"]) }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__["v"])('i', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_4__["formatAriaProperties"])(aria), { classes: this.theme([_theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__["icon"], _theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__[type]]) })),
            altText ? this.renderAltText(altText) : null
        ]);
    }
};
IconBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__["theme"])(_theme_icon_m_css__WEBPACK_IMPORTED_MODULE_5__),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_7__["customElement"])({
        tag: 'dojo-icon',
        properties: [
            'theme',
            'classes',
            'aria',
            'extraClasses'
        ],
        attributes: ['type', 'altText']
    })
], IconBase);

class Icon extends IconBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/label/index.mjs":
/*!****************************************************!*\
  !*** ./node_modules/@dojo/widgets/label/index.mjs ***!
  \****************************************************/
/*! exports provided: ThemedBase, LabelBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LabelBase", function() { return LabelBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Label; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/util */ "./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../theme/label.m.css */ "./node_modules/@dojo/widgets/theme/label.m.css.js");
/* harmony import */ var _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/styles/base.m.css */ "./node_modules/@dojo/widgets/common/styles/base.m.css.js");
/* harmony import */ var _common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");








const ThemedBase = Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__["ThemedMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"]);
let LabelBase = class LabelBase extends ThemedBase {
    getRootClasses() {
        const { disabled, focused, invalid, readOnly, required, secondary } = this.properties;
        return [
            _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["root"],
            disabled ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["disabled"] : null,
            focused ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["focused"] : null,
            invalid === true ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["invalid"] : null,
            invalid === false ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["valid"] : null,
            readOnly ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["readonly"] : null,
            required ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["required"] : null,
            secondary ? _theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__["secondary"] : null
        ];
    }
    render() {
        const { aria = {}, forId, hidden, widgetId } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_3__["v"])('label', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_4__["formatAriaProperties"])(aria), { id: widgetId, classes: [
                ...this.theme(this.getRootClasses()),
                hidden ? _common_styles_base_m_css__WEBPACK_IMPORTED_MODULE_6__["visuallyHidden"] : null
            ], for: forId }), this.children);
    }
};
LabelBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_2__["theme"])(_theme_label_m_css__WEBPACK_IMPORTED_MODULE_5__),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_7__["customElement"])({
        tag: 'dojo-label',
        properties: ['theme', 'classes', 'aria', 'extraClasses', 'disabled', 'focused', 'readOnly', 'required', 'invalid', 'hidden', 'secondary'],
        attributes: [],
        events: []
    })
], LabelBase);

class Label extends LabelBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/listbox/ListboxOption.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/@dojo/widgets/listbox/ListboxOption.mjs ***!
  \**************************************************************/
/*! exports provided: ThemedBase, ListboxOptionBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListboxOptionBase", function() { return ListboxOptionBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ListboxOption; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../theme/listbox.m.css */ "./node_modules/@dojo/widgets/theme/listbox.m.css.js");
/* harmony import */ var _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_4__);





const ThemedBase = Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_1__["ThemedMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_3__["WidgetBase"]);
let ListboxOptionBase = class ListboxOptionBase extends ThemedBase {
    _onClick(event) {
        event.stopPropagation();
        const { index, key, option, onClick } = this.properties;
        onClick && onClick(option, index, key);
    }
    render() {
        const { css = [], disabled = false, id, label, selected = false } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', {
            'aria-disabled': disabled ? 'true' : null,
            'aria-selected': disabled ? null : String(selected),
            classes: this.theme(css),
            id,
            role: 'option',
            onclick: this._onClick
        }, [label]);
    }
};
ListboxOptionBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_1__["theme"])(_theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_4__)
], ListboxOptionBase);

class ListboxOption extends ListboxOptionBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/listbox/index.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/widgets/listbox/index.mjs ***!
  \******************************************************/
/*! exports provided: ScrollMeta, ThemedBase, ListboxBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScrollMeta", function() { return ScrollMeta; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListboxBase", function() { return ListboxBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Listbox; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var _dojo_framework_widget_core_meta_Dimensions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/meta/Dimensions */ "./node_modules/@dojo/framework/widget-core/meta/Dimensions.mjs");
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/util */ "./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var _dojo_framework_widget_core_meta_Base__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/widget-core/meta/Base */ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Focus__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Focus */ "./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs");
/* harmony import */ var _dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @dojo/framework/core/util */ "./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../theme/listbox.m.css */ "./node_modules/@dojo/widgets/theme/listbox.m.css.js");
/* harmony import */ var _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _ListboxOption__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ListboxOption */ "./node_modules/@dojo/widgets/listbox/ListboxOption.mjs");
/* harmony import */ var _dojo_framework_widget_core_meta_Focus__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @dojo/framework/widget-core/meta/Focus */ "./node_modules/@dojo/framework/widget-core/meta/Focus.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");















/* Default scroll meta */
class ScrollMeta extends _dojo_framework_widget_core_meta_Base__WEBPACK_IMPORTED_MODULE_5__["default"] {
    scroll(key, amount) {
        const node = this.getNode(key);
        if (node) {
            node.scrollTop = amount;
        }
    }
}
const ThemedBase = Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_6__["ThemedMixin"])(Object(_dojo_framework_widget_core_mixins_Focus__WEBPACK_IMPORTED_MODULE_7__["FocusMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_10__["WidgetBase"]));
let ListboxBase = class ListboxBase extends ThemedBase {
    constructor() {
        super(...arguments);
        this._boundRenderOption = this.renderOption.bind(this);
        this._idBase = Object(_dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_8__["uuid"])();
    }
    _getOptionDisabled(option, index) {
        const { getOptionDisabled } = this.properties;
        return getOptionDisabled ? getOptionDisabled(option, index) : false;
    }
    _getOptionId(index) {
        const { optionData = [], getOptionId } = this.properties;
        return getOptionId ? getOptionId(optionData[index], index) : `${this._idBase}-${index}`;
    }
    _onKeyDown(event) {
        event.stopPropagation();
        const { activeIndex = 0, key, optionData = [], onActiveIndexChange, onOptionSelect, onKeyDown } = this.properties;
        onKeyDown && onKeyDown(event, key);
        const activeItem = optionData[activeIndex];
        let newIndex;
        switch (event.which) {
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].Enter:
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].Space:
                event.preventDefault();
                if (!this._getOptionDisabled(activeItem, activeIndex)) {
                    onOptionSelect && onOptionSelect(activeItem, activeIndex, key);
                }
                break;
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].Down:
                event.preventDefault();
                newIndex = (activeIndex + 1) % optionData.length;
                onActiveIndexChange && onActiveIndexChange(newIndex, key);
                break;
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].Up:
                event.preventDefault();
                newIndex = (activeIndex - 1 + optionData.length) % optionData.length;
                onActiveIndexChange && onActiveIndexChange(newIndex, key);
                break;
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].Home:
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].PageUp:
                onActiveIndexChange && onActiveIndexChange(0, key);
                break;
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].End:
            case _common_util__WEBPACK_IMPORTED_MODULE_4__["Keys"].PageDown:
                onActiveIndexChange && onActiveIndexChange(optionData.length - 1, key);
                break;
        }
    }
    _onOptionClick(option, index, key) {
        const { onActiveIndexChange, onOptionSelect } = this.properties;
        if (!this._getOptionDisabled(option, index)) {
            onActiveIndexChange && onActiveIndexChange(index, key);
            onOptionSelect && onOptionSelect(option, index, key);
        }
    }
    animateScroll(scrollValue) {
        this.meta(ScrollMeta).scroll('root', scrollValue);
    }
    calculateScroll(previousProperties, { activeIndex = 0 }) {
        const menuDimensions = this.meta(_dojo_framework_widget_core_meta_Dimensions__WEBPACK_IMPORTED_MODULE_3__["default"]).get('root');
        const scrollOffset = menuDimensions.scroll.top;
        const menuHeight = menuDimensions.offset.height;
        const optionOffset = this.meta(_dojo_framework_widget_core_meta_Dimensions__WEBPACK_IMPORTED_MODULE_3__["default"]).get(this._getOptionId(activeIndex)).offset;
        if (optionOffset.top - scrollOffset < 0) {
            this.animateScroll(optionOffset.top);
        }
        else if ((optionOffset.top + optionOffset.height) > (scrollOffset + menuHeight)) {
            this.animateScroll(optionOffset.top + optionOffset.height - menuHeight);
        }
    }
    getModifierClasses() {
        const { visualFocus } = this.properties;
        const focus = this.meta(_dojo_framework_widget_core_meta_Focus__WEBPACK_IMPORTED_MODULE_13__["Focus"]).get('root');
        return [
            (visualFocus || focus.containsFocus) ? _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["focused"] : null
        ];
    }
    getOptionClasses(active, disabled, selected) {
        return [
            _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["option"],
            active ? _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["activeOption"] : null,
            disabled ? _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["disabledOption"] : null,
            selected ? _theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["selectedOption"] : null
        ];
    }
    renderOptionLabel(option, index) {
        const { getOptionLabel } = this.properties;
        return getOptionLabel ? getOptionLabel(option, index) : `${option}`;
    }
    renderOption(option, index) {
        const { activeIndex = 0, getOptionSelected, theme, classes } = this.properties;
        const disabled = this._getOptionDisabled(option, index);
        const selected = getOptionSelected ? getOptionSelected(option, index) : false;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_9__["v"])('div', { key: this._getOptionId(index) }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_9__["w"])(_ListboxOption__WEBPACK_IMPORTED_MODULE_12__["default"], {
                active: activeIndex === index,
                css: this.getOptionClasses(activeIndex === index, disabled, selected),
                classes,
                disabled,
                label: this.renderOptionLabel(option, index),
                id: this._getOptionId(index),
                index: index,
                key: `option-${index}`,
                option,
                selected,
                theme,
                onClick: this._onOptionClick
            })
        ]);
    }
    renderOptions() {
        const { optionData = [] } = this.properties;
        return optionData.map(this._boundRenderOption);
    }
    render() {
        const { activeIndex = 0, aria = {}, widgetId, multiselect = false, tabIndex = 0 } = this.properties;
        const themeClasses = this.getModifierClasses();
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_9__["v"])('div', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_4__["formatAriaProperties"])(aria), { 'aria-activedescendant': this._getOptionId(activeIndex), 'aria-multiselectable': multiselect ? 'true' : null, classes: this.theme([_theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__["root"], ...themeClasses]), id: widgetId, focus: this.shouldFocus, key: 'root', role: 'listbox', tabIndex, onkeydown: this._onKeyDown }), this.renderOptions());
    }
};
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_2__["diffProperty"])('activeIndex', _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_1__["auto"]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Function),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [Object, Object]),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:returntype", void 0)
], ListboxBase.prototype, "calculateScroll", null);
ListboxBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_6__["theme"])(_theme_listbox_m_css__WEBPACK_IMPORTED_MODULE_11__),
    Object(_dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_2__["diffProperty"])('optionData', _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_1__["reference"]),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_14__["customElement"])({
        tag: 'dojo-listbox',
        properties: [
            'theme',
            'classes',
            'activeIndex',
            'multiselect',
            'tabIndex',
            'visualFocus',
            'optionData',
            'getOptionDisabled',
            'getOptionId',
            'getOptionLabel',
            'getOptionSelected'
        ],
        attributes: [
            'widgetId'
        ],
        events: [
            'onActiveIndexChange',
            'onKeyDown',
            'onOptionSelect'
        ]
    })
], ListboxBase);

class Listbox extends ListboxBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/select/index.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/@dojo/widgets/select/index.mjs ***!
  \*****************************************************/
/*! exports provided: ThemedBase, SelectBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SelectBase", function() { return SelectBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Select; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/diffProperty */ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/diff */ "./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Focus__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Focus */ "./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs");
/* harmony import */ var _dojo_framework_widget_core_meta_Focus__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @dojo/framework/widget-core/meta/Focus */ "./node_modules/@dojo/framework/widget-core/meta/Focus.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @dojo/framework/core/util */ "./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var _dojo_framework_shim_array__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @dojo/framework/shim/array */ "./node_modules/@dojo/framework/shim/array.mjs");
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../common/util */ "./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var _icon_index__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../icon/index */ "./node_modules/@dojo/widgets/icon/index.mjs");
/* harmony import */ var _label_index__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../label/index */ "./node_modules/@dojo/widgets/label/index.mjs");
/* harmony import */ var _listbox_index__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../listbox/index */ "./node_modules/@dojo/widgets/listbox/index.mjs");
/* harmony import */ var _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../theme/select.m.css */ "./node_modules/@dojo/widgets/theme/select.m.css.js");
/* harmony import */ var _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");
















const ThemedBase = Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_4__["ThemedMixin"])(Object(_dojo_framework_widget_core_mixins_Focus__WEBPACK_IMPORTED_MODULE_5__["FocusMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["WidgetBase"]));
let SelectBase = class SelectBase extends ThemedBase {
    constructor() {
        super(...arguments);
        this._focusedIndex = 0;
        this._focusNode = 'trigger';
        this._ignoreBlur = false;
        this._open = false;
        this._baseId = Object(_dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_8__["uuid"])();
        this._inputText = '';
        this._getOptionSelected = (option, index) => {
            const { getOptionValue, value } = this.properties;
            return getOptionValue ? getOptionValue(option, index) === value : option === value;
        };
    }
    _getOptionLabel(option) {
        const { getOptionLabel } = this.properties;
        const fallback = option ? `${option}` : '';
        return getOptionLabel ? getOptionLabel(option) : fallback;
    }
    _getSelectedIndexOnInput(event) {
        const { options = [], getOptionDisabled, getOptionText } = this.properties;
        if (event.key !== undefined && event.key.length === 1) {
            clearTimeout(this._resetInputTextTimer);
            this._resetInputTextTimer = setTimeout(() => {
                this._inputText = '';
            }, 800);
            this._inputText += `${event.key}`;
            let index;
            options.some((option, i) => {
                if (getOptionDisabled && getOptionDisabled(option, i)) {
                    return false;
                }
                const optionText = getOptionText ? getOptionText(option) : this._getOptionLabel(option);
                if (typeof optionText === 'string' && optionText.toLowerCase().indexOf(this._inputText.toLowerCase()) === 0) {
                    index = i;
                    return true;
                }
                return false;
            });
            return index;
        }
    }
    _onBlur(event) { this.properties.onBlur && this.properties.onBlur(this.properties.key || ''); }
    _onFocus(event) { this.properties.onFocus && this.properties.onFocus(this.properties.key || ''); }
    // native select events
    _onNativeChange(event) {
        const { key, getOptionValue, options = [], onChange } = this.properties;
        event.stopPropagation();
        const value = event.target.value;
        const option = Object(_dojo_framework_shim_array__WEBPACK_IMPORTED_MODULE_9__["find"])(options, (option, index) => getOptionValue ? getOptionValue(option, index) === value : false);
        option && onChange && onChange(option, key);
    }
    // custom select events
    _openSelect() {
        this.focus();
        this._focusNode = 'listbox';
        this._ignoreBlur = true;
        this._open = true;
        this._focusedIndex = this._focusedIndex || 0;
        this.invalidate();
    }
    _closeSelect() {
        this._focusNode = 'trigger';
        this._ignoreBlur = true;
        this._open = false;
        this.invalidate();
    }
    _onDropdownKeyDown(event) {
        event.stopPropagation();
        if (event.which === _common_util__WEBPACK_IMPORTED_MODULE_10__["Keys"].Escape) {
            this._closeSelect();
            this.focus();
        }
    }
    _onTriggerClick(event) {
        event.stopPropagation();
        this._open ? this._closeSelect() : this._openSelect();
    }
    _onTriggerBlur(event) {
        if (this._ignoreBlur) {
            this._ignoreBlur = false;
            return;
        }
        const { key, onBlur } = this.properties;
        onBlur && onBlur(key);
        this._closeSelect();
    }
    _onTriggerKeyDown(event) {
        const { key, options = [], onChange } = this.properties;
        event.stopPropagation();
        const index = this._getSelectedIndexOnInput(event);
        if (index !== undefined) {
            this._focusedIndex = index;
            onChange && onChange(options[index], key);
            this.invalidate();
        }
        if (event.which === _common_util__WEBPACK_IMPORTED_MODULE_10__["Keys"].Down) {
            this._openSelect();
        }
    }
    _onTriggerMouseDown() {
        this._ignoreBlur = true;
    }
    _onListboxBlur(event) {
        if (this._ignoreBlur) {
            this._ignoreBlur = false;
            return;
        }
        const { key, onBlur } = this.properties;
        onBlur && onBlur(key);
        this._closeSelect();
    }
    getRootClasses() {
        const { disabled, invalid, readOnly, required } = this.properties;
        const focus = this.meta(_dojo_framework_widget_core_meta_Focus__WEBPACK_IMPORTED_MODULE_6__["default"]).get('root');
        return [
            _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["root"],
            disabled ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["disabled"] : null,
            focus.containsFocus ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["focused"] : null,
            invalid === true ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["invalid"] : null,
            invalid === false ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["valid"] : null,
            readOnly ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["readonly"] : null,
            required ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["required"] : null
        ];
    }
    renderExpandIcon() {
        const { theme, classes } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('span', { classes: this.theme(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["arrow"]) }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["w"])(_icon_index__WEBPACK_IMPORTED_MODULE_11__["default"], { type: 'downIcon', theme, classes })
        ]);
    }
    renderNativeSelect() {
        const { aria = {}, disabled, getOptionDisabled, getOptionId, getOptionSelected, getOptionValue, widgetId = this._baseId, invalid, name, options = [], readOnly, required, value } = this.properties;
        /* create option nodes */
        const optionNodes = options.map((option, i) => Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('option', {
            value: getOptionValue ? getOptionValue(option, i) : '',
            id: getOptionId ? getOptionId(option, i) : undefined,
            disabled: getOptionDisabled ? getOptionDisabled(option, i) : undefined,
            selected: getOptionSelected ? getOptionSelected(option, i) : undefined
        }, [this._getOptionLabel(option)]));
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('div', { classes: this.theme(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["inputWrapper"]) }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('select', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_10__["formatAriaProperties"])(aria), { classes: this.theme(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["input"]), disabled, focus: this.shouldFocus, 'aria-invalid': invalid ? 'true' : null, id: widgetId, name,
                readOnly, 'aria-readonly': readOnly ? 'true' : null, required,
                value, onblur: this._onBlur, onchange: this._onNativeChange, onfocus: this._onFocus }), optionNodes),
            this.renderExpandIcon()
        ]);
    }
    renderCustomSelect() {
        const { getOptionDisabled, getOptionId, getOptionLabel, getOptionSelected = this._getOptionSelected, widgetId = this._baseId, key, options = [], theme, classes, onChange } = this.properties;
        const { _open, _focusedIndex } = this;
        // create dropdown trigger and select box
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('div', {
            key: 'wrapper',
            classes: this.theme([_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["inputWrapper"], _open ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["open"] : null])
        }, [
            ...this.renderCustomTrigger(),
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('div', {
                classes: this.theme(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["dropdown"]),
                onfocusout: this._onListboxBlur,
                onkeydown: this._onDropdownKeyDown
            }, [
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["w"])(_listbox_index__WEBPACK_IMPORTED_MODULE_13__["default"], {
                    key: 'listbox',
                    activeIndex: _focusedIndex,
                    widgetId: widgetId,
                    focus: this._focusNode === 'listbox' ? this.shouldFocus : () => false,
                    optionData: options,
                    tabIndex: _open ? 0 : -1,
                    getOptionDisabled,
                    getOptionId,
                    getOptionLabel,
                    getOptionSelected,
                    theme,
                    classes,
                    onActiveIndexChange: (index) => {
                        this._focusedIndex = index;
                        this.invalidate();
                    },
                    onOptionSelect: (option) => {
                        onChange && onChange(option, key);
                        this._closeSelect();
                        this.focus();
                    },
                    onKeyDown: (event) => {
                        const index = this._getSelectedIndexOnInput(event);
                        if (index !== undefined) {
                            this._focusedIndex = index;
                            this.invalidate();
                        }
                    }
                })
            ])
        ]);
    }
    renderCustomTrigger() {
        const { aria = {}, disabled, getOptionSelected = this._getOptionSelected, invalid, options = [], placeholder, readOnly, required, value } = this.properties;
        let label;
        let isPlaceholder = false;
        const selectedOption = Object(_dojo_framework_shim_array__WEBPACK_IMPORTED_MODULE_9__["find"])(options, (option, index) => {
            return getOptionSelected(option, index);
        });
        if (selectedOption) {
            label = this._getOptionLabel(selectedOption);
        }
        else {
            isPlaceholder = true;
            label = placeholder ? placeholder : this._getOptionLabel(options[0]);
        }
        return [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('button', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_10__["formatAriaProperties"])(aria), { 'aria-controls': this._baseId, 'aria-expanded': `${this._open}`, 'aria-haspopup': 'listbox', 'aria-invalid': invalid ? 'true' : null, 'aria-required': required ? 'true' : null, classes: this.theme([_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["trigger"], isPlaceholder ? _theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__["placeholder"] : null]), disabled: disabled || readOnly, focus: this._focusNode === 'trigger' ? this.shouldFocus : () => false, key: 'trigger', type: 'button', value, onblur: this._onTriggerBlur, onclick: this._onTriggerClick, onfocus: this._onFocus, onkeydown: this._onTriggerKeyDown, onmousedown: this._onTriggerMouseDown }), [label]),
            this.renderExpandIcon()
        ];
    }
    render() {
        const { label, labelHidden, labelAfter, disabled, widgetId = this._baseId, invalid, readOnly, required, useNativeElement = false, theme, classes } = this.properties;
        const focus = this.meta(_dojo_framework_widget_core_meta_Focus__WEBPACK_IMPORTED_MODULE_6__["default"]).get('root');
        const children = [
            label ? Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["w"])(_label_index__WEBPACK_IMPORTED_MODULE_12__["default"], {
                theme,
                classes,
                disabled,
                focused: focus.containsFocus,
                invalid,
                readOnly,
                required,
                hidden: labelHidden,
                forId: widgetId
            }, [label]) : null,
            useNativeElement ? this.renderNativeSelect() : this.renderCustomSelect()
        ];
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_7__["v"])('div', {
            key: 'root',
            classes: this.theme(this.getRootClasses())
        }, labelAfter ? children.reverse() : children);
    }
};
SelectBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_4__["theme"])(_theme_select_m_css__WEBPACK_IMPORTED_MODULE_14__),
    Object(_dojo_framework_widget_core_decorators_diffProperty__WEBPACK_IMPORTED_MODULE_2__["diffProperty"])('options', _dojo_framework_widget_core_diff__WEBPACK_IMPORTED_MODULE_3__["reference"]),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_15__["customElement"])({
        tag: 'dojo-select',
        properties: [
            'theme',
            'classes',
            'aria',
            'extraClasses',
            'options',
            'useNativeElement',
            'getOptionDisabled',
            'getOptionId',
            'getOptionLabel',
            'getOptionText',
            'getOptionSelected',
            'getOptionValue',
            'readOnly',
            'required',
            'invalid',
            'disabled',
            'labelAfter',
            'labelHidden'
        ],
        attributes: ['widgetId', 'placeholder', 'label', 'value'],
        events: [
            'onBlur',
            'onChange',
            'onFocus'
        ]
    })
], SelectBase);

class Select extends SelectBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/slide-pane/index.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/widgets/slide-pane/index.mjs ***!
  \*********************************************************/
/*! exports provided: Align, ThemedBase, SlidePaneBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Align", function() { return Align; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SlidePaneBase", function() { return SlidePaneBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SlidePane; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/core/util */ "./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/util */ "./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var _common_styles_animations_m_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/styles/animations.m.css */ "./node_modules/@dojo/widgets/common/styles/animations.m.css.js");
/* harmony import */ var _common_styles_animations_m_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_common_styles_animations_m_css__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _common_nls_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/nls/common */ "./node_modules/@dojo/widgets/common/nls/common.mjs");
/* harmony import */ var _icon_index__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../icon/index */ "./node_modules/@dojo/widgets/icon/index.mjs");
/* harmony import */ var _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./styles/slide-pane.m.css */ "./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css.js");
/* harmony import */ var _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../theme/slide-pane.m.css */ "./node_modules/@dojo/widgets/theme/slide-pane.m.css.js");
/* harmony import */ var _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");













/**
 * Enum for left / right alignment
 */
var Align;
(function (Align) {
    Align["bottom"] = "bottom";
    Align["left"] = "left";
    Align["right"] = "right";
    Align["top"] = "top";
})(Align || (Align = {}));
/**
 * The default width of the slide pane
 */
const DEFAULT_WIDTH = 320;
var Plane;
(function (Plane) {
    Plane[Plane["x"] = 0] = "x";
    Plane[Plane["y"] = 1] = "y";
})(Plane || (Plane = {}));
const ThemedBase = Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_2__["I18nMixin"])(Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__["ThemedMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_5__["WidgetBase"]));
let SlidePaneBase = class SlidePaneBase extends ThemedBase {
    constructor() {
        super(...arguments);
        this._initialPosition = 0;
        this._titleId = Object(_dojo_framework_core_util__WEBPACK_IMPORTED_MODULE_1__["uuid"])();
        this._wasOpen = false;
        this._stylesTransform = null;
        this._attached = false;
        this._hasMoved = false;
    }
    get plane() {
        const { align = Align.left } = this.properties;
        return align === Align.left || align === Align.right ? Plane.x : Plane.y;
    }
    _getDelta(event, eventType) {
        const { align = Align.left } = this.properties;
        if (this.plane === Plane.x) {
            const currentX = event.type === eventType ? event.changedTouches[0].screenX : event.pageX;
            return align === Align.right ? currentX - this._initialPosition : this._initialPosition - currentX;
        }
        else {
            const currentY = event.type === eventType ? event.changedTouches[0].screenY : event.pageY;
            return align === Align.bottom ? currentY - this._initialPosition : this._initialPosition - currentY;
        }
    }
    _onCloseClick(event) {
        event.stopPropagation();
        const { onRequestClose } = this.properties;
        onRequestClose && onRequestClose();
    }
    _onSwipeStart(event) {
        event.stopPropagation();
        this._swiping = true;
        // Cache initial pointer position
        if (this.plane === Plane.x) {
            this._initialPosition = event.type === 'touchstart' ? event.changedTouches[0].screenX : event.pageX;
        }
        else {
            this._initialPosition = event.type === 'touchstart' ? event.changedTouches[0].screenY : event.pageY;
        }
        // Clear out the last transform applied
        this._transform = 0;
    }
    _onSwipeMove(event) {
        event.stopPropagation();
        // Ignore mouse movement when not clicking
        if (!this._swiping) {
            return;
        }
        this._hasMoved = true;
        const { align = Align.left, width = DEFAULT_WIDTH } = this.properties;
        const delta = this._getDelta(event, 'touchmove');
        // Transform to apply
        this._transform = 100 * delta / width;
        // Prevent pane from sliding past screen edge
        if (delta <= 0) {
            return;
        }
        // Move the pane
        if (this.plane === Plane.x) {
            this._stylesTransform = `translateX(${align === Align.left ? '-' : ''}${this._transform}%)`;
        }
        else {
            this._stylesTransform = `translateY(${align === Align.top ? '-' : ''}${this._transform}%)`;
        }
        this.invalidate();
    }
    _onSwipeEnd(event) {
        event.stopPropagation();
        this._swiping = false;
        this._hasMoved = false;
        const { onRequestClose, width = DEFAULT_WIDTH } = this.properties;
        const delta = this._getDelta(event, 'touchend');
        // If the pane was swiped far enough to close
        if (delta > width / 2) {
            // Cache the transform to apply on next render
            this._transform = 100 * delta / width;
            onRequestClose && onRequestClose();
        }
        else if (delta > 0) {
            // Animate the pane back open
            this._slideIn = true;
            this.invalidate();
        }
    }
    _onUnderlayMouseUp(event) {
        const { onRequestClose } = this.properties;
        if (this._hasMoved === false) {
            onRequestClose && onRequestClose();
        }
    }
    onAttach() {
        this._attached = true;
    }
    getContent() {
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', { classes: [this.theme(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["content"]), _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["contentFixed"]] }, this.children);
    }
    getStyles() {
        const { align = Align.left, open = false, width = DEFAULT_WIDTH } = this.properties;
        let translate = '';
        const translateAxis = this.plane === Plane.x ? 'X' : 'Y';
        // If pane is closing because of swipe
        if (!open && this._wasOpen && this._transform) {
            translate = align === Align.left || align === Align.top ? `-${this._transform}` : `${this._transform}`;
        }
        return {
            transform: translate ? `translate${translateAxis}(${translate}%)` : this._stylesTransform,
            width: this.plane === Plane.x ? `${width}px` : null,
            height: this.plane === Plane.y ? `${width}px` : null
        };
    }
    getFixedModifierClasses() {
        const { align = Align.left, open = false } = this.properties;
        const alignCss = _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__;
        return [
            open ? _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["openFixed"] : null,
            alignCss[`${align}Fixed`],
            this._slideIn || (open && !this._wasOpen) ? _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["slideInFixed"] : null,
            !open && this._wasOpen ? _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["slideOutFixed"] : null
        ];
    }
    getModifierClasses() {
        const { align = Align.left, open = false } = this.properties;
        const alignCss = _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__;
        return [
            alignCss[align],
            open ? _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["open"] : null,
            this._slideIn || (open && !this._wasOpen) ? _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["slideIn"] : null,
            !open && this._wasOpen ? _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["slideOut"] : null
        ];
    }
    renderTitle() {
        const { title = '' } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', { id: this._titleId }, [title]);
    }
    renderUnderlay() {
        const { underlay = false } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
            classes: [this.theme(underlay ? _theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["underlayVisible"] : null), _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["underlay"]],
            enterAnimation: _common_styles_animations_m_css__WEBPACK_IMPORTED_MODULE_7__["fadeIn"],
            exitAnimation: _common_styles_animations_m_css__WEBPACK_IMPORTED_MODULE_7__["fadeOut"],
            onmouseup: this._onUnderlayMouseUp,
            ontouchend: this._onUnderlayMouseUp,
            key: 'underlay'
        });
    }
    render() {
        let { aria = {}, closeText, onOpen, open = false, title = '', theme, classes } = this.properties;
        const contentStyles = this.getStyles();
        const contentClasses = this.getModifierClasses();
        const fixedContentClasses = this.getFixedModifierClasses();
        if (this._slideIn && this._attached) {
            this._stylesTransform = '';
        }
        if (!closeText) {
            const { messages } = this.localizeBundle(_common_nls_common__WEBPACK_IMPORTED_MODULE_8__["default"]);
            closeText = `${messages.close} ${title}`;
        }
        open && !this._wasOpen && onOpen && onOpen();
        this._wasOpen = open;
        this._slideIn = false;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
            'aria-labelledby': this._titleId,
            classes: this.theme(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["root"]),
            onmousedown: this._onSwipeStart,
            onmousemove: this._onSwipeMove,
            onmouseup: this._onSwipeEnd,
            ontouchend: this._onSwipeEnd,
            ontouchmove: this._onSwipeMove,
            ontouchstart: this._onSwipeStart
        }, [
            open ? this.renderUnderlay() : null,
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', Object.assign({}, Object(_common_util__WEBPACK_IMPORTED_MODULE_6__["formatAriaProperties"])(aria), { key: 'content', classes: [...this.theme([_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["pane"], ...contentClasses]), _styles_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_10__["paneFixed"], ...fixedContentClasses], transitionend: this.invalidate, styles: contentStyles }), [
                title ? Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
                    classes: this.theme(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["title"]),
                    key: 'title'
                }, [
                    this.renderTitle(),
                    Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('button', {
                        classes: this.theme(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__["close"]),
                        type: 'button',
                        onclick: this._onCloseClick
                    }, [
                        closeText,
                        Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["w"])(_icon_index__WEBPACK_IMPORTED_MODULE_9__["default"], { type: 'closeIcon', theme, classes })
                    ])
                ]) : null,
                this.getContent()
            ])
        ]);
    }
};
SlidePaneBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__["theme"])(_theme_slide_pane_m_css__WEBPACK_IMPORTED_MODULE_11__),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_12__["customElement"])({
        tag: 'dojo-slide-pane',
        properties: ['theme', 'aria', 'extraClasses', 'open', 'underlay', 'classes'],
        attributes: ['align', 'closeText', 'title'],
        events: [
            'onOpen',
            'onRequestClose'
        ]
    })
], SlidePaneBase);

class SlidePane extends SlidePaneBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css":
/*!***********************************************************************!*\
  !*** ./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css */ "./node_modules/@dojo/widgets/slide-pane/styles/slide-pane.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"underlay":"ZJyi9mWa","paneFixed":"geLsDLAm","contentFixed":"_16ddxK4v","leftFixed":"_2CBYuBsa","rightFixed":"LHBt3Aou","topFixed":"_1o1D2-gL","bottomFixed":"_2fS48yNu","slideOutFixed":"_1Uk4GQZP","slideInFixed":"_3aYW-YFP","openFixed":"_1UDNk_HU"," _key":"@dojo/widgets/slide-pane"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/icon.m.css":
/*!*****************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/icon.m.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/icon.m.css.js":
/*!********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/icon.m.css.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/icon.m.css */ "./node_modules/@dojo/widgets/theme/icon.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"root":"_2L6Ls-Zy","icon":"_3tF1vZM-","downIcon":"_3GFyIk3G","leftIcon":"_1db8DKc8","rightIcon":"_2a143YET","closeIcon":"w1WZiet2","plusIcon":"_2V_909OC","minusIcon":"_27KOe4gH","checkIcon":"mKil4MCX","upIcon":"Rw4TXrdb","upAltIcon":"b2BPqdCO","downAltIcon":"_3QpkEw-I","searchIcon":"_3MWqsC_b","barsIcon":"_3uXWm-H6","settingsIcon":"_3V--OLwl","alertIcon":"_3YjJOXWh","helpIcon":"_3mL91Z0s","infoIcon":"dZLeo6Sf","phoneIcon":"_1vzkNuNB","editIcon":"_2y3IH3o2","dateIcon":"_1_x6RqtA","linkIcon":"HkV2v3yK","locationIcon":"_24-7y_Lz","secureIcon":"_2cTDxmou","mailIcon":"_12PMYHnq"," _key":"@dojo/widgets/icon"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/label.m.css ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css.js":
/*!*********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/label.m.css.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/label.m.css */ "./node_modules/@dojo/widgets/theme/label.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"root":"_1Xn7GZjl","readonly":"_79gMw0vX","invalid":"_1HXQXand","valid":"_3TeO85nD","required":"_2a_lwZi8","disabled":"_3gv9ptxH","focused":"_2Qy2nYta","secondary":"_29UpR7Gd"," _key":"@dojo/widgets/label"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/listbox.m.css":
/*!********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/listbox.m.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/listbox.m.css.js":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/listbox.m.css.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/listbox.m.css */ "./node_modules/@dojo/widgets/theme/listbox.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"root":"_16vSBEPX","focused":"_3M-zaY9v","option":"MMFTfgmD","activeOption":"_1FTY-B02","disabledOption":"_275oqePd","selectedOption":"_13tNGSOF"," _key":"@dojo/widgets/listbox"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/select.m.css":
/*!*******************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/select.m.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/select.m.css.js":
/*!**********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/select.m.css.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/select.m.css */ "./node_modules/@dojo/widgets/theme/select.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"root":"_1LR3Qq0p","inputWrapper":"_1XSeTCk3","trigger":"_247dfl6z","placeholder":"_3QPbsYHn","required":"_2doLU3oZ","dropdown":"_1PomDaSE","open":"_2aIUMkvX","input":"_1oGGnLOG","arrow":"_3nXwwAIl","focused":"TIg6nVog","disabled":"_3AB08jmw","readonly":"_35xFLM6c","invalid":"_22-e6sRp","valid":"_2BYdZkRE"," _key":"@dojo/widgets/select"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slide-pane.m.css":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/slide-pane.m.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slide-pane.m.css.js":
/*!**************************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/slide-pane.m.css.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/slide-pane.m.css */ "./node_modules/@dojo/widgets/theme/slide-pane.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"root":"_27hIyl5Q","slideIn":"_1Y0qXx1t","slideOut":"_3UjBe_qo","underlayVisible":"_1wKNZcBn","content":"_3V_bfHIT","open":"_1nADkSkW","pane":"_3W7iyFHd","title":"WbrkIbTU","close":"onY8sM7Z","left":"_YGKPjx4","right":"Mh9mwWT3","top":"_33dC6Hy_","bottom":"_3gP6oSQg"," _key":"@dojo/widgets/slide-pane"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/toolbar.m.css":
/*!********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/toolbar.m.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/toolbar.m.css.js":
/*!***********************************************************!*\
  !*** ./node_modules/@dojo/widgets/theme/toolbar.m.css.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/theme/toolbar.m.css */ "./node_modules/@dojo/widgets/theme/toolbar.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"actions":"_5E9jF1Pb","collapsed":"_2NNctpHs","menuButton":"xHc4SjsX","root":"KnywAHNo","title":"_1jpx3AuG"," _key":"@dojo/widgets/toolbar"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/toolbar/index.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@dojo/widgets/toolbar/index.mjs ***!
  \******************************************************/
/*! exports provided: ThemedBase, ToolbarBase, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemedBase", function() { return ThemedBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ToolbarBase", function() { return ToolbarBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Toolbar; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.js");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dojo_framework_widget_core_meta_Dimensions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/meta/Dimensions */ "./node_modules/@dojo/framework/widget-core/meta/Dimensions.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _icon_index__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../icon/index */ "./node_modules/@dojo/widgets/icon/index.mjs");
/* harmony import */ var _slide_pane_index__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../slide-pane/index */ "./node_modules/@dojo/widgets/slide-pane/index.mjs");
/* harmony import */ var _common_nls_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/nls/common */ "./node_modules/@dojo/widgets/common/nls/common.mjs");
/* harmony import */ var _styles_toolbar_m_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./styles/toolbar.m.css */ "./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css.js");
/* harmony import */ var _styles_toolbar_m_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_styles_toolbar_m_css__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../theme/toolbar.m.css */ "./node_modules/@dojo/widgets/theme/toolbar.m.css.js");
/* harmony import */ var _theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _global_event_index__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../global-event/index */ "./node_modules/@dojo/widgets/global-event/index.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/customElement */ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");













const ThemedBase = Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_2__["I18nMixin"])(Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__["ThemedMixin"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_5__["WidgetBase"]));
let ToolbarBase = class ToolbarBase extends ThemedBase {
    constructor() {
        super(...arguments);
        this._collapsed = false;
        this._open = false;
        this._collapseIfNecessary = () => {
            const { collapseWidth = 800, onCollapse } = this.properties;
            const { width } = this.meta(_dojo_framework_widget_core_meta_Dimensions__WEBPACK_IMPORTED_MODULE_1__["Dimensions"]).get('root').size;
            if (width > collapseWidth && this._collapsed === true) {
                this._collapsed = false;
                onCollapse && onCollapse(this._collapsed);
                this.invalidate();
            }
            else if (width <= collapseWidth && this._collapsed === false) {
                this._collapsed = true;
                onCollapse && onCollapse(this._collapsed);
                this.invalidate();
            }
        };
    }
    _closeMenu() {
        this._open = false;
        this.invalidate();
    }
    _toggleMenu(event) {
        event.stopPropagation();
        this._open = !this._open;
        this.invalidate();
    }
    onAttach() {
        this._collapseIfNecessary();
    }
    renderActions() {
        const { close } = this.localizeBundle(_common_nls_common__WEBPACK_IMPORTED_MODULE_8__["default"]).messages;
        const { theme, classes, heading } = this.properties;
        return this._collapsed ? Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["w"])(_slide_pane_index__WEBPACK_IMPORTED_MODULE_7__["default"], {
            align: _slide_pane_index__WEBPACK_IMPORTED_MODULE_7__["Align"].right,
            closeText: close,
            key: 'slide-pane-menu',
            onRequestClose: this._closeMenu,
            open: this._open,
            theme,
            classes,
            title: heading
        }, this.children) : Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
            classes: this.theme(_theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__["actions"]),
            key: 'menu'
        }, this.children);
    }
    renderButton() {
        const { open } = this.localizeBundle(_common_nls_common__WEBPACK_IMPORTED_MODULE_8__["default"]).messages;
        const { theme, classes } = this.properties;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('button', {
            classes: this.theme(_theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__["menuButton"]),
            type: 'button',
            onclick: this._toggleMenu
        }, [
            open,
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["w"])(_icon_index__WEBPACK_IMPORTED_MODULE_6__["default"], { type: 'barsIcon', theme, classes })
        ]);
    }
    render() {
        const { heading } = this.properties;
        const hasActions = this.children && this.children.length;
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
            key: 'root',
            classes: [
                _styles_toolbar_m_css__WEBPACK_IMPORTED_MODULE_9__["rootFixed"],
                ...this.theme([
                    _theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__["root"],
                    this._collapsed ? _theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__["collapsed"] : null
                ])
            ]
        }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["w"])(_global_event_index__WEBPACK_IMPORTED_MODULE_11__["GlobalEvent"], { key: 'global', window: { resize: this._collapseIfNecessary } }),
            heading ? Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_4__["v"])('div', {
                classes: this.theme(_theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__["title"])
            }, [heading]) : null,
            hasActions ? this.renderActions() : null,
            hasActions && this._collapsed ? this.renderButton() : null
        ]);
    }
};
ToolbarBase = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_3__["theme"])(_theme_toolbar_m_css__WEBPACK_IMPORTED_MODULE_10__),
    Object(_dojo_framework_widget_core_decorators_customElement__WEBPACK_IMPORTED_MODULE_12__["customElement"])({
        tag: 'dojo-toolbar',
        properties: ['theme', 'classes', 'extraClasses', 'collapseWidth'],
        attributes: ['key', 'heading'],
        events: [
            'onCollapse'
        ]
    })
], ToolbarBase);

class Toolbar extends ToolbarBase {
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css":
/*!*****************************************************************!*\
  !*** ./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css.js":
/*!********************************************************************!*\
  !*** ./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__(/*! ./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css */ "./node_modules/@dojo/widgets/toolbar/styles/toolbar.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return (factory()); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}
}(this, function () {
	return {"rootFixed":"ZdCaptWX"," _key":"@dojo/widgets/toolbar"};
}));;

/***/ }),

/***/ "./node_modules/cldrjs/dist/cldr.js":
/*!******************************************!*\
  !*** ./node_modules/cldrjs/dist/cldr.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * CLDR JavaScript Library v0.5.0
 * http://jquery.com/
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-08-11T11:52Z
 */
/*!
 * CLDR JavaScript Library v0.5.0 2017-08-11T11:52Z MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */
(function( root, factory ) {

	if ( true ) {
		// AMD.
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}( this, function() {


	var arrayIsArray = Array.isArray || function( obj ) {
		return Object.prototype.toString.call( obj ) === "[object Array]";
	};




	var pathNormalize = function( path, attributes ) {
		if ( arrayIsArray( path ) ) {
			path = path.join( "/" );
		}
		if ( typeof path !== "string" ) {
			throw new Error( "invalid path \"" + path + "\"" );
		}
		// 1: Ignore leading slash `/`
		// 2: Ignore leading `cldr/`
		path = path
			.replace( /^\// , "" ) /* 1 */
			.replace( /^cldr\// , "" ); /* 2 */

		// Replace {attribute}'s
		path = path.replace( /{[a-zA-Z]+}/g, function( name ) {
			name = name.replace( /^{([^}]*)}$/, "$1" );
			return attributes[ name ];
		});

		return path.split( "/" );
	};




	var arraySome = function( array, callback ) {
		var i, length;
		if ( array.some ) {
			return array.some( callback );
		}
		for ( i = 0, length = array.length; i < length; i++ ) {
			if ( callback( array[ i ], i, array ) ) {
				return true;
			}
		}
		return false;
	};




	/**
	 * Return the maximized language id as defined in
	 * http://www.unicode.org/reports/tr35/#Likely_Subtags
	 * 1. Canonicalize.
	 * 1.1 Make sure the input locale is in canonical form: uses the right
	 * separator, and has the right casing.
	 * TODO Right casing? What df? It seems languages are lowercase, scripts are
	 * Capitalized, territory is uppercase. I am leaving this as an exercise to
	 * the user.
	 *
	 * 1.2 Replace any deprecated subtags with their canonical values using the
	 * <alias> data in supplemental metadata. Use the first value in the
	 * replacement list, if it exists. Language tag replacements may have multiple
	 * parts, such as "sh" ➞ "sr_Latn" or mo" ➞ "ro_MD". In such a case, the
	 * original script and/or region are retained if there is one. Thus
	 * "sh_Arab_AQ" ➞ "sr_Arab_AQ", not "sr_Latn_AQ".
	 * TODO What <alias> data?
	 *
	 * 1.3 If the tag is grandfathered (see <variable id="$grandfathered"
	 * type="choice"> in the supplemental data), then return it.
	 * TODO grandfathered?
	 *
	 * 1.4 Remove the script code 'Zzzz' and the region code 'ZZ' if they occur.
	 * 1.5 Get the components of the cleaned-up source tag (languages, scripts,
	 * and regions), plus any variants and extensions.
	 * 2. Lookup. Lookup each of the following in order, and stop on the first
	 * match:
	 * 2.1 languages_scripts_regions
	 * 2.2 languages_regions
	 * 2.3 languages_scripts
	 * 2.4 languages
	 * 2.5 und_scripts
	 * 3. Return
	 * 3.1 If there is no match, either return an error value, or the match for
	 * "und" (in APIs where a valid language tag is required).
	 * 3.2 Otherwise there is a match = languagem_scriptm_regionm
	 * 3.3 Let xr = xs if xs is not empty, and xm otherwise.
	 * 3.4 Return the language tag composed of languager _ scriptr _ regionr +
	 * variants + extensions.
	 *
	 * @subtags [Array] normalized language id subtags tuple (see init.js).
	 */
	var coreLikelySubtags = function( Cldr, cldr, subtags, options ) {
		var match, matchFound,
			language = subtags[ 0 ],
			script = subtags[ 1 ],
			sep = Cldr.localeSep,
			territory = subtags[ 2 ],
			variants = subtags.slice( 3, 4 );
		options = options || {};

		// Skip if (language, script, territory) is not empty [3.3]
		if ( language !== "und" && script !== "Zzzz" && territory !== "ZZ" ) {
			return [ language, script, territory ].concat( variants );
		}

		// Skip if no supplemental likelySubtags data is present
		if ( typeof cldr.get( "supplemental/likelySubtags" ) === "undefined" ) {
			return;
		}

		// [2]
		matchFound = arraySome([
			[ language, script, territory ],
			[ language, territory ],
			[ language, script ],
			[ language ],
			[ "und", script ]
		], function( test ) {
			return match = !(/\b(Zzzz|ZZ)\b/).test( test.join( sep ) ) /* [1.4] */ && cldr.get( [ "supplemental/likelySubtags", test.join( sep ) ] );
		});

		// [3]
		if ( matchFound ) {
			// [3.2 .. 3.4]
			match = match.split( sep );
			return [
				language !== "und" ? language : match[ 0 ],
				script !== "Zzzz" ? script : match[ 1 ],
				territory !== "ZZ" ? territory : match[ 2 ]
			].concat( variants );
		} else if ( options.force ) {
			// [3.1.2]
			return cldr.get( "supplemental/likelySubtags/und" ).split( sep );
		} else {
			// [3.1.1]
			return;
		}
	};



	/**
	 * Given a locale, remove any fields that Add Likely Subtags would add.
	 * http://www.unicode.org/reports/tr35/#Likely_Subtags
	 * 1. First get max = AddLikelySubtags(inputLocale). If an error is signaled,
	 * return it.
	 * 2. Remove the variants from max.
	 * 3. Then for trial in {language, language _ region, language _ script}. If
	 * AddLikelySubtags(trial) = max, then return trial + variants.
	 * 4. If you do not get a match, return max + variants.
	 * 
	 * @maxLanguageId [Array] maxLanguageId tuple (see init.js).
	 */
	var coreRemoveLikelySubtags = function( Cldr, cldr, maxLanguageId ) {
		var match, matchFound,
			language = maxLanguageId[ 0 ],
			script = maxLanguageId[ 1 ],
			territory = maxLanguageId[ 2 ],
			variants = maxLanguageId[ 3 ];

		// [3]
		matchFound = arraySome([
			[ [ language, "Zzzz", "ZZ" ], [ language ] ],
			[ [ language, "Zzzz", territory ], [ language, territory ] ],
			[ [ language, script, "ZZ" ], [ language, script ] ]
		], function( test ) {
			var result = coreLikelySubtags( Cldr, cldr, test[ 0 ] );
			match = test[ 1 ];
			return result && result[ 0 ] === maxLanguageId[ 0 ] &&
				result[ 1 ] === maxLanguageId[ 1 ] &&
				result[ 2 ] === maxLanguageId[ 2 ];
		});

		if ( matchFound ) {
			if ( variants ) {
				match.push( variants );
			}
			return match;
		}

		// [4]
		return maxLanguageId;
	};




	/**
	 * subtags( locale )
	 *
	 * @locale [String]
	 */
	var coreSubtags = function( locale ) {
		var aux, unicodeLanguageId,
			subtags = [];

		locale = locale.replace( /_/, "-" );

		// Unicode locale extensions.
		aux = locale.split( "-u-" );
		if ( aux[ 1 ] ) {
			aux[ 1 ] = aux[ 1 ].split( "-t-" );
			locale = aux[ 0 ] + ( aux[ 1 ][ 1 ] ? "-t-" + aux[ 1 ][ 1 ] : "");
			subtags[ 4 /* unicodeLocaleExtensions */ ] = aux[ 1 ][ 0 ];
		}

		// TODO normalize transformed extensions. Currently, skipped.
		// subtags[ x ] = locale.split( "-t-" )[ 1 ];
		unicodeLanguageId = locale.split( "-t-" )[ 0 ];

		// unicode_language_id = "root"
		//   | unicode_language_subtag         
		//     (sep unicode_script_subtag)? 
		//     (sep unicode_region_subtag)?
		//     (sep unicode_variant_subtag)* ;
		//
		// Although unicode_language_subtag = alpha{2,8}, I'm using alpha{2,3}. Because, there's no language on CLDR lengthier than 3.
		aux = unicodeLanguageId.match( /^(([a-z]{2,3})(-([A-Z][a-z]{3}))?(-([A-Z]{2}|[0-9]{3}))?)((-([a-zA-Z0-9]{5,8}|[0-9][a-zA-Z0-9]{3}))*)$|^(root)$/ );
		if ( aux === null ) {
			return [ "und", "Zzzz", "ZZ" ];
		}
		subtags[ 0 /* language */ ] = aux[ 10 ] /* root */ || aux[ 2 ] || "und";
		subtags[ 1 /* script */ ] = aux[ 4 ] || "Zzzz";
		subtags[ 2 /* territory */ ] = aux[ 6 ] || "ZZ";
		if ( aux[ 7 ] && aux[ 7 ].length ) {
			subtags[ 3 /* variant */ ] = aux[ 7 ].slice( 1 ) /* remove leading "-" */;
		}

		// 0: language
		// 1: script
		// 2: territory (aka region)
		// 3: variant
		// 4: unicodeLocaleExtensions
		return subtags;
	};




	var arrayForEach = function( array, callback ) {
		var i, length;
		if ( array.forEach ) {
			return array.forEach( callback );
		}
		for ( i = 0, length = array.length; i < length; i++ ) {
			callback( array[ i ], i, array );
		}
	};




	/**
	 * bundleLookup( minLanguageId )
	 *
	 * @Cldr [Cldr class]
	 *
	 * @cldr [Cldr instance]
	 *
	 * @minLanguageId [String] requested languageId after applied remove likely subtags.
	 */
	var bundleLookup = function( Cldr, cldr, minLanguageId ) {
		var availableBundleMap = Cldr._availableBundleMap,
			availableBundleMapQueue = Cldr._availableBundleMapQueue;

		if ( availableBundleMapQueue.length ) {
			arrayForEach( availableBundleMapQueue, function( bundle ) {
				var existing, maxBundle, minBundle, subtags;
				subtags = coreSubtags( bundle );
				maxBundle = coreLikelySubtags( Cldr, cldr, subtags );
				minBundle = coreRemoveLikelySubtags( Cldr, cldr, maxBundle );
				minBundle = minBundle.join( Cldr.localeSep );
				existing = availableBundleMapQueue[ minBundle ];
				if ( existing && existing.length < bundle.length ) {
					return;
				}
				availableBundleMap[ minBundle ] = bundle;
			});
			Cldr._availableBundleMapQueue = [];
		}

		return availableBundleMap[ minLanguageId ] || null;
	};




	var objectKeys = function( object ) {
		var i,
			result = [];

		if ( Object.keys ) {
			return Object.keys( object );
		}

		for ( i in object ) {
			result.push( i );
		}

		return result;
	};




	var createError = function( code, attributes ) {
		var error, message;

		message = code + ( attributes && JSON ? ": " + JSON.stringify( attributes ) : "" );
		error = new Error( message );
		error.code = code;

		// extend( error, attributes );
		arrayForEach( objectKeys( attributes ), function( attribute ) {
			error[ attribute ] = attributes[ attribute ];
		});

		return error;
	};




	var validate = function( code, check, attributes ) {
		if ( !check ) {
			throw createError( code, attributes );
		}
	};




	var validatePresence = function( value, name ) {
		validate( "E_MISSING_PARAMETER", typeof value !== "undefined", {
			name: name
		});
	};




	var validateType = function( value, name, check, expected ) {
		validate( "E_INVALID_PAR_TYPE", check, {
			expected: expected,
			name: name,
			value: value
		});
	};




	var validateTypePath = function( value, name ) {
		validateType( value, name, typeof value === "string" || arrayIsArray( value ), "String or Array" );
	};




	/**
	 * Function inspired by jQuery Core, but reduced to our use case.
	 */
	var isPlainObject = function( obj ) {
		return obj !== null && "" + obj === "[object Object]";
	};




	var validateTypePlainObject = function( value, name ) {
		validateType( value, name, typeof value === "undefined" || isPlainObject( value ), "Plain Object" );
	};




	var validateTypeString = function( value, name ) {
		validateType( value, name, typeof value === "string", "a string" );
	};




	// @path: normalized path
	var resourceGet = function( data, path ) {
		var i,
			node = data,
			length = path.length;

		for ( i = 0; i < length - 1; i++ ) {
			node = node[ path[ i ] ];
			if ( !node ) {
				return undefined;
			}
		}
		return node[ path[ i ] ];
	};




	/**
	 * setAvailableBundles( Cldr, json )
	 *
	 * @Cldr [Cldr class]
	 *
	 * @json resolved/unresolved cldr data.
	 *
	 * Set available bundles queue based on passed json CLDR data. Considers a bundle as any String at /main/{bundle}.
	 */
	var coreSetAvailableBundles = function( Cldr, json ) {
		var bundle,
			availableBundleMapQueue = Cldr._availableBundleMapQueue,
			main = resourceGet( json, [ "main" ] );

		if ( main ) {
			for ( bundle in main ) {
				if ( main.hasOwnProperty( bundle ) && bundle !== "root" &&
							availableBundleMapQueue.indexOf( bundle ) === -1 ) {
					availableBundleMapQueue.push( bundle );
				}
			}
		}
	};



	var alwaysArray = function( somethingOrArray ) {
		return arrayIsArray( somethingOrArray ) ?  somethingOrArray : [ somethingOrArray ];
	};


	var jsonMerge = (function() {

	// Returns new deeply merged JSON.
	//
	// Eg.
	// merge( { a: { b: 1, c: 2 } }, { a: { b: 3, d: 4 } } )
	// -> { a: { b: 3, c: 2, d: 4 } }
	//
	// @arguments JSON's
	// 
	var merge = function() {
		var destination = {},
			sources = [].slice.call( arguments, 0 );
		arrayForEach( sources, function( source ) {
			var prop;
			for ( prop in source ) {
				if ( prop in destination && typeof destination[ prop ] === "object" && !arrayIsArray( destination[ prop ] ) ) {

					// Merge Objects
					destination[ prop ] = merge( destination[ prop ], source[ prop ] );

				} else {

					// Set new values
					destination[ prop ] = source[ prop ];

				}
			}
		});
		return destination;
	};

	return merge;

}());


	/**
	 * load( Cldr, source, jsons )
	 *
	 * @Cldr [Cldr class]
	 *
	 * @source [Object]
	 *
	 * @jsons [arguments]
	 */
	var coreLoad = function( Cldr, source, jsons ) {
		var i, j, json;

		validatePresence( jsons[ 0 ], "json" );

		// Support arbitrary parameters, e.g., `Cldr.load({...}, {...})`.
		for ( i = 0; i < jsons.length; i++ ) {

			// Support array parameters, e.g., `Cldr.load([{...}, {...}])`.
			json = alwaysArray( jsons[ i ] );

			for ( j = 0; j < json.length; j++ ) {
				validateTypePlainObject( json[ j ], "json" );
				source = jsonMerge( source, json[ j ] );
				coreSetAvailableBundles( Cldr, json[ j ] );
			}
		}

		return source;
	};



	var itemGetResolved = function( Cldr, path, attributes ) {
		// Resolve path
		var normalizedPath = pathNormalize( path, attributes );

		return resourceGet( Cldr._resolved, normalizedPath );
	};




	/**
	 * new Cldr()
	 */
	var Cldr = function( locale ) {
		this.init( locale );
	};

	// Build optimization hack to avoid duplicating functions across modules.
	Cldr._alwaysArray = alwaysArray;
	Cldr._coreLoad = coreLoad;
	Cldr._createError = createError;
	Cldr._itemGetResolved = itemGetResolved;
	Cldr._jsonMerge = jsonMerge;
	Cldr._pathNormalize = pathNormalize;
	Cldr._resourceGet = resourceGet;
	Cldr._validatePresence = validatePresence;
	Cldr._validateType = validateType;
	Cldr._validateTypePath = validateTypePath;
	Cldr._validateTypePlainObject = validateTypePlainObject;

	Cldr._availableBundleMap = {};
	Cldr._availableBundleMapQueue = [];
	Cldr._resolved = {};

	// Allow user to override locale separator "-" (default) | "_". According to http://www.unicode.org/reports/tr35/#Unicode_language_identifier, both "-" and "_" are valid locale separators (eg. "en_GB", "en-GB"). According to http://unicode.org/cldr/trac/ticket/6786 its usage must be consistent throughout the data set.
	Cldr.localeSep = "-";

	/**
	 * Cldr.load( json [, json, ...] )
	 *
	 * @json [JSON] CLDR data or [Array] Array of @json's.
	 *
	 * Load resolved cldr data.
	 */
	Cldr.load = function() {
		Cldr._resolved = coreLoad( Cldr, Cldr._resolved, arguments );
	};

	/**
	 * .init() automatically run on instantiation/construction.
	 */
	Cldr.prototype.init = function( locale ) {
		var attributes, language, maxLanguageId, minLanguageId, script, subtags, territory, unicodeLocaleExtensions, variant,
			sep = Cldr.localeSep,
			unicodeLocaleExtensionsRaw = "";

		validatePresence( locale, "locale" );
		validateTypeString( locale, "locale" );

		subtags = coreSubtags( locale );

		if ( subtags.length === 5 ) {
			unicodeLocaleExtensions = subtags.pop();
			unicodeLocaleExtensionsRaw = sep + "u" + sep + unicodeLocaleExtensions;
			// Remove trailing null when there is unicodeLocaleExtensions but no variants.
			if ( !subtags[ 3 ] ) {
				subtags.pop();
			}
		}
		variant = subtags[ 3 ];

		// Normalize locale code.
		// Get (or deduce) the "triple subtags": language, territory (also aliased as region), and script subtags.
		// Get the variant subtags (calendar, collation, currency, etc).
		// refs:
		// - http://www.unicode.org/reports/tr35/#Field_Definitions
		// - http://www.unicode.org/reports/tr35/#Language_and_Locale_IDs
		// - http://www.unicode.org/reports/tr35/#Unicode_locale_identifier

		// When a locale id does not specify a language, or territory (region), or script, they are obtained by Likely Subtags.
		maxLanguageId = coreLikelySubtags( Cldr, this, subtags, { force: true } ) || subtags;
		language = maxLanguageId[ 0 ];
		script = maxLanguageId[ 1 ];
		territory = maxLanguageId[ 2 ];

		minLanguageId = coreRemoveLikelySubtags( Cldr, this, maxLanguageId ).join( sep );

		// Set attributes
		this.attributes = attributes = {
			bundle: bundleLookup( Cldr, this, minLanguageId ),

			// Unicode Language Id
			minLanguageId: minLanguageId + unicodeLocaleExtensionsRaw,
			maxLanguageId: maxLanguageId.join( sep ) + unicodeLocaleExtensionsRaw,

			// Unicode Language Id Subtabs
			language: language,
			script: script,
			territory: territory,
			region: territory, /* alias */
			variant: variant
		};

		// Unicode locale extensions.
		unicodeLocaleExtensions && ( "-" + unicodeLocaleExtensions ).replace( /-[a-z]{3,8}|(-[a-z]{2})-([a-z]{3,8})/g, function( attribute, key, type ) {

			if ( key ) {

				// Extension is in the `keyword` form.
				attributes[ "u" + key ] = type;
			} else {

				// Extension is in the `attribute` form.
				attributes[ "u" + attribute ] = true;
			}
		});

		this.locale = locale;
	};

	/**
	 * .get()
	 */
	Cldr.prototype.get = function( path ) {

		validatePresence( path, "path" );
		validateTypePath( path, "path" );

		return itemGetResolved( Cldr, path, this.attributes );
	};

	/**
	 * .main()
	 */
	Cldr.prototype.main = function( path ) {
		validatePresence( path, "path" );
		validateTypePath( path, "path" );

		validate( "E_MISSING_BUNDLE", this.attributes.bundle !== null, {
			locale: this.locale
		});

		path = alwaysArray( path );
		return this.get( [ "main/{bundle}" ].concat( path ) );
	};

	return Cldr;




}));


/***/ }),

/***/ "./node_modules/cldrjs/dist/cldr/event.js":
/*!************************************************!*\
  !*** ./node_modules/cldrjs/dist/cldr/event.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * CLDR JavaScript Library v0.5.0
 * http://jquery.com/
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-08-11T11:52Z
 */
/*!
 * CLDR JavaScript Library v0.5.0 2017-08-11T11:52Z MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */
(function( factory ) {

	if ( true ) {
		// AMD.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! ../cldr */ "./node_modules/cldrjs/dist/cldr.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(function( Cldr ) {

	// Build optimization hack to avoid duplicating functions across modules.
	var pathNormalize = Cldr._pathNormalize,
		validatePresence = Cldr._validatePresence,
		validateType = Cldr._validateType;

/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

var EventEmitter;
/* jshint ignore:start */
EventEmitter = (function () {


	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = {};
	

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (evt instanceof RegExp) {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (evt instanceof RegExp) {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	return EventEmitter;
}());
/* jshint ignore:end */



	var validateTypeFunction = function( value, name ) {
		validateType( value, name, typeof value === "undefined" || typeof value === "function", "Function" );
	};




	var superGet, superInit,
		globalEe = new EventEmitter();

	function validateTypeEvent( value, name ) {
		validateType( value, name, typeof value === "string" || value instanceof RegExp, "String or RegExp" );
	}

	function validateThenCall( method, self ) {
		return function( event, listener ) {
			validatePresence( event, "event" );
			validateTypeEvent( event, "event" );

			validatePresence( listener, "listener" );
			validateTypeFunction( listener, "listener" );

			return self[ method ].apply( self, arguments );
		};
	}

	function off( self ) {
		return validateThenCall( "off", self );
	}

	function on( self ) {
		return validateThenCall( "on", self );
	}

	function once( self ) {
		return validateThenCall( "once", self );
	}

	Cldr.off = off( globalEe );
	Cldr.on = on( globalEe );
	Cldr.once = once( globalEe );

	/**
	 * Overload Cldr.prototype.init().
	 */
	superInit = Cldr.prototype.init;
	Cldr.prototype.init = function() {
		var ee;
		this.ee = ee = new EventEmitter();
		this.off = off( ee );
		this.on = on( ee );
		this.once = once( ee );
		superInit.apply( this, arguments );
	};

	/**
	 * getOverload is encapsulated, because of cldr/unresolved. If it's loaded
	 * after cldr/event (and note it overwrites .get), it can trigger this
	 * overload again.
	 */
	function getOverload() {

		/**
		 * Overload Cldr.prototype.get().
		 */
		superGet = Cldr.prototype.get;
		Cldr.prototype.get = function( path ) {
			var value = superGet.apply( this, arguments );
			path = pathNormalize( path, this.attributes ).join( "/" );
			globalEe.trigger( "get", [ path, value ] );
			this.ee.trigger( "get", [ path, value ] );
			return value;
		};
	}

	Cldr._eventInit = getOverload;
	getOverload();

	return Cldr;




}));


/***/ }),

/***/ "./node_modules/cldrjs/dist/cldr/supplemental.js":
/*!*******************************************************!*\
  !*** ./node_modules/cldrjs/dist/cldr/supplemental.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * CLDR JavaScript Library v0.5.0
 * http://jquery.com/
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-08-11T11:52Z
 */
/*!
 * CLDR JavaScript Library v0.5.0 2017-08-11T11:52Z MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */
(function( factory ) {

	if ( true ) {
		// AMD.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! ../cldr */ "./node_modules/cldrjs/dist/cldr.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(function( Cldr ) {

	// Build optimization hack to avoid duplicating functions across modules.
	var alwaysArray = Cldr._alwaysArray;



	var supplementalMain = function( cldr ) {

		var prepend, supplemental;
		
		prepend = function( prepend ) {
			return function( path ) {
				path = alwaysArray( path );
				return cldr.get( [ prepend ].concat( path ) );
			};
		};

		supplemental = prepend( "supplemental" );

		// Week Data
		// http://www.unicode.org/reports/tr35/tr35-dates.html#Week_Data
		supplemental.weekData = prepend( "supplemental/weekData" );

		supplemental.weekData.firstDay = function() {
			return cldr.get( "supplemental/weekData/firstDay/{territory}" ) ||
				cldr.get( "supplemental/weekData/firstDay/001" );
		};

		supplemental.weekData.minDays = function() {
			var minDays = cldr.get( "supplemental/weekData/minDays/{territory}" ) ||
				cldr.get( "supplemental/weekData/minDays/001" );
			return parseInt( minDays, 10 );
		};

		// Time Data
		// http://www.unicode.org/reports/tr35/tr35-dates.html#Time_Data
		supplemental.timeData = prepend( "supplemental/timeData" );

		supplemental.timeData.allowed = function() {
			return cldr.get( "supplemental/timeData/{territory}/_allowed" ) ||
				cldr.get( "supplemental/timeData/001/_allowed" );
		};

		supplemental.timeData.preferred = function() {
			return cldr.get( "supplemental/timeData/{territory}/_preferred" ) ||
				cldr.get( "supplemental/timeData/001/_preferred" );
		};

		return supplemental;

	};




	var initSuper = Cldr.prototype.init;

	/**
	 * .init() automatically ran on construction.
	 *
	 * Overload .init().
	 */
	Cldr.prototype.init = function() {
		initSuper.apply( this, arguments );
		this.supplemental = supplementalMain( this );
	};

	return Cldr;




}));


/***/ }),

/***/ "./node_modules/cldrjs/dist/cldr/unresolved.js":
/*!*****************************************************!*\
  !*** ./node_modules/cldrjs/dist/cldr/unresolved.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * CLDR JavaScript Library v0.5.0
 * http://jquery.com/
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-08-11T11:52Z
 */
/*!
 * CLDR JavaScript Library v0.5.0 2017-08-11T11:52Z MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */
(function( factory ) {

	if ( true ) {
		// AMD.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! ../cldr */ "./node_modules/cldrjs/dist/cldr.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(function( Cldr ) {

	// Build optimization hack to avoid duplicating functions across modules.
	var coreLoad = Cldr._coreLoad;
	var jsonMerge = Cldr._jsonMerge;
	var pathNormalize = Cldr._pathNormalize;
	var resourceGet = Cldr._resourceGet;
	var validatePresence = Cldr._validatePresence;
	var validateTypePath = Cldr._validateTypePath;



	var bundleParentLookup = function( Cldr, locale ) {
		var normalizedPath, parent;

		if ( locale === "root" ) {
			return;
		}

		// First, try to find parent on supplemental data.
		normalizedPath = pathNormalize( [ "supplemental/parentLocales/parentLocale", locale ] );
		parent = resourceGet( Cldr._resolved, normalizedPath ) || resourceGet( Cldr._raw, normalizedPath );
		if ( parent ) {
			return parent;
		}

		// Or truncate locale.
		parent = locale.substr( 0, locale.lastIndexOf( Cldr.localeSep ) );
		if ( !parent ) {
			return "root";
		}

		return parent;
	};




	// @path: normalized path
	var resourceSet = function( data, path, value ) {
		var i,
			node = data,
			length = path.length;

		for ( i = 0; i < length - 1; i++ ) {
			if ( !node[ path[ i ] ] ) {
				node[ path[ i ] ] = {};
			}
			node = node[ path[ i ] ];
		}
		node[ path[ i ] ] = value;
	};


	var itemLookup = (function() {

	var lookup;

	lookup = function( Cldr, locale, path, attributes, childLocale ) {
		var normalizedPath, parent, value;

		// 1: Finish recursion
		// 2: Avoid infinite loop
		if ( typeof locale === "undefined" /* 1 */ || locale === childLocale /* 2 */ ) {
			return;
		}

		// Resolve path
		normalizedPath = pathNormalize( path, attributes );

		// Check resolved (cached) data first
		// 1: Due to #16, never use the cached resolved non-leaf nodes. It may not
		//    represent its leafs in its entirety.
		value = resourceGet( Cldr._resolved, normalizedPath );
		if ( value !== undefined && typeof value !== "object" /* 1 */ ) {
			return value;
		}

		// Check raw data
		value = resourceGet( Cldr._raw, normalizedPath );

		if ( value === undefined ) {
			// Or, lookup at parent locale
			parent = bundleParentLookup( Cldr, locale );
			value = lookup( Cldr, parent, path, jsonMerge( attributes, { bundle: parent }), locale );
		}

		if ( value !== undefined ) {
			// Set resolved (cached)
			resourceSet( Cldr._resolved, normalizedPath, value );
		}

		return value;
	};

	return lookup;

}());


	Cldr._raw = {};

	/**
	 * Cldr.load( json [, json, ...] )
	 *
	 * @json [JSON] CLDR data or [Array] Array of @json's.
	 *
	 * Load resolved or unresolved cldr data.
	 * Overwrite Cldr.load().
	 */
	Cldr.load = function() {
		Cldr._raw = coreLoad( Cldr, Cldr._raw, arguments );
	};

	/**
	 * Overwrite Cldr.prototype.get().
	 */
	Cldr.prototype.get = function( path ) {
		validatePresence( path, "path" );
		validateTypePath( path, "path" );

		// 1: use bundle as locale on item lookup for simplification purposes, because no other extended subtag is used anyway on bundle parent lookup.
		// 2: during init(), this method is called, but bundle is yet not defined. Use "" as a workaround in this very specific scenario.
		return itemLookup( Cldr, this.attributes && this.attributes.bundle /* 1 */ || "" /* 2 */, path, this.attributes );
	};

	// In case cldr/unresolved is loaded after cldr/event, we trigger its overloads again. Because, .get is overwritten in here.
	if ( Cldr._eventInit ) {
		Cldr._eventInit();
	}

	return Cldr;




}));


/***/ }),

/***/ "./node_modules/cldrjs/dist/node_main.js":
/*!***********************************************!*\
  !*** ./node_modules/cldrjs/dist/node_main.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * CLDR JavaScript Library v0.5.0
 * http://jquery.com/
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-08-11T11:52Z
 */
/*!
 * CLDR JavaScript Library v0.5.0 2017-08-11T11:52Z MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */

// Cldr
module.exports = __webpack_require__( /*! ./cldr */ "./node_modules/cldrjs/dist/cldr.js" );

// Extent Cldr with the following modules
__webpack_require__( /*! ./cldr/event */ "./node_modules/cldrjs/dist/cldr/event.js" );
__webpack_require__( /*! ./cldr/supplemental */ "./node_modules/cldrjs/dist/cldr/supplemental.js" );
__webpack_require__( /*! ./cldr/unresolved */ "./node_modules/cldrjs/dist/cldr/unresolved.js" );


/***/ }),

/***/ "./node_modules/globalize/dist/globalize.js":
/*!**************************************************!*\
  !*** ./node_modules/globalize/dist/globalize.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*** IMPORTS FROM imports-loader ***/
var define = false;

/**
 * Globalize v1.4.0
 *
 * http://github.com/jquery/globalize
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2018-07-17T20:38Z
 */
/*!
 * Globalize v1.4.0 2018-07-17T20:38Z Released under the MIT license
 * http://git.io/TrdQbw
 */
(function( root, factory ) {

	// UMD returnExports
	if ( typeof define === "function" && define.amd ) {

		// AMD
		define([
			"cldr",
			"cldr/event"
		], factory );
	} else if ( true ) {

		// Node, CommonJS
		module.exports = factory( __webpack_require__( /*! cldrjs */ "./node_modules/cldrjs/dist/node_main.js" ) );
	} else {}
}( this, function( Cldr ) {


/**
 * A toString method that outputs meaningful values for objects or arrays and
 * still performs as fast as a plain string in case variable is string, or as
 * fast as `"" + number` in case variable is a number.
 * Ref: http://jsperf.com/my-stringify
 */
var toString = function( variable ) {
	return typeof variable === "string" ? variable : ( typeof variable === "number" ? "" +
		variable : JSON.stringify( variable ) );
};




/**
 * formatMessage( message, data )
 *
 * @message [String] A message with optional {vars} to be replaced.
 *
 * @data [Array or JSON] Object with replacing-variables content.
 *
 * Return the formatted message. For example:
 *
 * - formatMessage( "{0} second", [ 1 ] ); // 1 second
 *
 * - formatMessage( "{0}/{1}", ["m", "s"] ); // m/s
 *
 * - formatMessage( "{name} <{email}>", {
 *     name: "Foo",
 *     email: "bar@baz.qux"
 *   }); // Foo <bar@baz.qux>
 */
var formatMessage = function( message, data ) {

	// Replace {attribute}'s
	message = message.replace( /{[0-9a-zA-Z-_. ]+}/g, function( name ) {
		name = name.replace( /^{([^}]*)}$/, "$1" );
		return toString( data[ name ] );
	});

	return message;
};




var objectExtend = function() {
	var destination = arguments[ 0 ],
		sources = [].slice.call( arguments, 1 );

	sources.forEach(function( source ) {
		var prop;
		for ( prop in source ) {
			destination[ prop ] = source[ prop ];
		}
	});

	return destination;
};




var createError = function( code, message, attributes ) {
	var error;

	message = code + ( message ? ": " + formatMessage( message, attributes ) : "" );
	error = new Error( message );
	error.code = code;

	objectExtend( error, attributes );

	return error;
};




var runtimeStringify = function( args ) {
	return JSON.stringify( args, function( key, value ) {
		if ( value && value.runtimeKey ) {
			return value.runtimeKey;
		}
		return value;
	} );
};




// Based on http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
var stringHash = function( str ) {
	return [].reduce.call( str, function( hash, i ) {
		var chr = i.charCodeAt( 0 );
		hash = ( ( hash << 5 ) - hash ) + chr;
		return hash | 0;
	}, 0 );
};




var runtimeKey = function( fnName, locale, args, argsStr ) {
	var hash;
	argsStr = argsStr || runtimeStringify( args );
	hash = stringHash( fnName + locale + argsStr );
	return hash > 0 ? "a" + hash : "b" + Math.abs( hash );
};




var functionName = function( fn ) {
	if ( fn.name !== undefined ) {
		return fn.name;
	}

	// fn.name is not supported by IE.
	var matches = /^function\s+([\w\$]+)\s*\(/.exec( fn.toString() );

	if ( matches && matches.length > 0 ) {
		return matches[ 1 ];
	}
};




var runtimeBind = function( args, cldr, fn, runtimeArgs ) {

	var argsStr = runtimeStringify( args ),
		fnName = functionName( fn ),
		locale = cldr.locale;

	// If name of the function is not available, this is most likely due to uglification,
	// which most likely means we are in production, and runtimeBind here is not necessary.
	if ( !fnName ) {
		return fn;
	}

	fn.runtimeKey = runtimeKey( fnName, locale, null, argsStr );

	fn.generatorString = function() {
		return "Globalize(\"" + locale + "\")." + fnName + "(" + argsStr.slice( 1, -1 ) + ")";
	};

	fn.runtimeArgs = runtimeArgs;

	return fn;
};




var validate = function( code, message, check, attributes ) {
	if ( !check ) {
		throw createError( code, message, attributes );
	}
};




var alwaysArray = function( stringOrArray ) {
	return Array.isArray( stringOrArray ) ? stringOrArray : stringOrArray ? [ stringOrArray ] : [];
};




var validateCldr = function( path, value, options ) {
	var skipBoolean;
	options = options || {};

	skipBoolean = alwaysArray( options.skip ).some(function( pathRe ) {
		return pathRe.test( path );
	});

	validate( "E_MISSING_CLDR", "Missing required CLDR content `{path}`.", value || skipBoolean, {
		path: path
	});
};




var validateDefaultLocale = function( value ) {
	validate( "E_DEFAULT_LOCALE_NOT_DEFINED", "Default locale has not been defined.",
		value !== undefined, {} );
};




var validateParameterPresence = function( value, name ) {
	validate( "E_MISSING_PARAMETER", "Missing required parameter `{name}`.",
		value !== undefined, { name: name });
};




/**
 * range( value, name, minimum, maximum )
 *
 * @value [Number].
 *
 * @name [String] name of variable.
 *
 * @minimum [Number]. The lowest valid value, inclusive.
 *
 * @maximum [Number]. The greatest valid value, inclusive.
 */
var validateParameterRange = function( value, name, minimum, maximum ) {
	validate(
		"E_PAR_OUT_OF_RANGE",
		"Parameter `{name}` has value `{value}` out of range [{minimum}, {maximum}].",
		value === undefined || value >= minimum && value <= maximum,
		{
			maximum: maximum,
			minimum: minimum,
			name: name,
			value: value
		}
	);
};




var validateParameterType = function( value, name, check, expected ) {
	validate(
		"E_INVALID_PAR_TYPE",
		"Invalid `{name}` parameter ({value}). {expected} expected.",
		check,
		{
			expected: expected,
			name: name,
			value: value
		}
	);
};




var validateParameterTypeLocale = function( value, name ) {
	validateParameterType(
		value,
		name,
		value === undefined || typeof value === "string" || value instanceof Cldr,
		"String or Cldr instance"
	);
};




/**
 * Function inspired by jQuery Core, but reduced to our use case.
 */
var isPlainObject = function( obj ) {
	return obj !== null && "" + obj === "[object Object]";
};




var validateParameterTypePlainObject = function( value, name ) {
	validateParameterType(
		value,
		name,
		value === undefined || isPlainObject( value ),
		"Plain Object"
	);
};




var alwaysCldr = function( localeOrCldr ) {
	return localeOrCldr instanceof Cldr ? localeOrCldr : new Cldr( localeOrCldr );
};




// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions
var regexpEscape = function( string ) {
	return string.replace( /([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1" );
};




var stringPad = function( str, count, right ) {
	var length;
	if ( typeof str !== "string" ) {
		str = String( str );
	}
	for ( length = str.length; length < count; length += 1 ) {
		str = ( right ? ( str + "0" ) : ( "0" + str ) );
	}
	return str;
};




function validateLikelySubtags( cldr ) {
	cldr.once( "get", validateCldr );
	cldr.get( "supplemental/likelySubtags" );
}

/**
 * [new] Globalize( locale|cldr )
 *
 * @locale [String]
 *
 * @cldr [Cldr instance]
 *
 * Create a Globalize instance.
 */
function Globalize( locale ) {
	if ( !( this instanceof Globalize ) ) {
		return new Globalize( locale );
	}

	validateParameterPresence( locale, "locale" );
	validateParameterTypeLocale( locale, "locale" );

	this.cldr = alwaysCldr( locale );

	validateLikelySubtags( this.cldr );
}

/**
 * Globalize.load( json, ... )
 *
 * @json [JSON]
 *
 * Load resolved or unresolved cldr data.
 * Somewhat equivalent to previous Globalize.addCultureInfo(...).
 */
Globalize.load = function() {

	// validations are delegated to Cldr.load().
	Cldr.load.apply( Cldr, arguments );
};

/**
 * Globalize.locale( [locale|cldr] )
 *
 * @locale [String]
 *
 * @cldr [Cldr instance]
 *
 * Set default Cldr instance if locale or cldr argument is passed.
 *
 * Return the default Cldr instance.
 */
Globalize.locale = function( locale ) {
	validateParameterTypeLocale( locale, "locale" );

	if ( arguments.length ) {
		this.cldr = alwaysCldr( locale );
		validateLikelySubtags( this.cldr );
	}
	return this.cldr;
};

/**
 * Optimization to avoid duplicating some internal functions across modules.
 */
Globalize._alwaysArray = alwaysArray;
Globalize._createError = createError;
Globalize._formatMessage = formatMessage;
Globalize._isPlainObject = isPlainObject;
Globalize._objectExtend = objectExtend;
Globalize._regexpEscape = regexpEscape;
Globalize._runtimeBind = runtimeBind;
Globalize._stringPad = stringPad;
Globalize._validate = validate;
Globalize._validateCldr = validateCldr;
Globalize._validateDefaultLocale = validateDefaultLocale;
Globalize._validateParameterPresence = validateParameterPresence;
Globalize._validateParameterRange = validateParameterRange;
Globalize._validateParameterTypePlainObject = validateParameterTypePlainObject;
Globalize._validateParameterType = validateParameterType;

return Globalize;




}));



/***/ }),

/***/ "./node_modules/globalize/dist/globalize/message.js":
/*!**********************************************************!*\
  !*** ./node_modules/globalize/dist/globalize/message.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*** IMPORTS FROM imports-loader ***/
var define = false;

/**
 * Globalize v1.4.0
 *
 * http://github.com/jquery/globalize
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2018-07-17T20:38Z
 */
/*!
 * Globalize v1.4.0 2018-07-17T20:38Z Released under the MIT license
 * http://git.io/TrdQbw
 */
(function( root, factory ) {

	// UMD returnExports
	if ( typeof define === "function" && define.amd ) {

		// AMD
		define([
			"cldr",
			"../globalize",
			"cldr/event"
		], factory );
	} else if ( true ) {

		// Node, CommonJS
		module.exports = factory( __webpack_require__( /*! cldrjs */ "./node_modules/cldrjs/dist/node_main.js" ), __webpack_require__( /*! ../globalize */ "./node_modules/globalize/dist/globalize.js" ) );
	} else {}
}(this, function( Cldr, Globalize ) {

var alwaysArray = Globalize._alwaysArray,
	createError = Globalize._createError,
	isPlainObject = Globalize._isPlainObject,
	runtimeBind = Globalize._runtimeBind,
	validateDefaultLocale = Globalize._validateDefaultLocale,
	validate = Globalize._validate,
	validateParameterPresence = Globalize._validateParameterPresence,
	validateParameterType = Globalize._validateParameterType,
	validateParameterTypePlainObject = Globalize._validateParameterTypePlainObject;
var MessageFormat;
/* jshint ignore:start */
MessageFormat = (function() {
MessageFormat._parse = (function() {

  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function(st) {
              return { type: 'messageFormatPattern', statements: st };
            },
        peg$c2 = peg$FAILED,
        peg$c3 = "{",
        peg$c4 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c5 = null,
        peg$c6 = ",",
        peg$c7 = { type: "literal", value: ",", description: "\",\"" },
        peg$c8 = "}",
        peg$c9 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c10 = function(argIdx, efmt) {
              var res = {
                type: "messageFormatElement",
                argumentIndex: argIdx
              };
              if (efmt && efmt.length) {
                res.elementFormat = efmt[1];
              } else {
                res.output = true;
              }
              return res;
            },
        peg$c11 = "plural",
        peg$c12 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c13 = function(t, s) {
              return { type: "elementFormat", key: t, val: s };
            },
        peg$c14 = "selectordinal",
        peg$c15 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c16 = "select",
        peg$c17 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c18 = function(t, p) {
              return { type: "elementFormat", key: t, val: p };
            },
        peg$c19 = function(op, pf) {
              return { type: "pluralFormatPattern", pluralForms: pf, offset: op || 0 };
            },
        peg$c20 = "offset",
        peg$c21 = { type: "literal", value: "offset", description: "\"offset\"" },
        peg$c22 = ":",
        peg$c23 = { type: "literal", value: ":", description: "\":\"" },
        peg$c24 = function(d) { return d; },
        peg$c25 = function(k, mfp) {
              return { key: k, val: mfp };
            },
        peg$c26 = function(i) { return i; },
        peg$c27 = "=",
        peg$c28 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c29 = function(pf) { return { type: "selectFormatPattern", pluralForms: pf }; },
        peg$c30 = function(p) { return p; },
        peg$c31 = "#",
        peg$c32 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c33 = function() { return {type: 'octothorpe'}; },
        peg$c34 = function(s) { return { type: "string", val: s.join('') }; },
        peg$c35 = { type: "other", description: "identifier" },
        peg$c36 = /^[0-9a-zA-Z$_]/,
        peg$c37 = { type: "class", value: "[0-9a-zA-Z$_]", description: "[0-9a-zA-Z$_]" },
        peg$c38 = /^[^ \t\n\r,.+={}]/,
        peg$c39 = { type: "class", value: "[^ \\t\\n\\r,.+={}]", description: "[^ \\t\\n\\r,.+={}]" },
        peg$c40 = function(s) { return s; },
        peg$c41 = function(chars) { return chars.join(''); },
        peg$c42 = /^[^{}#\\\0-\x1F \t\n\r]/,
        peg$c43 = { type: "class", value: "[^{}#\\\\\\0-\\x1F \\t\\n\\r]", description: "[^{}#\\\\\\0-\\x1F \\t\\n\\r]" },
        peg$c44 = function(x) { return x; },
        peg$c45 = "\\\\",
        peg$c46 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c47 = function() { return "\\"; },
        peg$c48 = "\\#",
        peg$c49 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c50 = function() { return "#"; },
        peg$c51 = "\\{",
        peg$c52 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c53 = function() { return "\u007B"; },
        peg$c54 = "\\}",
        peg$c55 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c56 = function() { return "\u007D"; },
        peg$c57 = "\\u",
        peg$c58 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c59 = function(h1, h2, h3, h4) {
              return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
            },
        peg$c60 = /^[0-9]/,
        peg$c61 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c62 = function(ds) {
            //the number might start with 0 but must not be interpreted as an octal number
            //Hence, the base is passed to parseInt explicitely
            return parseInt((ds.join('')), 10);
          },
        peg$c63 = /^[0-9a-fA-F]/,
        peg$c64 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
        peg$c65 = { type: "other", description: "whitespace" },
        peg$c66 = function(w) { return w.join(''); },
        peg$c67 = /^[ \t\n\r]/,
        peg$c68 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      if (s2 === peg$FAILED) {
        s2 = peg$parsestring();
        if (s2 === peg$FAILED) {
          s2 = peg$parseoctothorpe();
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
        if (s2 === peg$FAILED) {
          s2 = peg$parsestring();
          if (s2 === peg$FAILED) {
            s2 = peg$parseoctothorpe();
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c3;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseid();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c6;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseelementFormat();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c5;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s6 = peg$c8;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c9); }
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c10(s3, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c11) {
          s2 = peg$c11;
          peg$currPos += 6;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s4 = peg$c6;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsepluralFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c13(s2, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 13) === peg$c14) {
            s2 = peg$c14;
            peg$currPos += 13;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s4 = peg$c6;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c7); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsepluralFormatPattern();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c13(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 6) === peg$c16) {
              s2 = peg$c16;
              peg$currPos += 6;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s4 = peg$c6;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c7); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseselectFormatPattern();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parse_();
                      if (s7 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c13(s2, s6);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseid();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseargStylePattern();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseargStylePattern();
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c18(s2, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          }
        }
      }

      return s0;
    }

    function peg$parsepluralFormatPattern() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseoffsetPattern();
      if (s1 === peg$FAILED) {
        s1 = peg$c5;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsepluralForm();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsepluralForm();
          }
        } else {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c19(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseoffsetPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c20) {
          s2 = peg$c20;
          peg$currPos += 6;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c22;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsedigits();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c24(s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralForm() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepluralKey();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c8;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c9); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c25(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralKey() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseid();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c26(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
          s1 = peg$c27;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsedigits();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c24(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      return s0;
    }

    function peg$parseselectFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseselectForm();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseselectForm();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c29(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseselectForm() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseid();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c8;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c9); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c25(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseargStylePattern() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c6;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c7); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseid();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseoctothorpe() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c33();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechars();
      if (s2 === peg$FAILED) {
        s2 = peg$parsewhitespace();
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechars();
          if (s2 === peg$FAILED) {
            s2 = peg$parsewhitespace();
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c34(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseid() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$currPos;
        if (peg$c36.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s4 !== peg$FAILED) {
          s5 = [];
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            if (peg$c38.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c39); }
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c40(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c41(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (peg$c42.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c44(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c45) {
          s1 = peg$c45;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c47();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c48) {
            s1 = peg$c48;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c50();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c51) {
              s1 = peg$c51;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c52); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c53();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c54) {
                s1 = peg$c54;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c55); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c56();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c57) {
                  s1 = peg$c57;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c58); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsehexDigit();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsehexDigit();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsehexDigit();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsehexDigit();
                        if (s5 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c59(s2, s3, s4, s5);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsedigits() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c60.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c60.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c61); }
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c62(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c63.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsewhitespace();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewhitespace();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c66(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (peg$c67.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c68); }
      }

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
}()).parse;


/** @file messageformat.js - ICU PluralFormat + SelectFormat for JavaScript
 *  @author Alex Sexton - @SlexAxton
 *  @version 0.3.0-1
 *  @copyright 2012-2015 Alex Sexton, Eemeli Aro, and Contributors
 *  @license To use or fork, MIT. To contribute back, Dojo CLA  */


/** Utility function for quoting an Object's key value iff required
 *  @private  */
function propname(key, obj) {
  if (/^[A-Z_$][0-9A-Z_$]*$/i.test(key)) {
    return obj ? obj + '.' + key : key;
  } else {
    var jkey = JSON.stringify(key);
    return obj ? obj + '[' + jkey + ']' : jkey;
  }
};


/** Create a new message formatter
 *
 *  @class
 *  @global
 *  @param {string|string[]} [locale="en"] - The locale to use, with fallbacks
 *  @param {function} [pluralFunc] - Optional custom pluralization function
 *  @param {function[]} [formatters] - Optional custom formatting functions  */
function MessageFormat(locale, pluralFunc, formatters) {
  this.lc = [locale];  
  this.runtime.pluralFuncs = {};
  this.runtime.pluralFuncs[this.lc[0]] = pluralFunc;
  this.runtime.fmt = {};
  if (formatters) for (var f in formatters) {
    this.runtime.fmt[f] = formatters[f];
  }
}




/** Parse an input string to its AST
 *
 *  Precompiled from `lib/messageformat-parser.pegjs` by
 *  {@link http://pegjs.org/ PEG.js}. Included in MessageFormat object
 *  to enable testing.
 *
 *  @private  */



/** Pluralization functions from
 *  {@link http://github.com/eemeli/make-plural.js make-plural}
 *
 *  @memberof MessageFormat
 *  @type Object.<string,function>  */
MessageFormat.plurals = {};


/** Default number formatting functions in the style of ICU's
 *  {@link http://icu-project.org/apiref/icu4j/com/ibm/icu/text/MessageFormat.html simpleArg syntax}
 *  implemented using the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl Intl}
 *  object defined by ECMA-402.
 *
 *  **Note**: Intl is not defined in default Node until 0.11.15 / 0.12.0, so
 *  earlier versions require a {@link https://www.npmjs.com/package/intl polyfill}.
 *  Therefore {@link MessageFormat.withIntlSupport} needs to be true for these
 *  functions to be available for inclusion in the output.
 *
 *  @see MessageFormat#setIntlSupport
 *
 *  @namespace
 *  @memberof MessageFormat
 *  @property {function} number - Represent a number as an integer, percent or currency value
 *  @property {function} date - Represent a date as a full/long/default/short string
 *  @property {function} time - Represent a time as a full/long/default/short string
 *
 *  @example
 *  > var MessageFormat = require('messageformat');
 *  > var mf = (new MessageFormat('en')).setIntlSupport(true);
 *  > mf.currency = 'EUR';
 *  > var mfunc = mf.compile("The total is {V,number,currency}.");
 *  > mfunc({V:5.5})
 *  "The total is €5.50."
 *
 *  @example
 *  > var MessageFormat = require('messageformat');
 *  > var mf = new MessageFormat('en', null, {number: MessageFormat.number});
 *  > mf.currency = 'EUR';
 *  > var mfunc = mf.compile("The total is {V,number,currency}.");
 *  > mfunc({V:5.5})
 *  "The total is €5.50."  */
MessageFormat.formatters = {};

/** Enable or disable support for the default formatters, which require the
 *  `Intl` object. Note that this can't be autodetected, as the environment
 *  in which the formatted text is compiled into Javascript functions is not
 *  necessarily the same environment in which they will get executed.
 *
 *  @see MessageFormat.formatters
 *
 *  @memberof MessageFormat
 *  @param {boolean} [enable=true]
 *  @returns {Object} The MessageFormat instance, to allow for chaining
 *  @example
 *  > var Intl = require('intl');
 *  > var MessageFormat = require('messageformat');
 *  > var mf = (new MessageFormat('en')).setIntlSupport(true);
 *  > mf.currency = 'EUR';
 *  > mf.compile("The total is {V,number,currency}.")({V:5.5});
 *  "The total is €5.50."  */



/** A set of utility functions that are called by the compiled Javascript
 *  functions, these are included locally in the output of {@link
 *  MessageFormat#compile compile()}.
 *
 *  @namespace
 *  @memberof MessageFormat  */
MessageFormat.prototype.runtime = {

  /** Utility function for `#` in plural rules
   *
   *  @param {number} value - The value to operate on
   *  @param {number} [offset=0] - An optional offset, set by the surrounding context  */
  number: function(value, offset) {
    if (isNaN(value)) throw new Error("'" + value + "' isn't a number.");
    return value - (offset || 0);
  },

  /** Utility function for `{N, plural|selectordinal, ...}`
   *
   *  @param {number} value - The key to use to find a pluralization rule
   *  @param {number} offset - An offset to apply to `value`
   *  @param {function} lcfunc - A locale function from `pluralFuncs`
   *  @param {Object.<string,string>} data - The object from which results are looked up
   *  @param {?boolean} isOrdinal - If true, use ordinal rather than cardinal rules
   *  @returns {string} The result of the pluralization  */
  plural: function(value, offset, lcfunc, data, isOrdinal) {
    if ({}.hasOwnProperty.call(data, value)) return data[value]();
    if (offset) value -= offset;
    var key = lcfunc(value, isOrdinal);
    if (key in data) return data[key]();
    return data.other();
  },

  /** Utility function for `{N, select, ...}`
   *
   *  @param {number} value - The key to use to find a selection
   *  @param {Object.<string,string>} data - The object from which results are looked up
   *  @returns {string} The result of the select statement  */
  select: function(value, data) {
    if ({}.hasOwnProperty.call(data, value)) return data[value]();
    return data.other()
  },

  /** Pluralization functions included in compiled output
   *  @instance
   *  @type Object.<string,function>  */
  pluralFuncs: {},

  /** Custom formatting functions called by `{var, fn[, args]*}` syntax
   *
   *  For examples, see {@link MessageFormat.formatters}
   *
   *  @instance
   *  @see MessageFormat.formatters
   *  @type Object.<string,function>  */
  fmt: {},

  /** Custom stringifier to clean up browser inconsistencies
   *  @instance  */
  toString: function () {
    var _stringify = function(o, level) {
      if (typeof o != 'object') {
        var funcStr = o.toString().replace(/^(function )\w*/, '$1');
        var indent = /([ \t]*)\S.*$/.exec(funcStr);
        return indent ? funcStr.replace(new RegExp('^' + indent[1], 'mg'), '') : funcStr;
      }
      var s = [];
      for (var i in o) if (i != 'toString') {
        if (level == 0) s.push('var ' + i + ' = ' + _stringify(o[i], level + 1) + ';\n');
        else s.push(propname(i) + ': ' + _stringify(o[i], level + 1));
      }
      if (level == 0) return s.join('');
      if (s.length == 0) return '{}';
      var indent = '  '; while (--level) indent += '  ';
      return '{\n' + s.join(',\n').replace(/^/gm, indent) + '\n}';
    };
    return _stringify(this, 0);
  }
};


/** Recursively map an AST to its resulting string
 *
 *  @memberof MessageFormat
 *
 *  @param ast - the Ast node for which the JS code should be generated
 *
 *  @private  */
MessageFormat.prototype._precompile = function(ast, data) {
  data = data || { keys: {}, offset: {} };
  var r = [], i, tmp, args = [];

  switch ( ast.type ) {
    case 'messageFormatPattern':
      for ( i = 0; i < ast.statements.length; ++i ) {
        r.push(this._precompile( ast.statements[i], data ));
      }
      tmp = r.join(' + ') || '""';
      return data.pf_count ? tmp : 'function(d) { return ' + tmp + '; }';

    case 'messageFormatElement':
      data.pf_count = data.pf_count || 0;
      if ( ast.output ) {
        return propname(ast.argumentIndex, 'd');
      }
      else {
        data.keys[data.pf_count] = ast.argumentIndex;
        return this._precompile( ast.elementFormat, data );
      }
      return '';

    case 'elementFormat':
      args = [ propname(data.keys[data.pf_count], 'd') ];
      switch (ast.key) {
        case 'select':
          args.push(this._precompile(ast.val, data));
          return 'select(' + args.join(', ') + ')';
        case 'selectordinal':
          args = args.concat([ 0, propname(this.lc[0], 'pluralFuncs'), this._precompile(ast.val, data), 1 ]);
          return 'plural(' + args.join(', ') + ')';
        case 'plural':
          data.offset[data.pf_count || 0] = ast.val.offset || 0;
          args = args.concat([ data.offset[data.pf_count] || 0, propname(this.lc[0], 'pluralFuncs'), this._precompile(ast.val, data) ]);
          return 'plural(' + args.join(', ') + ')';
        default:
          if (this.withIntlSupport && !(ast.key in this.runtime.fmt) && (ast.key in MessageFormat.formatters)) {
            tmp = MessageFormat.formatters[ast.key];
            this.runtime.fmt[ast.key] = (typeof tmp(this) == 'function') ? tmp(this) : tmp;
          }
          args.push(JSON.stringify(this.lc));
          if (ast.val && ast.val.length) args.push(JSON.stringify(ast.val.length == 1 ? ast.val[0] : ast.val));
          return 'fmt.' + ast.key + '(' + args.join(', ') + ')';
      }

    case 'pluralFormatPattern':
    case 'selectFormatPattern':
      data.pf_count = data.pf_count || 0;
      if (ast.type == 'selectFormatPattern') data.offset[data.pf_count] = 0;
      var needOther = true;
      for (i = 0; i < ast.pluralForms.length; ++i) {
        var key = ast.pluralForms[i].key;
        if (key === 'other') needOther = false;
        var data_copy = JSON.parse(JSON.stringify(data));
        data_copy.pf_count++;
        r.push(propname(key) + ': function() { return ' + this._precompile(ast.pluralForms[i].val, data_copy) + ';}');
      }
      if (needOther) throw new Error("No 'other' form found in " + ast.type + " " + data.pf_count);
      return '{ ' + r.join(', ') + ' }';

    case 'string':
      return JSON.stringify(ast.val || "");

    case 'octothorpe':
      if (!data.pf_count) return '"#"';
      args = [ propname(data.keys[data.pf_count-1], 'd') ];
      if (data.offset[data.pf_count-1]) args.push(data.offset[data.pf_count-1]);
      return 'number(' + args.join(', ') + ')';

    default:
      throw new Error( 'Bad AST type: ' + ast.type );
  }
};

/** Compile messages into an executable function with clean string
 *  representation.
 *
 *  If `messages` is a single string including ICU MessageFormat declarations,
 *  `opt` is ignored and the returned function takes a single Object parameter
 *  `d` representing each of the input's defined variables. The returned
 *  function will be defined in a local scope that includes all the required
 *  runtime variables.
 *
 *  If `messages` is a map of keys to strings, or a map of namespace keys to
 *  such key/string maps, the returned function will fill the specified global
 *  with javascript functions matching the structure of the input. In such use,
 *  the output of `compile()` is expected to be serialized using `.toString()`,
 *  and will include definitions of the runtime functions. If `opt.global` is
 *  null, calling the output function will return the object itself.
 *
 *  Together, the input parameters should match the following patterns:
 *  ```js
 *  messages = "string" || { key0: "string0", key1: "string1", ... } || {
 *    ns0: { key0: "string0", key1: "string1", ...  },
 *    ns1: { key0: "string0", key1: "string1", ...  },
 *    ...
 *  }
 *
 *  opt = null || {
 *    locale: null || {
 *      ns0: "lc0" || [ "lc0", ... ],
 *      ns1: "lc1" || [ "lc1", ... ],
 *      ...
 *    },
 *    global: null || "module.exports" || "exports" || "i18n" || ...
 *  }
 *  ```
 *
 *  @memberof MessageFormat
 *  @param {string|Object}
 *      messages - The input message(s) to be compiled, in ICU MessageFormat
 *  @param {Object} [opt={}] - Options controlling output for non-simple intput
 *  @param {Object} [opt.locale] - The locales to use for the messages, with a
 *      structure matching that of `messages`
 *  @param {string} [opt.global=""] - The global variable that the output
 *      function should use, or a null string for none. "exports" and
 *      "module.exports" are recognised as special cases.
 *  @returns {function} The first match found for the given locale(s)
 *
 *  @example
 * > var MessageFormat = require('messageformat'),
 * ...   mf = new MessageFormat('en'),
 * ...   mfunc0 = mf.compile('A {TYPE} example.');
 * > mfunc0({TYPE:'simple'})
 * 'A simple example.'
 * > mfunc0.toString()
 * 'function (d) { return "A " + d.TYPE + " example."; }'
 *
 *  @example
 * > var msgSet = { a: 'A {TYPE} example.',
 * ...              b: 'This has {COUNT, plural, one{one member} other{# members}}.' },
 * ...   mfuncSet = mf.compile(msgSet);
 * > mfuncSet().a({TYPE:'more complex'})
 * 'A more complex example.'
 * > mfuncSet().b({COUNT:2})
 * 'This has 2 members.'
 *
 * > console.log(mfuncSet.toString())
 * function anonymous() {
 * var number = function (value, offset) {
 *   if (isNaN(value)) throw new Error("'" + value + "' isn't a number.");
 *   return value - (offset || 0);
 * };
 * var plural = function (value, offset, lcfunc, data, isOrdinal) {
 *   if ({}.hasOwnProperty.call(data, value)) return data[value]();
 *   if (offset) value -= offset;
 *   var key = lcfunc(value, isOrdinal);
 *   if (key in data) return data[key]();
 *   return data.other();
 * };
 * var select = function (value, data) {
 *   if ({}.hasOwnProperty.call(data, value)) return data[value]();
 *   return data.other()
 * };
 * var pluralFuncs = {
 *   en: function (n, ord) {
 *     var s = String(n).split('.'), v0 = !s[1], t0 = Number(s[0]) == n,
 *         n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
 *     if (ord) return (n10 == 1 && n100 != 11) ? 'one'
 *         : (n10 == 2 && n100 != 12) ? 'two'
 *         : (n10 == 3 && n100 != 13) ? 'few'
 *         : 'other';
 *     return (n == 1 && v0) ? 'one' : 'other';
 *   }
 * };
 * var fmt = {};
 *
 * return {
 *   a: function(d) { return "A " + d.TYPE + " example."; },
 *   b: function(d) { return "This has " + plural(d.COUNT, 0, pluralFuncs.en, { one: function() { return "one member";}, other: function() { return number(d.COUNT)+" members";} }) + "."; }
 * }
 * }
 *
 *  @example
 * > mf.runtime.pluralFuncs.fi = MessageFormat.plurals.fi;
 * > var multiSet = { en: { a: 'A {TYPE} example.',
 * ...                      b: 'This is the {COUNT, selectordinal, one{#st} two{#nd} few{#rd} other{#th}} example.' },
 * ...                fi: { a: '{TYPE} esimerkki.',
 * ...                      b: 'Tämä on {COUNT, selectordinal, other{#.}} esimerkki.' } },
 * ...   multiSetLocales = { en: 'en', fi: 'fi' },
 * ...   mfuncSet = mf.compile(multiSet, { locale: multiSetLocales, global: 'i18n' });
 * > mfuncSet(this);
 * > i18n.en.b({COUNT:3})
 * 'This is the 3rd example.'
 * > i18n.fi.b({COUNT:3})
 * 'Tämä on 3. esimerkki.'  */
MessageFormat.prototype.compile = function ( messages, opt ) {
  var r = {}, lc0 = this.lc,
      compileMsg = function(self, msg) {
        try {
          var ast = MessageFormat._parse(msg);
          return self._precompile(ast);
        } catch (e) {
          throw new Error((ast ? 'Precompiler' : 'Parser') + ' error: ' + e.toString());
        }
      },
      stringify = function(r, level) {
        if (!level) level = 0;
        if (typeof r != 'object') return r;
        var o = [], indent = '';
        for (var i = 0; i < level; ++i) indent += '  ';
        for (var k in r) o.push('\n' + indent + '  ' + propname(k) + ': ' + stringify(r[k], level + 1));
        return '{' + o.join(',') + '\n' + indent + '}';
      };

  if (typeof messages == 'string') {
    var f = new Function(
        'number, plural, select, pluralFuncs, fmt',
        'return ' + compileMsg(this, messages));
    return f(this.runtime.number, this.runtime.plural, this.runtime.select,
        this.runtime.pluralFuncs, this.runtime.fmt);
  }

  opt = opt || {};

  for (var ns in messages) {
    if (opt.locale) this.lc = opt.locale[ns] && [].concat(opt.locale[ns]) || lc0;
    if (typeof messages[ns] == 'string') {
      try { r[ns] = compileMsg(this, messages[ns]); }
      catch (e) { e.message = e.message.replace(':', ' with `' + ns + '`:'); throw e; }
    } else {
      r[ns] = {};
      for (var key in messages[ns]) {
        try { r[ns][key] = compileMsg(this, messages[ns][key]); }
        catch (e) { e.message = e.message.replace(':', ' with `' + key + '` in `' + ns + '`:'); throw e; }
      }
    }
  }

  this.lc = lc0;
  var s = this.runtime.toString() + '\n';
  switch (opt.global || '') {
    case 'exports':
      var o = [];
      for (var k in r) o.push(propname(k, 'exports') + ' = ' + stringify(r[k]));
      return new Function(s + o.join(';\n'));
    case 'module.exports':
      return new Function(s + 'module.exports = ' + stringify(r));
    case '':
      return new Function(s + 'return ' + stringify(r));
    default:
      return new Function('G', s + propname(opt.global, 'G') + ' = ' + stringify(r));
  }
};


return MessageFormat;
}());
/* jshint ignore:end */


var createErrorPluralModulePresence = function() {
	return createError( "E_MISSING_PLURAL_MODULE", "Plural module not loaded." );
};




var validateMessageBundle = function( cldr ) {
	validate(
		"E_MISSING_MESSAGE_BUNDLE",
		"Missing message bundle for locale `{locale}`.",
		cldr.attributes.bundle && cldr.get( "globalize-messages/{bundle}" ) !== undefined,
		{
			locale: cldr.locale
		}
	);
};




var validateMessagePresence = function( path, value ) {
	path = path.join( "/" );
	validate( "E_MISSING_MESSAGE", "Missing required message content `{path}`.",
		value !== undefined, { path: path } );
};




var validateMessageType = function( path, value ) {
	path = path.join( "/" );
	validate(
		"E_INVALID_MESSAGE",
		"Invalid message content `{path}`. {expected} expected.",
		typeof value === "string",
		{
			expected: "a string",
			path: path
		}
	);
};




var validateParameterTypeMessageVariables = function( value, name ) {
	validateParameterType(
		value,
		name,
		value === undefined || isPlainObject( value ) || Array.isArray( value ),
		"Array or Plain Object"
	);
};




var messageFormatterFn = function( formatter ) {
	return function messageFormatter( variables ) {
		if ( typeof variables === "number" || typeof variables === "string" ) {
			variables = [].slice.call( arguments, 0 );
		}
		validateParameterTypeMessageVariables( variables, "variables" );
		return formatter( variables );
	};
};




var messageFormatterRuntimeBind = function( cldr, messageformatter ) {
	var locale = cldr.locale,
		origToString = messageformatter.toString;

	messageformatter.toString = function() {
		var argNames, argValues, output,
			args = {};

		// Properly adjust SlexAxton/messageformat.js compiled variables with Globalize variables:
		output = origToString.call( messageformatter );

		if ( /number\(/.test( output ) ) {
			args.number = "messageFormat.number";
		}

		if ( /plural\(/.test( output ) ) {
			args.plural = "messageFormat.plural";
		}

		if ( /select\(/.test( output ) ) {
			args.select = "messageFormat.select";
		}

		output.replace( /pluralFuncs(\[([^\]]+)\]|\.([a-zA-Z]+))/, function( match ) {
			args.pluralFuncs = "{" +
				"\"" + locale + "\": Globalize(\"" + locale + "\").pluralGenerator()" +
				"}";
			return match;
		});

		argNames = Object.keys( args ).join( ", " );
		argValues = Object.keys( args ).map(function( key ) {
			return args[ key ];
		}).join( ", " );

		return "(function( " + argNames + " ) {\n" +
			"  return " + output + "\n" +
			"})(" + argValues + ")";
	};

	return messageformatter;
};




var slice = [].slice;

/**
 * .loadMessages( json )
 *
 * @json [JSON]
 *
 * Load translation data.
 */
Globalize.loadMessages = function( json ) {
	var locale,
		customData = {
			"globalize-messages": json,
			"main": {}
		};

	validateParameterPresence( json, "json" );
	validateParameterTypePlainObject( json, "json" );

	// Set available bundles by populating customData main dataset.
	for ( locale in json ) {
		if ( json.hasOwnProperty( locale ) ) {
			customData.main[ locale ] = {};
		}
	}

	Cldr.load( customData );
};

/**
 * .messageFormatter( path )
 *
 * @path [String or Array]
 *
 * Format a message given its path.
 */
Globalize.messageFormatter =
Globalize.prototype.messageFormatter = function( path ) {
	var cldr, formatter, message, pluralGenerator, returnFn,
		args = slice.call( arguments, 0 );

	validateParameterPresence( path, "path" );
	validateParameterType( path, "path", typeof path === "string" || Array.isArray( path ),
		"a String nor an Array" );

	path = alwaysArray( path );
	cldr = this.cldr;

	validateDefaultLocale( cldr );
	validateMessageBundle( cldr );

	message = cldr.get( [ "globalize-messages/{bundle}" ].concat( path ) );
	validateMessagePresence( path, message );

	// If message is an Array, concatenate it.
	if ( Array.isArray( message ) ) {
		message = message.join( " " );
	}
	validateMessageType( path, message );

	// Is plural module present? Yes, use its generator. Nope, use an error generator.
	pluralGenerator = this.plural !== undefined ?
		this.pluralGenerator() :
		createErrorPluralModulePresence;

	formatter = new MessageFormat( cldr.locale, pluralGenerator ).compile( message );

	returnFn = messageFormatterFn( formatter );

	runtimeBind( args, cldr, returnFn,
		[ messageFormatterRuntimeBind( cldr, formatter ), pluralGenerator ] );

	return returnFn;
};

/**
 * .formatMessage( path [, variables] )
 *
 * @path [String or Array]
 *
 * @variables [Number, String, Array or Object]
 *
 * Format a message given its path.
 */
Globalize.formatMessage =
Globalize.prototype.formatMessage = function( path /* , variables */ ) {
	return this.messageFormatter( path ).apply( {}, slice.call( arguments, 1 ) );
};

return Globalize;




}));



/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};


/***/ }),

/***/ "./node_modules/tslib/tslib.js":
/*!*************************************!*\
  !*** ./node_modules/tslib/tslib.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function (exports) { factory(createExporter(root, createExporter(exports))); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
    else {}
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator];
        return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
});

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/App.m.css":
/*!***********************!*\
  !*** ./src/App.m.css ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
module.exports = {" _key":"nls-bundles-per-locale/App","root":"App-m__root__LaFAR"};

/***/ }),

/***/ "./src/App.ts":
/*!********************!*\
  !*** ./src/App.ts ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return App; });
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_routing_Outlet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/routing/Outlet */ "./node_modules/@dojo/framework/routing/Outlet.mjs");
/* harmony import */ var _widgets_Menu_Menu_container__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./widgets/Menu/Menu.container */ "./src/widgets/Menu/Menu.container.ts");
/* harmony import */ var _nls__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./nls */ "./src/nls/index.ts");
/* harmony import */ var _App_m_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./App.m.css */ "./src/App.m.css");
/* harmony import */ var _App_m_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_App_m_css__WEBPACK_IMPORTED_MODULE_6__);







var __autoRegistryItems = { Home: () => __webpack_require__.e(/*! import() | src/widgets/Home/Home */ "src/widgets/Home/Home").then(__webpack_require__.bind(null, /*! ./widgets/Home/Home */ "./src/widgets/Home/Home.ts")), About: () => __webpack_require__.e(/*! import() | src/widgets/About/About */ "src/widgets/About/About").then(__webpack_require__.bind(null, /*! ./widgets/About/About */ "./src/widgets/About/About.ts")), Profile: () => __webpack_require__.e(/*! import() | src/widgets/Profile/Profile */ "src/widgets/Profile/Profile").then(__webpack_require__.bind(null, /*! ./widgets/Profile/Profile */ "./src/widgets/Profile/Profile.ts")) };
class App extends Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_1__["default"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    render() {
        const { messages } = this.localizeBundle(_nls__WEBPACK_IMPORTED_MODULE_5__["default"]);
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', { classes: [_App_m_css__WEBPACK_IMPORTED_MODULE_6__["root"]] }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_widgets_Menu_Menu_container__WEBPACK_IMPORTED_MODULE_4__["default"], {}),
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', [
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_Outlet__WEBPACK_IMPORTED_MODULE_3__["default"], { key: 'home', id: 'home', renderer: () => Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])({ label: "__autoRegistryItem_Home", registryItem: __autoRegistryItems.Home }, {}) }),
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_Outlet__WEBPACK_IMPORTED_MODULE_3__["default"], { key: 'about', id: 'about', renderer: () => Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])({ label: "__autoRegistryItem_About", registryItem: __autoRegistryItems.About }, {}) }),
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_Outlet__WEBPACK_IMPORTED_MODULE_3__["default"], {
                    key: 'profile',
                    id: 'profile',
                    renderer: () => Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])({ label: "__autoRegistryItem_Profile", registryItem: __autoRegistryItems.Profile }, { username: `Dojo ${messages.user}` })
                })
            ])
        ]);
    }
}


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dojo_framework_widget_core_vdom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dojo/framework/widget-core/vdom */ "./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var _dojo_framework_widget_core_Registry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/Registry */ "./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_routing_RouterInjector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/routing/RouterInjector */ "./node_modules/@dojo/framework/routing/RouterInjector.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/Themed */ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_themes_dojo__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @dojo/themes/dojo */ "./node_modules/@dojo/themes/dojo/index.js");
/* harmony import */ var _dojo_themes_dojo__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_dojo_themes_dojo__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _dojo_themes_dojo_index_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/themes/dojo/index.css */ "./node_modules/@dojo/themes/dojo/index.css");
/* harmony import */ var _dojo_themes_dojo_index_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_dojo_themes_dojo_index_css__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _routes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./routes */ "./src/routes.ts");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./App */ "./src/App.ts");










const registry = new _dojo_framework_widget_core_Registry__WEBPACK_IMPORTED_MODULE_1__["default"]();
Object(_dojo_framework_routing_RouterInjector__WEBPACK_IMPORTED_MODULE_3__["registerRouterInjector"])(_routes__WEBPACK_IMPORTED_MODULE_8__["default"], registry);
Object(_dojo_framework_widget_core_mixins_Themed__WEBPACK_IMPORTED_MODULE_4__["registerThemeInjector"])(_dojo_themes_dojo__WEBPACK_IMPORTED_MODULE_6___default.a, registry);
const injector = Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_5__["registerI18nInjector"])({ locale: 'en' }, registry);
registry.defineInjector('locale', (invalidator) => {
    function localeSwitcher(locale) {
        injector.set({ locale });
    }
    return () => localeSwitcher;
});
const r = Object(_dojo_framework_widget_core_vdom__WEBPACK_IMPORTED_MODULE_0__["default"])(() => Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_App__WEBPACK_IMPORTED_MODULE_9__["default"], {}));
r.mount({ registry });


/***/ }),

/***/ "./src/nls/index.ts":
/*!**************************!*\
  !*** ./src/nls/index.ts ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
    locales: {
        fr: () => __webpack_require__.e(/*! import() | fr */ "fr").then(__webpack_require__.bind(null, /*! ./fr */ "./src/nls/fr/index.ts")),
        de: () => __webpack_require__.e(/*! import() | de */ "de").then(__webpack_require__.bind(null, /*! ./de */ "./src/nls/de/index.ts"))
    },
    messages: {
        user: 'User'
    }
});


/***/ }),

/***/ "./src/routes.ts":
/*!***********************!*\
  !*** ./src/routes.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ([
    {
        path: 'home',
        outlet: 'home',
        defaultRoute: true
    },
    {
        path: 'about',
        outlet: 'about'
    },
    {
        path: 'profile',
        outlet: 'profile'
    }
]);


/***/ }),

/***/ "./src/widgets/Menu/Menu.container.ts":
/*!********************************************!*\
  !*** ./src/widgets/Menu/Menu.container.ts ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dojo_framework_widget_core_Container__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dojo/framework/widget-core/Container */ "./node_modules/@dojo/framework/widget-core/Container.mjs");
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Menu */ "./src/widgets/Menu/Menu.ts");


/* harmony default export */ __webpack_exports__["default"] = (Object(_dojo_framework_widget_core_Container__WEBPACK_IMPORTED_MODULE_0__["default"])(_Menu__WEBPACK_IMPORTED_MODULE_1__["default"], 'locale', {
    getProperties(context) {
        return {
            localeSwitcher: context
        };
    }
}));


/***/ }),

/***/ "./src/widgets/Menu/Menu.m.css":
/*!*************************************!*\
  !*** ./src/widgets/Menu/Menu.m.css ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
module.exports = {" _key":"nls-bundles-per-locale/Menu","root":"Menu-m__root__1nTz0","link":"Menu-m__link__3p33W","selected":"Menu-m__selected__1bGY7","select":"Menu-m__select__1u0n9","container":"Menu-m__container__RrHow","columnContainer":"Menu-m__columnContainer__2e0WU","selectWrapper":"Menu-m__selectWrapper__1K9lL"};

/***/ }),

/***/ "./src/widgets/Menu/Menu.ts":
/*!**********************************!*\
  !*** ./src/widgets/Menu/Menu.ts ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Menu; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dojo/framework/widget-core/WidgetBase */ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var _dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dojo/framework/widget-core/d */ "./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var _dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dojo/framework/widget-core/mixins/I18n */ "./node_modules/@dojo/framework/widget-core/mixins/I18n.mjs");
/* harmony import */ var _dojo_framework_widget_core_decorators_watch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dojo/framework/widget-core/decorators/watch */ "./node_modules/@dojo/framework/widget-core/decorators/watch.mjs");
/* harmony import */ var _dojo_framework_routing_ActiveLink__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @dojo/framework/routing/ActiveLink */ "./node_modules/@dojo/framework/routing/ActiveLink.mjs");
/* harmony import */ var _dojo_widgets_toolbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @dojo/widgets/toolbar */ "./node_modules/@dojo/widgets/toolbar/index.mjs");
/* harmony import */ var _dojo_widgets_select__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dojo/widgets/select */ "./node_modules/@dojo/widgets/select/index.mjs");
/* harmony import */ var _Menu_m_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Menu.m.css */ "./src/widgets/Menu/Menu.m.css");
/* harmony import */ var _Menu_m_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _nls__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./nls */ "./src/widgets/Menu/nls/index.ts");










class Menu extends Object(_dojo_framework_widget_core_mixins_I18n__WEBPACK_IMPORTED_MODULE_3__["default"])(_dojo_framework_widget_core_WidgetBase__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    constructor() {
        super(...arguments);
        this._locales = ['en', 'de', 'fr'];
        this._locale = 'en';
        this._collapsed = false;
    }
    render() {
        const { messages } = this.localizeBundle(_nls__WEBPACK_IMPORTED_MODULE_9__["default"]);
        return Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_widgets_toolbar__WEBPACK_IMPORTED_MODULE_6__["default"], {
            heading: 'My Dojo App!',
            collapseWidth: 650,
            onCollapse: (value) => {
                this._collapsed = value;
            }
        }, [
            Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', { classes: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["container"], this._collapsed ? _Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["columnContainer"] : null] }, [
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_ActiveLink__WEBPACK_IMPORTED_MODULE_5__["default"], {
                    to: 'home',
                    classes: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["link"]],
                    activeClasses: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["selected"]]
                }, [messages.home]),
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_ActiveLink__WEBPACK_IMPORTED_MODULE_5__["default"], {
                    to: 'about',
                    classes: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["link"]],
                    activeClasses: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["selected"]]
                }, [messages.about]),
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_framework_routing_ActiveLink__WEBPACK_IMPORTED_MODULE_5__["default"], {
                    to: 'profile',
                    classes: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["link"]],
                    activeClasses: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["selected"]]
                }, [messages.profile]),
                Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["v"])('div', { classes: [_Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["selectWrapper"]] }, [
                    Object(_dojo_framework_widget_core_d__WEBPACK_IMPORTED_MODULE_2__["w"])(_dojo_widgets_select__WEBPACK_IMPORTED_MODULE_7__["default"], {
                        extraClasses: {
                            input: _Menu_m_css__WEBPACK_IMPORTED_MODULE_8__["select"]
                        },
                        value: this._locale,
                        options: this._locales,
                        useNativeElement: true,
                        getOptionValue: (option) => option,
                        onChange: (value) => {
                            this._locale = value;
                            this.properties.localeSwitcher(value);
                        }
                    })
                ])
            ])
        ]);
    }
}
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_decorators_watch__WEBPACK_IMPORTED_MODULE_4__["default"])()
], Menu.prototype, "_locale", void 0);
tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_dojo_framework_widget_core_decorators_watch__WEBPACK_IMPORTED_MODULE_4__["default"])()
], Menu.prototype, "_collapsed", void 0);


/***/ }),

/***/ "./src/widgets/Menu/nls/index.ts":
/*!***************************************!*\
  !*** ./src/widgets/Menu/nls/index.ts ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
    locales: {
        fr: () => __webpack_require__.e(/*! import() | fr */ "fr").then(__webpack_require__.bind(null, /*! ./fr */ "./src/widgets/Menu/nls/fr/index.ts")),
        de: () => __webpack_require__.e(/*! import() | de */ "de").then(__webpack_require__.bind(null, /*! ./de */ "./src/widgets/Menu/nls/de/index.ts"))
    },
    messages: {
        home: 'Home',
        about: 'About',
        profile: 'Profile'
    }
});


/***/ })

}]);
//# sourceMappingURL=main.js.map