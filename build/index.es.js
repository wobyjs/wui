(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const Fragment = ({ children, ...props }) => {
  return children;
};
const SYMBOL_OBSERVABLE = Symbol("Observable");
const SYMBOL_OBSERVABLE_BOOLEAN = Symbol("Observable.Boolean");
const SYMBOL_OBSERVABLE_FROZEN = Symbol("Observable.Frozen");
const SYMBOL_OBSERVABLE_READABLE = Symbol("Observable.Readable");
const SYMBOL_OBSERVABLE_WRITABLE = Symbol("Observable.Writable");
const SYMBOL_STORE = Symbol("Store");
const SYMBOL_STORE_KEYS = Symbol("Store.Keys");
const SYMBOL_STORE_OBSERVABLE = Symbol("Store.Observable");
const SYMBOL_STORE_TARGET = Symbol("Store.Target");
const SYMBOL_STORE_VALUES = Symbol("Store.Values");
const SYMBOL_STORE_UNTRACKED = Symbol("Store.Untracked");
const SYMBOL_SUSPENSE = Symbol("Suspense");
const SYMBOL_UNCACHED = Symbol("Uncached");
const SYMBOL_UNTRACKED = Symbol("Untracked");
const SYMBOL_UNTRACKED_UNWRAPPED = Symbol("Untracked.Unwrapped");
const callStack = (msg) => {
  return void 0;
};
const castArray$1 = (value2) => {
  return isArray$1(value2) ? value2 : [value2];
};
const castError = (error) => {
  if (error instanceof Error)
    return error;
  if (typeof error === "string")
    return new Error(error);
  return new Error("Unknown error");
};
const { is } = Object;
const { isArray: isArray$1 } = Array;
const isFunction$1 = (value2) => {
  return typeof value2 === "function";
};
const isObject$1 = (value2) => {
  return value2 !== null && typeof value2 === "object";
};
const isSymbol = (value2) => {
  return typeof value2 === "symbol";
};
const noop = (stack, dispose) => {
  return;
};
const nope = () => {
  return false;
};
function frozenFunction() {
  if (arguments.length) {
    throw new Error("A readonly Observable can not be updated");
  } else {
    return this;
  }
}
function readableFunction() {
  if (arguments.length) {
    throw new Error("A readonly Observable can not be updated");
  } else {
    return this.get();
  }
}
function writableFunction(fn) {
  if (arguments.length) {
    if (isFunction$1(fn)) {
      return this.update(fn);
    } else {
      return this.set(fn);
    }
  } else {
    return this.get();
  }
}
const frozen = (value2) => {
  const fn = frozenFunction.bind(value2);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_FROZEN] = true;
  return fn;
};
const readable = (value2, stack) => {
  value2.stack = stack;
  const fn = readableFunction.bind(value2);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_READABLE] = value2;
  return fn;
};
const writable = (value2, stack) => {
  value2.stack = stack;
  const fn = writableFunction.bind(value2);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_WRITABLE] = value2;
  return fn;
};
const DIRTY_NO = 0;
const DIRTY_MAYBE_NO = 1;
const DIRTY_MAYBE_YES = 2;
const DIRTY_YES = 3;
const OBSERVABLE_FALSE = frozen(false);
frozen(true);
const UNAVAILABLE = new Proxy({}, new Proxy({}, { get() {
  throw new Error("Unavailable value");
} }));
const UNINITIALIZED = function() {
};
const lazyArrayEachRight = (arr, fn) => {
  if (arr instanceof Array) {
    for (let i = arr.length - 1; i >= 0; i--) {
      fn(arr[i]);
    }
  } else if (arr) {
    fn(arr);
  }
};
const lazyArrayPush = (obj, key, value2) => {
  const arr = obj[key];
  if (arr instanceof Array) {
    arr.push(value2);
  } else if (arr) {
    obj[key] = [arr, value2];
  } else {
    obj[key] = value2;
  }
};
const lazySetAdd = (obj, key, value2) => {
  const set = obj[key];
  if (set instanceof Set) {
    set.add(value2);
  } else if (set) {
    if (value2 !== set) {
      const s = /* @__PURE__ */ new Set();
      s.add(set);
      s.add(value2);
      obj[key] = s;
    }
  } else {
    obj[key] = value2;
  }
};
const lazySetDelete = (obj, key, value2) => {
  const set = obj[key];
  if (set instanceof Set) {
    set.delete(value2);
  } else if (set === value2) {
    obj[key] = void 0;
  }
};
const lazySetEach = (set, fn) => {
  if (set instanceof Set) {
    for (const value2 of set) {
      fn(value2);
    }
  } else if (set) {
    fn(set);
  }
};
const onCleanup = (cleanup2) => cleanup2.call(cleanup2, callStack());
const onDispose = (owner) => owner.dispose(true);
class Owner {
  constructor() {
    this.disposed = false;
    this.cleanups = void 0;
    this.errorHandler = void 0;
    this.contexts = void 0;
    this.observers = void 0;
    this.roots = void 0;
    this.suspenses = void 0;
  }
  /* API */
  catch(error, silent) {
    var _a;
    const { errorHandler } = this;
    if (errorHandler) {
      errorHandler(error);
      return true;
    } else {
      if ((_a = this.parent) == null ? void 0 : _a.catch(error, true))
        return true;
      if (silent)
        return false;
      throw error;
    }
  }
  dispose(deep) {
    lazyArrayEachRight(this.contexts, onDispose);
    lazyArrayEachRight(this.observers, onDispose);
    lazyArrayEachRight(this.suspenses, onDispose);
    lazyArrayEachRight(this.cleanups, onCleanup);
    this.cleanups = void 0;
    this.disposed = deep;
    this.errorHandler = void 0;
    this.observers = void 0;
    this.suspenses = void 0;
  }
  get(symbol) {
    var _a;
    return (_a = this.context) == null ? void 0 : _a[symbol];
  }
  wrap(fn, owner, observer, stack) {
    const ownerPrev = OWNER;
    const observerPrev = OBSERVER;
    setOwner(owner);
    setObserver(observer);
    try {
      return fn(stack);
    } catch (error) {
      this.catch(castError(error), false);
      return UNAVAILABLE;
    } finally {
      setOwner(ownerPrev);
      setObserver(observerPrev);
    }
  }
}
class SuperRoot extends Owner {
  constructor() {
    super(...arguments);
    this.context = {};
  }
}
let SUPER_OWNER = new SuperRoot();
let OBSERVER;
let OWNER = SUPER_OWNER;
const setObserver = (value2) => OBSERVER = value2;
const setOwner = (value2) => OWNER = value2;
const isObservableBoolean = (value2) => {
  return isFunction$1(value2) && SYMBOL_OBSERVABLE_BOOLEAN in value2;
};
const isObservableFrozen = (value2) => {
  var _a, _b;
  return isFunction$1(value2) && (SYMBOL_OBSERVABLE_FROZEN in value2 || !!((_b = (_a = value2[SYMBOL_OBSERVABLE_READABLE]) == null ? void 0 : _a.parent) == null ? void 0 : _b.disposed));
};
const isUntracked$1 = (value2) => {
  return isFunction$1(value2) && (SYMBOL_UNTRACKED in value2 || SYMBOL_UNTRACKED_UNWRAPPED in value2);
};
let Scheduler$2 = class Scheduler {
  constructor() {
    this.waiting = [];
    this.counter = 0;
    this.locked = false;
    this.flush = () => {
      if (this.locked)
        return;
      if (this.counter)
        return;
      if (!this.waiting.length)
        return;
      try {
        this.locked = true;
        while (true) {
          const queue = this.waiting;
          if (!queue.length)
            break;
          this.waiting = [];
          for (let i = 0, l2 = queue.length; i < l2; i++) {
            queue[i][0].update(queue[i][1]);
          }
        }
      } finally {
        this.locked = false;
      }
    };
    this.wrap = (fn) => {
      this.counter += 1;
      fn();
      this.counter -= 1;
      this.flush();
    };
    this.schedule = (observer, stack) => {
      this.waiting.push([observer, stack]);
    };
  }
};
const SchedulerSync = new Scheduler$2();
class Observable {
  /* CONSTRUCTOR */
  constructor(value2, options2, parent) {
    this.observers = /* @__PURE__ */ new Set();
    this.value = value2;
    if (parent) {
      this.parent = parent;
    }
    if ((options2 == null ? void 0 : options2.equals) !== void 0) {
      this.equals = options2.equals || nope;
    }
  }
  /* API */
  get() {
    var _a, _b;
    if (!((_a = this.parent) == null ? void 0 : _a.disposed)) {
      (_b = this.parent) == null ? void 0 : _b.update(this.stack);
      OBSERVER == null ? void 0 : OBSERVER.observables.link(this);
    }
    return this.value;
  }
  set(value2) {
    const equals = this.equals || is;
    const fresh = this.value === UNINITIALIZED || !equals(value2, this.value);
    if (!fresh)
      return value2;
    this.value = value2;
    this.stack = callStack();
    SchedulerSync.counter += 1;
    this.stale(DIRTY_YES, this.stack);
    SchedulerSync.counter -= 1;
    SchedulerSync.flush();
    return value2;
  }
  stale(status, stack) {
    for (const observer of this.observers) {
      if (observer.status !== DIRTY_MAYBE_NO || observer.observables.has(this)) {
        if (observer.sync) {
          observer.status = Math.max(observer.status, status);
          SchedulerSync.schedule(observer, stack);
        } else {
          observer.stale(status, stack);
        }
      }
    }
  }
  update(fn, stack) {
    const value2 = fn(this.value);
    return this.set(value2);
  }
}
class ObservablesArray {
  /* CONSTRUCTOR */
  constructor(observer) {
    this.observer = observer;
    this.observables = [];
    this.observablesIndex = 0;
  }
  /* API */
  dispose(deep) {
    if (deep) {
      const { observer, observables } = this;
      for (let i = 0; i < observables.length; i++) {
        observables[i].observers.delete(observer);
      }
    }
    this.observablesIndex = 0;
  }
  postdispose() {
    const { observer, observables, observablesIndex } = this;
    const observablesLength = observables.length;
    if (observablesIndex < observablesLength) {
      for (let i = observablesIndex; i < observablesLength; i++) {
        observables[i].observers.delete(observer);
      }
      observables.length = observablesIndex;
    }
  }
  empty() {
    return !this.observables.length;
  }
  has(observable2) {
    const index = this.observables.indexOf(observable2);
    return index >= 0 && index < this.observablesIndex;
  }
  link(observable2) {
    const { observer, observables, observablesIndex } = this;
    const observablesLength = observables.length;
    if (observablesLength > 0) {
      if (observables[observablesIndex] === observable2) {
        this.observablesIndex += 1;
        return;
      }
      const index = observables.indexOf(observable2);
      if (index >= 0 && index < observablesIndex) {
        return;
      }
      if (observablesIndex < observablesLength - 1) {
        this.postdispose();
      } else if (observablesIndex === observablesLength - 1) {
        observables[observablesIndex].observers.delete(observer);
      }
    }
    observable2.observers.add(observer);
    observables[this.observablesIndex++] = observable2;
    if (observablesIndex === 128) {
      observer.observables = new ObservablesSet(observer, observables);
    }
  }
  update(stack) {
    var _a;
    const { observables } = this;
    for (let i = 0, l2 = observables.length; i < l2; i++) {
      (_a = observables[i].parent) == null ? void 0 : _a.update(stack);
    }
  }
}
class ObservablesSet {
  /* CONSTRUCTOR */
  constructor(observer, observables) {
    this.observer = observer;
    this.observables = new Set(observables);
  }
  /* API */
  dispose(deep) {
    for (const observable2 of this.observables) {
      observable2.observers.delete(this.observer);
    }
  }
  postdispose() {
    return;
  }
  empty() {
    return !this.observables.size;
  }
  has(observable2) {
    return this.observables.has(observable2);
  }
  link(observable2) {
    const { observer, observables } = this;
    const sizePrev = observables.size;
    observable2.observers.add(observer);
    const sizeNext = observables.size;
    if (sizePrev === sizeNext)
      return;
    observables.add(observable2);
  }
  update(stack) {
    var _a;
    for (const observable2 of this.observables) {
      (_a = observable2.parent) == null ? void 0 : _a.update(stack);
    }
  }
}
class Observer extends Owner {
  /* CONSTRUCTOR */
  constructor() {
    super();
    this.parent = OWNER;
    this.context = OWNER.context;
    this.status = DIRTY_YES;
    this.observables = new ObservablesArray(this);
    if (OWNER !== SUPER_OWNER) {
      lazyArrayPush(this.parent, "observers", this);
    }
  }
  /* API */
  dispose(deep) {
    this.observables.dispose(deep);
    super.dispose(deep);
  }
  refresh(fn, stack) {
    this.dispose(false);
    this.status = DIRTY_MAYBE_NO;
    try {
      return this.wrap(fn, this, this, stack);
    } finally {
      this.observables.postdispose();
    }
  }
  run(stack) {
    throw new Error("Abstract method");
  }
  stale(status, stack) {
    throw new Error("Abstract method");
  }
  update(stack) {
    if (this.disposed)
      return;
    if (this.status === DIRTY_MAYBE_YES) {
      this.observables.update(stack);
    }
    if (this.status === DIRTY_YES) {
      this.status = DIRTY_MAYBE_NO;
      this.run(stack);
      if (this.status === DIRTY_MAYBE_NO) {
        this.status = DIRTY_NO;
      } else {
        this.update(stack);
      }
    } else {
      this.status = DIRTY_NO;
    }
  }
}
class Memo extends Observer {
  /* CONSTRUCTOR */
  constructor(fn, options2) {
    super();
    this.fn = fn;
    this.observable = new Observable(UNINITIALIZED, options2, this);
    const { stack } = options2 ?? { stack: callStack() };
    if ((options2 == null ? void 0 : options2.sync) === true) {
      this.sync = true;
      this.update(stack);
    }
  }
  /* API */
  run(stack) {
    const result = super.refresh(this.fn, stack);
    if (!this.disposed && this.observables.empty()) {
      this.disposed = true;
    }
    if (result !== UNAVAILABLE) {
      this.observable.set(result);
    }
  }
  stale(status, stack) {
    const statusPrev = this.status;
    if (statusPrev >= status)
      return;
    this.status = status;
    if (statusPrev === DIRTY_MAYBE_YES)
      return;
    this.observable.stale(DIRTY_MAYBE_YES, stack);
  }
}
const memo = (fn, options2) => {
  const stack = (options2 == null ? void 0 : options2.stack) ?? callStack();
  if (isObservableFrozen(fn)) {
    return fn;
  } else if (isUntracked$1(fn)) {
    return frozen(fn(stack));
  } else {
    const memo2 = new Memo(fn, options2);
    const observable2 = readable(memo2.observable, stack);
    return observable2;
  }
};
const boolean = (value2) => {
  if (isFunction$1(value2)) {
    if (isObservableFrozen(value2) || isUntracked$1(value2)) {
      return !!value2();
    } else if (isObservableBoolean(value2)) {
      return value2;
    } else {
      const boolean2 = memo(() => !!value2());
      boolean2[SYMBOL_OBSERVABLE_BOOLEAN] = true;
      return boolean2;
    }
  } else {
    return !!value2;
  }
};
const cleanup = (fn) => {
  lazyArrayPush(OWNER, "cleanups", fn);
};
class Context extends Owner {
  /* CONSTRUCTOR */
  constructor(context2) {
    super();
    this.parent = OWNER;
    this.context = { ...OWNER.context, ...context2 };
    lazyArrayPush(this.parent, "contexts", this);
  }
  /* API */
  wrap(fn, owner, observer, stack) {
    return super.wrap(fn, this, void 0, stack);
  }
}
function context(symbolOrContext, fn) {
  if (isSymbol(symbolOrContext)) {
    return OWNER.context[symbolOrContext];
  } else {
    const stack = callStack();
    return new Context(symbolOrContext).wrap(fn || noop, void 0, void 0, stack);
  }
}
class Scheduler2 {
  constructor() {
    this.waiting = [];
    this.locked = false;
    this.queued = false;
    this.flush = (stack) => {
      if (this.locked)
        return;
      if (!this.waiting.length)
        return;
      try {
        this.locked = true;
        while (true) {
          const queue = this.waiting;
          if (!queue.length)
            break;
          this.waiting = [];
          for (let i = 0, l2 = queue.length; i < l2; i++) {
            queue[i][0].update(queue[i][1]);
          }
        }
      } finally {
        this.locked = false;
      }
    };
    this.queue = (stack) => {
      if (this.queued)
        return;
      this.queued = true;
      this.resolve(stack);
    };
    this.resolve = (stack) => {
      queueMicrotask(() => {
        queueMicrotask(() => {
          {
            this.queued = false;
            this.flush(stack);
          }
        });
      });
    };
    this.schedule = (effect25, stack) => {
      this.waiting.push([effect25, stack]);
      this.queue(stack);
    };
  }
}
const Scheduler$1 = new Scheduler2();
class Effect extends Observer {
  /* CONSTRUCTOR */
  constructor(fn, options2) {
    super();
    this.fn = fn;
    if ((options2 == null ? void 0 : options2.suspense) !== false) {
      const suspense = this.get(SYMBOL_SUSPENSE);
      if (suspense) {
        this.suspense = suspense;
      }
    }
    if ((options2 == null ? void 0 : options2.sync) === true) {
      this.sync = true;
    }
    const { stack } = options2 ?? { stack: callStack() };
    if ((options2 == null ? void 0 : options2.sync) === "init") {
      this.init = true;
      this.update(stack);
    } else {
      this.schedule(stack);
    }
  }
  /* API */
  run(stack) {
    const result = super.refresh(this.fn, stack);
    if (isFunction$1(result)) {
      lazyArrayPush(this, "cleanups", result);
    }
  }
  schedule(stack) {
    var _a;
    if ((_a = this.suspense) == null ? void 0 : _a.suspended)
      return;
    if (this.sync) {
      this.update(stack);
    } else {
      Scheduler$1.schedule(this, stack);
    }
  }
  stale(status, stack) {
    const statusPrev = this.status;
    if (statusPrev >= status)
      return;
    this.status = status;
    if (!this.sync || statusPrev !== 2 && statusPrev !== 3) {
      this.schedule(stack);
    }
  }
  update(stack) {
    var _a;
    if ((_a = this.suspense) == null ? void 0 : _a.suspended)
      return;
    super.update(stack);
  }
}
const effect = (fn, options2) => {
  const effect25 = new Effect(fn, options2);
  const dispose = (stack) => effect25.dispose(true);
  return dispose;
};
function resolve(value2) {
  if (isFunction$1(value2)) {
    if (SYMBOL_UNTRACKED_UNWRAPPED in value2) {
      return resolve(value2());
    } else if (SYMBOL_UNTRACKED in value2) {
      return frozen(resolve(value2()));
    } else if (SYMBOL_OBSERVABLE in value2) {
      return value2;
    } else {
      return memo(() => resolve(value2()));
    }
  }
  if (value2 instanceof Array) {
    const resolved = new Array(value2.length);
    for (let i = 0, l2 = resolved.length; i < l2; i++) {
      resolved[i] = resolve(value2[i]);
    }
    return resolved;
  } else {
    return value2;
  }
}
class Root extends Owner {
  /* CONSTRUCTOR */
  constructor(register) {
    super();
    this.parent = OWNER;
    this.context = OWNER.context;
    if (register) {
      const suspense = this.get(SYMBOL_SUSPENSE);
      if (suspense) {
        this.registered = true;
        lazySetAdd(this.parent, "roots", this);
      }
    }
  }
  /* API */
  dispose(deep) {
    if (this.registered) {
      lazySetDelete(this.parent, "roots", this);
    }
    super.dispose(deep);
  }
  wrap(fn, owner, observer, stack) {
    const dispose = () => this.dispose(true);
    const fnWithDispose = () => fn(stack, dispose);
    return super.wrap(fnWithDispose, this, void 0, stack);
  }
}
const isObservable = (value2) => {
  return isFunction$1(value2) && SYMBOL_OBSERVABLE in value2;
};
function get(value2, getFunction = true) {
  const is2 = getFunction ? isFunction$1 : isObservable;
  if (is2(value2)) {
    return value2();
  } else {
    return value2;
  }
}
const isStore = (value2) => {
  return isObject$1(value2) && SYMBOL_STORE in value2;
};
function untrack(fn) {
  if (isFunction$1(fn)) {
    const observerPrev = OBSERVER;
    if (observerPrev) {
      try {
        setObserver(void 0);
        return fn();
      } finally {
        setObserver(observerPrev);
      }
    } else {
      return fn();
    }
  } else {
    return fn;
  }
}
const isBatching = () => {
  return Scheduler$1.queued || Scheduler$1.locked || SchedulerSync.locked;
};
function observable(value2, options2) {
  const stack = callStack();
  return writable(new Observable(value2, options2), stack);
}
const root = (fn) => {
  const stack = callStack();
  return new Root(true).wrap(fn, void 0, void 0, stack);
};
class StoreMap extends Map {
  insert(key, value2) {
    super.set(key, value2);
    return value2;
  }
}
class StoreCleanable {
  constructor() {
    this.count = 0;
  }
  listen() {
    this.count += 1;
    cleanup(this);
  }
  call() {
    this.count -= 1;
    if (this.count)
      return;
    this.dispose();
  }
  dispose() {
  }
}
class StoreKeys extends StoreCleanable {
  constructor(parent, observable2) {
    super();
    this.parent = parent;
    this.observable = observable2;
  }
  dispose() {
    this.parent.keys = void 0;
  }
}
class StoreValues extends StoreCleanable {
  constructor(parent, observable2) {
    super();
    this.parent = parent;
    this.observable = observable2;
  }
  dispose() {
    this.parent.values = void 0;
  }
}
class StoreHas extends StoreCleanable {
  constructor(parent, key, observable2) {
    super();
    this.parent = parent;
    this.key = key;
    this.observable = observable2;
  }
  dispose() {
    var _a;
    (_a = this.parent.has) == null ? void 0 : _a.delete(this.key);
  }
}
class StoreProperty extends StoreCleanable {
  constructor(parent, key, observable2, node) {
    super();
    this.parent = parent;
    this.key = key;
    this.observable = observable2;
    this.node = node;
  }
  dispose() {
    var _a;
    (_a = this.parent.properties) == null ? void 0 : _a.delete(this.key);
  }
}
const StoreListenersRegular = {
  /* VARIABLES */
  active: 0,
  listeners: /* @__PURE__ */ new Set(),
  nodes: /* @__PURE__ */ new Set(),
  /* API */
  prepare: (stack) => {
    const { listeners, nodes } = StoreListenersRegular;
    const traversed = /* @__PURE__ */ new Set();
    const traverse = (node) => {
      if (traversed.has(node))
        return;
      traversed.add(node);
      lazySetEach(node.parents, traverse);
      lazySetEach(node.listenersRegular, (listener) => {
        listeners.add(listener);
      });
    };
    nodes.forEach(traverse);
    return () => {
      listeners.forEach((listener) => {
        listener(stack);
      });
    };
  },
  register: (node, stack) => {
    StoreListenersRegular.nodes.add(node);
    StoreScheduler.schedule(stack);
  },
  reset: () => {
    StoreListenersRegular.listeners = /* @__PURE__ */ new Set();
    StoreListenersRegular.nodes = /* @__PURE__ */ new Set();
  }
};
const StoreListenersRoots = {
  /* VARIABLES */
  active: 0,
  nodes: /* @__PURE__ */ new Map(),
  /* API */
  prepare: () => {
    const { nodes } = StoreListenersRoots;
    return () => {
      nodes.forEach((rootsSet, store2) => {
        const roots = Array.from(rootsSet);
        lazySetEach(store2.listenersRoots, (listener) => {
          listener(roots);
        });
      });
    };
  },
  register: (store2, root2, stack) => {
    const roots = StoreListenersRoots.nodes.get(store2) || /* @__PURE__ */ new Set();
    roots.add(root2);
    StoreListenersRoots.nodes.set(store2, roots);
    StoreScheduler.schedule(stack);
  },
  registerWith: (current, parent, key, stack) => {
    if (!parent.parents) {
      const root2 = (current == null ? void 0 : current.store) || untrack(() => parent.store[key]);
      StoreListenersRoots.register(parent, root2, stack);
    } else {
      const traversed = /* @__PURE__ */ new Set();
      const traverse = (node) => {
        if (traversed.has(node))
          return;
        traversed.add(node);
        lazySetEach(node.parents, (parent2) => {
          if (!parent2.parents) {
            StoreListenersRoots.register(parent2, node.store, stack);
          }
          traverse(parent2);
        });
      };
      traverse(current || parent);
    }
  },
  reset: () => {
    StoreListenersRoots.nodes = /* @__PURE__ */ new Map();
  }
};
const StoreScheduler = {
  /* VARIABLES */
  active: false,
  /* API */
  flush: (stack) => {
    const flushRegular = StoreListenersRegular.prepare(stack);
    const flushRoots = StoreListenersRoots.prepare();
    StoreScheduler.reset();
    flushRegular(stack);
    flushRoots(stack);
  },
  flushIfNotBatching: (stack) => {
    if (isBatching()) {
      {
        setTimeout(StoreScheduler.flushIfNotBatching, 0);
      }
    } else {
      StoreScheduler.flush(stack);
    }
  },
  reset: () => {
    StoreScheduler.active = false;
    StoreListenersRegular.reset();
    StoreListenersRoots.reset();
  },
  schedule: (stack) => {
    if (StoreScheduler.active)
      return;
    StoreScheduler.active = true;
    queueMicrotask(() => StoreScheduler.flushIfNotBatching(stack));
  }
};
const NODES = /* @__PURE__ */ new WeakMap();
const SPECIAL_SYMBOLS = /* @__PURE__ */ new Set([SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES]);
const UNREACTIVE_KEYS = /* @__PURE__ */ new Set(["__proto__", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "prototype", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toSource", "toString", "valueOf"]);
const STORE_TRAPS = {
  /* API */
  get: (target, key) => {
    var _a, _b;
    const stack = callStack();
    if (SPECIAL_SYMBOLS.has(key)) {
      if (key === SYMBOL_STORE)
        return true;
      if (key === SYMBOL_STORE_TARGET)
        return target;
      if (key === SYMBOL_STORE_KEYS) {
        if (isListenable()) {
          const node2 = getNodeExisting(target);
          node2.keys || (node2.keys = getNodeKeys(node2));
          node2.keys.listen();
          node2.keys.observable.get();
        }
        return;
      }
      if (key === SYMBOL_STORE_VALUES) {
        if (isListenable()) {
          const node2 = getNodeExisting(target);
          node2.values || (node2.values = getNodeValues(node2));
          node2.values.listen();
          node2.values.observable.get();
        }
        return;
      }
      if (key === SYMBOL_STORE_OBSERVABLE) {
        return (key2) => {
          var _a2;
          key2 = typeof key2 === "number" ? String(key2) : key2;
          const node2 = getNodeExisting(target);
          const getter2 = (_a2 = node2.getters) == null ? void 0 : _a2.get(key2);
          if (getter2)
            return getter2.bind(node2.store);
          node2.properties || (node2.properties = new StoreMap());
          const value3 = target[key2];
          const property2 = node2.properties.get(key2) || node2.properties.insert(key2, getNodeProperty(node2, key2, value3));
          const options2 = node2.equals ? { equals: node2.equals } : void 0;
          property2.observable || (property2.observable = getNodeObservable(node2, value3, options2));
          const observable2 = readable(property2.observable, stack);
          return observable2;
        };
      }
    }
    if (UNREACTIVE_KEYS.has(key))
      return target[key];
    const node = getNodeExisting(target);
    const getter = (_a = node.getters) == null ? void 0 : _a.get(key);
    const value2 = getter || target[key];
    node.properties || (node.properties = new StoreMap());
    const listenable = isListenable();
    const proxiable = isProxiable(value2);
    const property = listenable || proxiable ? node.properties.get(key) || node.properties.insert(key, getNodeProperty(node, key, value2)) : void 0;
    if (property == null ? void 0 : property.node) {
      lazySetAdd(property.node, "parents", node);
    }
    if (property && listenable) {
      const options2 = node.equals ? { equals: node.equals } : void 0;
      property.listen();
      property.observable || (property.observable = getNodeObservable(node, value2, options2));
      property.observable.get();
    }
    if (getter) {
      return getter.call(node.store);
    } else {
      if (typeof value2 === "function" && value2 === Array.prototype[key]) {
        return function() {
          return value2.apply(node.store, arguments);
        };
      }
      return ((_b = property == null ? void 0 : property.node) == null ? void 0 : _b.store) || value2;
    }
  },
  set: (target, key, value2, stack) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    value2 = getTarget(value2);
    const node = getNodeExisting(target);
    const setter = (_a = node.setters) == null ? void 0 : _a.get(key);
    if (setter) {
      setter.call(node.store, value2);
    } else {
      const targetIsArray = isArray$1(target);
      const valuePrev = target[key];
      const hadProperty = !!valuePrev || key in target;
      const equals = node.equals || is;
      if (hadProperty && equals(value2, valuePrev) && (key !== "length" || !targetIsArray))
        return true;
      const lengthPrev = targetIsArray && target["length"];
      target[key] = value2;
      const lengthNext = targetIsArray && target["length"];
      if (targetIsArray && key !== "length" && lengthPrev !== lengthNext) {
        (_d = (_c = (_b = node.properties) == null ? void 0 : _b.get("length")) == null ? void 0 : _c.observable) == null ? void 0 : _d.set(lengthNext);
      }
      (_e = node.values) == null ? void 0 : _e.observable.set(0);
      if (!hadProperty) {
        (_f = node.keys) == null ? void 0 : _f.observable.set(0);
        (_h = (_g = node.has) == null ? void 0 : _g.get(key)) == null ? void 0 : _h.observable.set(true);
      }
      const property = (_i = node.properties) == null ? void 0 : _i.get(key);
      if (property == null ? void 0 : property.node) {
        lazySetDelete(property.node, "parents", node);
      }
      if (property) {
        (_j = property.observable) == null ? void 0 : _j.set(value2);
        property.node = isProxiable(value2) ? NODES.get(value2) || getNode(value2, key, node) : void 0;
      }
      if (property == null ? void 0 : property.node) {
        lazySetAdd(property.node, "parents", node);
      }
      if (StoreListenersRoots.active) {
        StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key, stack);
      }
      if (StoreListenersRegular.active) {
        StoreListenersRegular.register(node, stack);
      }
      if (targetIsArray && key === "length") {
        const lengthPrev2 = Number(valuePrev);
        const lengthNext2 = Number(value2);
        for (let i = lengthNext2; i < lengthPrev2; i++) {
          if (i in target)
            continue;
          STORE_TRAPS.deleteProperty(target, `${i}`, true);
        }
      }
    }
    return true;
  },
  deleteProperty: (target, key, _force) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const hasProperty = key in target;
    if (!_force && !hasProperty)
      return true;
    const deleted = Reflect.deleteProperty(target, key);
    if (!deleted)
      return false;
    const node = getNodeExisting(target);
    const stack = callStack();
    (_a = node.getters) == null ? void 0 : _a.delete(key);
    (_b = node.setters) == null ? void 0 : _b.delete(key);
    (_c = node.keys) == null ? void 0 : _c.observable.set(0);
    (_d = node.values) == null ? void 0 : _d.observable.set(0);
    (_f = (_e = node.has) == null ? void 0 : _e.get(key)) == null ? void 0 : _f.observable.set(false);
    const property = (_g = node.properties) == null ? void 0 : _g.get(key);
    if (StoreListenersRoots.active) {
      StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key, stack);
    }
    if (property == null ? void 0 : property.node) {
      lazySetDelete(property.node, "parents", node);
    }
    if (property) {
      (_h = property.observable) == null ? void 0 : _h.set(void 0);
      property.node = void 0;
    }
    if (StoreListenersRegular.active) {
      StoreListenersRegular.register(node, stack);
    }
    return true;
  },
  defineProperty: (target, key, descriptor) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const node = getNodeExisting(target);
    const equals = node.equals || is;
    const hadProperty = key in target;
    const descriptorPrev = Reflect.getOwnPropertyDescriptor(target, key);
    const stack = callStack();
    if ("value" in descriptor && isStore(descriptor.value)) {
      descriptor = { ...descriptor, value: getTarget(descriptor.value) };
    }
    if (descriptorPrev && isEqualDescriptor(descriptorPrev, descriptor, equals))
      return true;
    const defined = Reflect.defineProperty(target, key, descriptor);
    if (!defined)
      return false;
    if (!descriptor.get) {
      (_a = node.getters) == null ? void 0 : _a.delete(key);
    } else if (descriptor.get) {
      node.getters || (node.getters = new StoreMap());
      node.getters.set(key, descriptor.get);
    }
    if (!descriptor.set) {
      (_b = node.setters) == null ? void 0 : _b.delete(key);
    } else if (descriptor.set) {
      node.setters || (node.setters = new StoreMap());
      node.setters.set(key, descriptor.set);
    }
    if (hadProperty !== !!descriptor.enumerable) {
      (_c = node.keys) == null ? void 0 : _c.observable.set(0);
    }
    (_e = (_d = node.has) == null ? void 0 : _d.get(key)) == null ? void 0 : _e.observable.set(true);
    const property = (_f = node.properties) == null ? void 0 : _f.get(key);
    if (StoreListenersRoots.active) {
      StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key, stack);
    }
    if (property == null ? void 0 : property.node) {
      lazySetDelete(property.node, "parents", node);
    }
    if (property) {
      if ("get" in descriptor) {
        (_g = property.observable) == null ? void 0 : _g.set(descriptor.get);
        property.node = void 0;
      } else {
        const value2 = descriptor.value;
        (_h = property.observable) == null ? void 0 : _h.set(value2);
        property.node = isProxiable(value2) ? NODES.get(value2) || getNode(value2, key, node) : void 0;
      }
    }
    if (property == null ? void 0 : property.node) {
      lazySetAdd(property.node, "parents", node);
    }
    if (StoreListenersRoots.active) {
      StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key, stack);
    }
    if (StoreListenersRegular.active) {
      StoreListenersRegular.register(node, stack);
    }
    return true;
  },
  has: (target, key) => {
    if (key === SYMBOL_STORE)
      return true;
    if (key === SYMBOL_STORE_TARGET)
      return true;
    const value2 = key in target;
    if (isListenable()) {
      const node = getNodeExisting(target);
      node.has || (node.has = new StoreMap());
      const has = node.has.get(key) || node.has.insert(key, getNodeHas(node, key, value2));
      has.listen();
      has.observable.get();
    }
    return value2;
  },
  ownKeys: (target) => {
    const keys = Reflect.ownKeys(target);
    if (isListenable()) {
      const node = getNodeExisting(target);
      node.keys || (node.keys = getNodeKeys(node));
      node.keys.listen();
      node.keys.observable.get();
    }
    return keys;
  }
};
const STORE_UNTRACK_TRAPS = {
  /* API */
  has: (target, key) => {
    if (key === SYMBOL_STORE_UNTRACKED)
      return true;
    return key in target;
  }
};
const getNode = (value2, key, parent, equals) => {
  if (isStore(value2))
    return getNodeExisting(getTarget(value2));
  const store2 = isFrozenLike(value2, key, parent) ? value2 : new Proxy(value2, STORE_TRAPS);
  const gettersAndSetters = getGettersAndSetters(value2);
  const node = { parents: parent, store: store2 };
  if (gettersAndSetters) {
    const { getters, setters } = gettersAndSetters;
    if (getters)
      node.getters = getters;
    if (setters)
      node.setters = setters;
  }
  if (equals === false) {
    node.equals = nope;
  } else if (equals) {
    node.equals = equals;
  } else if (parent == null ? void 0 : parent.equals) {
    node.equals = parent.equals;
  }
  NODES.set(value2, node);
  return node;
};
const getNodeExisting = (value2) => {
  const node = NODES.get(value2);
  if (!node)
    throw new Error("Impossible");
  return node;
};
const getNodeFromStore = (store2) => {
  return getNodeExisting(getTarget(store2));
};
const getNodeKeys = (node) => {
  const observable2 = getNodeObservable(node, 0, { equals: false });
  const keys = new StoreKeys(node, observable2);
  return keys;
};
const getNodeValues = (node) => {
  const observable2 = getNodeObservable(node, 0, { equals: false });
  const values = new StoreValues(node, observable2);
  return values;
};
const getNodeHas = (node, key, value2) => {
  const observable2 = getNodeObservable(node, value2);
  const has = new StoreHas(node, key, observable2);
  return has;
};
const getNodeObservable = (node, value2, options2) => {
  return new Observable(value2, options2);
};
const getNodeProperty = (node, key, value2) => {
  const observable2 = void 0;
  const propertyNode = isProxiable(value2) ? NODES.get(value2) || getNode(value2, key, node) : void 0;
  const property = new StoreProperty(node, key, observable2, propertyNode);
  node.properties || (node.properties = new StoreMap());
  node.properties.set(key, property);
  return property;
};
const getGettersAndSetters = (value2) => {
  if (isArray$1(value2))
    return;
  let getters;
  let setters;
  const keys = Object.keys(value2);
  for (let i = 0, l2 = keys.length; i < l2; i++) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(value2, key);
    if (!descriptor)
      continue;
    const { get: get2, set } = descriptor;
    if (get2) {
      getters || (getters = new StoreMap());
      getters.set(key, get2);
    }
    if (set) {
      setters || (setters = new StoreMap());
      setters.set(key, set);
    }
    if (get2 && !set) {
      setters || (setters = new StoreMap());
      setters.set(key, throwNoSetterError);
    }
  }
  if (!getters && !setters)
    return;
  return { getters, setters };
};
const getStore = (value2, options2) => {
  if (isStore(value2))
    return value2;
  const node = NODES.get(value2) || getNode(value2, void 0, void 0, options2 == null ? void 0 : options2.equals);
  return node.store;
};
const getTarget = (value2) => {
  if (isStore(value2))
    return value2[SYMBOL_STORE_TARGET];
  return value2;
};
const getUntracked = (value2) => {
  if (!isObject$1(value2))
    return value2;
  if (isUntracked(value2))
    return value2;
  return new Proxy(value2, STORE_UNTRACK_TRAPS);
};
const isEqualDescriptor = (a, b, equals) => {
  return !!a.configurable === !!b.configurable && !!a.enumerable === !!b.enumerable && !!a.writable === !!b.writable && equals(a.value, b.value) && a.get === b.get && a.set === b.set;
};
const isFrozenLike = (value2, key, parent) => {
  if (Object.isFrozen(value2))
    return true;
  if (!parent || key === void 0)
    return false;
  const target = store.unwrap(parent.store);
  const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
  if ((descriptor == null ? void 0 : descriptor.configurable) || (descriptor == null ? void 0 : descriptor.writable))
    return false;
  return true;
};
const isListenable = () => {
  return !!OBSERVER;
};
const isProxiable = (value2) => {
  if (value2 === null || typeof value2 !== "object")
    return false;
  if (SYMBOL_STORE in value2)
    return true;
  if (SYMBOL_STORE_UNTRACKED in value2)
    return false;
  if (isArray$1(value2))
    return true;
  const prototype = Object.getPrototypeOf(value2);
  if (prototype === null)
    return true;
  return Object.getPrototypeOf(prototype) === null;
};
const isUntracked = (value2) => {
  if (value2 === null || typeof value2 !== "object")
    return false;
  return SYMBOL_STORE_UNTRACKED in value2;
};
const throwNoSetterError = () => {
  throw new TypeError("Cannot set property value of #<Object> which has only a getter");
};
const store = (value2, options2) => {
  if (!isObject$1(value2))
    return value2;
  if (isUntracked(value2))
    return value2;
  return getStore(value2, options2);
};
store.on = (target, listener) => {
  const targets = isStore(target) ? [target] : castArray$1(target);
  const selectors = targets.filter(isFunction$1);
  const nodes = targets.filter(isStore).map(getNodeFromStore);
  StoreListenersRegular.active += 1;
  const stack = callStack();
  const disposers = selectors.map((selector) => {
    let inited = false;
    return effect((stack2) => {
      if (inited) {
        StoreListenersRegular.listeners.add(listener);
        StoreScheduler.schedule(stack2);
      }
      inited = true;
      selector();
    }, { suspense: false, sync: true, stack });
  });
  nodes.forEach((node) => {
    lazySetAdd(node, "listenersRegular", listener);
  });
  return (stack2) => {
    StoreListenersRegular.active -= 1;
    disposers.forEach((disposer) => {
      disposer(stack2);
    });
    nodes.forEach((node) => {
      lazySetDelete(node, "listenersRegular", listener);
    });
  };
};
store._onRoots = (target, listener) => {
  if (!isStore(target))
    return noop;
  const node = getNodeFromStore(target);
  if (node.parents)
    throw new Error("Only top-level stores are supported");
  StoreListenersRoots.active += 1;
  lazySetAdd(node, "listenersRoots", listener);
  return () => {
    StoreListenersRoots.active -= 1;
    lazySetDelete(node, "listenersRoots", listener);
  };
};
store.reconcile = /* @__PURE__ */ (() => {
  const getType = (value2) => {
    if (isArray$1(value2))
      return 1;
    if (isProxiable(value2))
      return 2;
    return 0;
  };
  const reconcileOuter = (prev, next) => {
    const uprev = getTarget(prev);
    const unext = getTarget(next);
    reconcileInner(prev, next);
    const prevType = getType(uprev);
    const nextType = getType(unext);
    if (prevType === 1 || nextType === 1) {
      prev.length = next.length;
    }
    return prev;
  };
  const reconcileInner = (prev, next) => {
    const uprev = getTarget(prev);
    const unext = getTarget(next);
    const prevKeys = Object.keys(uprev);
    const nextKeys = Object.keys(unext);
    for (let i = 0, l2 = nextKeys.length; i < l2; i++) {
      const key = nextKeys[i];
      const prevValue = uprev[key];
      const nextValue = unext[key];
      if (!is(prevValue, nextValue)) {
        const prevType = getType(prevValue);
        const nextType = getType(nextValue);
        if (prevType && prevType === nextType) {
          reconcileInner(prev[key], nextValue);
          if (prevType === 1) {
            prev[key].length = nextValue.length;
          }
        } else {
          prev[key] = nextValue;
        }
      } else if (prevValue === void 0 && !(key in uprev)) {
        prev[key] = void 0;
      }
    }
    for (let i = 0, l2 = prevKeys.length; i < l2; i++) {
      const key = prevKeys[i];
      if (!(key in unext)) {
        delete prev[key];
      }
    }
    return prev;
  };
  const reconcile = (prev, next) => {
    return untrack(() => {
      return reconcileOuter(prev, next);
    });
  };
  return reconcile;
})();
store.untrack = (value2) => {
  return getUntracked(value2);
};
store.unwrap = (value2) => {
  return getTarget(value2);
};
const suspended = (stack) => {
  const suspense = OWNER.get(SYMBOL_SUSPENSE);
  if (!suspense)
    return OBSERVABLE_FALSE;
  const observable2 = suspense.observable || (suspense.observable = new Observable(!!suspense.suspended));
  return readable(observable2, stack);
};
const _with = () => {
  const owner = OWNER;
  const observer = OBSERVER;
  return (fn, stack) => {
    return owner.wrap(() => fn(stack), owner, observer, stack);
  };
};
const CONTEXTS_DATA = /* @__PURE__ */ new WeakMap();
const DIRECTIVES = {};
const SYMBOL_TEMPLATE_ACCESSOR = Symbol("Template.Accessor");
const SYMBOLS_DIRECTIVES = {};
const SYMBOL_CLONE = Symbol("CloneElement");
const wrapElement = (element) => {
  element[SYMBOL_UNTRACKED_UNWRAPPED] = true;
  return element;
};
const { createComment, createHTMLNode, createSVGNode, createText, createDocumentFragment } = (() => {
  if (typeof via !== "undefined") {
    const document2 = via.document;
    const createComment2 = document2.createComment;
    const createHTMLNode2 = document2.createElement;
    const createSVGNode2 = (name) => document2.createElementNS("http://www.w3.org/2000/svg", name);
    const createText2 = document2.createTextNode;
    const createDocumentFragment2 = document2.createDocumentFragment;
    return { createComment: createComment2, createHTMLNode: createHTMLNode2, createSVGNode: createSVGNode2, createText: createText2, createDocumentFragment: createDocumentFragment2 };
  } else {
    const createComment2 = document.createComment.bind(document, "");
    const createHTMLNode2 = document.createElement.bind(document);
    const createSVGNode2 = document.createElementNS.bind(document, "http://www.w3.org/2000/svg");
    const createText2 = document.createTextNode.bind(document);
    const createDocumentFragment2 = document.createDocumentFragment.bind(document);
    return { createComment: createComment2, createHTMLNode: createHTMLNode2, createSVGNode: createSVGNode2, createText: createText2, createDocumentFragment: createDocumentFragment2 };
  }
})();
const { assign } = Object;
const castArray = (value2) => {
  return isArray(value2) ? value2 : [value2];
};
const flatten = (arr) => {
  for (let i = 0, l2 = arr.length; i < l2; i++) {
    if (!isArray(arr[i])) continue;
    return arr.flat(Infinity);
  }
  return arr;
};
const { isArray } = Array;
const isBoolean = (value2) => {
  return typeof value2 === "boolean";
};
const isFunction = (value2) => {
  return typeof value2 === "function";
};
const isFunctionReactive = (value2) => {
  var _a, _b;
  return !(SYMBOL_UNTRACKED in value2 || SYMBOL_UNTRACKED_UNWRAPPED in value2 || SYMBOL_OBSERVABLE_FROZEN in value2 || ((_b = (_a = value2[SYMBOL_OBSERVABLE_READABLE]) == null ? void 0 : _a.parent) == null ? void 0 : _b.disposed));
};
const isNil = (value2) => {
  return value2 === null || value2 === void 0;
};
const isNode = (value2) => {
  return value2 instanceof Node;
};
const isObject = (value2) => {
  return typeof value2 === "object" && value2 !== null;
};
const isString = (value2) => {
  return typeof value2 === "string";
};
const isSVG = (value2) => {
  return !!value2["isSVG"];
};
const isSVGElement = /* @__PURE__ */ (() => {
  const svgRe = /^(t(ext$|s)|s[vwy]|g)|^set|tad|ker|p(at|s)|s(to|c$|ca|k)|r(ec|cl)|ew|us|f($|e|s)|cu|n[ei]|l[ty]|[GOP]/;
  const svgCache = {};
  return (element) => {
    const cached = svgCache[element];
    return cached !== void 0 ? cached : svgCache[element] = !element.includes("-") && svgRe.test(element);
  };
})();
const isTemplateAccessor = (value2) => {
  return isFunction(value2) && SYMBOL_TEMPLATE_ACCESSOR in value2;
};
const isVoidChild = (value2) => {
  return value2 === null || value2 === void 0 || typeof value2 === "boolean" || typeof value2 === "symbol";
};
const useScheduler = ({ loop, once, callback, cancel, schedule, stack }) => {
  let executed = false;
  let suspended$1 = suspended(stack);
  let tickId;
  const work = (value2) => {
    executed = true;
    if (get(loop)) tick();
    get(callback, false)(value2);
  };
  const tick = () => {
    tickId = untrack(() => schedule(work));
  };
  const dispose = () => {
    untrack(() => cancel(tickId));
  };
  effect(() => {
    if (once && executed) return;
    if (suspended$1()) return;
    tick();
    return dispose;
  }, { suspense: false, stack });
  return dispose;
};
function useContext(Context2) {
  const { symbol, defaultValue } = CONTEXTS_DATA.get(Context2) || { symbol: Symbol() };
  const valueContext = context(symbol);
  const value2 = isNil(valueContext) ? defaultValue : valueContext;
  return value2;
}
const options$1 = {
  sync: "init",
  stack: void 0
};
const useRenderEffect = (fn, stack) => {
  return effect(fn, { ...options$1, stack });
};
const useInterval = (callback, ms) => {
  const stack = new Error();
  return useScheduler({
    callback,
    cancel: clearInterval,
    schedule: (callback2) => setInterval(callback2, get(ms)),
    stack
  });
};
const useTimeout = (callback, ms) => {
  const stack = new Error();
  return useScheduler({
    callback,
    once: true,
    cancel: clearTimeout,
    schedule: (callback2) => setTimeout(callback2, get(ms)),
    stack
  });
};
const useCheapDisposed = () => {
  let disposed = false;
  const get2 = () => disposed;
  const set = () => disposed = true;
  cleanup(set);
  return get2;
};
const useMicrotask = (fn, stack) => {
  const disposed = useCheapDisposed();
  const runWithOwner = _with();
  queueMicrotask(() => {
    if (disposed()) return;
    runWithOwner(fn, stack);
  });
};
const classesToggle = (element, classes, force) => {
  const { className } = element;
  if (isString(className)) {
    if (!className) {
      if (force) {
        element.className = classes;
        return;
      } else {
        return;
      }
    } else if (!force && className === classes) {
      element.className = "";
      return;
    }
  }
  if (classes.includes(" ")) {
    classes.split(" ").forEach((cls) => {
      if (!cls.length) return;
      element.classList.toggle(cls, !!force);
    });
  } else {
    element.classList.toggle(classes, !!force);
  }
};
const dummyNode = createComment("");
const beforeDummyWrapper = [dummyNode];
const afterDummyWrapper = [dummyNode];
const diff = (parent, before, after, nextSibling) => {
  if (before === after) return;
  if (before instanceof Node) {
    if (after instanceof Node) {
      if (before.parentNode === parent) {
        parent.replaceChild(after, before);
        return;
      }
    }
    beforeDummyWrapper[0] = before;
    before = beforeDummyWrapper;
  }
  if (after instanceof Node) {
    afterDummyWrapper[0] = after;
    after = afterDummyWrapper;
  }
  const bLength = after.length;
  let aEnd = before.length;
  let bEnd = bLength;
  let aStart = 0;
  let bStart = 0;
  let map = null;
  let removable;
  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? after[bStart - 1].nextSibling : after[bEnd - bStart] : nextSibling;
      if (bStart < bEnd) {
        if (node) {
          node.before.apply(node, after.slice(bStart, bEnd));
        } else {
          parent.append.apply(parent, after.slice(bStart, bEnd));
        }
        bStart = bEnd;
      }
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(before[aStart])) {
          removable = before[aStart];
          if (removable.parentNode === parent) {
            parent.removeChild(removable);
          }
        }
        aStart++;
      }
    } else if (before[aStart] === after[bStart]) {
      aStart++;
      bStart++;
    } else if (before[aEnd - 1] === after[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (before[aStart] === after[bEnd - 1] && after[bStart] === before[aEnd - 1]) {
      const node = before[--aEnd].nextSibling;
      parent.insertBefore(
        after[bStart++],
        before[aStart++].nextSibling
      );
      parent.insertBefore(after[--bEnd], node);
      before[aEnd] = after[bEnd];
    } else {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        let i = bStart;
        while (i < bEnd)
          map.set(after[i], i++);
      }
      if (map.has(before[aStart])) {
        const index = map.get(before[aStart]);
        if (bStart < index && index < bEnd) {
          let i = aStart;
          let sequence = 1;
          while (++i < aEnd && i < bEnd && map.get(before[i]) === index + sequence)
            sequence++;
          if (sequence > index - bStart) {
            const node = before[aStart];
            if (bStart < index) {
              if (node) {
                node.before.apply(node, after.slice(bStart, index));
              } else {
                parent.append.apply(parent, after.slice(bStart, index));
              }
              bStart = index;
            }
          } else {
            parent.replaceChild(
              after[bStart++],
              before[aStart++]
            );
          }
        } else
          aStart++;
      } else {
        removable = before[aStart++];
        if (removable.parentNode === parent) {
          parent.removeChild(removable);
        }
      }
    }
  }
  beforeDummyWrapper[0] = dummyNode;
  afterDummyWrapper[0] = dummyNode;
};
const NOOP_CHILDREN = [];
const FragmentUtils = {
  make: () => {
    return {
      values: void 0,
      length: 0
    };
  },
  makeWithNode: (node) => {
    return {
      values: node,
      length: 1
    };
  },
  makeWithFragment: (fragment) => {
    return {
      values: fragment,
      fragmented: true,
      length: 1
    };
  },
  getChildrenFragmented: (thiz, children = []) => {
    const { values, length } = thiz;
    if (!length) return children;
    if (values instanceof Array) {
      for (let i = 0, l2 = values.length; i < l2; i++) {
        const value2 = values[i];
        if (value2 instanceof Node) {
          children.push(value2);
        } else {
          FragmentUtils.getChildrenFragmented(value2, children);
        }
      }
    } else {
      if (values instanceof Node) {
        children.push(values);
      } else {
        FragmentUtils.getChildrenFragmented(values, children);
      }
    }
    return children;
  },
  getChildren: (thiz) => {
    if (!thiz.length) return NOOP_CHILDREN;
    if (!thiz.fragmented) return thiz.values;
    if (thiz.length === 1) return FragmentUtils.getChildren(thiz.values);
    return FragmentUtils.getChildrenFragmented(thiz);
  },
  pushFragment: (thiz, fragment) => {
    FragmentUtils.pushValue(thiz, fragment);
    thiz.fragmented = true;
  },
  pushNode: (thiz, node) => {
    FragmentUtils.pushValue(thiz, node);
  },
  pushValue: (thiz, value2) => {
    const { values, length } = thiz;
    if (length === 0) {
      thiz.values = value2;
    } else if (length === 1) {
      thiz.values = [values, value2];
    } else {
      values.push(value2);
    }
    thiz.length += 1;
  },
  replaceWithNode: (thiz, node) => {
    thiz.values = node;
    delete thiz.fragmented;
    thiz.length = 1;
  },
  replaceWithFragment: (thiz, fragment) => {
    thiz.values = fragment.values;
    thiz.fragmented = fragment.fragmented;
    thiz.length = fragment.length;
  }
};
const resolveChild = (value2, setter, _dynamic = false, stack) => {
  if (isFunction(value2)) {
    if (!isFunctionReactive(value2)) {
      if (value2[SYMBOL_OBSERVABLE_READABLE] ?? value2[SYMBOL_OBSERVABLE_WRITABLE])
        (value2[SYMBOL_OBSERVABLE_READABLE] ?? value2[SYMBOL_OBSERVABLE_WRITABLE]).stack = stack;
      resolveChild(value2(), setter, _dynamic, stack);
    } else {
      useRenderEffect((stack2) => {
        if (value2[SYMBOL_OBSERVABLE_READABLE] ?? value2[SYMBOL_OBSERVABLE_WRITABLE])
          (value2[SYMBOL_OBSERVABLE_READABLE] ?? value2[SYMBOL_OBSERVABLE_WRITABLE]).stack = stack2;
        resolveChild(value2(), setter, true, stack2);
      }, stack);
    }
  } else if (isArray(value2)) {
    const [values, hasObservables] = resolveArraysAndStatics(value2);
    values[SYMBOL_UNCACHED] = value2[SYMBOL_UNCACHED];
    setter(values, hasObservables || _dynamic, stack);
  } else {
    setter(value2, _dynamic, stack);
  }
};
const resolveClass = (classes, resolved = {}) => {
  if (isString(classes)) {
    classes.split(/\s+/g).filter(Boolean).filter((cls) => {
      resolved[cls] = true;
    });
  } else if (isFunction(classes)) {
    resolveClass(classes(), resolved);
  } else if (isArray(classes)) {
    classes.forEach((cls) => {
      resolveClass(cls, resolved);
    });
  } else if (classes) {
    for (const key in classes) {
      const value2 = classes[key];
      const isActive = !!get(value2);
      if (!isActive) continue;
      resolved[key] = true;
    }
  }
  return resolved;
};
const resolveStyle = (styles, resolved = {}) => {
  if (isString(styles)) {
    return styles;
  } else if (isFunction(styles)) {
    return resolveStyle(styles(), resolved);
  } else if (isArray(styles)) {
    styles.forEach((style) => {
      resolveStyle(style, resolved);
    });
  } else if (styles) {
    for (const key in styles) {
      const value2 = styles[key];
      resolved[key] = get(value2);
    }
  }
  return resolved;
};
const resolveArraysAndStatics = /* @__PURE__ */ (() => {
  const DUMMY_RESOLVED = [];
  const resolveArraysAndStaticsInner = (values, resolved, hasObservables) => {
    for (let i = 0, l2 = values.length; i < l2; i++) {
      const value2 = values[i];
      const type = typeof value2;
      if (type === "string" || type === "number" || type === "bigint") {
        if (resolved === DUMMY_RESOLVED) resolved = values.slice(0, i);
        resolved.push(createText(value2));
      } else if (type === "object" && isArray(value2)) {
        if (resolved === DUMMY_RESOLVED) resolved = values.slice(0, i);
        hasObservables = resolveArraysAndStaticsInner(value2, resolved, hasObservables)[1];
      } else if (type === "function" && isObservable(value2)) {
        if (resolved !== DUMMY_RESOLVED) resolved.push(value2);
        hasObservables = true;
      } else {
        if (resolved !== DUMMY_RESOLVED) resolved.push(value2);
      }
    }
    if (resolved === DUMMY_RESOLVED) resolved = values;
    return [resolved, hasObservables];
  };
  return (values) => {
    return resolveArraysAndStaticsInner(values, DUMMY_RESOLVED, false);
  };
})();
const setAttributeStatic = /* @__PURE__ */ (() => {
  const attributesBoolean = /* @__PURE__ */ new Set(["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"]);
  const attributeCamelCasedRe = /e(r[HRWrv]|[Vawy])|Con|l(e[Tcs]|c)|s(eP|y)|a(t[rt]|u|v)|Of|Ex|f[XYa]|gt|hR|d[Pg]|t[TXYd]|[UZq]/;
  const attributesCache = {};
  const uppercaseRe = /[A-Z]/g;
  const normalizeKeySvg = (key) => {
    return attributesCache[key] || (attributesCache[key] = attributeCamelCasedRe.test(key) ? key : key.replace(uppercaseRe, (char) => `-${char.toLowerCase()}`));
  };
  return (element, key, value2) => {
    if (isSVG(element)) {
      key = key === "xlinkHref" || key === "xlink:href" ? "href" : normalizeKeySvg(key);
      if (isNil(value2) || value2 === false && attributesBoolean.has(key)) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value2));
      }
    } else {
      if (isNil(value2) || value2 === false && attributesBoolean.has(key)) {
        element.removeAttribute(key);
      } else {
        value2 = value2 === true ? "" : String(value2);
        element.setAttribute(key, value2);
      }
    }
  };
})();
const setAttribute = (element, key, value2, stack) => {
  if (isFunction(value2) && isFunctionReactive(value2)) {
    useRenderEffect(() => {
      setAttributeStatic(element, key, value2());
    }, stack);
  } else {
    setAttributeStatic(element, key, get(value2));
  }
};
const setChildReplacementText = (child, childPrev) => {
  if (childPrev.nodeType === 3) {
    childPrev.nodeValue = child;
    return childPrev;
  } else {
    const parent = childPrev.parentElement;
    if (!parent) throw new Error("Invalid child replacement");
    const textNode = createText(child);
    parent.replaceChild(textNode, childPrev);
    return textNode;
  }
};
const setChildStatic = (parent, fragment, fragmentOnly, child, dynamic, stack) => {
  if (!dynamic && isVoidChild(child)) return;
  const prev = FragmentUtils.getChildren(fragment);
  const prevIsArray = prev instanceof Array;
  const prevLength = prevIsArray ? prev.length : 1;
  const prevFirst = prevIsArray ? prev[0] : prev;
  const prevLast = prevIsArray ? prev[prevLength - 1] : prev;
  const prevSibling = (prevLast == null ? void 0 : prevLast.nextSibling) || null;
  if (prevLength === 0) {
    const type = typeof child;
    if (type === "string" || type === "number" || type === "bigint") {
      const textNode = createText(child);
      if (!fragmentOnly) {
        parent.appendChild(textNode);
      }
      FragmentUtils.replaceWithNode(fragment, textNode);
      return;
    } else if (type === "object" && child !== null && typeof child.nodeType === "number") {
      const node = child;
      if (!fragmentOnly) {
        parent.insertBefore(node, null);
      }
      FragmentUtils.replaceWithNode(fragment, node);
      return;
    }
  }
  if (prevLength === 1) {
    const type = typeof child;
    if (type === "string" || type === "number" || type === "bigint") {
      const node = setChildReplacementText(String(child), prevFirst);
      FragmentUtils.replaceWithNode(fragment, node);
      return;
    }
  }
  const fragmentNext = FragmentUtils.make();
  const children = Array.isArray(child) ? child : [child];
  for (let i = 0, l2 = children.length; i < l2; i++) {
    const child2 = children[i];
    const type = typeof child2;
    if (type === "string" || type === "number" || type === "bigint") {
      FragmentUtils.pushNode(fragmentNext, createText(child2));
    } else if (type === "object" && child2 !== null && typeof child2.nodeType === "number") {
      FragmentUtils.pushNode(fragmentNext, child2);
    } else if (type === "function") {
      const fragment2 = FragmentUtils.make();
      let childFragmentOnly = !fragmentOnly;
      FragmentUtils.pushFragment(fragmentNext, fragment2);
      resolveChild(child2, (child3, dynamic2, stack2) => {
        const fragmentOnly2 = childFragmentOnly;
        childFragmentOnly = false;
        setChildStatic(parent, fragment2, fragmentOnly2, child3, dynamic2, stack2);
      }, false, stack);
    }
  }
  let next = FragmentUtils.getChildren(fragmentNext);
  let nextLength = fragmentNext.length;
  if (nextLength === 0 && prevLength === 1 && prevFirst.nodeType === 8) {
    return;
  }
  if (!fragmentOnly && (nextLength === 0 || prevLength === 1 && prevFirst.nodeType === 8 || children[SYMBOL_UNCACHED])) {
    const { childNodes } = parent;
    if (childNodes.length === prevLength) {
      parent.textContent = "";
      if (nextLength === 0) {
        const placeholder = createComment("");
        FragmentUtils.pushNode(fragmentNext, placeholder);
        if (next !== fragmentNext.values) {
          next = placeholder;
          nextLength += 1;
        }
      }
      if (prevSibling) {
        if (next instanceof Array) {
          prevSibling.before.apply(prevSibling, next);
        } else {
          parent.insertBefore(next, prevSibling);
        }
      } else {
        if (next instanceof Array) {
          parent.append.apply(parent, next);
        } else {
          parent.append(next);
        }
      }
      FragmentUtils.replaceWithFragment(fragment, fragmentNext);
      return;
    }
  }
  if (nextLength === 0) {
    const placeholder = createComment("");
    FragmentUtils.pushNode(fragmentNext, placeholder);
    if (next !== fragmentNext.values) {
      next = placeholder;
      nextLength += 1;
    }
  }
  if (!fragmentOnly) {
    diff(parent, prev, next, prevSibling);
  }
  FragmentUtils.replaceWithFragment(fragment, fragmentNext);
};
const setChild = (parent, child, fragment = FragmentUtils.make(), stack) => {
  resolveChild(child, setChildStatic.bind(void 0, parent, fragment, false), false, stack);
};
const setClassStatic = classesToggle;
const setClass = (element, key, value2, stack) => {
  if (isFunction(value2) && isFunctionReactive(value2)) {
    useRenderEffect(() => {
      setClassStatic(element, key, value2());
    }, stack);
  } else {
    setClassStatic(element, key, get(value2));
  }
};
const setClassBooleanStatic = (element, value2, key, keyPrev) => {
  if (keyPrev && keyPrev !== true) {
    setClassStatic(element, keyPrev, false);
  }
  if (key && key !== true) {
    setClassStatic(element, key, value2);
  }
};
const setClassBoolean = (element, value2, key, stack) => {
  if (isFunction(key) && isFunctionReactive(key)) {
    let keyPrev;
    useRenderEffect(() => {
      const keyNext = key();
      setClassBooleanStatic(element, value2, keyNext, keyPrev);
      keyPrev = keyNext;
    }, stack);
  } else {
    setClassBooleanStatic(element, value2, get(key));
  }
};
const setClassesStatic = (element, object, objectPrev, stack) => {
  if (isString(object)) {
    if (isSVG(element)) {
      element.setAttribute("class", object);
    } else {
      element.className = object;
    }
  } else {
    if (objectPrev) {
      if (isString(objectPrev)) {
        if (objectPrev) {
          if (isSVG(element)) {
            element.setAttribute("class", "");
          } else {
            element.className = "";
          }
        }
      } else if (isArray(objectPrev)) {
        objectPrev = store.unwrap(objectPrev);
        for (let i = 0, l2 = objectPrev.length; i < l2; i++) {
          if (!objectPrev[i]) continue;
          setClassBoolean(element, false, objectPrev[i], stack);
        }
      } else {
        objectPrev = store.unwrap(objectPrev);
        for (const key in objectPrev) {
          if (object && key in object) continue;
          setClass(element, key, false, stack);
        }
      }
    }
    if (isArray(object)) {
      if (isStore(object)) {
        for (let i = 0, l2 = object.length; i < l2; i++) {
          const fn = untrack(() => isFunction(object[i]) ? object[i] : object[SYMBOL_STORE_OBSERVABLE](String(i)));
          setClassBoolean(element, true, fn, stack);
        }
      } else {
        for (let i = 0, l2 = object.length; i < l2; i++) {
          if (!object[i]) continue;
          setClassBoolean(element, true, object[i], stack);
        }
      }
    } else {
      if (isStore(object)) {
        for (const key in object) {
          const fn = untrack(() => isFunction(object[key]) ? object[key] : object[SYMBOL_STORE_OBSERVABLE](key));
          setClass(element, key, fn, stack);
        }
      } else {
        for (const key in object) {
          setClass(element, key, object[key], stack);
        }
      }
    }
  }
};
const setClasses = (element, object, stack) => {
  if (isFunction(object) || isArray(object)) {
    let objectPrev;
    useRenderEffect(() => {
      const objectNext = resolveClass(object);
      setClassesStatic(element, objectNext, objectPrev, stack);
      objectPrev = objectNext;
    }, stack);
  } else {
    setClassesStatic(element, object, null, stack);
  }
};
const setDirective = (element, directive, args) => {
  const symbol = SYMBOLS_DIRECTIVES[directive] || Symbol();
  const data = context(symbol) || DIRECTIVES[symbol];
  if (!data) throw new Error(`Directive "${directive}" not found`);
  const call = () => data.fn(element, ...castArray(args));
  const stack = new Error();
  if (data.immediate) {
    call();
  } else {
    useMicrotask(call, stack);
  }
};
const setEventStatic = /* @__PURE__ */ (() => {
  const delegatedEvents = {
    onauxclick: ["_onauxclick", false],
    onbeforeinput: ["_onbeforeinput", false],
    onclick: ["_onclick", false],
    ondblclick: ["_ondblclick", false],
    onfocusin: ["_onfocusin", false],
    onfocusout: ["_onfocusout", false],
    oninput: ["_oninput", false],
    onkeydown: ["_onkeydown", false],
    onkeyup: ["_onkeyup", false],
    onmousedown: ["_onmousedown", false],
    onmouseup: ["_onmouseup", false]
  };
  const delegate = (event) => {
    const key = `_${event}`;
    document.addEventListener(event.slice(2), (event2) => {
      const targets = event2.composedPath();
      let target = null;
      Object.defineProperty(event2, "currentTarget", {
        configurable: true,
        get() {
          return target;
        }
      });
      for (let i = 0, l2 = targets.length; i < l2; i++) {
        target = targets[i];
        const handler = target[key];
        if (!handler) continue;
        handler(event2);
        if (event2.cancelBubble) break;
      }
      target = null;
    });
  };
  return (element, event, value2) => {
    if (event.startsWith("onmiddleclick")) {
      const _value = value2;
      event = `onauxclick${event.slice(13)}`;
      value2 = _value && ((event2) => event2["button"] === 1 && _value(event2));
    }
    const delegated = delegatedEvents[event];
    if (delegated) {
      if (!delegated[1]) {
        delegated[1] = true;
        delegate(event);
      }
      element[delegated[0]] = value2;
    } else if (event.endsWith("passive")) {
      const isCapture = event.endsWith("capturepassive");
      const type = event.slice(2, -7 - (isCapture ? 7 : 0));
      const key = `_${event}`;
      const valuePrev = element[key];
      if (valuePrev) element.removeEventListener(type, valuePrev, { capture: isCapture });
      if (value2) element.addEventListener(type, value2, { passive: true, capture: isCapture });
      element[key] = value2;
    } else if (event.endsWith("capture")) {
      const type = event.slice(2, -7);
      const key = `_${event}`;
      const valuePrev = element[key];
      if (valuePrev) element.removeEventListener(type, valuePrev, { capture: true });
      if (value2) element.addEventListener(type, value2, { capture: true });
      element[key] = value2;
    } else {
      element[event] = value2;
    }
  };
})();
const setEvent = (element, event, value2) => {
  setEventStatic(element, event, value2);
};
const setHTMLStatic = (element, value2) => {
  element.innerHTML = String(isNil(value2) ? "" : value2);
};
const setHTML = (element, value2, stack) => {
  useRenderEffect(() => {
    setHTMLStatic(element, get(get(value2).__html));
  }, stack);
};
const setPropertyStatic = (element, key, value2) => {
  if (key === "tabIndex" && isBoolean(value2)) {
    value2 = value2 ? 0 : void 0;
  }
  if (key === "value") {
    if (element.tagName === "PROGRESS") {
      value2 ?? (value2 = null);
    } else if (element.tagName === "SELECT" && !element["_$inited"]) {
      element["_$inited"] = true;
      queueMicrotask(() => element[key] = value2);
    }
  }
  try {
    element[key] = value2;
    if (isNil(value2)) {
      setAttributeStatic(element, key, null);
    }
  } catch {
    setAttributeStatic(element, key, value2);
  }
};
const setProperty = (element, key, value2, stack) => {
  if (isFunction(value2) && isFunctionReactive(value2)) {
    useRenderEffect(() => {
      setPropertyStatic(element, key, value2());
    }, stack);
  } else {
    setPropertyStatic(element, key, get(value2));
  }
};
const setRef = (element, value2) => {
  if (isNil(value2)) return;
  const values = flatten(castArray(value2)).filter(Boolean);
  if (!values.length) return;
  const stack = new Error();
  useMicrotask(() => untrack(() => values.forEach((value22) => value22 == null ? void 0 : value22(element))), stack);
};
const setStyleStatic = /* @__PURE__ */ (() => {
  const propertyNonDimensionalRe = /^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/i;
  const propertyNonDimensionalCache = {};
  return (element, key, value2) => {
    if (key.charCodeAt(0) === 45) {
      if (isNil(value2)) {
        element.style.removeProperty(key);
      } else {
        element.style.setProperty(key, String(value2));
      }
    } else if (isNil(value2)) {
      element.style[key] = null;
    } else {
      element.style[key] = isString(value2) || (propertyNonDimensionalCache[key] || (propertyNonDimensionalCache[key] = propertyNonDimensionalRe.test(key))) ? value2 : `${value2}px`;
    }
  };
})();
const setStyle = (element, key, value2, stack) => {
  if (isFunction(value2) && isFunctionReactive(value2)) {
    useRenderEffect(() => {
      setStyleStatic(element, key, value2());
    }, stack);
  } else {
    setStyleStatic(element, key, get(value2));
  }
};
const setStylesStatic = (element, object, objectPrev, stack) => {
  if (isString(object)) {
    element.setAttribute("style", object);
  } else {
    if (objectPrev) {
      if (isString(objectPrev)) {
        if (objectPrev) {
          element.style.cssText = "";
        }
      } else {
        objectPrev = store.unwrap(objectPrev);
        for (const key in objectPrev) {
          if (object && key in object) continue;
          setStyleStatic(element, key, null);
        }
      }
    }
    if (isStore(object)) {
      for (const key in object) {
        const fn = untrack(() => isFunction(object[key]) ? object[key] : object[SYMBOL_STORE_OBSERVABLE](key));
        setStyle(element, key, fn, stack);
      }
    } else {
      for (const key in object) {
        setStyle(element, key, object[key], stack);
      }
    }
  }
};
const setStyles = (element, object, stack) => {
  if (isFunction(object) || isArray(object)) {
    let objectPrev;
    useRenderEffect((stack2) => {
      const objectNext = resolveStyle(object);
      setStylesStatic(element, objectNext, objectPrev, stack2);
      objectPrev = objectNext;
    }, stack);
  } else {
    setStylesStatic(element, get(object), null, stack);
  }
};
const setTemplateAccessor = (element, key, value2) => {
  if (key === "children") {
    const placeholder = createText("");
    element.insertBefore(placeholder, null);
    value2(element, "setChildReplacement", void 0, placeholder);
  } else if (key === "ref") {
    value2(element, "setRef");
  } else if (key === "style") {
    value2(element, "setStyles");
  } else if (key === "class" || key === "className") {
    if (!isSVG(element)) {
      element.className = "";
    }
    value2(element, "setClasses");
  } else if (key === "dangerouslySetInnerHTML") {
    value2(element, "setHTML");
  } else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
    value2(element, "setEvent", key.toLowerCase());
  } else if (key.charCodeAt(0) === 117 && key.charCodeAt(3) === 58) {
    value2(element, "setDirective", key.slice(4));
  } else if (key === "innerHTML" || key === "outerHTML" || key === "textContent" || key === "className") ;
  else if (key in element && !isSVG(element)) {
    value2(element, "setProperty", key);
  } else {
    element.setAttribute(key, "");
    value2(element, "setAttribute", key);
  }
};
const setProp = (element, key, value2, stack) => {
  if (value2 === void 0) return;
  if (isTemplateAccessor(value2)) {
    setTemplateAccessor(element, key, value2);
  } else if (key === "children") {
    setChild(element, value2, FragmentUtils.make(), stack);
  } else if (key === "ref") {
    setRef(element, value2);
  } else if (key === "style") {
    setStyles(element, value2, stack);
  } else if (key === "class" || key === "className") {
    setClasses(element, value2, stack);
  } else if (key === "dangerouslySetInnerHTML") {
    setHTML(element, value2, stack);
  } else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
    setEvent(element, key.toLowerCase(), value2);
  } else if (key.charCodeAt(0) === 117 && key.charCodeAt(3) === 58) {
    setDirective(element, key.slice(4), value2);
  } else if (key === "innerHTML" || key === "outerHTML" || key === "textContent" || key === "className") ;
  else if (key in element && !isSVG(element)) {
    setProperty(element, key, value2, stack);
  } else {
    setAttribute(element, key, value2, stack);
  }
};
const setProps = (element, object, stack) => {
  for (const key in object) {
    setProp(element, key, object[key], stack);
  }
};
const createElement = (component, _props, ..._children) => {
  const children = _children.length > 1 ? _children : _children.length > 0 ? _children[0] : void 0;
  const hasChildren = !isVoidChild(children);
  const { ...rest } = _props ?? {};
  if (hasChildren && isObject(_props) && "children" in _props) {
    throw new Error('Providing "children" both as a prop and as rest arguments is forbidden');
  }
  if (isFunction(component)) {
    const props = hasChildren ? { ..._props, children } : _props;
    return wrapElement(() => {
      return untrack(() => component.call(component, props));
    });
  } else if (isString(component)) {
    const isSVG2 = isSVGElement(component);
    const createNode = isSVG2 ? createSVGNode : createHTMLNode;
    return wrapElement(() => {
      const child = createNode(component);
      if (isSVG2) child["isSVG"] = true;
      const stack = new Error();
      untrack(() => {
        if (_props) {
          setProps(child, _props, stack);
        }
        if (hasChildren) {
          setChild(child, children, FragmentUtils.make(), stack);
        }
      });
      return child;
    });
  } else if (isNode(component)) {
    return wrapElement(() => component);
  } else {
    throw new Error("Invalid component");
  }
};
const render = (child, parent) => {
  if (!parent || !(parent instanceof HTMLElement)) throw new Error("Invalid parent node");
  parent.textContent = "";
  return root((stack, dispose) => {
    setChild(parent, child, FragmentUtils.make(), stack);
    return () => {
      dispose(stack);
      parent.textContent = "";
    };
  });
};
const Portal = ({ when = true, mount, wrapper, children }) => {
  const portal = get(wrapper) || createHTMLNode("div");
  if (!(portal instanceof HTMLElement)) throw new Error("Invalid wrapper node");
  const condition = boolean(when);
  const stack = new Error();
  useRenderEffect(() => {
    if (!get(condition)) return;
    const parent = get(mount) || document.body;
    if (!(parent instanceof Element)) throw new Error("Invalid mount node");
    parent.insertBefore(portal, null);
    return () => {
      parent.removeChild(portal);
    };
  }, stack);
  useRenderEffect(() => {
    if (!get(condition)) return;
    return render(children, portal);
  }, stack);
  return assign(() => get(condition) || children, { metadata: { portal } });
};
function createContext(defaultValue) {
  const symbol = Symbol();
  const Provider = ({ value: value2, children }) => {
    return context({ [symbol]: value2 }, () => {
      return resolve(children);
    });
  };
  const Context2 = { Provider };
  CONTEXTS_DATA.set(Context2, { symbol, defaultValue });
  return Context2;
}
const wrapCloneElement = (target, component, props) => {
  target[SYMBOL_CLONE] = { Component: component, props };
  return target;
};
function jsx(component, props, ...children) {
  if (typeof children === "string")
    return wrapCloneElement(createElement(component, props ?? {}, children), component, props);
  if (!props) props = {};
  if (typeof children === "string")
    Object.assign(props, { children });
  return wrapCloneElement(createElement(component, props, props == null ? void 0 : props.key), component, props);
}
const underlineOnly = `focus:[outline:none] px-0 py-[7px] border-b-[#ccc] border-0 border-b border-solid`;
const effect1$1 = `${underlineOnly} 
[&~span]:absolute [&~span]:w-0 [&~span]:h-0.5 [&~span]:bg-[#4caf50] [&~span]:duration-[0.4s] [&~span]:left-0 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s] 
`;
const effect2$1 = `${underlineOnly}
[&~span]:absolute [&~span]:w-0 [&~span]:h-0.5 [&~span]:bg-[#4caf50] [&~span]:duration-[0.4s] [&~span]:left-2/4 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s] [&:focus~span]:left-0
`;
const effect3$1 = `${underlineOnly}
[&~span]:absolute [&~span]:w-full [&~span]:h-0.5 [&~span]:z-[99] [&~span]:left-0 [&~span]:bottom-0
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-full [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-0 [&~span]:before:bottom-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-full [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-0 [&~span]:after:bottom-0
[&~span]:after:left-auto [&~span]:after:right-0
[&:focus~span]:before:w-1/2 [&:focus~span]:before:duration-[0.4s]
[&:focus~span]:after:w-1/2 [&:focus~span]:after:duration-[0.4s]
`;
const box = `focus:[outline:none] duration-[0.4s] pt-[5px] pb-[7px] px-0 border-b-[#ccc] border-b-solid border-b-2 w-full`;
const effect4$1 = `${box}
focus:duration-[0.4s] focus:pt-[5px] focus:pb-[7px] focus:px-3.5
[&~span]:absolute [&~span]:h-0 [&~span]:w-full [&~span]:duration-[0.4s] [&~span]:z-[-1] [&~span]:left-0 [&~span]:bottom-0
[&:focus~span]:duration-[0.4s] [&:focus~span]:h-9 [&:focus~span]:z-[1] [&:focus~span]:border-2 [&:focus~span]:border-solid [&:focus~span]:border-[#4caf50]
`;
const effect5$1 = `${box}
focus:duration-[0.4s] focus:pt-[5px] focus:pb-[7px] focus:px-3.5
[&~span]:absolute [&~span]:h-9 [&~span]:w-0 [&~span]:duration-[0.4s] [&~span]:left-0 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s] [&:focus~span]:border-2 [&:focus~span]:border-solid [&:focus~span]:border-[#4caf50]
`;
const effect6$1 = `${box}
focus:duration-[0.4s] focus:pt-[5px] focus:pb-[7px] focus:px-3.5
[&~span]:absolute [&~span]:h-9 [&~span]:w-0 [&~span]:duration-[0.4s] [&~span]:right-0 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s] [&:focus~span]:border-2 [&:focus~span]:border-solid [&:focus~span]:border-[#4caf50]
`;
const outline7 = `focus:[outline:none] border-2 duration-[0.4s] pt-[7px] pb-[9px] px-3.5 border-solid border-[#ccc]`;
const effect7$1 = `${outline7}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-2/4 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-2/4 [&~span]:after:top-0
[&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.6s] [&~span_i]:before:left-0 [&~span_i]:before:top-2/4
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.6s]  [&~span_i]:after:top-2/4
[&~span_i]:after:left-auto [&~span_i]:after:right-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.4s] [&:focus~span]:before:left-0
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.4s] [&:focus~span]:after:left-0
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s] [&:focus~span_i]:before:top-0
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.6s] [&:focus~span_i]:after:top-0
`;
const effect8$1 = `${outline7}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.3s] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.3s] [&~span]:after:left-0 [&~span]:after:top-0
[&~span]:after:left-auto [&~span]:after:right-0 [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.4s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.4s]  [&~span_i]:after:top-0
[&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.3s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.3s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.4s]
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.4s]
`;
const effect9$1 = `${outline7}
[&~span]:before:content-[""] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.2s] [&~span]:before:delay-[0.2s] [&~span]:before:right-0 [&~span]:before:top-0
[&~span]:after:content-[""] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.2s] [&~span]:after:right-0 [&~span]:after:top-0
[&~span]:after:delay-[0.6s] [&~span]:after:left-0 [&~span]:after:right-auto [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[""] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.2s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:before:delay-[0.8s]
[&~span_i]:after:content-[""] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.2s]  [&~span_i]:after:top-0
[&~span_i]:after:delay-[0.4s] [&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.2s] [&:focus~span]:before:delay-[0.6s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.2s]
[&:focus~span]:after:delay-[0.2s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.2s] [&:focus~span_i]:before:delay-0
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.2s]

`;
const fill10 = `focus:[outline:none] relative px-[15px] py-[7px] border-2 border-solid border-[#ccc] bg-transparent`;
const effect10$1 = `${fill10}
[&~span]:absolute [&~span]:w-full [&~span]:h-full [&~span]:bg-[#ededed] [&~span]:opacity-0 [&~span]:duration-[0.5s] [&~span]:z-[-1] [&~span]:left-0 [&~span]:top-0
[&:focus~span]:duration-[0.5s] [&:focus~span]:opacity-100
`;
const effect11$1 = `${fill10}
[&~span]:absolute [&~span]:w-0 [&~span]:h-full [&~span]:bg-[#ededed] [&~span]:duration-[0.3s] [&~span]:z-[-1] [&~span]:left-0 [&~span]:top-0
[&:focus~span]:duration-[0.3s] [&:focus~span]:w-full
`;
const effect12$1 = `${fill10}
[&~span]:absolute [&~span]:w-0 [&~span]:h-full [&~span]:bg-[#ededed] [&~span]:duration-[0.3s] [&~span]:z-[-1] [&~span]:left-2/4 [&~span]:top-0
[&:focus~span]:duration-[0.3s] [&:focus~span]:w-full [&:focus~span]:left-0
`;
const effect13$1 = `${fill10}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-full [&~span]:before:bg-[#ededed] [&~span]:before:duration-[0.3s] [&~span]:before:z-[-1] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-full [&~span]:after:bg-[#ededed] [&~span]:after:duration-[0.3s] [&~span]:after:z-[-1] [&~span]:after:left-0 [&~span]:after:top-0
[&:focus~span]:before:duration-[0.3s] [&:focus~span]:before:w-1/2
[&~span]:after:left-auto [&~span]:after:right-0
[&:focus~span]:after:duration-[0.3s] [&:focus~span]:after:w-1/2
`;
const effect14$1 = `${fill10}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0 [&~span]:before:bg-[#ededed] [&~span]:before:duration-[0.3s] [&~span]:before:z-[-1] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0 [&~span]:after:bg-[#ededed] [&~span]:after:duration-[0.3s] [&~span]:after:z-[-1] [&~span]:after:left-0 [&~span]:after:top-0
[&:focus~span]:before:duration-[0.3s] [&:focus~span]:before:w-1/2 [&:focus~span]:before:h-full
[&~span]:after:left-auto [&~span]:after:right-0 [&~span]:after:top-auto [&~span]:after:bottom-0
[&:focus~span]:after:duration-[0.3s] [&:focus~span]:after:w-1/2 [&:focus~span]:after:h-full
`;
const effect15$1 = `${fill10}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0 [&~span]:before:bg-[#ededed] [&~span]:before:duration-[0.3s] [&~span]:before:z-[-1] [&~span]:before:left-2/4 [&~span]:before:top-2/4
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0 [&~span]:after:bg-[#ededed] [&~span]:after:duration-[0.3s] [&~span]:after:z-[-1] [&~span]:after:left-2/4 [&~span]:after:top-2/4
[&:focus~span]:before:duration-[0.3s] [&:focus~span]:before:w-1/2 [&:focus~span]:before:h-full [&:focus~span]:before:left-0 [&:focus~span]:before:top-0
[&~span]:after:left-auto [&~span]:after:right-2/4 [&~span]:after:top-auto [&~span]:after:bottom-2/4
[&:focus~span]:after:duration-[0.3s] [&:focus~span]:after:w-1/2 [&:focus~span]:after:h-full [&:focus~span]:after:right-0 [&:focus~span]:after:bottom-0
`;
const underline16 = `focus:[outline:none] bg-transparent px-0 py-1 border-b-[#ccc] border-0 border-b border-solid`;
const effect16$1 = `${underline16}
[&~span]:absolute [&~span]:w-0 [&~span]:h-0.5 [&~span]:bg-[#4caf50] [&~span]:duration-[0.4s] [&~span]:left-0 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s]
[&:not(:placeholder-shown)~span]:w-full [&:not(:placeholder-shown)~span]:duration-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-0 [&~label]:top-[9px]
[&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:-top-4
[&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:-top-4
`;
const effect17$1 = `${underline16}
[&~span]:absolute [&~span]:w-0 [&~span]:h-0.5 [&~span]:bg-[#4caf50] [&~span]:duration-[0.4s] [&~span]:left-2/4 [&~span]:bottom-0
[&:focus~span]:w-full [&:focus~span]:duration-[0.4s] [&:focus~span]:left-0
[&:not(:placeholder-shown)~span]:w-full [&:not(:placeholder-shown)~span]:duration-[0.4s] [&:not(:placeholder-shown)~span]:left-0
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-0 [&~label]:top-[9px]
[&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:-top-4
[&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:-top-4
`;
const effect18$1 = `${underline16}
[&~span]:absolute [&~span]:w-full [&~span]:h-0.5 [&~span]:z-[99] [&~span]:left-0 [&~span]:bottom-0
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-full [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-0 [&~span]:before:bottom-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-full [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-0 [&~span]:after:bottom-0
[&~span]:after:left-auto [&~span]:after:right-0
[&:focus~span]:before:w-1/2 [&:focus~span]:before:duration-[0.4s]
[&:focus~span]:after:w-1/2 [&:focus~span]:after:duration-[0.4s]
[&:not(:placeholder-shown)~span]:before:w-1/2 [&:not(:placeholder-shown)~span]:before:duration-[0.4s]
[&:not(:placeholder-shown)~span]:after:w-1/2 [&:not(:placeholder-shown)~span]:after:duration-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-0 [&~label]:top-[9px]
[&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:-top-4
[&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:-top-4
`;
const box19 = `focus:[outline:none] border duration-[0.4s] px-3.5 py-[7px] border-solid border-[#ccc] bg-transparent`;
const effect19 = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-2/4 [&~span]:before:-top-px
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-2/4 
[&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.6s] [&~span_i]:before:left-0 [&~span_i]:before:top-2/4
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.6s]  [&~span_i]:after:top-2/4
[&~span_i]:after:left-auto [&~span_i]:after:right-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.4s] [&:focus~span]:before:left-0
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.4s] [&:focus~span]:after:left-0
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.4s] [&:not(:placeholder-shown)~span]:before:left-0
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.4s] [&:not(:placeholder-shown)~span]:after:left-0
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s] [&:focus~span_i]:before:-top-px
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.6s] [&:focus~span_i]:after:-top-px
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:before:-top-px
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:after:-top-px
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
[&:not(:placeholder-shown)~label]:top-[-18px] [&:not(:placeholder-shown)~label]:text-xs text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:left-0
`;
const hpLabel20 = `[&:not(:placeholder-shown)~label]:top-[-18px] [&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:left-0`;
const effect20 = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.3s] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.3s] [&~span]:after:left-0 [&~span]:after:top-0
[&~span]:after:left-auto [&~span]:after:right-0 [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.4s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.4s]  [&~span_i]:after:top-0
[&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.3s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.3s]
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.3s]
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.3s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.4s]
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.4s]
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
${hpLabel20}
`;
const effect21 = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.2s] [&~span]:before:delay-[0.2s] [&~span]:before:right-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.2s] [&~span]:after:delay-[0.2s] [&~span]:after:right-0 [&~span]:after:top-0
[&~span]:after:delay-[0.6s] [&~span]:after:left-0 [&~span]:after:right-auto [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.2s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.2s]  [&~span_i]:after:top-0
[&~span_i]:after:delay-[0.4s] [&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.2s] [&:focus~span]:before:delay-[0.6s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.2s] 
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.2s] [&:not(:placeholder-shown)~span]:before:delay-[0.6s]
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.2s] [&:not(:placeholder-shown)~span]:after:delay-[0.6s]
[&:focus~span]:after:delay-[0.4s]
[&:not(:placeholder-shown)~span]:after:delay-[0.2s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s]
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.2s]
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]
[&:focus~span_i]:after:delay-[0.4s]
[&:not(:placeholder-shown)~span_i]:after:delay-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
${hpLabel20}
[&~span_i]:before:delay-[0.8s]
[&:focus~span_i]:before:delay-0
`;
const fill22 = `focus:[outline:none] border-2 relative px-[15px] py-[7px] border-0 border-solid border-[#ccc] bg-transparent`;
const effect22 = `${fill22}
[&~span]:absolute [&~span]:w-0 [&~span]:h-full [&~span]:bg-transparent [&~span]:duration-[0.4s] [&~span]:z-[-1] [&~span]:left-0 [&~span]:top-0
[&:focus~span]:duration-[0.4s] [&:focus~span]:w-full [&:focus~span]:bg-[#ededed]
[&:not(:placeholder-shown)~span]:duration-[0.4s] [&:not(:placeholder-shown)~span]:w-full [&:not(:placeholder-shown)~span]:bg-[#ededed]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs [&:focus~label]:text-[#333] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
${hpLabel20}
`;
const effect23 = `${fill22}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0 [&~span]:before:bg-[#ededed] [&~span]:before:duration-[0.3s] [&~span]:before:z-[-1] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0 [&~span]:after:bg-[#ededed] [&~span]:after:duration-[0.3s] [&~span]:after:z-[-1] [&~span]:after:left-0 [&~span]:after:top-0
[&:focus~span]:before:duration-[0.3s] [&:focus~span]:before:w-1/2 [&:focus~span]:before:h-full
[&:not(:placeholder-shown)~span]:before:duration-[0.3s] [&:not(:placeholder-shown)~span]:before:w-1/2 [&:not(:placeholder-shown)~span]:before:h-full
[&~span]:after:left-auto [&~span]:after:right-0 [&~span]:after:top-auto [&~span]:after:bottom-0
[&:focus~span]:after:duration-[0.3s] [&:focus~span]:after:w-1/2 [&:focus~span]:after:h-full
[&:not(:placeholder-shown)~span]:after:duration-[0.3s] [&:not(:placeholder-shown)~span]:after:w-1/2 [&:not(:placeholder-shown)~span]:after:h-full
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs [&:focus~label]:text-[#333] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
${hpLabel20}
`;
const effect24 = `${fill22}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0 [&~span]:before:bg-[#ededed] [&~span]:before:duration-[0.3s] [&~span]:before:z-[-1] [&~span]:before:left-2/4 [&~span]:before:top-2/4
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0 [&~span]:after:bg-[#ededed] [&~span]:after:duration-[0.3s] [&~span]:after:z-[-1] [&~span]:after:left-2/4 [&~span]:after:top-2/4
[&:focus~span]:before:duration-[0.3s] [&:focus~span]:before:w-1/2 [&:focus~span]:before:h-full [&:focus~span]:before:left-0 [&:focus~span]:before:top-0
[&:not(:placeholder-shown)~span]:before:duration-[0.3s] [&:not(:placeholder-shown)~span]:before:w-1/2 [&:not(:placeholder-shown)~span]:before:h-full [&:not(:placeholder-shown)~span]:before:left-0 [&:not(:placeholder-shown)~span]:before:top-0
[&~span]:after:left-auto [&~span]:after:right-2/4 [&~span]:after:top-auto [&~span]:after:bottom-2/4
[&:focus~span]:after:duration-[0.3s] [&:focus~span]:after:w-1/2 [&:focus~span]:after:h-full [&:focus~span]:after:right-0 [&:focus~span]:after:bottom-0
[&:not(:placeholder-shown)~span]:after:duration-[0.3s] [&:not(:placeholder-shown)~span]:after:w-1/2 [&:not(:placeholder-shown)~span]:after:h-full [&:not(:placeholder-shown)~span]:after:right-0 [&:not(:placeholder-shown)~span]:after:bottom-0
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
[&:focus~label]:top-[-18px] [&:focus~label]:text-xs [&:focus~label]:text-[#333] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-0
[&:not(:placeholder-shown)~label]:top-[-18px] [&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#333] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:left-0
`;
const hLabel = `[&:focus~label]:top-[-12px] [&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-[7px] [&:focus~label]:bg-[white] [&:focus~label]:w-fit [&:focus~label]:z-10 [&:focus~label]:p-[2px]`;
const hpLabel = `[&:not(:placeholder-shown)~label]:top-[-12px] [&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:left-[7px] [&:not(:placeholder-shown)~label]:bg-[white] [&:not(:placeholder-shown)~label]:w-fit [&:not(:placeholder-shown)~label]:z-10 [&:not(:placeholder-shown)~label]:p-[2px]`;
const effect19a = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-2/4 [&~span]:before:-top-px
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-2/4 
[&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.6s] [&~span_i]:before:left-0 [&~span_i]:before:top-2/4
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.6s]  [&~span_i]:after:top-2/4
[&~span_i]:after:left-auto [&~span_i]:after:right-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.4s] [&:focus~span]:before:left-0
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.4s] [&:focus~span]:after:left-0
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.4s] [&:not(:placeholder-shown)~span]:before:left-0
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.4s] [&:not(:placeholder-shown)~span]:after:left-0
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s] [&:focus~span_i]:before:-top-px
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.6s] [&:focus~span_i]:after:-top-px
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:before:-top-px
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:after:-top-px
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
${hLabel}
${hpLabel}
`;
const effect20a = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.3s] [&~span]:before:left-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.3s] [&~span]:after:left-0 [&~span]:after:top-0
[&~span]:after:left-auto [&~span]:after:right-0 [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.4s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.4s]  [&~span_i]:after:top-0
[&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.3s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.3s]
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.3s]
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.3s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.4s]
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.4s]
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
${hLabel}
${hpLabel}
`;
const effect21a = `${box19}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.2s] [&~span]:before:delay-[0.2s] [&~span]:before:right-0 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.2s] [&~span]:after:delay-[0.2s] [&~span]:after:right-0 [&~span]:after:top-0
[&~span]:after:delay-[0.6s] [&~span]:after:left-0 [&~span]:after:right-auto [&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.2s] [&~span_i]:before:left-0 [&~span_i]:before:top-0
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.2s]  [&~span_i]:after:top-0
[&~span_i]:after:delay-[0.4s] [&~span_i]:after:left-auto [&~span_i]:after:right-0 [&~span_i]:after:top-auto [&~span_i]:after:bottom-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.2s] [&:focus~span]:before:delay-[0.6s]
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.2s] 
[&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.2s] [&:not(:placeholder-shown)~span]:before:delay-[0.6s]
[&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.2s] [&:not(:placeholder-shown)~span]:after:delay-[0.6s]
[&:focus~span]:after:delay-[0.4s]
[&:not(:placeholder-shown)~span]:after:delay-[0.2s]
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s]
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.2s]
[&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]
[&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]
[&:focus~span_i]:after:delay-[0.4s]
[&:not(:placeholder-shown)~span_i]:after:delay-[0.4s]
[&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-[-1] [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5
${hLabel}
${hpLabel}
[&~span_i]:before:delay-[0.8s]
[&:focus~span_i]:before:delay-0
`;
let nanoid = (size = 21) => crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
  byte &= 63;
  if (byte < 36) {
    id += byte.toString(36);
  } else if (byte < 62) {
    id += (byte - 26).toString(36).toUpperCase();
  } else if (byte > 62) {
    id += "-";
  } else {
    id += "_";
  }
  return id;
}, "");
const isTemp = (s) => !!s.raw;
const extract = (C, props, classNames) => {
  const { className, ...p } = props;
  const cls = p.class;
  delete p.class;
  return /* @__PURE__ */ jsx(C, { class: [classNames, cls, className], ...p });
};
function style$1(comp) {
  function tw2(strings, ...values) {
    if (isTemp(strings)) {
      const C = comp;
      const r = memo(() => strings.map((str, i) => i < values.length ? str + get(values[i]) : str).join(""));
      return C ? (props) => extract(C, props, r) : r;
    }
    return style$1(strings).tw;
  }
  return { comp, tw: tw2 };
}
const tw = style$1().tw;
const TextField = (props) => {
  const { className, class: cls, children, effect: effect25, assignOnEnter, value: value2, type = "text", placeholder = "Placeholder Text", onChange, onKeyUp, size, ...otherProps } = props;
  return /* @__PURE__ */ jsx("div", { class: [className ?? cls ?? "m-[20px]", "relative"], children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        class: effect25 ?? effect19a,
        value: value2,
        ...{ ...otherProps, type, placeholder },
        onChange: (e) => {
          !get(assignOnEnter) && isObservable(value2) ? (value2 == null ? void 0 : value2(e.target.value), onChange == null ? void 0 : onChange(e)) : void 0;
        },
        onKeyUp: (e) => {
          !get(assignOnEnter) && isObservable(value2) ? (value2 == null ? void 0 : value2(e.target.value), onKeyUp == null ? void 0 : onKeyUp(e)) : (e.key === "Enter" && isObservable(value2) && value2(e.target.value), onKeyUp == null ? void 0 : onKeyUp(e));
        },
        size: size ?? 40
      }
    ),
    children
  ] });
};
tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2`;
tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2`;
const TextArea = ({ className, class: cls, children, effect: effect25, reactive, type = "text", placeholder = "Placeholder Text", ...props }) => {
  const { onChange, onKeyUp, ...ps } = props;
  return /* @__PURE__ */ jsx("div", { class: [className ?? cls ?? "m-[20px]", "relative"], children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        class: effect25 ?? effect19a,
        ...{ ...ps, type, placeholder },
        onChange: (e) => {
          var _a;
          return !get(reactive) && isObservable(ps.value) ? ((_a = ps.value) == null ? void 0 : _a.call(ps, e.target.value), onChange == null ? void 0 : onChange(e)) : void 0;
        },
        onKeyUp: (e) => {
          var _a;
          return !get(reactive) && isObservable(ps.value) ? ((_a = ps.value) == null ? void 0 : _a.call(ps, e.target.value), onKeyUp == null ? void 0 : onKeyUp(e)) : (e.key === "Enter" && isObservable(ps.value) && ps.value(e.target.value), onKeyUp == null ? void 0 : onKeyUp(e), onChange == null ? void 0 : onChange(e));
        }
      }
    ),
    children,
    /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("i", {}) })
  ] });
};
const IconButton = tw("button")`inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle appearance-none no-underline text-center flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] m-0 p-2 rounded-[50%] border-0
[outline:0px] 
duration-[0.3s] hover:bg-[#dde0dd] 
[&_svg]:w-[1em] [&_svg]:h-[1em] [&_svg]:fill-current
disabled:bg-transparent disabled:text-[rgba(0,0,0,0.26)] disabled:[&_svg]:fill-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default
`;
const DeleteIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    class: "text-[rgba(0,0,0,0.26)] text-[22px] cursor-pointer select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl -ml-1.5 mr-[5px] my-0 [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms] hover:text-[rgba(0,0,0,0.4)]",
    focusable: "false",
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    "data-testid": "CancelIcon",
    children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" })
  }
);
const Chip = ({ avatar, deleteIcon = DeleteIcon, onDelete, children, ...props }) => {
  const { className, ...p } = props;
  const cls = props.class;
  delete props.class;
  return /* @__PURE__ */ jsx("div", { class: [`relative cursor-pointer select-none appearance-none max-w-full text-[0.8125rem] inline-flex items-center justify-center h-8 text-[rgba(0,0,0,0.87)] bg-[rgba(0,0,0,0.08)] whitespace-nowrap no-underline align-middle box-border m-0 p-0 rounded-2xl border-0;
  [transition:background-color_300ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]
  [outline:0px]`, className ?? cls], tabIndex: 0, role: "button", ...props, children: [
    avatar,
    /* @__PURE__ */ jsx("span", { class: "overflow-hidden text-ellipsis whitespace-nowrap px-3", children }),
    onDelete ? /* @__PURE__ */ jsx("div", { onClick: (e) => {
      e.stopPropagation();
      onDelete(e);
    }, children: deleteIcon }) : null
  ] });
};
const Switch = ({ off = "OFF", on = "ON", checked, ...props }) => {
  const id = props.id ?? nanoid(8);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { ...props, children: [
    /* @__PURE__ */ jsx("input", { id, type: "checkbox", checked, onChange: (v) => isObservable(checked) && checked(v.target.checked) }),
    /* @__PURE__ */ jsx("div", { "data-tg-on": on, "data-tg-off": off, children: /* @__PURE__ */ jsx("span", { "data-tg-on": on, "data-tg-off": off }) }),
    /* @__PURE__ */ jsx("span", {}),
    /* @__PURE__ */ jsx("label", { for: id, "data-tg-on": on, "data-tg-off": off })
  ] }) });
};
const useEnumSwitch = (e, t, f) => {
  const v = observable(get(e) === t);
  effect(() => {
    v(get(e) !== get(f));
  });
  effect(() => {
    if (get(v)) e(get(t));
    else e(get(f));
  });
  return v;
};
const Avatar = ({ className = "w-10 h-10 bg-[rgb(189,189,189)]", src, alt, children, ...props }) => {
  const cls = props.class;
  delete props.class;
  const child = memo(() => get(src) ? /* @__PURE__ */ jsx("img", { alt, src }) : children);
  return /* @__PURE__ */ jsx("div", { class: ["relative flex items-center justify-center shrink-0  text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className], children: child });
};
const Badge = ({ className, children, badgeContent, anchorOrigin: { vertical = "top", horizontal = "right" } = {}, badgeClass = `bg-[rgb(156,39,176)]`, open: op, ...props }) => {
  const { class: cls, ...ps } = props;
  const empty = memo(
    () => get(badgeContent) ? "min-w-[20px] h-5 rounded-[10px] px-1" : "hidden"
    /* min-w-[8px] h-2 rounded px-0  */
  );
  const pos = memo(() => {
    const [v, h] = [get(vertical), get(horizontal)];
    return v === "top" ? h === "right" ? `translate-x-2/4 -translate-y-2/4 origin-[100%_0%]` : `-translate-x-2/4 -translate-y-2/4 origin-[0%_0%]` : h === "right" ? `translate-x-2/4 translate-y-2/4 origin-[100%_100%]` : `-translate-x-2/4 translate-y-2/4 origin-[0%_100%]`;
  });
  return /* @__PURE__ */ jsx("span", { class: "relative inline-flex align-middle shrink-0 m-4", children: [
    children,
    /* @__PURE__ */ jsx("span", { class: [`flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 right-0 top-0 [flex-flow:wrap]
        [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms`, empty, pos, badgeClass], children: badgeContent })
  ] });
};
const Appbar = tw("header")`shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] [@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 fixed z-[1100] bg-[rgb(25,118,210)] text-white left-auto top-0
    [transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]`;
const Toolbar = tw("div")`relative flex items-center px-4 h-full`;
const variant = {
  text: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline 
            font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-[#1976d2] 
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default`,
  contained: `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle no-underline 
            font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-white bg-[#1976d2] 
            shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)] 
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[#1565c0] hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]
            active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:shadow-none disabled:bg-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
  outlined: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline font-medium 
            text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded border text-[#1976d2] rounded-none 
            border-solid border-[rgba(25,118,210,0.5)] font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)] hover:border hover:border-solid hover:border-[#1976d2]
            disabled:text-[rgba(0,0,0,0.26)] disabled:border disabled:border-solid disabled:border-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
  icon: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-center
     flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] rounded-none
     rounded-[50%] border-0
     hover:bg-[rgba(0,0,0,0.04)]`
};
const Button = (props) => {
  const { children, class: cls, buttonType = "contained", checked = observable(false), disabled, ...otherProps } = props;
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: (e) => {
        e.stopImmediatePropagation();
        if (isObservable(checked)) {
          checked(!get(checked));
        }
      },
      disabled,
      class: [variant[buttonType], cls],
      ...otherProps,
      children
    }
  );
};
tw("button")`inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-h-[36px] min-w-0 z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0
[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
      outline-none`;
const Fab = tw("button")`absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]`;
const yesKnot = `[&>div]:before:w-[2rem] [&>div]:before:h-[2rem] [&>div]:before:flex [&>div]:before:items-center [&>div]:before:justify-center`;
const noKnot = `[&>div]:after:w-[2rem] [&>div]:after:h-[2rem] [&>div]:after:flex [&>div]:after:items-center [&>div]:after:justify-center`;
const divSpanDim = `[&>div>span]:w-[2rem] [&>div>span]:h-[2rem]`;
const layer = `[&>span]:w-full [&>span]:bg-[#ebf7fc] [&>span]:[transition:0.3s_ease_all] [&>span]:z-[1]`;
const button_$1 = `relative w-[74px] h-9 overflow-hidden -mt-5 mb-0 mx-auto top-2/4
[&>span]:absolute [&>span]:inset-0
[&>div]:absolute [&>div]:inset-0 [&>div]:z-[2]
[&>input]:relative [&>input]:w-full [&>input]:h-full [&>input]:opacity-0 [&>input]:cursor-pointer [&>input]:z-[3] [&>input]:m-0 [&>input]:p-0

`;
const buttonr$1 = button_$1 + " rounded-[100px] [&>span]:rounded-[100px]";
const effect1 = `
${buttonr$1}
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center
[&>div]:before:leading-none [&>div]:before:bg-[#f44336] [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 
[&>div]:before:[&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:left-[42px]
[&>input~div]:bg-[#fcebeb]
[&>input:checked~div]:bg-[#ebfbfc]
[&>div]:[transition:0.3s_ease_all]
[&>span]:[transition:0.3s_ease_all]
`;
const effect2 = `
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center 
[&>div]:before:leading-none [&>div]:before:bg-[#f44336] [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center 
[&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%]
[&>div]:after:left-1 [&>div]:after:top-[2px]
${noKnot}
[&>div]:before:content-[attr(data-tg-off)]
[&>div]:after:bg-[#03a9f4] [&>div]:after:left-auto [&>div]:after:-right-8
[&>input:checked+div]:before:-left-8
[&>input:checked+div]:after:right-1
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect3 = `
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center
[&>div]:before:leading-none [&>div]:before:bg-[#f44336] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:left-1
[&>div]:before:top-[2px]
${yesKnot}
[&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:active+div]:before:w-[46px] [&>input:active+div]:before:rounded-[100px]
[&>input:checked:active+div]:before:ml-[-26px]
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:left-[42px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect4 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none 
[&>div]:before:bg-[#f44336] [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:[transition:0.3s_ease_all]
[&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none 
[&>div]:after:bg-[#03a9f4] [&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] 
[&>div]:after:left-1
${noKnot}
[&>div]:before:content-[attr(data-tg-off)]
[&>div]:after:content-[attr(data-tg-on)]
[&>div]:after:bg-[#03a9f4] [&>div]:after:left-auto [&>div]:after:right-1 [&>div]:after:-top-8
[&>input:checked+div]:before:-top-8
[&>input:checked+div]:after:top-[2px]
[&>input:checked+div]:div:-top-1
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect5 = `
${layer}
overflow-visible [perspective:60px]
[&>div]:before:content-[''] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center 
[&>div]:before:leading-none [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div>span]:content-[''] [&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold 
[&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:left-1 [&>div>span]:top-[2px]
[&>div]:before:bg-[#f44336]
[&>div>span]:before:content-[attr(data-tg-off)]
[&>div]:before:origin-center [&>div]:before:[transform:rotateY(0)]
[&>span]:origin-center [&>span]:[transform:rotateY(0)]
[&>input:checked+div]:before:left-[42px]
[&>input:checked+div>span]:left-[42px]
[&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:[transform:rotateY(180deg)]
[&>input:checked+div>span]:before:content-[attr(data-tg-on)] [&>input:checked+div>span]:before:left-[42px] [&>input:checked+div>span]:before:pl-[5px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
[&>input:checked~span]:[transform:rotateY(-180deg)]
[&>div]:[transition:0.3s_ease_all]
[&>div]:before:[transition:0.3s_ease_all]
[&>span]:[transition:0.3s_ease_all]
`;
const effect6 = `
${layer}
overflow-visible
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold 
[&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:bg-[#f44336] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] 
[&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>span]:[transform:rotateZ(0)]
[&>div]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:[transform:rotateZ(0)]
[&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:[transform:rotateZ(0)]
[&>input:checked+div]:[transform:rotateZ(-180deg)]
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:[transform:rotateZ(180deg)]
[&>input~span]:bg-[#fcebeb] 
[&>input:checked~span]:bg-[#ebfbfc] 
[&>input:checked~span]:[transform:rotateZ(180deg)]
`;
const effect7 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
${noKnot}
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:text-white [&>div]:before:opacity-100 [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:text-white [&>div]:after:text-left [&>div]:after:bg-[#03a9f4] [&>div]:after:opacity-0 [&>div]:after:px-[7px] [&>div]:after:py-[9px] [&>div]:after:left-[42px]
[&>div]:before:[transition:0.3s_ease_all] [&>div]:before:z-[2]
[&>div]:after:[transition:0.3s_ease_all] [&>div]:after:z-[2]
[&>div>span]:bg-[#f44336] [&>div>span]:[transition:0.2s_ease_all] [&>div>span]:z-[1] [&>div>span]:left-1
[&>input:checked+div]:before:opacity-0
[&>input:checked+div]:after:opacity-100
${divSpanDim}
[&>input:checked+div>span]:w-0.5 [&>input:checked+div>span]:h-0.5 [&>input:checked+div>span]:bg-white [&>input:checked+div>span]:p-[3px] [&>input:checked+div>span]:left-14 [&>input:checked+div>span]:top-3.5
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect8 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
${noKnot}
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:text-white [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:text-white [&>div]:after:bg-[#03a9f4] [&>div]:after:opacity-0 [&>div]:after:left-[42px]
[&>div]:before:z-[2]
[&>div]:after:z-[2]
[&>div>span]:bg-[#f44336] [&>div>span]:z-[1] [&>div>span]:left-1
${divSpanDim}

[&>input:checked+div]:before:opacity-0
[&>input:checked+div]:after:opacity-100
[&>input+div>span]:bg-[#f44336] 
[&>input:checked+div>span]:bg-[#ebfbfc] 
[&>input:checked+div>span]:scale-[4]
`;
const effect9 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:-right-6
[&>div]:before:text-white [&>div]:before:z-[2]
[&>div]:after:text-white [&>div]:after:z-[2]
[&>div>span]:bg-[#f44336] [&>div>span]:z-[1] [&>div>span]:left-1
${divSpanDim}

[&>input:checked+div]:before:-left-6
[&>input:checked+div]:after:right-1
[&>input:checked+div>span]:bg-[#03a9f4] [&>input:checked+div>span]:left-[42px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect10 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[4px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:bg-[#f44336] [&>div]:before:left-1 [&>div]:text-[white] 
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:text-[#4e4e4e] [&>div]:after:right-1
[&>div>span]:inline-block [&>div>span]:text-white [&>div>span]:z-[1] [&>div>span]:left-1
[&>input:checked+div>span]:text-[#4e4e4e]
[&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:left-[42px]
[&>div>span]:before:content-[attr(data-tg-off)] [&>div]:before:z-[10] [&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div>span]:before:relative 
[&>input:checked+div]:after:text-white
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect11 = `
${layer}
overflow-visible
[&>div]:[perspective:70px]
[&>div]:before:absolute [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px]
[&>div]:after:text-[#4e4e4e] [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:px-1 [&>div]:after:py-[9px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:right-1
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:bg-[#f44336] [&>div>span]:origin-[0%_50%] [&>div>span]:[transition:0.6s_ease_all] [&>div>span]:z-[1] [&>div>span]:right-1 [&>div>span]:[transform:rotateY(0)]
[&>input:checked+div>span]:bg-[#03a9f4] [&>input:checked+div>span]:[transform:rotateY(-180deg)]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect12 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div>span]:before:absolute [&>div>span]:before:text-[10px] [&>div>span]:before:font-bold [&>div>span]:before:text-center [&>div>span]:before:leading-none [&>div>span]:before:[transition:0.3s_ease_all] [&>div>span]:before:rounded-sm [&>div>span]:before:top-[2px]
[&>div>span]:after:absolute [&>div>span]:after:text-[10px] [&>div>span]:after:font-bold [&>div>span]:after:text-center [&>div>span]:after:leading-none [&>div>span]:after:[transition:0.3s_ease_all] [&>div>span]:after:rounded-sm [&>div>span]:after:top-[2px]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:right-1
[&>div]:before:w-[27px] [&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1] [&>div]:before:px-[3px] [&>div]:before:py-[9px]
[&>div]:after:w-[27px] [&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1] [&>div]:after:px-[3px] [&>div]:after:py-[9px]
[&>div>span]:inline-block [&>div>span]:z-[2] [&>div>span]:before:bg-[#03a9f4] [&>div>span]:before:-left-7 [&>div>span]:after:right-[-42px] [&>div>span]:after:bg-[#f44336]
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:px-1 [&>div>span]:py-[9px]
[&>div>span]:before:w--[2rem] [&>div>span]:before:h-[2rem] [&>div>span]:before:px-1 [&>div>span]:before:py-[9px]
[&>div>span]:after:w-[2rem] [&>div>span]:after:h-[2rem] [&>div>span]:after:px-1 [&>div>span]:after:py-[9px]
[&>div>span]:before:content-[''] [&>div>span]:before:top-0
[&>div>span]:after:content-[''] [&>div>span]:after:top-0
[&>input:checked+div>span]:before:left-1 [&>input:checked+div>span]:before:w-[2rem]
[&>input:checked+div>span]:after:right-[-74px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect13 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1]
[&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:right-1
[&>div>span]:w-[2rem] [&>div>span]:bg-[#f44336] [&>div>span]:z-[2] [&>div>span]:left-[37px]
[&>input:checked+div>span]:bg-[#03a9f4] [&>input:checked+div>span]:left-1
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect14 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:before:absolute [&>div>span]:before:w-[2rem] [&>div>span]:before:h-[2rem] [&>div>span]:before:text-[10px] [&>div>span]:before:font-bold [&>div>span]:before:text-center [&>div>span]:before:leading-none [&>div>span]:before:[transition:0.3s_ease_all] [&>div>span]:before:px-1 [&>div>span]:before:py-[9px] [&>div>span]:before:rounded-sm
[&>div>span]:after:absolute [&>div>span]:after:w-[2rem] [&>div>span]:after:h-[2rem] [&>div>span]:after:text-[10px] [&>div>span]:after:font-bold [&>div>span]:after:text-center [&>div>span]:after:leading-none [&>div>span]:after:[transition:0.3s_ease_all] [&>div>span]:after:px-1 [&>div>span]:after:py-[9px] [&>div>span]:after:rounded-sm [&>div>span]:after:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1]
[&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1]
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:right-1
[&>div>span]:block [&>div>span]:w-full [&>div>span]:h-full [&>div>span]:left-0 [&>div>span]:top-0 [&>div>span]:before:bg-[#03a9f4] [&>div>span]:before:left-1 [&>div>span]:before:-top-7 [&>div>span]:after:bg-[#f44336] [&>div>span]:after:left-[39px] [&>div>span]:after:top-[2px]
[&>div>span]:before:content-[''] [&>div>span]:before:w-[2rem] [&>div>span]:before:z-[2]
[&>div>span]:after:content-[''] [&>div>span]:after:w-[2rem] [&>div>span]:after:z-[2]
[&>input:checked+div>span]:before:top-[2px]
[&>input:checked+div>span]:after:-top-8
[&>div>span]:before:-top-8
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect15 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:opacity-100 [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:scale-100 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:opacity-0 [&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:scale-100 [&>div]:after:top-[2px]
${noKnot}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:bg-[#f44336] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-on)] [&>div]:after:opacity-0 [&>div]:after:bg-[#03a9f4] [&>div]:after:scale-[4] [&>div]:after:right-1
[&>input:checked+div]:before:opacity-0 [&>input:checked+div]:before:scale-[4]
[&>input:checked+div]:after:opacity-100 [&>input:checked+div]:after:scale-100
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect16 = `
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:bg-[#f44336] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:left-1 [&>div]:before:top-[2px] [&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
${yesKnot}
[&>input:active+div]:before:w-[46px]
${noKnot}
[&>input:checked:active+div]:before:ml-[-26px]
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:bg-[#03a9f4] [&>input:checked+div]:before:left-[42px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect17 = `
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div>span]:content-[attr(data-tg-off)] [&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:left-1 [&>div>span]:top-[2px]
[&>div]:before:z-[2] [&>div]:before:[transition:0.3s_ease_all,left_0.5s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>div>span]:bg-[#f44336] [&>div>span]:z-[1] [&>div>span]:rounded-sm [&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:left-[42px]
[&>input:checked+div>span]:bg-[#03a9f4] [&>input:checked+div>span]:left-[42px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const effect18 = `
${layer}
[&>div]:before:content-[attr(data-tg-off)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:rounded-sm [&>div]:before:left-1
[&>div>span]:content-[attr(data-tg-off)] [&>div>span]:absolute [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:bg-[#f44336] [&>div>span]:rounded-sm [&>div>span]:left-1 
[&>div]:before:mt-[-5px] [&>div]:before:bg-transparent [&>div]:before:z-[2] [&>div]:before:left-2 [&>div]:before:top-[45%]
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:z-[1] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:active+div]:before:w-[46px] [&>input:active+div]:before:h-1 [&>input:active+div]:before:text-transparent [&>input:active+div]:before:bg-[#d80000] [&>input:active+div]:before:[transition:0.3s_ease_all] [&>input:active+div]:before:overflow-hidden [&>input:active+div]:before:-mt-0.5 [&>input:active+div]:before:left-2.5
[&>input:active+div>span]:w-[68px]
[&>input:checked:active+div]:before:bg-[#0095d8] [&>input:checked:active+div]:before:left-auto [&>input:checked:active+div]:before:right-2.5
[&>input:checked:active+div>span]:ml-[-38px]
[&>input:checked+div]:before:content-[attr(data-tg-on)] [&>input:checked+div]:before:left-[47px]
[&>input:checked+div>span]:bg-[#03a9f4] [&>input:checked+div>span]:left-[42px]
[&>input~span]:bg-[#fcebeb]
[&>input:checked~span]:bg-[#ebfbfc]
`;
const iinput = `
${layer}
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&_*]:box-border [&_*]:after:box-border [&_*]:before:box-border [&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:after:left-0 [&>label]:[outline:0]
[&>label]:after:relative [&>label]:after:block [&>label]:after:w-6/12 [&>label]:after:h-full
[&>label]:before:relative [&>label]:before:w-6/12 [&>label]:before:h-full
[&>input:checked~label]:after:left-2/4
`;
const ilabel = `
[&>label]:after:content-[attr(data-tg-on)] [&>label]:after:flex [&>label]:after:justify-center [&>label]:after:align-center
[&>input:checked~label]:after:content-[attr(data-tg-off)] [&>input:checked~label]:after:flex [&>input:checked~label]:after:justify-center [&>input:checked~label]:after:align-center
`;
const light = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.4s_ease] [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:rounded-[50%] 
[&>label]:bg-[#f0f0f0]
[&>label]:after:bg-[#fff]
[&>input:checked~label]:bg-[#9fd6ae]
${ilabel}
`;
const ios = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.4s_ease] [&>label]:border [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:border-solid [&>label]:border-[#e8eae9] [&>label]:after:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_0_rgba(0,0,0,0.08)] [&>label]:after:rounded-[2em] [&>label]:hover:after:will-change-[padding] [&>label]:active:shadow-[inset_0_0_0_2em_#e8eae9] [&>label]:active:after:pr-[0.8em] 
[&>label]:after:bg-[#fbfbfb] [&>label]:after:[transition:left_0.3s_cubic-bezier(0.175,0.885,0.32,1.275),padding_0.3s_ease,margin_0.3s_ease]
[&>input:checked~label]:bg-[#86d993]
[&>input:checked~label]:active:shadow-none
[&>input:checked~label]:active:after:ml-[-0.8em]
${ilabel}
`;
const skewed = `mx-[2em] my-0
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&>input]:[&_*]:box-border [&>input]:[&_*]:after:box-border [&>input]:[&_*]:before:box-border [&>input]:[&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:[outline:0]
[&>label]:after:h-full
[&>label]:before:h-full

[&>label]:overflow-hidden [&>label]:skew-x-[-10deg] [&>label]:[transition:all_0.2s_ease] [&>label]:before:content-[attr(data-tg-on)] [&>label]:after:left-full [&>input:checked~label]:after:content-[attr(data-tg-off)] [&>label]:before:left-0 [&>label]:active:before:left-[-10%]
[&>label]:[backface-visibility:hidden] [&>label]:font-sans [&>label]:bg-[#888]
[&>label]:after:skew-x-[10deg] [&>label]:after:inline-block [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:w-full [&>label]:after:text-center [&>label]:after:absolute [&>label]:after:leading-[2em] [&>label]:after:font-bold [&>label]:after:text-white [&>label]:after:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]
[&>label]:before:skew-x-[10deg] [&>label]:before:inline-block [&>label]:before:[transition:all_0.2s_ease] [&>label]:before:w-full [&>label]:before:text-center [&>label]:before:absolute [&>label]:before:leading-[2em] [&>label]:before:font-bold [&>label]:before:text-white [&>label]:before:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]
[&>label]:active:bg-[#888]
[&>input:checked~label]:bg-[#86d993]
[&>input:checked~label]:before:left-full
[&>input:checked~label]:after:left-0
[&>input:checked~label]:active:after:left-[10%]
`;
const flat = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.2s_ease] [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:border-4 [&>label]:border-solid [&>label]:border-[#f2f2f2] [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:content-[''] [&>label]:after:rounded-[1em] [&>label]:bg-[#fff]
[&>label]:after:bg-[#f2f2f2]
[&>input:checked~label]:border-4 [&>input:checked~label]:border-solid [&>input:checked~label]:border-[#7fc6a6] [&>input:checked~label]:after:left-2/4
[&>input:checked~label]:after:bg-[#7fc6a6]
${ilabel} [&>input:checked~label]:after:text-[80%] [&>label]:after:text-[80%]
`;
const flip = `mx-[2em] my-0
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&>input]:[&_*]:box-border [&>input]:[&_*]:after:box-border [&>input]:[&_*]:before:box-border [&>input]:[&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:[outline:0]
[&>label]:before:h-full

[&>label]:[transition:all_0.2s_ease] [&>label]:p-0.5 [&>label]:before:content-[attr(data-tg-on)] [&>label]:font-sans [&>label]:[perspective:100px]
[&>label]:before:inline-block [&>label]:before:[transition:all_0.4s_ease] [&>label]:before:w-full [&>label]:before:text-center [&>label]:before:leading-[2em] [&>label]:before:font-bold [&>label]:before:text-white [&>label]:before:absolute [&>label]:before:rounded [&>label]:before:left-0 [&>label]:before:top-0 [&>label]:before:[backface-visibility:hidden]

[&>label]:before:bg-[#ff3a19]
[&>label]:active:before:[transform:rotateY(-20deg)]
[&>input:checked~label]:before:[transform:rotateY(180deg)]
[&>input:checked~label]:after:left-0 [&>input:checked~label]:after:[transform:rotateY(0)] [&>input:checked~label]:after:bg-[#7fc6a6]
[&>input:checked~label:active:after:[transform:rotateY(20deg)]

[&>label]:after:h-full
[&>label]:after:bg-[#02c66f] [&>label]:after:[transform:rotateY(-180deg)]
[&>label]:after:content-[attr(data-tg-off)]
[&>label]:after:inline-block [&>label]:after:[transition:all_0.4s_ease] [&>label]:after:w-full [&>label]:after:text-center [&>label]:after:leading-[2em] [&>label]:after:font-bold [&>label]:after:text-white [&>label]:after:absolute [&>label]:after:rounded [&>label]:after:left-0 [&>label]:after:top-0 [&>label]:after:[backface-visibility:hidden]

`;
const Collapse = (props) => {
  const { className, background = true, children, open: op, class: cls } = props;
  const open2 = isObservable(op) ? op : observable(op);
  const ref = observable();
  const opened = memo(() => get(open2) && get(ref) ? { height: get(ref).clientHeight + "px" } : { height: 0 });
  return /* @__PURE__ */ jsx(
    "div",
    {
      class: [
        "overflow-hidden transition-height duration-200 ease-in-out",
        () => background ? "bg-[#ccc]" : "",
        cls ?? className
      ],
      style: opened,
      ...props,
      children: /* @__PURE__ */ jsx(
        "div",
        {
          class: "h-fit",
          ref,
          children
        }
      )
    }
  );
};
const Checkbox = (props) => {
  const { type, labelPosition = "left", children, className, ...otherProps } = props;
  const id = nanoid(8);
  const before = memo(
    () => get(labelPosition) === "left" || get(labelPosition) === "top" ? /* @__PURE__ */ jsx(
      "label",
      {
        className: "pr-1.5 select-none ",
        for: id,
        children
      }
    ) : null
  );
  const after = memo(
    () => get(labelPosition) === "right" || get(labelPosition) === "bottom" ? /* @__PURE__ */ jsx(
      "label",
      {
        className: "select-none",
        for: id,
        children
      }
    ) : null
  );
  const line = memo(() => get(labelPosition) === "top" || get(labelPosition) === "bottom" ? /* @__PURE__ */ jsx("br", {}) : null);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className, children: [
    before,
    line,
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        ...otherProps
      }
    ),
    line,
    after
  ] }) });
};
const SideBar = ({ children, className, contentRef, width: w = observable("300px"), disableBackground, open: open2 = observable(false), class: cls, ...props }) => {
  const width2 = memo(() => get(open2) ? get(w) : 0);
  effect(() => {
    if (!get(contentRef)) return;
    get(contentRef).style.marginLeft = get(width2) + "";
    get(contentRef).style.transition = "margin-left .5s";
  });
  return [
    /* @__PURE__ */ jsx("div", { class: "h-full w-0 fixed overflow-x-hidden transition-[0.5s] left-0 top-0", style: { width: width2 }, children }),
    /* @__PURE__ */ jsx(
      "div",
      {
        class: ["absolute h-full w-full z-[999] bg-[#000] opacity-50", () => get(disableBackground) && get(open2) ? "visible" : "hidden"],
        onClick: () => open2((p) => !p),
        style: { height: () => {
          var _a;
          return (_a = get(contentRef)) == null ? void 0 : _a.offsetHeight;
        } }
      }
    )
  ];
};
const MenuItem = tw("a")`flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300 cursor-pointer`;
const MenuText = tw("span")`ml-3 text-sm font-medium`;
const btn = `
bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none]
disabled:bg-[#d9dbda]
`;
const NumberField = (props) => {
  const { className, class: cls, children, onChange, noMinMax, onKeyUp, reactive, noRotate = false, noFix, ...otherProps } = props;
  const { min, max, value: value2, step, disabled } = otherProps;
  const inputRef = observable();
  const error = () => get(value2) < get(min) || get(value2) > get(max);
  const cantMin = () => get(value2) <= get(min) && get(noRotate);
  const cantMax = () => get(value2) >= get(max) && get(noRotate);
  let pvalue;
  const updated = () => {
    if (pvalue === +get(value2)) return;
    if (get(noFix) && get(noRotate)) return;
    if (+get(value2) < +get(min))
      isObservable(value2) && value2(get(noRotate) ? +get(min) : +get(max));
    if (+get(value2) > +get(max))
      isObservable(value2) && value2(get(noRotate) ? +get(max) : +get(min));
    pvalue = +get(value2);
  };
  effect(updated);
  const dec = () => {
    !get(reactive) && isObservable(value2) ? value2 == null ? void 0 : value2(+get(inputRef).value - +get(step)) : void 0;
    updated();
  };
  const inc = () => {
    !get(reactive) && isObservable(value2) ? value2 == null ? void 0 : value2(+get(inputRef).value + +get(step)) : void 0;
    updated();
  };
  let interval;
  let timeout;
  function startContinuousUpdate(isIncrement) {
    isIncrement ? inc() : dec();
    timeout = useTimeout(() => interval = useInterval(() => isIncrement ? inc() : dec(), 100), 200);
  }
  function stopUpdate() {
    timeout == null ? void 0 : timeout();
    interval == null ? void 0 : interval();
  }
  return /* @__PURE__ */ jsx("div", { class: ["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", className, cls], children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        class: btn,
        onPointerDown: () => startContinuousUpdate(false),
        onPointerUp: stopUpdate,
        onPointerLeave: stopUpdate,
        disabled: cantMin,
        children: "-"
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        class: [`quantity  [-webkit-appearance:textfield] [-moz-appearance:textfield] [appearance:textfield]
        [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none]
        text-center p-2 border-solid border-[0_2px]
        `, () => get(error) ? "text-[red]" : ""],
        type: "number",
        value: value2,
        onChange: (e) => {
          !get(reactive) && isObservable(value2) ? (value2 == null ? void 0 : value2(e.target.value), onChange == null ? void 0 : onChange(e)) : void 0;
          updated();
        },
        onKeyUp: (e) => {
          !get(reactive) && isObservable(value2) ? (value2 == null ? void 0 : value2(e.target.value), onKeyUp == null ? void 0 : onKeyUp(e)) : void 0;
          updated();
        },
        onWheel: (e) => {
          e.preventDefault();
          Math.sign(e.deltaY) > 0 ? dec() : inc();
        },
        ...otherProps,
        disabled
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        class: [btn, "plus"],
        onPointerDown: () => startContinuousUpdate(true),
        onPointerUp: stopUpdate,
        onPointerLeave: stopUpdate,
        disabled: cantMax,
        children: "+"
      }
    )
  ] });
};
const handlers = /* @__PURE__ */ new Map();
function useEventListener(element, eventName, handler, options2) {
  return effect(() => {
    const targetElement = get(element) ?? window;
    if (!(targetElement && targetElement.addEventListener)) return void 0;
    if (!handlers.has(targetElement)) {
      handlers.set(targetElement, /* @__PURE__ */ new Map());
    }
    const dict = handlers.get(targetElement);
    if (!dict.has(eventName.toLowerCase()) && dict.get(eventName) !== handler) {
      targetElement.addEventListener(eventName.toLowerCase(), handler, options2);
      dict.set(eventName.toLowerCase(), handler);
      return () => {
        targetElement.removeEventListener(eventName.toLowerCase(), handler, options2);
      };
    }
    return () => {
    };
  });
}
const useIsomorphicLayoutEffect = effect;
const getScreen = () => {
  if (typeof window !== "undefined" && window.screen) {
    return window.screen;
  }
  return void 0;
};
observable(getScreen());
observable(0);
observable(0);
const width = observable(0);
const height = observable(0);
const offsetLeft = observable(0);
const offsetTop = observable(0);
const pageLeft = observable(0);
const pageTop = observable(0);
const scale = observable(0);
const handleSize = () => {
  width(visualViewport.width);
  height(visualViewport.height);
  offsetLeft(visualViewport.offsetLeft);
  offsetTop(visualViewport.offsetTop);
  pageLeft(visualViewport.pageLeft);
  pageTop(visualViewport.pageTop);
  scale(visualViewport.scale);
};
function useViewportSize() {
  useEventListener(visualViewport, "resize", handleSize);
  useEventListener(window, "pointermove", handleSize);
  useEventListener(window, "pointercancel", handleSize);
  useEventListener(window, "pointerleave", handleSize);
  useEventListener(window, "pointerout", handleSize);
  useEventListener(window, "pointerup", handleSize);
  useEventListener(document, "wheel", handleSize);
  useEventListener(document, "scroll", handleSize);
  useIsomorphicLayoutEffect(() => {
    handleSize();
  });
  return {
    width,
    height,
    offsetLeft,
    offsetTop,
    pageLeft,
    pageTop,
    scale
  };
}
function useClickAway(ref, clickEvent) {
  effect(() => {
    const handleClickOutside = (event) => {
      if (get(ref) && !get(ref).contains(event.target))
        clickEvent();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
}
createContext();
function useLocation() {
  const location = observable(window.location);
  effect(() => {
    const handleLocationChange = () => location({ ...window.location });
    window.addEventListener("popstate", handleLocationChange);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  });
  return location;
}
observable(0);
observable();
window.getSelection();
observable();
observable(0);
observable();
observable(0);
observable(true);
observable(0);
observable("");
observable([]);
const l = useLocation();
memo(() => get(l).host.toLowerCase().includes("localhost"));
const use = (val, def) => {
  if (isObservable(val))
    return val;
  if (typeof val !== "undefined")
    return observable(val);
  if (!def) return observable();
  if (isObservable(def))
    return def;
  return observable(def);
};
const ZoomableContext = createContext();
const useZoomable = () => useContext(ZoomableContext);
const Zoomable = ({ minScale = 1, maxScale = 5, class: cls = "relative w-full h-[400px] overflow-hidden touch-none", children, ...props }) => {
  const containerRef = observable(null);
  const ref = observable(null);
  const scale2 = observable(1);
  const translateX = observable(0);
  const translateY = observable(0);
  const isDown = observable(false);
  const startX = observable(0);
  const startY = observable(0);
  const lastX = observable(0);
  const lastY = observable(0);
  const pointers = observable([]);
  const clamp = (value2) => Math.max(get(minScale), Math.min(get(maxScale), value2));
  const calculateDistance = (p1, p2) => Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
  const handlePointerDown = (e) => {
    e.preventDefault();
    const updatedPointers = [...get(pointers), e];
    isDown(true);
    startX(e.clientX);
    startY(e.clientY);
    lastX(e.clientX);
    lastY(e.clientY);
    pointers(updatedPointers);
  };
  const handlePointerUp = (e) => {
    const remainingPointers = get(pointers).filter((p) => p.pointerId !== e.pointerId);
    isDown(remainingPointers.length > 0);
    startX(0);
    startY(0);
    lastX(remainingPointers.length > 0 ? remainingPointers[0].clientX : 0);
    lastY(remainingPointers.length > 0 ? remainingPointers[0].clientY : 0);
    pointers(remainingPointers);
  };
  const handleWheel = (e) => {
    var _a;
    e.preventDefault();
    const rect = (_a = get(containerRef)) == null ? void 0 : _a.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = clamp(get(scale2) * delta);
    const scaleRatio = newScale / get(scale2);
    scale2(newScale);
    translateX(mouseX - (mouseX - get(translateX)) * scaleRatio);
    translateY(mouseY - (mouseY - get(translateY)) * scaleRatio);
  };
  const handlePointerMove = (e) => {
    var _a;
    if (get(pointers).length > 1) {
      const rect = (_a = get(containerRef)) == null ? void 0 : _a.getBoundingClientRect();
      if (!rect) return;
      const currentPointers = get(pointers).map(
        (p) => p.pointerId === e.pointerId ? e : p
      );
      const currentDistance = calculateDistance(currentPointers[0], currentPointers[1]);
      const initialDistance = calculateDistance(get(pointers)[0], get(pointers)[1]);
      const centerX = (currentPointers[0].clientX + currentPointers[1].clientX) / 2 - rect.left;
      const centerY = (currentPointers[0].clientY + currentPointers[1].clientY) / 2 - rect.top;
      const newScale = clamp(get(scale2) * (currentDistance / initialDistance));
      translateX(centerX - (centerX - get(translateX)) * (newScale / get(scale2)));
      translateY(centerY - (centerY - get(translateY)) * (newScale / get(scale2)));
      scale2(newScale);
      pointers(currentPointers);
    } else if (get(isDown) && get(pointers).length === 1) {
      const deltaX = e.clientX - get(lastX);
      const deltaY = e.clientY - get(lastY);
      translateX(get(translateX) + deltaX);
      translateY(get(translateY) + deltaY);
      lastX(e.clientX);
      lastY(e.clientY);
    }
  };
  const adjustTransformOnResize = /* @__PURE__ */ (() => {
    let previousRect = null;
    return () => {
      const container = get(containerRef);
      if (!container) return;
      const currentRect = container.getBoundingClientRect();
      if (!previousRect) {
        previousRect = currentRect;
        return;
      }
      const scaleRatioX = currentRect.width / previousRect.width;
      const scaleRatioY = currentRect.height / previousRect.height;
      translateX(get(translateX) * scaleRatioX);
      translateY(get(translateY) * scaleRatioY);
      previousRect = currentRect;
    };
  })();
  useEventListener(window, "resize", adjustTransformOnResize);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      class: cls,
      ...props,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onWheel: handleWheel,
      children: /* @__PURE__ */ jsx(ZoomableContext.Provider, { value: { style: { transform: memo(() => `translate(${get(translateX)}px, ${get(translateY)}px) scale(${get(scale2)})`) }, ref, translateX, translateY, scale: scale2 }, children })
    }
  );
};
const Img = ({ style: s, ref: r, class: cls = "absolute w-full h-full object-contain origin-top-left cursor-grab select-none pointer-events-none", ...props }) => {
  const { style, ref } = useZoomable();
  effect(() => {
    if (!get(ref)) return;
    get(ref).style.transform = get(style.transform);
  });
  return /* @__PURE__ */ jsx("img", { ref: [ref, r], class: cls, ...props });
};
const ToggleButton = ({
  children,
  className,
  class: cls,
  onClass = "text-[#1976d2] bg-[rgba(25,118,210,0.08)] hover:bg-[rgba(25,118,210,0.12)]",
  offClass = "text-[rgba(0,0,0,0.54)] hover:no-underline hover:bg-[rgba(0,0,0,0.04)]",
  checked = observable(false),
  ...props
}) => /* @__PURE__ */ jsx(
  "button",
  {
    onClick: () => isObservable(checked) && checked((c) => !c),
    class: [
      `rounded-tr-none rounded-br-none`,
      `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle leading-[1.75] tracking-[0.02857em] uppercase border m-0 border-[rgba(0,0,0,0.12)]`,
      `[outline:0]`,
      () => get(checked) ? onClass : offClass,
      className,
      cls
    ],
    ...props,
    children
  }
);
const ActiveWheelers = observable([]);
const Wheeler = (props) => {
  const {
    options: options2,
    itemHeight: ih,
    itemCount: vic,
    value: oriValue,
    class: cls,
    header,
    ok: ok2,
    visible = observable(true),
    mask,
    bottom = get(mask),
    all,
    cancelOnBlur,
    commitOnBlur,
    changeValueOnClickOnly
  } = props;
  const itemHeight = use(ih, 36);
  const itemCount2 = use(vic, 5);
  const value2 = observable(get(oriValue));
  effect(() => {
    value2(get(oriValue));
  });
  const CLICK_THRESHOLD_PX = 5;
  const checkboxes = observable({});
  const paddingItemCount = observable(0);
  let minTranslateY = 0;
  let maxTranslateY = 0;
  const selectedIndex = observable(-1);
  let currentY = 0;
  let startY = 0;
  let startTranslateY = 0;
  let startTime = 0;
  let isDragging = false;
  let hasMoved = false;
  const rafId = observable(0);
  let velocity = 0;
  let lastMoveTime = 0;
  let lastMoveY = 0;
  let wheelSnapTimeoutId = observable(0);
  const viewport = observable();
  const list = observable();
  const eventType = observable();
  const multiple = all;
  let preOptions, preFormattedOptions;
  const formattedOptions = memo(() => {
    if (preOptions === get(options2)) return preFormattedOptions;
    const base = get(options2).map((opt) => {
      const o = typeof opt === "object" && opt !== null ? opt : { value: opt, label: String(opt) };
      if (!("hasComponent" in o))
        o.hasComponent = !!o.component;
      return o;
    });
    if (get(multiple)) {
      base.unshift({ value: get(multiple), label: get(multiple), hasComponent: false });
      const r = {};
      base.map((opt) => r[opt.label] = observable(false));
      checkboxes(r);
      const vs = [...[get(value2)]].flat();
      let allInitiallyChecked = true;
      base.forEach((opt) => {
        const isSelected = vs.some((sv) => sv === opt.value);
        r[opt.label](isSelected);
        if (opt.label !== get(multiple) && !isSelected) {
          allInitiallyChecked = false;
        }
      });
      if (r[get(multiple)]) {
        r[get(multiple)](allInitiallyChecked && base.length > 1);
      }
      base.forEach((o, index) => o.component = o.hasComponent ? o.component : (props2) => /* @__PURE__ */ jsx(
        "li",
        {
          class: ["wheeler-item", "text-black"],
          "data-index": index,
          "data-value": o.value,
          style: { height: () => `${get(itemHeight)}px` },
          children: () => {
            const isChecked = get(checkboxes)[o.label];
            return /* @__PURE__ */ jsx("label", { class: "flex items-center gap-2 px-2", children: [
              /* @__PURE__ */ jsx("input", { class: "pl-2", onClick: (e) => {
                isChecked(!get(isChecked));
                chk2value(o.label);
              }, type: "checkbox", checked: get(isChecked), readonly: true }),
              /* @__PURE__ */ jsx("span", { class: ["pl-5 w-full"], children: o.label })
            ] });
          }
        }
      ));
    } else {
      base.forEach((o, index) => o.component = o.hasComponent ? o.component : () => /* @__PURE__ */ jsx(
        "li",
        {
          class: ["wheeler-item", pickerItemCls, "text-[#555] opacity-60 "],
          "data-index": index,
          "data-value": o.value,
          style: { height: () => `${get(itemHeight)}px` },
          children: o.label
        }
      ));
    }
    preOptions = get(options2);
    return preFormattedOptions = base;
  });
  const chkValues = () => {
    const vs = new Set([get(value2)].flat());
    const os = get(formattedOptions);
    const cb = get(checkboxes);
    const cbv = new Set(
      Object.entries(cb).filter(([_, active]) => get(active)).map(([label]) => label)
    );
    const onlyInCheckbox = os.filter((opt) => get(cb[opt.label]) && !vs.has(opt.value) && opt.label !== get(multiple)).map((opt) => opt.value);
    const onlyInValue = [...vs].filter((val) => {
      const opt = os.find((o) => o.value === val);
      return opt ? !get(cbv.has(opt.label)) : true;
    });
    return { onlyInCheckbox, onlyInValue };
  };
  effect(() => {
    if (!ok2) return;
    if (!get(ok2)) return;
    if (isObservable(oriValue))
      oriValue(get(value2));
    if (isObservable(ok2))
      ok2(false);
    if (isObservable(visible))
      visible(false);
  });
  let preValue;
  const value2chk = () => {
    if (!get(multiple)) return;
    if (get(visible) && preValue === get(value2)) {
      return;
    }
    const { onlyInCheckbox, onlyInValue } = chkValues();
    const os = get(formattedOptions);
    const c = get(checkboxes);
    const allLabel = get(multiple);
    let changed = false;
    for (const valFromProp of onlyInValue) {
      const opt = os.find((o) => o.value === valFromProp);
      if (opt && opt.label !== allLabel && c[opt.label]) {
        if (!get(c[opt.label])) {
          c[opt.label](true);
          changed = true;
        }
      }
    }
    for (const valFromCheckbox of onlyInCheckbox) {
      const opt = os.find((o) => o.value === valFromCheckbox);
      if (opt && opt.label !== allLabel && c[opt.label]) {
        if (get(c[opt.label])) {
          c[opt.label](false);
          changed = true;
        }
      }
    }
    if (allLabel && c[allLabel]) {
      const individualItemCheckboxes = Object.entries(c).filter(([key, _]) => key !== allLabel);
      const allIndividualsAreChecked = individualItemCheckboxes.length > 0 && individualItemCheckboxes.every(([_, obs]) => get(obs));
      if (get(c[allLabel]) !== allIndividualsAreChecked) {
        c[allLabel](allIndividualsAreChecked);
        changed = true;
      }
    }
    if (changed) {
      checkboxes({ ...c });
    }
    preValue = get(value2);
  };
  value2chk();
  effect(value2chk);
  const chk2value = (clickedLabel) => {
    if (!get(multiple)) return;
    const checkboxesMap = get(checkboxes);
    const allLabel = get(multiple);
    if (clickedLabel === allLabel) {
      const isAllCheckedNow = get(checkboxesMap[allLabel]);
      Object.entries(checkboxesMap).forEach(([key, obs]) => {
        obs(isAllCheckedNow);
      });
    } else {
      if (checkboxesMap[allLabel]) {
        const individualItems = Object.entries(checkboxesMap).filter(([key, _]) => key !== allLabel);
        const allIndividualsAreChecked = individualItems.length > 0 && individualItems.every(([_, obs]) => get(obs));
        if (get(checkboxesMap[clickedLabel])) {
          if (allIndividualsAreChecked) {
            checkboxesMap[allLabel](true);
          }
        } else {
          checkboxesMap[allLabel](false);
        }
      }
    }
    const { onlyInCheckbox, onlyInValue } = chkValues();
    if (onlyInCheckbox.length === 0 && onlyInValue.length === 0) {
      const newSelectedValues = /* @__PURE__ */ new Set();
      const currentFormattedOptions = get(formattedOptions);
      Object.entries(get(checkboxes)).forEach(([label, isCheckedObservable]) => {
        if (label !== allLabel && get(isCheckedObservable)) {
          const opt = currentFormattedOptions.find((o) => o.label === label);
          if (opt) {
            newSelectedValues.add(opt.value);
          }
        }
      });
      const finalNewValueArray2 = [...newSelectedValues];
      const oldValueJSON = JSON.stringify(get(value2));
      const newValueJSON = JSON.stringify(finalNewValueArray2);
      if (oldValueJSON !== newValueJSON) {
        value2(finalNewValueArray2);
        if (!ok2 && isObservable(oriValue)) {
          oriValue(get(value2));
        }
      }
      return;
    }
    const currentVal = get(value2);
    const currentValueFlat = Array.isArray(currentVal) ? currentVal.flat() : [currentVal];
    const currentValueAsSet = new Set(currentValueFlat);
    for (const v of onlyInValue) {
      currentValueAsSet.delete(v);
    }
    for (const v of onlyInCheckbox) {
      currentValueAsSet.add(v);
    }
    const finalNewValueArray = [...currentValueAsSet];
    value2(finalNewValueArray);
    if (!ok2) {
      if (isObservable(oriValue)) {
        oriValue(finalNewValueArray);
      }
    }
  };
  memo(() => {
    const allValues = get(formattedOptions).map((opt) => opt.value);
    return allValues.every((v) => get(get(checkboxes)[v]));
  });
  effect(() => {
    if (!get(formattedOptions)) return;
    if (typeof get(itemCount2) !== "number" || get(itemCount2) <= 0)
      itemCount2(3);
    if (get(itemCount2) % 2 === 0) {
      console.warn(`itemCount (${get(itemCount2)}) should be odd for symmetry. Adjusting to ${get(itemCount2) + 1}.`);
      itemCount2(get(itemCount2) + 1);
    }
    paddingItemCount(Math.floor(get(itemCount2) / 2));
    minTranslateY = _getTargetYForIndexUnbound(get(formattedOptions).length - 1);
    maxTranslateY = _getTargetYForIndexUnbound(0);
    snapToIndex(get(selectedIndex));
  });
  const viewportHeight = memo(() => get(itemHeight) * get(itemCount2));
  const indicatorTop = memo(() => (get(viewportHeight) - get(itemHeight)) / 2);
  function _getTargetYForIndexUnbound(index) {
    return get(indicatorTop) - (index + get(paddingItemCount)) * get(itemHeight);
  }
  function getTargetYForIndex(index) {
    return get(indicatorTop) - (index + get(paddingItemCount)) * get(itemHeight);
  }
  const pickerItemCls = "apply h-9 flex items-center justify-center text-base box-border transition-opacity duration-[0.3s,transform] delay-[0.3s] select-none scale-90";
  function* populateList() {
    for (let i = 0; i < get(paddingItemCount); i++)
      yield /* @__PURE__ */ jsx("li", { class: ["wheeler-item is-padding invisible", pickerItemCls], style: { height: () => `${get(itemHeight)}px` } });
    if (get(formattedOptions))
      for (const [index, option] of get(formattedOptions).entries())
        yield /* @__PURE__ */ jsx(option.component, { ...{ index, value: option, itemHeight } });
    for (let i = 0; i < get(paddingItemCount); i++)
      yield /* @__PURE__ */ jsx("li", { class: ["wheeler-item is-padding invisible", pickerItemCls], style: { height: `${get(itemHeight)}px` } });
  }
  function setTranslateY(y) {
    if (!get(list)) return;
    currentY = Math.max(minTranslateY, Math.min(maxTranslateY, y));
    get(list).style.transform = `translateY(${currentY}px)`;
    updateItemStyles();
  }
  let snapToIndexTimeout = 0;
  function snapToIndex(index, immediate = false, eventType2) {
    if (!get(list)) return;
    if (get(multiple)) return;
    const clampedIndex = Math.max(0, Math.min(index, get(formattedOptions).length - 1));
    const targetY = getTargetYForIndex(clampedIndex);
    if (immediate) {
      get(list).style.transition = "none";
    } else {
      get(list).style.transition = "transform 0.3s ease-out";
    }
    setTranslateY(targetY);
    const timeoutDuration = immediate ? 10 : 310;
    if (snapToIndexTimeout !== 0) {
      clearTimeout(snapToIndexTimeout);
      snapToIndexTimeout = 0;
    }
    snapToIndexTimeout = setTimeout(() => {
      if (get(list).style.transition === "none") {
        get(list).style.transition = "transform 0.3s ease-out";
      }
      if (get(selectedIndex) !== clampedIndex) {
        selectedIndex(clampedIndex);
      }
      updateItemStyles();
      snapToIndexTimeout = 0;
    }, timeoutDuration);
  }
  function updateItemStyles() {
    if (get(multiple)) return;
    const centerViewportY = get(viewportHeight) / 2;
    const listItems = get(list).querySelectorAll(".wheeler-item:not(.is-padding)");
    listItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const viewportRect = get(viewport).getBoundingClientRect();
      const itemCenterRelativeToViewport = (itemRect.top + itemRect.bottom) / 2 - viewportRect.top;
      const distanceFromCenter = Math.abs(itemCenterRelativeToViewport - centerViewportY);
      if (distanceFromCenter < get(itemHeight) * 0.6) {
        item.classList.add("is-near-center", "opacity-100", "font-bold", "text-[#007bff]", "scale-100");
      } else {
        item.classList.remove("is-near-center", "opacity-100", "font-bold", "text-[#007bff]", "scale-100");
      }
    });
  }
  function getClientY(e) {
    if (e.type === "touchend" || e.type === "touchcancel") {
      return e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientY : startY;
    }
    return e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
  }
  function handleStart(e) {
    if (get(wheelSnapTimeoutId)) {
      clearTimeout(get(wheelSnapTimeoutId));
      wheelSnapTimeoutId(null);
    }
    if (e.type !== "touchstart") e.preventDefault();
    isDragging = true;
    hasMoved = false;
    startY = getClientY(e);
    startTranslateY = currentY;
    startTime = Date.now();
    lastMoveY = startY;
    lastMoveTime = startTime;
    velocity = 0;
    eventType(e.type);
    get(list).style.transition = "none";
    get(viewport).style.cursor = "grabbing";
    if (get(rafId)) cancelAnimationFrame(get(rafId));
  }
  function handleMove(e) {
    if (!isDragging) return;
    const currentMoveY = getClientY(e);
    const deltaY = currentMoveY - startY;
    if (!hasMoved && Math.abs(deltaY) > CLICK_THRESHOLD_PX) {
      hasMoved = true;
    }
    if (hasMoved && e.cancelable) {
      e.preventDefault();
    }
    let newY = startTranslateY + deltaY;
    if (hasMoved) {
      if (newY > maxTranslateY) {
        newY = maxTranslateY + (newY - maxTranslateY) * 0.3;
      } else if (newY < minTranslateY) {
        newY = minTranslateY + (newY - minTranslateY) * 0.3;
      }
    }
    const now = Date.now();
    const timeDiff = now - lastMoveTime;
    if (timeDiff > 10) {
      velocity = (currentMoveY - lastMoveY) / timeDiff;
      lastMoveTime = now;
      lastMoveY = currentMoveY;
    }
    if (get(rafId)) {
      cancelAnimationFrame(get(rafId));
    }
    rafId(requestAnimationFrame(() => {
      currentY = newY;
      get(list).style.transform = `translateY(${currentY}px)`;
      updateItemStyles();
    }));
  }
  function handleEnd(e) {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    get(viewport).style.cursor = "grab";
    if (get(rafId)) {
      cancelAnimationFrame(get(rafId));
    }
    if (!hasMoved) {
      const targetElement = e.target;
      const targetItem = targetElement.closest(".wheeler-item");
      if (targetItem && !targetItem.classList.contains("is-padding")) {
        const clickedIndex = parseInt(targetItem.dataset.index, 10);
        if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < get(formattedOptions).length) {
          snapToIndex(clickedIndex);
          return;
        }
      }
      const idealIndexMiss = Math.round((get(indicatorTop) - currentY) / get(itemHeight)) - get(paddingItemCount);
      snapToIndex(idealIndexMiss);
      return;
    }
    if (currentY > maxTranslateY || currentY < minTranslateY) {
      const boundaryIndex = currentY > maxTranslateY ? 0 : get(formattedOptions).length - 1;
      snapToIndex(boundaryIndex);
    } else {
      const inertiaDist = velocity * 120;
      const predictedY = currentY + inertiaDist;
      const idealIndex = Math.round((get(indicatorTop) - predictedY) / get(itemHeight)) - get(paddingItemCount);
      snapToIndex(idealIndex);
    }
    velocity = 0;
  }
  function handleWheel(event) {
    if (isDragging) return;
    event.preventDefault();
    if (get(wheelSnapTimeoutId)) {
      clearTimeout(get(wheelSnapTimeoutId));
    }
    get(list).style.transition = "none";
    const scrollAmount = event.deltaY * 0.5;
    const newY = currentY - scrollAmount;
    setTranslateY(newY);
    eventType(event.type);
    wheelSnapTimeoutId(setTimeout(() => {
      const idealIndex = Math.round((get(indicatorTop) - currentY) / get(itemHeight)) - get(paddingItemCount);
      snapToIndex(idealIndex);
      wheelSnapTimeoutId(null);
    }, 150));
  }
  effect(() => {
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", (e) => handleEnd);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleEnd);
    };
  });
  effect(() => {
    if (get(multiple)) return;
    if (get(value2) === preValue) return;
    preValue = get(value2);
    const foundIndex = get(formattedOptions).findIndex((opt) => opt.value === get(value2));
    if (get(selectedIndex) !== foundIndex) selectedIndex(foundIndex);
  });
  snapToIndex(get(selectedIndex), true);
  const oriIndex = observable(-1);
  effect(() => {
    if (get(multiple)) return;
    if (get(oriIndex) === get(selectedIndex))
      return;
    oriIndex(get(selectedIndex));
    if (get(value2) !== get(formattedOptions)[get(selectedIndex)].value) {
      if (get(eventType) == "wheel" && changeValueOnClickOnly) ;
      else {
        value2(get(formattedOptions)[get(selectedIndex)].value);
        if (!ok2) {
          if (isObservable(oriValue))
            oriValue(get(value2));
        }
      }
    }
    if (get(selectedIndex) >= 0 && get(selectedIndex) < get(formattedOptions).length) {
      snapToIndex(get(selectedIndex));
    } else {
      console.warn(`Index "${get(selectedIndex)}" out of bounds.`);
      selectedIndex(-1);
    }
  });
  const wheeler = observable();
  effect(() => {
    if (!get(visible)) {
      preValue = null;
      if (get(ActiveWheelers).some((w) => w === wheeler))
        ActiveWheelers(get(ActiveWheelers).filter((w) => w !== wheeler));
      return;
    }
    if (get(ActiveWheelers).filter((w) => w === wheeler).length === 0) {
      ActiveWheelers([...get(ActiveWheelers), wheeler]);
    }
    value2chk();
  });
  useClickAway(wheeler, () => {
    if (get(cancelOnBlur))
      visible(false);
    if (get(commitOnBlur)) {
      if (isObservable(ok2))
        ok2(true);
      visible(false);
      if (isObservable(oriValue))
        oriValue(get(value2));
    }
  });
  return /* @__PURE__ */ jsx(Fragment, { children: () => !get(visible) ? null : get(bottom) ? /* @__PURE__ */ jsx(Portal, { mount: document.body, children: [
    () => get(mask) ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
      "div",
      {
        class: ["fixed inset-0 bg-black/50 h-full w-full z-[00] opacity-50"]
      }
    ) }) : null,
    /* @__PURE__ */ jsx("div", { ref: wheeler, class: ["wheeler-widget z-[100]", cls, "fixed inset-x-0 bottom-0 w-full z-20 bg-white"], children: [
      () => header ? /* @__PURE__ */ jsx(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { class: "font-bold text-center", children: () => header(value2) }),
        /* @__PURE__ */ jsx("div", { class: "my-1 h-px w-full bg-gray-300 dark:bg-gray-600" })
      ] }) : null,
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: viewport,
          onPointerDown: handleStart,
          onPointerMove: handleMove,
          onPointerUp: handleEnd,
          onPointerCancel: handleEnd,
          onWheel: handleWheel,
          class: ["wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]"],
          style: { height: () => `${get(viewportHeight)}px` },
          children: [
            /* @__PURE__ */ jsx("ul", { class: "wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none", ref: list, children: () => [...populateList()] }),
            /* @__PURE__ */ jsx("div", { class: "wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0", style: {
              height: () => `${get(itemHeight)}px`,
              top: () => `${get(indicatorTop) + get(get(itemHeight)) / 2}px`,
              // Center line of indicator
              transform: `translateY(-50%)`
            } })
          ]
        }
      )
    ] })
  ] }) : /* @__PURE__ */ jsx("div", { class: ["wheeler-widget", cls], children: [
    () => header ? /* @__PURE__ */ jsx(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { class: "font-bold text-center", children: () => header(value2) }),
      /* @__PURE__ */ jsx("div", { class: "my-1 h-px w-full bg-gray-300 dark:bg-gray-600" })
    ] }) : null,
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: viewport,
        onPointerDown: handleStart,
        onPointerMove: handleMove,
        onPointerUp: handleEnd,
        onPointerCancel: handleEnd,
        onWheel: handleWheel,
        class: ["wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]"],
        style: { height: () => `${get(viewportHeight)}px` },
        children: [
          /* @__PURE__ */ jsx("ul", { class: "wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none", ref: list, children: () => [...populateList()] }),
          () => get(multiple) ? null : /* @__PURE__ */ jsx("div", { class: "wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0", style: {
            height: () => `${get(itemHeight)}px`,
            top: () => `${get(indicatorTop) + get(get(itemHeight)) / 2}px`,
            // Center line of indicator
            transform: `translateY(-50%)`
          } })
        ]
      }
    )
  ] }) });
};
const MultiWheeler = (props) => {
  const {
    options: options2,
    value: value2,
    itemHeight = 36,
    itemCount: itemCount2 = 5,
    headers,
    divider,
    bottom = true,
    title,
    mask,
    visible = observable(true),
    changeValueOnClickOnly,
    ok: ok2
  } = props;
  const stateArr = value2;
  const { height: vh2, pageTop: pt2 } = useViewportSize();
  const dateTimeWheelerCls = "multi-Wheeler flex w-full bg-white p-1 border justify-center border-gray-300 rounded-md shadow-sm ";
  const wheelWrapperCls = "wheel-wrapper flex-1";
  memo(() => get(divider) ? "border-l border-gray-300 dark:border-gray-600" : null);
  const ref = observable();
  const comp = memo(() => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      class: [dateTimeWheelerCls, "flex-col fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-10", "h-fit"],
      style: { top: () => get(vh2) - (get(ref) ? get(ref).clientHeight ?? 0 : 0) + get(pt2) },
      children: [
        /* @__PURE__ */ jsx("div", { class: "flex items-center justify-between px-4 py-2 h-auto relative", children: [
          /* @__PURE__ */ jsx("div", { class: "w-[80px] flex justify-start", children: /* @__PURE__ */ jsx(
            Button,
            {
              buttonType: "contained",
              class: ["px-2"],
              onClick: () => visible(false),
              children: "Cancel"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { class: "flex-1 text-center px-2", children: /* @__PURE__ */ jsx("span", { class: "inline-block break-words", children: () => title ? title : null }) }),
          /* @__PURE__ */ jsx("div", { class: "w-[80px] flex justify-end", children: /* @__PURE__ */ jsx(
            Button,
            {
              buttonType: "contained",
              class: ["px-2"],
              onClick: () => {
                visible(false);
              },
              children: "OK"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { class: [dateTimeWheelerCls, "h-fit"], children: () => options2.map((options22, index) => {
          const columnName = headers[index];
          return /* @__PURE__ */ jsx(
            Wheeler,
            {
              header: (v) => columnName(v),
              options: options22,
              value: stateArr[index],
              itemHeight,
              itemCount: itemCount2,
              class: [wheelWrapperCls],
              changeValueOnClickOnly
            }
          );
        }) })
      ]
    }
  ) }));
  return () => !get(visible) ? null : get(bottom) ? /* @__PURE__ */ jsx(Portal, { mount: document.body, children: [
    () => get(mask) ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
      "div",
      {
        class: ["fixed inset-0 bg-black/50 h-full w-full z-[50] opacity-50"],
        onClick: () => {
          visible(false);
        }
      }
    ) }) : null,
    /* @__PURE__ */ jsx(
      "div",
      {
        class: [dateTimeWheelerCls, "fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-100"],
        style: {
          maxHeight: () => `${get(vh2) * 0.8}px`,
          maxWidth: () => `90vw`
          // left: '50%',
          // transform: 'translateX(-50%)'
        },
        children: comp
      }
    )
  ] }) : /* @__PURE__ */ jsx("div", { class: [dateTimeWheelerCls], children: comp });
};
const FaceIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    class: "text-[rgb(97,97,97)] select-none w-[1em] h-[1em] inline-block fill-current shrink-0 transition-[fill] duration-200 ease-in-out delay-[0ms] text-2xl ml-[5px] -mr-1.5",
    focusable: "false",
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    "data-testid": "FaceIcon",
    children: /* @__PURE__ */ jsx("path", { d: "M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z" })
  }
);
const row = `mr-[-15px] ml-[-15px]`;
const button_ = `relative w-[74px] h-9 overflow-hidden -mt-5 mb-0 mx-auto top-2/4
[&>span]:absolute [&>span]:inset-0
[&>div]:absolute [&>div]:inset-0 [&>div]:z-[2]
[&>input]:relative [&>input]:w-full [&>input]:h-full [&>input]:opacity-0 [&>input]:cursor-pointer [&>input]:z-[3] [&>input]:m-0 [&>input]:p-0

`;
const buttonr = button_ + " rounded-[100px] [&>span]:rounded-[100px]";
const buttonb2 = button_ + " rounded-sm";
const main = observable();
const open = observable(false);
const menu = observable(true);
const AppIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-8 h-8 fill-current",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx("path", { d: "M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" })
  }
);
const DashboardIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      }
    )
  }
);
const SearchIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      }
    )
  }
);
const InsightsIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      }
    )
  }
);
const DocsIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
      }
    )
  }
);
const ProductsIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      }
    )
  }
);
const SettingsIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...props,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      }
    )
  }
);
const MessagesIcon = (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-6 h-6 stroke-current",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      }
    )
  }
);
const number = observable(0);
const text1 = observable("abc");
const text2 = observable("change on enter");
effect(() => {
  console.log(get(number));
});
effect(() => {
  console.log(get(text1));
});
effect(() => {
  console.log(get(text2));
});
var A = /* @__PURE__ */ ((A2) => {
  A2[A2["a"] = 0] = "a";
  A2[A2["b"] = 1] = "b";
  return A2;
})(A || {});
const aa = observable(
  0
  /* a */
);
effect(() => {
  console.log("useEnumSwitch", get(aa), A[get(aa)]);
});
observable([]);
observable(["first tab", "second tab"]);
observable([/* @__PURE__ */ jsx("div", { children: "next instance tab" }), /* @__PURE__ */ jsx("div", { children: "next second tab" })]);
const { height: vh, pageTop: pt, pageLeft: pl } = useViewportSize();
const options = [
  /* ... options ... */
  { value: "apple", label: "🍎 Apple" },
  { value: "banana", label: "🍌 Banana" },
  { value: "orange", label: "🍊 Orange" },
  { value: "grape", label: "🍇 Grape" },
  { value: "strawberry", label: "🍓 Strawberry" },
  { value: "blueberry", label: "🫐 Blueberry" },
  { value: "mango", label: "🥭 Mango" },
  { value: "pineapple", label: "🍍 Pineapple" },
  { value: "kiwi", label: "🥝 Kiwi" },
  { value: "watermelon", label: "🍉 Watermelon" },
  { value: "peach", label: "🍑 Peach" },
  { value: "cherry", label: "🍒 Cherry" }
];
const itemCount = observable(5);
const value = observable("orange");
observable("datetime");
const selectedDate = observable(/* @__PURE__ */ new Date());
const ok = observable(false);
const dateOk = observable(false);
effect(() => console.log("selectedDate", get(selectedDate).toString()));
effect(() => console.log("value", get(value)));
const App = () => /* @__PURE__ */ jsx(Fragment, { children: [
  /* @__PURE__ */ jsx(
    SideBar,
    {
      class: "",
      open: menu,
      width: "10rem",
      disableBackground: true,
      contentRef: main,
      children: /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center w-40 h-full overflow-hidden text-gray-700 bg-gray-100 rounded", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            class: "flex items-center w-full px-3 mt-3",
            href: "#",
            children: [
              /* @__PURE__ */ jsx(AppIcon, { class: "w-7 h-7 fill-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "The App" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { class: "w-full px-1", children: [
          /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center w-full mt-3 border-t border-gray-300", children: [
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(DashboardIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Dasboard" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(SearchIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Search" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(InsightsIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Insights" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { class: "ml-5 h-fit", children: [
              /* @__PURE__ */ jsx(InsightsIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Child" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(DocsIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Docs" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center w-full mt-2 border-t border-gray-300", children: [
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(ProductsIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Products" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { children: [
              /* @__PURE__ */ jsx(SettingsIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Settings" })
            ] }),
            /* @__PURE__ */ jsx(MenuItem, { class: "relative", children: [
              /* @__PURE__ */ jsx(MessagesIcon, { class: "w-6 h-6 stroke-current" }),
              /* @__PURE__ */ jsx(MenuText, { children: "Messages" }),
              /* @__PURE__ */ jsx("span", { class: "absolute top-0 left-0 w-2 h-2 mt-2 ml-3 bg-indigo-500 rounded-full" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            class: "flex items-center justify-center w-full h-16 mt-auto bg-gray-200 hover:bg-gray-300",
            href: "#",
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  class: "w-6 h-6 stroke-current",
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(MenuText, { children: "Account" })
            ]
          }
        )
      ] })
    }
  ),
  /* @__PURE__ */ jsx("div", { ref: main, children: [
    /* @__PURE__ */ jsx(Appbar, { children: /* @__PURE__ */ jsx(Toolbar, { children: [
      /* @__PURE__ */ jsx(
        IconButton,
        {
          class: "text-white",
          onClick: () => menu((p) => !p),
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              class: "select-none w-[1em] h-[1em] inline-block shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms] ",
              focusable: "false",
              "aria-hidden": "true",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" })
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "font-medium text-xl leading-[1.6] tracking-[0.0075em] grow m-0", children: "News" }),
      /* @__PURE__ */ jsx(Button, { children: "Login" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { class: "pt-[60px]", children: [
      /* @__PURE__ */ jsx("table", { class: "relative top-[200]", children: /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsx("tr", { children: [
        /* @__PURE__ */ jsx("td", {}),
        /* @__PURE__ */ jsx(Wheeler, { ...{
          options,
          value,
          itemCount,
          all: "All"
          // ok,
        }, class: "w-[200px] border bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)] mb-2.5 rounded-lg border-solid border-[#ccc]" }),
        /* @__PURE__ */ jsx("td", { class: "pl-10", children: [
          /* @__PURE__ */ jsx("div", { class: "controls", children: [
            /* @__PURE__ */ jsx("span", { children: "Visible Items: " }),
            /* @__PURE__ */ jsx(Button, { class: "w-[3rem] border-2", type: "button", onClick: () => itemCount(get(itemCount) + 2), children: "++" }),
            " ",
            /* @__PURE__ */ jsx(Button, { class: "w-[3rem] border-2", type: "button", onClick: () => itemCount(get(itemCount) - 2), children: "--" })
          ] }),
          /* @__PURE__ */ jsx(Button, { id: "setKiwiButton", type: "button", onClick: () => value("kiwi"), children: "Set to Kiwi" }),
          /* @__PURE__ */ jsx("p", { children: [
            "Selected Value: ",
            /* @__PURE__ */ jsx("strong", { children: () => {
              var _a, _b;
              return (_b = (_a = get(value)) == null ? void 0 : _a.join) == null ? void 0 : _b.call(_a, " ");
            } })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: () => ok(true), children: "OK" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(
        MultiWheeler,
        {
          options: [["a", "b"], [1, 2, 3], [0, 5, 87, 8, 9]],
          title: /* @__PURE__ */ jsx("div", { children: "test" }),
          value: [observable("a"), observable(1), observable(0)],
          headers: [(v) => "col1 " + get(v), (v) => "col2 " + get(v), (v) => "col3 " + get(v)],
          ok: dateOk
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "[@media(min-width:768px)]:w-[750px] mx-auto px-[15px]", children: [
        /* @__PURE__ */ jsx(Fab, { class: "w-18 h-18", style: { top: () => get(pt) + get(vh) - 80, left: () => get(pl) }, children: /* @__PURE__ */ jsx(
          "svg",
          {
            class: "select-none w-[1em] h-[1em] inline-block fill-[black] shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
            focusable: "false",
            "aria-hidden": "true",
            viewBox: "0 0 24 24",
            "data-testid": "AddIcon",
            children: /* @__PURE__ */ jsx("path", { d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" })
          }
        ) }),
        /* @__PURE__ */ jsx(Fab, { class: "w-18 h-18", style: { top: () => get(pt) + 80, right: pl }, children: "☰" }),
        /* @__PURE__ */ jsx(Badge, { children: /* @__PURE__ */ jsx(
          "svg",
          {
            class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
            focusable: "false",
            "aria-hidden": "true",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
          }
        ) }),
        /* @__PURE__ */ jsx(Badge, { badgeContent: "9+", children: /* @__PURE__ */ jsx(
          "svg",
          {
            class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
            focusable: "false",
            "aria-hidden": "true",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
          }
        ) }),
        /* @__PURE__ */ jsx(Badge, { badgeContent: "99+", children: /* @__PURE__ */ jsx(
          "svg",
          {
            class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
            focusable: "false",
            "aria-hidden": "true",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
          }
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            badgeContent: "99+",
            anchorOrigin: { vertical: "bottom" },
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
                focusable: "false",
                "aria-hidden": "true",
                viewBox: "0 0 24 24",
                "data-testid": "MailIcon",
                children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Badge,
          {
            badgeContent: "99+",
            anchorOrigin: { horizontal: "left" },
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
                focusable: "false",
                "aria-hidden": "true",
                viewBox: "0 0 24 24",
                "data-testid": "MailIcon",
                children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Badge,
          {
            badgeContent: "99+",
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                class: "select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]",
                focusable: "false",
                "aria-hidden": "true",
                viewBox: "0 0 24 24",
                "data-testid": "MailIcon",
                children: /* @__PURE__ */ jsx("path", { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" })
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { class: "[@media(min-width:768px)]:w-[750px] mx-auto px-[15px]", children: [
        /* @__PURE__ */ jsx("div", { class: "w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]", children: [
          /* @__PURE__ */ jsx(Avatar, { children: "H" }),
          /* @__PURE__ */ jsx(Avatar, { class: "w-10 h-10 bg-orange-400", children: "N" }),
          /* @__PURE__ */ jsx(Avatar, { class: "w-10 h-10 bg-purple-600", children: "OP" })
        ] }),
        /* @__PURE__ */ jsx("div", { class: "w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]", children: [
          /* @__PURE__ */ jsx(
            Avatar,
            {
              alt: "Remy Sharp",
              src: "https://mui.com/static/images/avatar/1.jpg"
            }
          ),
          /* @__PURE__ */ jsx(
            Avatar,
            {
              alt: "Travis Howard",
              src: "https://mui.com/static/images/avatar/2.jpg"
            }
          ),
          /* @__PURE__ */ jsx(
            Avatar,
            {
              alt: "Cindy Baker",
              src: "https://mui.com/static/images/avatar/3.jpg"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: "w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]", children: [
          /* @__PURE__ */ jsx(Avatar, { children: "KD" }),
          /* @__PURE__ */ jsx(Avatar, { class: "w-10 h-10 bg-orange-400", children: "JW" }),
          /* @__PURE__ */ jsx(Avatar, { class: "w-10 h-10 bg-purple-600", children: "TN" })
        ] }),
        /* @__PURE__ */ jsx("div", { class: "w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]", children: [
          /* @__PURE__ */ jsx(
            Avatar,
            {
              class: "w-[24px] h-[24px]",
              alt: "Remy Sharp",
              src: "https://mui.com/static/images/avatar/3.jpg"
            }
          ),
          /* @__PURE__ */ jsx(
            Avatar,
            {
              alt: "Travis Howard",
              src: "https://mui.com/static/images/avatar/3.jpg"
            }
          ),
          /* @__PURE__ */ jsx(
            Avatar,
            {
              class: "w-[56px] h-[56px]",
              alt: "Cindy Baker",
              src: "https://mui.com/static/images/avatar/3.jpg"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(
          NumberField,
          {
            min: 1,
            max: 9,
            value: number,
            class: "[&_input]:w-[5rem] [&_button]:w-[2rem] [&_button]:text-[130%] [&_button]:leading-[0] [&_button]:font-bold h-[2rem]"
          }
        ),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(Checkbox, { children: /* @__PURE__ */ jsx("h1", { class: "inline-block", children: "h1 check" }) }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(
          Chip,
          {
            avatar: FaceIcon,
            onDelete: () => alert("delete"),
            children: "Chip"
          }
        ),
        /* @__PURE__ */ jsx(
          Chip,
          {
            class: "hover:bg-[gray]",
            onClick: () => alert("chip clicked"),
            onDelete: () => alert("delete"),
            children: "Chip 2"
          }
        ),
        /* @__PURE__ */ jsx(Chip, { class: "hover:bg-[gray]", children: "Chip 3" }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(
          "button",
          {
            class: "p-2 elevation-3 hover:bg-[gray] z-[10]",
            onClick: () => {
              open(!get(open));
            },
            children: "Toggle Expand/Collapse"
          }
        ),
        /* @__PURE__ */ jsx("div", { onClick: (e) => console.log("aaaa"), children: "aaaaa" }),
        /* @__PURE__ */ jsx(Collapse, { open, children: [
          /* @__PURE__ */ jsx("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" })
          ] }),
          /* @__PURE__ */ jsx("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" }),
            /* @__PURE__ */ jsx("li", { children: "Item" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Border effects" }) }),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect1$1, "w-full"],
              placeholder: "effect1",
              value: text1
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect2$1, "w-full"],
              placeholder: "effect2",
              value: text2,
              reactive: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect3$1, "w-full"],
              placeholder: "effect3"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect4$1, "w-full"],
              placeholder: "effect4"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect5$1, "w-full"],
              placeholder: "effect5"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect6$1, "w-full"],
              placeholder: "effect6"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect7$1, "w-full"],
              placeholder: "effect7"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect8$1, "w-full"],
              placeholder: "effect8"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect9$1, "w-full"],
              placeholder: "effect9"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Background Effects" }) }),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect10$1,
                "w-full",
                "[&~span]:opacity-[unset] [&:focus~span]:bg-[#000] [&~span]:bg-[#e7a8a8]"
              ],
              placeholder: "effect10"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect11$1, "w-full", "border-[#F00]"],
              placeholder: "effect11"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect12$1, "w-full"],
              placeholder: "effect12"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect13$1, "w-full"],
              placeholder: "effect13"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect14$1, "w-full"],
              placeholder: "effect14"
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect15$1, "w-full"],
              placeholder: "effect15"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Input with Label Effects" }) }),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect16$1,
                "w-full",
                "[&~label]:text-[red] [&:focus~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]"
              ],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect16" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect17$1, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect17" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect18$1, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect18" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect19, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect19" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect20,
                "w-full",
                "[&~span]:before:bg-[red] [&~span]:after:bg-[red] [&~span_i]:before:bg-[red] [&~span_i]:after:bg-[red]"
              ],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect20" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect21, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect21" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect22, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect22" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect23, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect23" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect24, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect24" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect19a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect19a" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect20a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect20a" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect21a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect21a" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("h1", { children: "TextArea" }),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Border effects" }) }),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect1$1, "w-full"],
              placeholder: "effect1",
              value: text1
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect2$1, "w-full"],
              placeholder: "effect2",
              value: text2,
              reactive: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect3$1, "w-full"],
              placeholder: "effect3"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect4$1, "w-full"],
              placeholder: "effect4"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect5$1, "w-full"],
              placeholder: "effect5"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect6$1, "w-full"],
              placeholder: "effect6"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect7$1, "w-full "],
              placeholder: "effect7"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect8$1, "w-full"],
              placeholder: "effect8"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect9$1, "w-full"],
              placeholder: "effect9"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Background Effects" }) }),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect10$1,
                "w-full",
                "[&~span]:opacity-[unset] [&:focus~span]:bg-[#000] [&~span]:bg-[#e7a8a8]"
              ],
              placeholder: "effect10"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect11$1, "w-full", "border-[#F00]"],
              placeholder: "effect11"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect12$1, "w-full"],
              placeholder: "effect12"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect13$1, "w-full"],
              placeholder: "effect13"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect14$1, "w-full"],
              placeholder: "effect14"
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect15$1, "w-full"],
              placeholder: "effect15"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: row, children: [
          /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("i", { children: "Input with Label Effects" }) }),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect16$1,
                "w-full",
                "[&~label]:text-[red] [&:focus~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]"
              ],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect16" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect17$1, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect17" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect18$1, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect18" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect19, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect19" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [
                effect20,
                "w-full",
                "[&~span]:before:bg-[red] [&~span]:after:bg-[red] [&~span_i]:before:bg-[red] [&~span_i]:after:bg-[red]"
              ],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect20" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect21, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect21" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect22, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect22" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect23, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect23" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect24, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect24" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect19a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect19a" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect20a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect20a" })
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              class: "inline-block w-[27.33%] mt-[20px] mr-3",
              effect: [effect21a, "w-full"],
              placeholder: "",
              children: /* @__PURE__ */ jsx("label", { children: "effect21a" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("h1", { children: "Paper" }),
        /* @__PURE__ */ jsx("div", { children: [
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-1", children: "elevation=1" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-2", children: "elevation=2" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-3", children: "elevation=3" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-4", children: "elevation=4" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-5", children: "elevation=5" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-6", children: "elevation=6" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-7", children: "elevation=7" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-8", children: "elevation=8" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-9", children: "elevation=9" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-10", children: "elevation=10" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-20", children: "elevation=20" }),
          /* @__PURE__ */ jsx("div", { class: "inline-block w-[27.33%] mt-[30px] mr-3 elevation-24", children: "elevation=24" })
        ] }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("div", { class: "block", children: [
          /* @__PURE__ */ jsx(Button, { buttonType: "outlined", children: "Outlined" }),
          /* @__PURE__ */ jsx(Button, { buttonType: "contained", children: "contained" }),
          /* @__PURE__ */ jsx(Button, { buttonType: "text", children: "text" }),
          /* @__PURE__ */ jsx(Button, { buttonType: "icon", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              width: "1.5rem",
              height: "1.5rem",
              children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("h1", { children: "IconButton" }),
        /* @__PURE__ */ jsx("div", { children: [
          /* @__PURE__ */ jsx(IconButton, { onClick: () => alert("clicked"), children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" })
            }
          ) }),
          /* @__PURE__ */ jsx(IconButton, { disabled: true, children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" })
            }
          ) }),
          /* @__PURE__ */ jsx(IconButton, { class: "[&_svg]:!fill-[#9C27B0]", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "m22 5.72-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39 6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" })
            }
          ) }),
          /* @__PURE__ */ jsx(IconButton, { class: "[&_svg]:!fill-[#1976D2]", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("h1", { children: "ToggleButton" }),
        /* @__PURE__ */ jsx("div", { children: [
          /* @__PURE__ */ jsx(ToggleButton, { class: "px-3 font-bold", children: "Web" }),
          /* @__PURE__ */ jsx(ToggleButton, { class: "px-3 font-bold", children: "Android" }),
          /* @__PURE__ */ jsx(ToggleButton, { class: "px-3 font-bold", children: "IOS" })
        ] }),
        /* @__PURE__ */ jsx("div", { children: [
          /* @__PURE__ */ jsx(ToggleButton, { class: "h-7 w-7", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" })
            }
          ) }),
          /* @__PURE__ */ jsx(ToggleButton, { class: "h-7 w-7", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "m22 5.72-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39 6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" })
            }
          ) }),
          /* @__PURE__ */ jsx(ToggleButton, { class: "h-7 w-7", children: /* @__PURE__ */ jsx(
            "svg",
            {
              focusable: "false",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { d: "M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { id: "app-cover", children: [
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [buttonr, effect2],
              checked: useEnumSwitch(
                aa,
                0,
                1
                /* b */
              )
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                title: "effect1",
                class: [
                  buttonr,
                  effect1,
                  `
                 [&>div]:before:content-['OK']
[&>div]:after:bg-[#82ec90]
[&>input:checked+div]:before:bg-[#46f436]
[&>input:checked~div]:bg-[#f9fceb]
[&>input:checked+div]:before:content-['KO']
`
                ],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                title: "effect2",
                class: [buttonr, effect2],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                title: "effect3",
                class: [buttonr, effect3],
                checked: observable(false)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect4],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect5],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect6],
                checked: observable(false)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect7],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect8],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [buttonr, effect9],
                checked: observable(false)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect10],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect11],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect12],
                checked: observable(false)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect13],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect14],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect15],
                checked: observable(false)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "table-row", children: [
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect16],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect17],
                checked: observable(false)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { class: "table-cell relative w-[200px] h-[50px] box-border", children: /* @__PURE__ */ jsx(
              Switch,
              {
                class: [button_, buttonb2, effect18],
                checked: observable(false)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { class: "table-row", children: [
          /* @__PURE__ */ jsx("h4", { children: "Light" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [light, "inline-block"],
              on: "Y",
              off: "N"
            }
          ),
          /* @__PURE__ */ jsx(Switch, { class: [light, "inline-block"] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [light, "inline-block"],
              on: "",
              off: ""
            }
          ),
          /* @__PURE__ */ jsx("h4", { children: "iOS" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [ios, "inline-block"],
              on: "Y",
              off: "N"
            }
          ),
          /* @__PURE__ */ jsx(Switch, { class: [ios, "inline-block"] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [ios, "inline-block"],
              on: "",
              off: ""
            }
          ),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [ios, "inline-block"],
              on: "☑",
              off: "☒"
            }
          ),
          /* @__PURE__ */ jsx("h4", { children: "Skewed" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [skewed, "inline-block"],
              on: "ON",
              off: "OFF"
            }
          ),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [skewed, "inline-block"],
              on: "☑",
              off: "☒"
            }
          ),
          /* @__PURE__ */ jsx("h4", { children: "Flat" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [flat, "inline-block"],
              on: "ON",
              off: "OFF"
            }
          ),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [flat, "inline-block"],
              on: "☑",
              off: "☒"
            }
          ),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [flat, "inline-block"],
              on: "",
              off: ""
            }
          ),
          /* @__PURE__ */ jsx("h4", { children: "Flip" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [flip, "inline-block"],
              on: "Yeah!",
              off: "Nope"
            }
          ),
          /* @__PURE__ */ jsx(
            Switch,
            {
              class: [flip, "inline-block"],
              on: "☑",
              off: "☒"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Zoomable, { class: "relative  border border-black w-[90%] h-[500px] overflow-hidden touch-none mx-auto", children: /* @__PURE__ */ jsx(Img, { src: "https://picsum.photos/2560/1440?random" }) })
    ] })
  ] })
] });
render(/* @__PURE__ */ jsx(App, {}), document.getElementById("app"));
