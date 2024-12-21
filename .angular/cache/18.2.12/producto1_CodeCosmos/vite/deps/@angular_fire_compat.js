import {
  VERSION as VERSION2
} from "./chunk-6YNY5HP2.js";
import {
  Inject,
  InjectionToken,
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  VERSION,
  isDevMode,
  setClassMetadata,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-4ILGPR6T.js";
import "./chunk-2QQLL3PY.js";
import "./chunk-2IQ2WWR6.js";
import {
  DEFAULT_ENTRY_NAME,
  SDK_VERSION,
  _addComponent,
  _addOrOverwriteComponent,
  _registerComponent,
  deleteApp,
  index_esm2017_exports,
  initializeApp,
  onLog,
  registerVersion,
  setLogLevel
} from "./chunk-CMZFNWV3.js";
import "./chunk-35ENWJA4.js";

// node_modules/@firebase/app-compat/node_modules/@firebase/util/dist/index.esm2017.js
function deepExtend(target, source) {
  if (!(source instanceof Object)) {
    return source;
  }
  switch (source.constructor) {
    case Date:
      const dateValue = source;
      return new Date(dateValue.getTime());
    case Object:
      if (target === void 0) {
        target = {};
      }
      break;
    case Array:
      target = [];
      break;
    default:
      return source;
  }
  for (const prop in source) {
    if (!source.hasOwnProperty(prop) || !isValidKey(prop)) {
      continue;
    }
    target[prop] = deepExtend(target[prop], source[prop]);
  }
  return target;
}
function isValidKey(key) {
  return key !== "__proto__";
}
function getGlobal() {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("Unable to locate global object.");
}
var ERROR_NAME = "FirebaseError";
var FirebaseError = class _FirebaseError extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, _FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
};
var ErrorFactory = class {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template = this.errors[code];
    const message = template ? replaceTemplate(template, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error = new FirebaseError(fullCode, fullMessage, customData);
    return error;
  }
};
function replaceTemplate(template, data) {
  return template.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
var PATTERN = /\{\$([^}]+)}/g;
function contains(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function createSubscribe(executor, onNoObservers) {
  const proxy = new ObserverProxy(executor, onNoObservers);
  return proxy.subscribe.bind(proxy);
}
var ObserverProxy = class {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(executor, onNoObservers) {
    this.observers = [];
    this.unsubscribes = [];
    this.observerCount = 0;
    this.task = Promise.resolve();
    this.finalized = false;
    this.onNoObservers = onNoObservers;
    this.task.then(() => {
      executor(this);
    }).catch((e) => {
      this.error(e);
    });
  }
  next(value) {
    this.forEachObserver((observer) => {
      observer.next(value);
    });
  }
  error(error) {
    this.forEachObserver((observer) => {
      observer.error(error);
    });
    this.close(error);
  }
  complete() {
    this.forEachObserver((observer) => {
      observer.complete();
    });
    this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber synchronously to their
   *   call to subscribe().
   */
  subscribe(nextOrObserver, error, complete) {
    let observer;
    if (nextOrObserver === void 0 && error === void 0 && complete === void 0) {
      throw new Error("Missing Observer.");
    }
    if (implementsAnyMethods(nextOrObserver, ["next", "error", "complete"])) {
      observer = nextOrObserver;
    } else {
      observer = {
        next: nextOrObserver,
        error,
        complete
      };
    }
    if (observer.next === void 0) {
      observer.next = noop;
    }
    if (observer.error === void 0) {
      observer.error = noop;
    }
    if (observer.complete === void 0) {
      observer.complete = noop;
    }
    const unsub = this.unsubscribeOne.bind(this, this.observers.length);
    if (this.finalized) {
      this.task.then(() => {
        try {
          if (this.finalError) {
            observer.error(this.finalError);
          } else {
            observer.complete();
          }
        } catch (e) {
        }
        return;
      });
    }
    this.observers.push(observer);
    return unsub;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(i) {
    if (this.observers === void 0 || this.observers[i] === void 0) {
      return;
    }
    delete this.observers[i];
    this.observerCount -= 1;
    if (this.observerCount === 0 && this.onNoObservers !== void 0) {
      this.onNoObservers(this);
    }
  }
  forEachObserver(fn) {
    if (this.finalized) {
      return;
    }
    for (let i = 0; i < this.observers.length; i++) {
      this.sendOne(i, fn);
    }
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(i, fn) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[i] !== void 0) {
        try {
          fn(this.observers[i]);
        } catch (e) {
          if (typeof console !== "undefined" && console.error) {
            console.error(e);
          }
        }
      }
    });
  }
  close(err) {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    if (err !== void 0) {
      this.finalError = err;
    }
    this.task.then(() => {
      this.observers = void 0;
      this.onNoObservers = void 0;
    });
  }
};
function implementsAnyMethods(obj, methods) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  for (const method of methods) {
    if (method in obj && typeof obj[method] === "function") {
      return true;
    }
  }
  return false;
}
function noop() {
}
var MAX_VALUE_MILLIS = 4 * 60 * 60 * 1e3;

// node_modules/@firebase/app-compat/node_modules/@firebase/component/dist/esm/index.esm2017.js
var Component = class {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(name3, instanceFactory, type) {
    this.name = name3;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
};

// node_modules/@firebase/app-compat/node_modules/@firebase/logger/dist/esm/index.esm2017.js
var instances = [];
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
var defaultLogLevel = LogLevel.INFO;
var ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
var defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
var Logger = class {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name3) {
    this.name = name3;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
    instances.push(this);
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
};

// node_modules/@firebase/app-compat/dist/esm/index.esm2017.js
var FirebaseAppImpl = class {
  constructor(_delegate, firebase2) {
    this._delegate = _delegate;
    this.firebase = firebase2;
    _addComponent(_delegate, new Component(
      "app-compat",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
    this.container = _delegate.container;
  }
  get automaticDataCollectionEnabled() {
    return this._delegate.automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(val) {
    this._delegate.automaticDataCollectionEnabled = val;
  }
  get name() {
    return this._delegate.name;
  }
  get options() {
    return this._delegate.options;
  }
  delete() {
    return new Promise((resolve) => {
      this._delegate.checkDestroyed();
      resolve();
    }).then(() => {
      this.firebase.INTERNAL.removeApp(this.name);
      return deleteApp(this._delegate);
    });
  }
  /**
   * Return a service instance associated with this app (creating it
   * on demand), identified by the passed instanceIdentifier.
   *
   * NOTE: Currently storage and functions are the only ones that are leveraging this
   * functionality. They invoke it by calling:
   *
   * ```javascript
   * firebase.app().storage('STORAGE BUCKET ID')
   * ```
   *
   * The service name is passed to this already
   * @internal
   */
  _getService(name3, instanceIdentifier = DEFAULT_ENTRY_NAME) {
    var _a;
    this._delegate.checkDestroyed();
    const provider = this._delegate.container.getProvider(name3);
    if (!provider.isInitialized() && ((_a = provider.getComponent()) === null || _a === void 0 ? void 0 : _a.instantiationMode) === "EXPLICIT") {
      provider.initialize();
    }
    return provider.getImmediate({
      identifier: instanceIdentifier
    });
  }
  /**
   * Remove a service instance from the cache, so we will create a new instance for this service
   * when people try to get it again.
   *
   * NOTE: currently only firestore uses this functionality to support firestore shutdown.
   *
   * @param name The service name
   * @param instanceIdentifier instance identifier in case multiple instances are allowed
   * @internal
   */
  _removeServiceInstance(name3, instanceIdentifier = DEFAULT_ENTRY_NAME) {
    this._delegate.container.getProvider(name3).clearInstance(instanceIdentifier);
  }
  /**
   * @param component the component being added to this app's container
   * @internal
   */
  _addComponent(component) {
    _addComponent(this._delegate, component);
  }
  _addOrOverwriteComponent(component) {
    _addOrOverwriteComponent(this._delegate, component);
  }
  toJSON() {
    return {
      name: this.name,
      automaticDataCollectionEnabled: this.automaticDataCollectionEnabled,
      options: this.options
    };
  }
};
var ERRORS = {
  [
    "no-app"
    /* AppError.NO_APP */
  ]: "No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()",
  [
    "invalid-app-argument"
    /* AppError.INVALID_APP_ARGUMENT */
  ]: "firebase.{$appName}() takes either no argument or a Firebase App instance."
};
var ERROR_FACTORY = new ErrorFactory("app-compat", "Firebase", ERRORS);
function createFirebaseNamespaceCore(firebaseAppImpl) {
  const apps = {};
  const namespace = {
    // Hack to prevent Babel from modifying the object returned
    // as the firebase namespace.
    // @ts-ignore
    __esModule: true,
    initializeApp: initializeAppCompat,
    // @ts-ignore
    app,
    registerVersion,
    setLogLevel,
    onLog,
    // @ts-ignore
    apps: null,
    SDK_VERSION,
    INTERNAL: {
      registerComponent: registerComponentCompat,
      removeApp,
      useAsService,
      modularAPIs: index_esm2017_exports
    }
  };
  namespace["default"] = namespace;
  Object.defineProperty(namespace, "apps", {
    get: getApps
  });
  function removeApp(name3) {
    delete apps[name3];
  }
  function app(name3) {
    name3 = name3 || DEFAULT_ENTRY_NAME;
    if (!contains(apps, name3)) {
      throw ERROR_FACTORY.create("no-app", {
        appName: name3
      });
    }
    return apps[name3];
  }
  app["App"] = firebaseAppImpl;
  function initializeAppCompat(options, rawConfig = {}) {
    const app2 = initializeApp(options, rawConfig);
    if (contains(apps, app2.name)) {
      return apps[app2.name];
    }
    const appCompat = new firebaseAppImpl(app2, namespace);
    apps[app2.name] = appCompat;
    return appCompat;
  }
  function getApps() {
    return Object.keys(apps).map((name3) => apps[name3]);
  }
  function registerComponentCompat(component) {
    const componentName = component.name;
    const componentNameWithoutCompat = componentName.replace("-compat", "");
    if (_registerComponent(component) && component.type === "PUBLIC") {
      const serviceNamespace = (appArg = app()) => {
        if (typeof appArg[componentNameWithoutCompat] !== "function") {
          throw ERROR_FACTORY.create("invalid-app-argument", {
            appName: componentName
          });
        }
        return appArg[componentNameWithoutCompat]();
      };
      if (component.serviceProps !== void 0) {
        deepExtend(serviceNamespace, component.serviceProps);
      }
      namespace[componentNameWithoutCompat] = serviceNamespace;
      firebaseAppImpl.prototype[componentNameWithoutCompat] = // TODO: The eslint disable can be removed and the 'ignoreRestArgs'
      // option added to the no-explicit-any rule when ESlint releases it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function(...args) {
        const serviceFxn = this._getService.bind(this, componentName);
        return serviceFxn.apply(this, component.multipleInstances ? args : []);
      };
    }
    return component.type === "PUBLIC" ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      namespace[componentNameWithoutCompat]
    ) : null;
  }
  function useAsService(app2, name3) {
    if (name3 === "serverAuth") {
      return null;
    }
    const useService = name3;
    return useService;
  }
  return namespace;
}
function createFirebaseNamespace() {
  const namespace = createFirebaseNamespaceCore(FirebaseAppImpl);
  namespace.INTERNAL = Object.assign(Object.assign({}, namespace.INTERNAL), {
    createFirebaseNamespace,
    extendNamespace,
    createSubscribe,
    ErrorFactory,
    deepExtend
  });
  function extendNamespace(props) {
    deepExtend(namespace, props);
  }
  return namespace;
}
var firebase$1 = createFirebaseNamespace();
var logger = new Logger("@firebase/app-compat");
var name = "@firebase/app-compat";
var version = "0.2.43";
function registerCoreComponents(variant) {
  registerVersion(name, version, variant);
}
try {
  const globals = getGlobal();
  if (globals.firebase !== void 0) {
    logger.warn(`
      Warning: Firebase is already defined in the global scope. Please make sure
      Firebase library is only loaded once.
    `);
    const sdkVersion = globals.firebase.SDK_VERSION;
    if (sdkVersion && sdkVersion.indexOf("LITE") >= 0) {
      logger.warn(`
        Warning: You are trying to load Firebase while using Firebase Performance standalone script.
        You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.
        `);
    }
  }
} catch (_a) {
}
var firebase = firebase$1;
registerCoreComponents();

// node_modules/firebase/compat/app/dist/esm/index.esm.js
var name2 = "firebase";
var version2 = "10.14.1";
firebase.registerVersion(name2, version2, "app-compat");

// node_modules/@angular/fire/fesm2022/angular-fire-compat.mjs
var noopFunctions = ["ngOnDestroy"];
var ɵlazySDKProxy = (klass, observable, zone, options = {}) => {
  return new Proxy(klass, {
    get: (_, name3) => zone.runOutsideAngular(() => {
      if (klass[name3]) {
        if (options?.spy?.get) {
          options.spy.get(name3, klass[name3]);
        }
        return klass[name3];
      }
      if (noopFunctions.indexOf(name3) > -1) {
        return () => void 0;
      }
      const promise = observable.toPromise().then((mod) => {
        const ret = mod?.[name3];
        if (typeof ret === "function") {
          return ret.bind(mod);
        } else if (ret?.then) {
          return ret.then((res) => zone.run(() => res));
        } else {
          return zone.run(() => ret);
        }
      });
      return new Proxy(() => void 0, {
        get: (_2, name4) => promise[name4],
        // TODO handle callbacks as transparently as I can
        apply: (self2, _2, args) => promise.then((it) => {
          const res = it?.(...args);
          if (options?.spy?.apply) {
            options.spy.apply(name3, args, res);
          }
          return res;
        })
      });
    })
  });
};
var ɵapplyMixins = (derivedCtor, constructors) => {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype || baseCtor).forEach((name3) => {
      Object.defineProperty(derivedCtor.prototype, name3, Object.getOwnPropertyDescriptor(baseCtor.prototype || baseCtor, name3));
    });
  });
};
var FirebaseApp = class {
  constructor(app) {
    return app;
  }
};
var FIREBASE_OPTIONS = new InjectionToken("angularfire2.app.options");
var FIREBASE_APP_NAME = new InjectionToken("angularfire2.app.name");
function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
  const name3 = typeof nameOrConfig === "string" && nameOrConfig || "[DEFAULT]";
  const config = typeof nameOrConfig === "object" && nameOrConfig || {};
  config.name = config.name || name3;
  const existingApp = firebase.apps.filter((app2) => app2 && app2.name === config.name)[0];
  const app = existingApp || zone.runOutsideAngular(() => firebase.initializeApp(options, config));
  try {
    if (JSON.stringify(options) !== JSON.stringify(app.options)) {
      const hmr = !!module.hot;
      log$1("error", `${app.name} Firebase App already initialized with different options${hmr ? ", you may need to reload as Firebase is not HMR aware." : "."}`);
    }
  } catch (e) {
  }
  return new FirebaseApp(app);
}
var log$1 = (level, ...args) => {
  if (isDevMode() && typeof console !== "undefined") {
    console[level](...args);
  }
};
var FIREBASE_APP_PROVIDER = {
  provide: FirebaseApp,
  useFactory: ɵfirebaseAppFactory,
  deps: [FIREBASE_OPTIONS, NgZone, [new Optional(), FIREBASE_APP_NAME]]
};
var AngularFireModule = class _AngularFireModule {
  static initializeApp(options, nameOrConfig) {
    return {
      ngModule: _AngularFireModule,
      providers: [{
        provide: FIREBASE_OPTIONS,
        useValue: options
      }, {
        provide: FIREBASE_APP_NAME,
        useValue: nameOrConfig
      }]
    };
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(platformId) {
    firebase.registerVersion("angularfire", VERSION2.full, "core");
    firebase.registerVersion("angularfire", VERSION2.full, "app-compat");
    firebase.registerVersion("angular", VERSION.full, platformId.toString());
  }
  static ɵfac = function AngularFireModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AngularFireModule)(ɵɵinject(PLATFORM_ID));
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFireModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [FIREBASE_APP_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireModule, [{
    type: NgModule,
    args: [{
      providers: [FIREBASE_APP_PROVIDER]
    }]
  }], () => [{
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], null);
})();
function ɵcacheInstance(cacheKey, moduleName, appName, fn, deps) {
  const [, instance, cachedDeps] = globalThis.ɵAngularfireInstanceCache.find((it) => it[0] === cacheKey) || [];
  if (instance) {
    if (!matchDep(deps, cachedDeps)) {
      log("error", `${moduleName} was already initialized on the ${appName} Firebase App with different settings.${IS_HMR ? " You may need to reload as Firebase is not HMR aware." : ""}`);
      log("warn", {
        is: deps,
        was: cachedDeps
      });
    }
    return instance;
  } else {
    const newInstance = fn();
    globalThis.ɵAngularfireInstanceCache.push([cacheKey, newInstance, deps]);
    return newInstance;
  }
}
function matchDep(a, b) {
  try {
    return a.toString() === b.toString();
  } catch (_) {
    return a === b;
  }
}
var IS_HMR = typeof module !== "undefined" && !!module.hot;
var log = (level, ...args) => {
  if (isDevMode() && typeof console !== "undefined") {
    console[level](...args);
  }
};
globalThis.ɵAngularfireInstanceCache ||= [];
export {
  AngularFireModule,
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS,
  FirebaseApp,
  ɵapplyMixins,
  ɵcacheInstance,
  ɵfirebaseAppFactory,
  ɵlazySDKProxy
};
/*! Bundled license information:

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-compat/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/compat/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=@angular_fire_compat.js.map
