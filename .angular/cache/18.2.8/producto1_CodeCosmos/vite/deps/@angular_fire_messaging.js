import {
  deleteToken,
  getMessagingInWindow,
  getToken,
  isWindowSupported,
  onMessage
} from "./chunk-BEMWL2RB.js";
import {
  FirebaseApp,
  FirebaseApps
} from "./chunk-RDQ3UJBU.js";
import {
  VERSION,
  ɵAngularFireSchedulers,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵisSupportedError,
  ɵzoneWrap
} from "./chunk-JEHFFJ5Z.js";
import "./chunk-3IMWLXIE.js";
import {
  registerVersion
} from "./chunk-5IYD3MR6.js";
import {
  APP_INITIALIZER,
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Optional,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-CEXP5ZO2.js";
import {
  concatMap,
  distinct,
  from,
  timer
} from "./chunk-3COQGF7T.js";
import "./chunk-35ENWJA4.js";

// node_modules/@angular/fire/fesm2022/angular-fire-messaging.mjs
var Messaging = class {
  constructor(messaging) {
    return messaging;
  }
};
var MESSAGING_PROVIDER_NAME = "messaging";
var MessagingInstances = class {
  constructor() {
    return ɵgetAllInstancesOf(MESSAGING_PROVIDER_NAME);
  }
};
var messagingInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(MESSAGING_PROVIDER_NAME))), distinct());
var isMessagingSupportedPromiseSymbol = "__angularfire_symbol__messagingIsSupported";
var isMessagingSupportedValueSymbol = "__angularfire_symbol__messagingIsSupportedValue";
globalThis[isMessagingSupportedPromiseSymbol] ||= isWindowSupported().then((it) => globalThis[isMessagingSupportedValueSymbol] = it).catch(() => globalThis[isMessagingSupportedValueSymbol] = false);
var isMessagingSupportedFactory = {
  async: () => globalThis[isMessagingSupportedPromiseSymbol],
  sync: () => {
    const ret = globalThis[isMessagingSupportedValueSymbol];
    if (ret === void 0) {
      throw new Error(ɵisSupportedError("Messaging"));
    }
    return ret;
  }
};
var PROVIDED_MESSAGING_INSTANCES = new InjectionToken("angularfire2.messaging-instances");
function defaultMessagingInstanceFactory(provided, defaultApp) {
  if (!isMessagingSupportedFactory.sync()) {
    return null;
  }
  const defaultMessaging = ɵgetDefaultInstanceOf(MESSAGING_PROVIDER_NAME, provided, defaultApp);
  return defaultMessaging && new Messaging(defaultMessaging);
}
function messagingInstanceFactory(fn) {
  return (zone, injector) => {
    if (!isMessagingSupportedFactory.sync()) {
      return null;
    }
    const messaging = zone.runOutsideAngular(() => fn(injector));
    return new Messaging(messaging);
  };
}
var MESSAGING_INSTANCES_PROVIDER = {
  provide: MessagingInstances,
  deps: [[new Optional(), PROVIDED_MESSAGING_INSTANCES]]
};
var DEFAULT_MESSAGING_INSTANCE_PROVIDER = {
  provide: Messaging,
  useFactory: defaultMessagingInstanceFactory,
  deps: [[new Optional(), PROVIDED_MESSAGING_INSTANCES], FirebaseApp]
};
var MessagingModule = class _MessagingModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "fcm");
  }
  static ɵfac = function MessagingModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MessagingModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MessagingModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_MESSAGING_INSTANCE_PROVIDER, MESSAGING_INSTANCES_PROVIDER, {
      provide: APP_INITIALIZER,
      useValue: isMessagingSupportedFactory.async,
      multi: true
    }]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MessagingModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_MESSAGING_INSTANCE_PROVIDER, MESSAGING_INSTANCES_PROVIDER, {
        provide: APP_INITIALIZER,
        useValue: isMessagingSupportedFactory.async,
        multi: true
      }]
    }]
  }], () => [], null);
})();
function provideMessaging(fn, ...deps) {
  registerVersion("angularfire", VERSION.full, "fcm");
  return makeEnvironmentProviders([DEFAULT_MESSAGING_INSTANCE_PROVIDER, MESSAGING_INSTANCES_PROVIDER, {
    provide: APP_INITIALIZER,
    useValue: isMessagingSupportedFactory.async,
    multi: true
  }, {
    provide: PROVIDED_MESSAGING_INSTANCES,
    useFactory: messagingInstanceFactory(fn),
    multi: true,
    deps: [NgZone, Injector, ɵAngularFireSchedulers, FirebaseApps, ...deps]
  }]);
}
var isSupported = isMessagingSupportedFactory.async;
var deleteToken2 = ɵzoneWrap(deleteToken, true);
var getMessaging = ɵzoneWrap(getMessagingInWindow, true);
var getToken2 = ɵzoneWrap(getToken, true);
var onMessage2 = ɵzoneWrap(onMessage, false);
export {
  Messaging,
  MessagingInstances,
  MessagingModule,
  deleteToken2 as deleteToken,
  getMessaging,
  getToken2 as getToken,
  isSupported,
  messagingInstance$,
  onMessage2 as onMessage,
  provideMessaging
};
//# sourceMappingURL=@angular_fire_messaging.js.map
