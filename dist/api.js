/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _asyncToGenerator)
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

/***/ }),

/***/ "./node_modules/jose/dist/browser/index.js":
/*!*************************************************!*\
  !*** ./node_modules/jose/dist/browser/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompactEncrypt: () => (/* reexport safe */ _jwe_compact_encrypt_js__WEBPACK_IMPORTED_MODULE_9__.CompactEncrypt),
/* harmony export */   CompactSign: () => (/* reexport safe */ _jws_compact_sign_js__WEBPACK_IMPORTED_MODULE_11__.CompactSign),
/* harmony export */   EmbeddedJWK: () => (/* reexport safe */ _jwk_embedded_js__WEBPACK_IMPORTED_MODULE_17__.EmbeddedJWK),
/* harmony export */   EncryptJWT: () => (/* reexport safe */ _jwt_encrypt_js__WEBPACK_IMPORTED_MODULE_15__.EncryptJWT),
/* harmony export */   FlattenedEncrypt: () => (/* reexport safe */ _jwe_flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_10__.FlattenedEncrypt),
/* harmony export */   FlattenedSign: () => (/* reexport safe */ _jws_flattened_sign_js__WEBPACK_IMPORTED_MODULE_12__.FlattenedSign),
/* harmony export */   GeneralEncrypt: () => (/* reexport safe */ _jwe_general_encrypt_js__WEBPACK_IMPORTED_MODULE_3__.GeneralEncrypt),
/* harmony export */   GeneralSign: () => (/* reexport safe */ _jws_general_sign_js__WEBPACK_IMPORTED_MODULE_13__.GeneralSign),
/* harmony export */   SignJWT: () => (/* reexport safe */ _jwt_sign_js__WEBPACK_IMPORTED_MODULE_14__.SignJWT),
/* harmony export */   UnsecuredJWT: () => (/* reexport safe */ _jwt_unsecured_js__WEBPACK_IMPORTED_MODULE_20__.UnsecuredJWT),
/* harmony export */   base64url: () => (/* reexport module object */ _util_base64url_js__WEBPACK_IMPORTED_MODULE_28__),
/* harmony export */   calculateJwkThumbprint: () => (/* reexport safe */ _jwk_thumbprint_js__WEBPACK_IMPORTED_MODULE_16__.calculateJwkThumbprint),
/* harmony export */   calculateJwkThumbprintUri: () => (/* reexport safe */ _jwk_thumbprint_js__WEBPACK_IMPORTED_MODULE_16__.calculateJwkThumbprintUri),
/* harmony export */   compactDecrypt: () => (/* reexport safe */ _jwe_compact_decrypt_js__WEBPACK_IMPORTED_MODULE_0__.compactDecrypt),
/* harmony export */   compactVerify: () => (/* reexport safe */ _jws_compact_verify_js__WEBPACK_IMPORTED_MODULE_4__.compactVerify),
/* harmony export */   createLocalJWKSet: () => (/* reexport safe */ _jwks_local_js__WEBPACK_IMPORTED_MODULE_18__.createLocalJWKSet),
/* harmony export */   createRemoteJWKSet: () => (/* reexport safe */ _jwks_remote_js__WEBPACK_IMPORTED_MODULE_19__.createRemoteJWKSet),
/* harmony export */   decodeJwt: () => (/* reexport safe */ _util_decode_jwt_js__WEBPACK_IMPORTED_MODULE_24__.decodeJwt),
/* harmony export */   decodeProtectedHeader: () => (/* reexport safe */ _util_decode_protected_header_js__WEBPACK_IMPORTED_MODULE_23__.decodeProtectedHeader),
/* harmony export */   errors: () => (/* reexport module object */ _util_errors_js__WEBPACK_IMPORTED_MODULE_25__),
/* harmony export */   exportJWK: () => (/* reexport safe */ _key_export_js__WEBPACK_IMPORTED_MODULE_21__.exportJWK),
/* harmony export */   exportPKCS8: () => (/* reexport safe */ _key_export_js__WEBPACK_IMPORTED_MODULE_21__.exportPKCS8),
/* harmony export */   exportSPKI: () => (/* reexport safe */ _key_export_js__WEBPACK_IMPORTED_MODULE_21__.exportSPKI),
/* harmony export */   flattenedDecrypt: () => (/* reexport safe */ _jwe_flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_1__.flattenedDecrypt),
/* harmony export */   flattenedVerify: () => (/* reexport safe */ _jws_flattened_verify_js__WEBPACK_IMPORTED_MODULE_5__.flattenedVerify),
/* harmony export */   generalDecrypt: () => (/* reexport safe */ _jwe_general_decrypt_js__WEBPACK_IMPORTED_MODULE_2__.generalDecrypt),
/* harmony export */   generalVerify: () => (/* reexport safe */ _jws_general_verify_js__WEBPACK_IMPORTED_MODULE_6__.generalVerify),
/* harmony export */   generateKeyPair: () => (/* reexport safe */ _key_generate_key_pair_js__WEBPACK_IMPORTED_MODULE_26__.generateKeyPair),
/* harmony export */   generateSecret: () => (/* reexport safe */ _key_generate_secret_js__WEBPACK_IMPORTED_MODULE_27__.generateSecret),
/* harmony export */   importJWK: () => (/* reexport safe */ _key_import_js__WEBPACK_IMPORTED_MODULE_22__.importJWK),
/* harmony export */   importPKCS8: () => (/* reexport safe */ _key_import_js__WEBPACK_IMPORTED_MODULE_22__.importPKCS8),
/* harmony export */   importSPKI: () => (/* reexport safe */ _key_import_js__WEBPACK_IMPORTED_MODULE_22__.importSPKI),
/* harmony export */   importX509: () => (/* reexport safe */ _key_import_js__WEBPACK_IMPORTED_MODULE_22__.importX509),
/* harmony export */   jwtDecrypt: () => (/* reexport safe */ _jwt_decrypt_js__WEBPACK_IMPORTED_MODULE_8__.jwtDecrypt),
/* harmony export */   jwtVerify: () => (/* reexport safe */ _jwt_verify_js__WEBPACK_IMPORTED_MODULE_7__.jwtVerify)
/* harmony export */ });
/* harmony import */ var _jwe_compact_decrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./jwe/compact/decrypt.js */ "./node_modules/jose/dist/browser/jwe/compact/decrypt.js");
/* harmony import */ var _jwe_flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./jwe/flattened/decrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/decrypt.js");
/* harmony import */ var _jwe_general_decrypt_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./jwe/general/decrypt.js */ "./node_modules/jose/dist/browser/jwe/general/decrypt.js");
/* harmony import */ var _jwe_general_encrypt_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./jwe/general/encrypt.js */ "./node_modules/jose/dist/browser/jwe/general/encrypt.js");
/* harmony import */ var _jws_compact_verify_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./jws/compact/verify.js */ "./node_modules/jose/dist/browser/jws/compact/verify.js");
/* harmony import */ var _jws_flattened_verify_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./jws/flattened/verify.js */ "./node_modules/jose/dist/browser/jws/flattened/verify.js");
/* harmony import */ var _jws_general_verify_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./jws/general/verify.js */ "./node_modules/jose/dist/browser/jws/general/verify.js");
/* harmony import */ var _jwt_verify_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./jwt/verify.js */ "./node_modules/jose/dist/browser/jwt/verify.js");
/* harmony import */ var _jwt_decrypt_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./jwt/decrypt.js */ "./node_modules/jose/dist/browser/jwt/decrypt.js");
/* harmony import */ var _jwe_compact_encrypt_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./jwe/compact/encrypt.js */ "./node_modules/jose/dist/browser/jwe/compact/encrypt.js");
/* harmony import */ var _jwe_flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./jwe/flattened/encrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/encrypt.js");
/* harmony import */ var _jws_compact_sign_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./jws/compact/sign.js */ "./node_modules/jose/dist/browser/jws/compact/sign.js");
/* harmony import */ var _jws_flattened_sign_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./jws/flattened/sign.js */ "./node_modules/jose/dist/browser/jws/flattened/sign.js");
/* harmony import */ var _jws_general_sign_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./jws/general/sign.js */ "./node_modules/jose/dist/browser/jws/general/sign.js");
/* harmony import */ var _jwt_sign_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./jwt/sign.js */ "./node_modules/jose/dist/browser/jwt/sign.js");
/* harmony import */ var _jwt_encrypt_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./jwt/encrypt.js */ "./node_modules/jose/dist/browser/jwt/encrypt.js");
/* harmony import */ var _jwk_thumbprint_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./jwk/thumbprint.js */ "./node_modules/jose/dist/browser/jwk/thumbprint.js");
/* harmony import */ var _jwk_embedded_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./jwk/embedded.js */ "./node_modules/jose/dist/browser/jwk/embedded.js");
/* harmony import */ var _jwks_local_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./jwks/local.js */ "./node_modules/jose/dist/browser/jwks/local.js");
/* harmony import */ var _jwks_remote_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./jwks/remote.js */ "./node_modules/jose/dist/browser/jwks/remote.js");
/* harmony import */ var _jwt_unsecured_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./jwt/unsecured.js */ "./node_modules/jose/dist/browser/jwt/unsecured.js");
/* harmony import */ var _key_export_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./key/export.js */ "./node_modules/jose/dist/browser/key/export.js");
/* harmony import */ var _key_import_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./key/import.js */ "./node_modules/jose/dist/browser/key/import.js");
/* harmony import */ var _util_decode_protected_header_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./util/decode_protected_header.js */ "./node_modules/jose/dist/browser/util/decode_protected_header.js");
/* harmony import */ var _util_decode_jwt_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./util/decode_jwt.js */ "./node_modules/jose/dist/browser/util/decode_jwt.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _key_generate_key_pair_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./key/generate_key_pair.js */ "./node_modules/jose/dist/browser/key/generate_key_pair.js");
/* harmony import */ var _key_generate_secret_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./key/generate_secret.js */ "./node_modules/jose/dist/browser/key/generate_secret.js");
/* harmony import */ var _util_base64url_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./util/base64url.js */ "./node_modules/jose/dist/browser/util/base64url.js");

































/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/compact/decrypt.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/compact/decrypt.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compactDecrypt: () => (/* binding */ compactDecrypt)
/* harmony export */ });
/* harmony import */ var _flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/decrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/decrypt.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");



async function compactDecrypt(jwe, key, options) {
    if (jwe instanceof Uint8Array) {
        jwe = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__.decoder.decode(jwe);
    }
    if (typeof jwe !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('Compact JWE must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length, } = jwe.split('.');
    if (length !== 5) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('Invalid Compact JWE');
    }
    const decrypted = await (0,_flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_0__.flattenedDecrypt)({
        ciphertext,
        iv: (iv || undefined),
        protected: protectedHeader || undefined,
        tag: (tag || undefined),
        encrypted_key: encryptedKey || undefined,
    }, key, options);
    const result = { plaintext: decrypted.plaintext, protectedHeader: decrypted.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: decrypted.key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/compact/encrypt.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/compact/encrypt.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompactEncrypt: () => (/* binding */ CompactEncrypt)
/* harmony export */ });
/* harmony import */ var _flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/encrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/encrypt.js");

class CompactEncrypt {
    constructor(plaintext) {
        this._flattened = new _flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__.FlattenedEncrypt(plaintext);
    }
    setContentEncryptionKey(cek) {
        this._flattened.setContentEncryptionKey(cek);
        return this;
    }
    setInitializationVector(iv) {
        this._flattened.setInitializationVector(iv);
        return this;
    }
    setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    setKeyManagementParameters(parameters) {
        this._flattened.setKeyManagementParameters(parameters);
        return this;
    }
    async encrypt(key, options) {
        const jwe = await this._flattened.encrypt(key, options);
        return [jwe.protected, jwe.encrypted_key, jwe.iv, jwe.ciphertext, jwe.tag].join('.');
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/flattened/decrypt.js":
/*!*****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/flattened/decrypt.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   flattenedDecrypt: () => (/* binding */ flattenedDecrypt)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _runtime_decrypt_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../runtime/decrypt.js */ "./node_modules/jose/dist/browser/runtime/decrypt.js");
/* harmony import */ var _runtime_zlib_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../runtime/zlib.js */ "./node_modules/jose/dist/browser/runtime/zlib.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/is_disjoint.js */ "./node_modules/jose/dist/browser/lib/is_disjoint.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _lib_decrypt_key_management_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/decrypt_key_management.js */ "./node_modules/jose/dist/browser/lib/decrypt_key_management.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_cek_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../lib/cek.js */ "./node_modules/jose/dist/browser/lib/cek.js");
/* harmony import */ var _lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../lib/validate_crit.js */ "./node_modules/jose/dist/browser/lib/validate_crit.js");
/* harmony import */ var _lib_validate_algorithms_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../lib/validate_algorithms.js */ "./node_modules/jose/dist/browser/lib/validate_algorithms.js");











async function flattenedDecrypt(jwe, key, options) {
    var _a;
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__["default"])(jwe)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('Flattened JWE must be an object');
    }
    if (jwe.protected === undefined && jwe.header === undefined && jwe.unprotected === undefined) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JOSE Header missing');
    }
    if (typeof jwe.iv !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Initialization Vector missing or incorrect type');
    }
    if (typeof jwe.ciphertext !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Ciphertext missing or incorrect type');
    }
    if (typeof jwe.tag !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Authentication Tag missing or incorrect type');
    }
    if (jwe.protected !== undefined && typeof jwe.protected !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Protected Header incorrect type');
    }
    if (jwe.encrypted_key !== undefined && typeof jwe.encrypted_key !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Encrypted Key incorrect type');
    }
    if (jwe.aad !== undefined && typeof jwe.aad !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE AAD incorrect type');
    }
    if (jwe.header !== undefined && !(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__["default"])(jwe.header)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Shared Unprotected Header incorrect type');
    }
    if (jwe.unprotected !== undefined && !(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__["default"])(jwe.unprotected)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Per-Recipient Unprotected Header incorrect type');
    }
    let parsedProt;
    if (jwe.protected) {
        try {
            const protectedHeader = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.protected);
            parsedProt = JSON.parse(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.decoder.decode(protectedHeader));
        }
        catch (_b) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Protected Header is invalid');
        }
    }
    if (!(0,_lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_4__["default"])(parsedProt, jwe.header, jwe.unprotected)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jwe.header,
        ...jwe.unprotected,
    };
    (0,_lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_9__["default"])(_util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid, new Map(), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
    if (joseHeader.zip !== undefined) {
        if (!parsedProt || !parsedProt.zip) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
        }
        if (joseHeader.zip !== 'DEF') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSENotSupported('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value');
        }
    }
    const { alg, enc } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('missing JWE Algorithm (alg) in JWE Header');
    }
    if (typeof enc !== 'string' || !enc) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid('missing JWE Encryption Algorithm (enc) in JWE Header');
    }
    const keyManagementAlgorithms = options && (0,_lib_validate_algorithms_js__WEBPACK_IMPORTED_MODULE_10__["default"])('keyManagementAlgorithms', options.keyManagementAlgorithms);
    const contentEncryptionAlgorithms = options &&
        (0,_lib_validate_algorithms_js__WEBPACK_IMPORTED_MODULE_10__["default"])('contentEncryptionAlgorithms', options.contentEncryptionAlgorithms);
    if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter not allowed');
    }
    if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSEAlgNotAllowed('"enc" (Encryption Algorithm) Header Parameter not allowed');
    }
    let encryptedKey;
    if (jwe.encrypted_key !== undefined) {
        encryptedKey = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.encrypted_key);
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jwe);
        resolvedKey = true;
    }
    let cek;
    try {
        cek = await (0,_lib_decrypt_key_management_js__WEBPACK_IMPORTED_MODULE_6__["default"])(alg, key, encryptedKey, joseHeader, options);
    }
    catch (err) {
        if (err instanceof TypeError || err instanceof _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWEInvalid || err instanceof _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSENotSupported) {
            throw err;
        }
        cek = (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_8__["default"])(enc);
    }
    const iv = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.iv);
    const tag = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.tag);
    const protectedHeader = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode((_a = jwe.protected) !== null && _a !== void 0 ? _a : '');
    let additionalData;
    if (jwe.aad !== undefined) {
        additionalData = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.concat)(protectedHeader, _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode('.'), _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode(jwe.aad));
    }
    else {
        additionalData = protectedHeader;
    }
    let plaintext = await (0,_runtime_decrypt_js__WEBPACK_IMPORTED_MODULE_1__["default"])(enc, cek, (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.ciphertext), iv, tag, additionalData);
    if (joseHeader.zip === 'DEF') {
        plaintext = await ((options === null || options === void 0 ? void 0 : options.inflateRaw) || _runtime_zlib_js__WEBPACK_IMPORTED_MODULE_2__.inflate)(plaintext);
    }
    const result = { plaintext };
    if (jwe.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jwe.aad !== undefined) {
        result.additionalAuthenticatedData = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwe.aad);
    }
    if (jwe.unprotected !== undefined) {
        result.sharedUnprotectedHeader = jwe.unprotected;
    }
    if (jwe.header !== undefined) {
        result.unprotectedHeader = jwe.header;
    }
    if (resolvedKey) {
        return { ...result, key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/flattened/encrypt.js":
/*!*****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/flattened/encrypt.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FlattenedEncrypt: () => (/* binding */ FlattenedEncrypt),
/* harmony export */   unprotected: () => (/* binding */ unprotected)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _runtime_encrypt_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../runtime/encrypt.js */ "./node_modules/jose/dist/browser/runtime/encrypt.js");
/* harmony import */ var _runtime_zlib_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../runtime/zlib.js */ "./node_modules/jose/dist/browser/runtime/zlib.js");
/* harmony import */ var _lib_iv_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/iv.js */ "./node_modules/jose/dist/browser/lib/iv.js");
/* harmony import */ var _lib_encrypt_key_management_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/encrypt_key_management.js */ "./node_modules/jose/dist/browser/lib/encrypt_key_management.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/is_disjoint.js */ "./node_modules/jose/dist/browser/lib/is_disjoint.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../lib/validate_crit.js */ "./node_modules/jose/dist/browser/lib/validate_crit.js");









const unprotected = Symbol();
class FlattenedEncrypt {
    constructor(plaintext) {
        if (!(plaintext instanceof Uint8Array)) {
            throw new TypeError('plaintext must be an instance of Uint8Array');
        }
        this._plaintext = plaintext;
    }
    setKeyManagementParameters(parameters) {
        if (this._keyManagementParameters) {
            throw new TypeError('setKeyManagementParameters can only be called once');
        }
        this._keyManagementParameters = parameters;
        return this;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setSharedUnprotectedHeader(sharedUnprotectedHeader) {
        if (this._sharedUnprotectedHeader) {
            throw new TypeError('setSharedUnprotectedHeader can only be called once');
        }
        this._sharedUnprotectedHeader = sharedUnprotectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    setAdditionalAuthenticatedData(aad) {
        this._aad = aad;
        return this;
    }
    setContentEncryptionKey(cek) {
        if (this._cek) {
            throw new TypeError('setContentEncryptionKey can only be called once');
        }
        this._cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        if (this._iv) {
            throw new TypeError('setInitializationVector can only be called once');
        }
        this._iv = iv;
        return this;
    }
    async encrypt(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader && !this._sharedUnprotectedHeader) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()');
        }
        if (!(0,_lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_6__["default"])(this._protectedHeader, this._unprotectedHeader, this._sharedUnprotectedHeader)) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
            ...this._sharedUnprotectedHeader,
        };
        (0,_lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_8__["default"])(_util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid, new Map(), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
        if (joseHeader.zip !== undefined) {
            if (!this._protectedHeader || !this._protectedHeader.zip) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
            }
            if (joseHeader.zip !== 'DEF') {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JOSENotSupported('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value');
            }
        }
        const { alg, enc } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE "alg" (Algorithm) Header Parameter missing or invalid');
        }
        if (typeof enc !== 'string' || !enc) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
        }
        let encryptedKey;
        if (alg === 'dir') {
            if (this._cek) {
                throw new TypeError('setContentEncryptionKey cannot be called when using Direct Encryption');
            }
        }
        else if (alg === 'ECDH-ES') {
            if (this._cek) {
                throw new TypeError('setContentEncryptionKey cannot be called when using Direct Key Agreement');
            }
        }
        let cek;
        {
            let parameters;
            ({ cek, encryptedKey, parameters } = await (0,_lib_encrypt_key_management_js__WEBPACK_IMPORTED_MODULE_4__["default"])(alg, enc, key, this._cek, this._keyManagementParameters));
            if (parameters) {
                if (options && unprotected in options) {
                    if (!this._unprotectedHeader) {
                        this.setUnprotectedHeader(parameters);
                    }
                    else {
                        this._unprotectedHeader = { ...this._unprotectedHeader, ...parameters };
                    }
                }
                else {
                    if (!this._protectedHeader) {
                        this.setProtectedHeader(parameters);
                    }
                    else {
                        this._protectedHeader = { ...this._protectedHeader, ...parameters };
                    }
                }
            }
        }
        this._iv || (this._iv = (0,_lib_iv_js__WEBPACK_IMPORTED_MODULE_3__["default"])(enc));
        let additionalData;
        let protectedHeader;
        let aadMember;
        if (this._protectedHeader) {
            protectedHeader = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode((0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(JSON.stringify(this._protectedHeader)));
        }
        else {
            protectedHeader = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode('');
        }
        if (this._aad) {
            aadMember = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(this._aad);
            additionalData = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.concat)(protectedHeader, _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode('.'), _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.encoder.encode(aadMember));
        }
        else {
            additionalData = protectedHeader;
        }
        let ciphertext;
        let tag;
        if (joseHeader.zip === 'DEF') {
            const deflated = await ((options === null || options === void 0 ? void 0 : options.deflateRaw) || _runtime_zlib_js__WEBPACK_IMPORTED_MODULE_2__.deflate)(this._plaintext);
            ({ ciphertext, tag } = await (0,_runtime_encrypt_js__WEBPACK_IMPORTED_MODULE_1__["default"])(enc, deflated, cek, this._iv, additionalData));
        }
        else {
            ;
            ({ ciphertext, tag } = await (0,_runtime_encrypt_js__WEBPACK_IMPORTED_MODULE_1__["default"])(enc, this._plaintext, cek, this._iv, additionalData));
        }
        const jwe = {
            ciphertext: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(ciphertext),
            iv: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(this._iv),
            tag: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(tag),
        };
        if (encryptedKey) {
            jwe.encrypted_key = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(encryptedKey);
        }
        if (aadMember) {
            jwe.aad = aadMember;
        }
        if (this._protectedHeader) {
            jwe.protected = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_7__.decoder.decode(protectedHeader);
        }
        if (this._sharedUnprotectedHeader) {
            jwe.unprotected = this._sharedUnprotectedHeader;
        }
        if (this._unprotectedHeader) {
            jwe.header = this._unprotectedHeader;
        }
        return jwe;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/general/decrypt.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/general/decrypt.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generalDecrypt: () => (/* binding */ generalDecrypt)
/* harmony export */ });
/* harmony import */ var _flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/decrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/decrypt.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");



async function generalDecrypt(jwe, key, options) {
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(jwe)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('General JWE must be an object');
    }
    if (!Array.isArray(jwe.recipients) || !jwe.recipients.every(_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE Recipients missing or incorrect type');
    }
    if (!jwe.recipients.length) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE Recipients has no members');
    }
    for (const recipient of jwe.recipients) {
        try {
            return await (0,_flattened_decrypt_js__WEBPACK_IMPORTED_MODULE_0__.flattenedDecrypt)({
                aad: jwe.aad,
                ciphertext: jwe.ciphertext,
                encrypted_key: recipient.encrypted_key,
                header: recipient.header,
                iv: jwe.iv,
                protected: jwe.protected,
                tag: jwe.tag,
                unprotected: jwe.unprotected,
            }, key, options);
        }
        catch (_a) {
        }
    }
    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEDecryptionFailed();
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwe/general/encrypt.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwe/general/encrypt.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GeneralEncrypt: () => (/* binding */ GeneralEncrypt)
/* harmony export */ });
/* harmony import */ var _flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/encrypt.js */ "./node_modules/jose/dist/browser/jwe/flattened/encrypt.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_cek_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/cek.js */ "./node_modules/jose/dist/browser/lib/cek.js");
/* harmony import */ var _lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/is_disjoint.js */ "./node_modules/jose/dist/browser/lib/is_disjoint.js");
/* harmony import */ var _lib_encrypt_key_management_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/encrypt_key_management.js */ "./node_modules/jose/dist/browser/lib/encrypt_key_management.js");
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/validate_crit.js */ "./node_modules/jose/dist/browser/lib/validate_crit.js");







class IndividualRecipient {
    constructor(enc, key, options) {
        this.parent = enc;
        this.key = key;
        this.options = options;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this.unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this.unprotectedHeader = unprotectedHeader;
        return this;
    }
    addRecipient(...args) {
        return this.parent.addRecipient(...args);
    }
    encrypt(...args) {
        return this.parent.encrypt(...args);
    }
    done() {
        return this.parent;
    }
}
class GeneralEncrypt {
    constructor(plaintext) {
        this._recipients = [];
        this._plaintext = plaintext;
    }
    addRecipient(key, options) {
        const recipient = new IndividualRecipient(this, key, { crit: options === null || options === void 0 ? void 0 : options.crit });
        this._recipients.push(recipient);
        return recipient;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setSharedUnprotectedHeader(sharedUnprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setSharedUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = sharedUnprotectedHeader;
        return this;
    }
    setAdditionalAuthenticatedData(aad) {
        this._aad = aad;
        return this;
    }
    async encrypt(options) {
        var _a, _b, _c;
        if (!this._recipients.length) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('at least one recipient must be added');
        }
        options = { deflateRaw: options === null || options === void 0 ? void 0 : options.deflateRaw };
        if (this._recipients.length === 1) {
            const [recipient] = this._recipients;
            const flattened = await new _flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__.FlattenedEncrypt(this._plaintext)
                .setAdditionalAuthenticatedData(this._aad)
                .setProtectedHeader(this._protectedHeader)
                .setSharedUnprotectedHeader(this._unprotectedHeader)
                .setUnprotectedHeader(recipient.unprotectedHeader)
                .encrypt(recipient.key, { ...recipient.options, ...options });
            let jwe = {
                ciphertext: flattened.ciphertext,
                iv: flattened.iv,
                recipients: [{}],
                tag: flattened.tag,
            };
            if (flattened.aad)
                jwe.aad = flattened.aad;
            if (flattened.protected)
                jwe.protected = flattened.protected;
            if (flattened.unprotected)
                jwe.unprotected = flattened.unprotected;
            if (flattened.encrypted_key)
                jwe.recipients[0].encrypted_key = flattened.encrypted_key;
            if (flattened.header)
                jwe.recipients[0].header = flattened.header;
            return jwe;
        }
        let enc;
        for (let i = 0; i < this._recipients.length; i++) {
            const recipient = this._recipients[i];
            if (!(0,_lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_3__["default"])(this._protectedHeader, this._unprotectedHeader, recipient.unprotectedHeader)) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint');
            }
            const joseHeader = {
                ...this._protectedHeader,
                ...this._unprotectedHeader,
                ...recipient.unprotectedHeader,
            };
            const { alg } = joseHeader;
            if (typeof alg !== 'string' || !alg) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE "alg" (Algorithm) Header Parameter missing or invalid');
            }
            if (alg === 'dir' || alg === 'ECDH-ES') {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('"dir" and "ECDH-ES" alg may only be used with a single recipient');
            }
            if (typeof joseHeader.enc !== 'string' || !joseHeader.enc) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
            }
            if (!enc) {
                enc = joseHeader.enc;
            }
            else if (enc !== joseHeader.enc) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter must be the same for all recipients');
            }
            (0,_lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_6__["default"])(_util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid, new Map(), recipient.options.crit, this._protectedHeader, joseHeader);
            if (joseHeader.zip !== undefined) {
                if (!this._protectedHeader || !this._protectedHeader.zip) {
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWEInvalid('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
                }
            }
        }
        const cek = (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_2__["default"])(enc);
        let jwe = {
            ciphertext: '',
            iv: '',
            recipients: [],
            tag: '',
        };
        for (let i = 0; i < this._recipients.length; i++) {
            const recipient = this._recipients[i];
            const target = {};
            jwe.recipients.push(target);
            const joseHeader = {
                ...this._protectedHeader,
                ...this._unprotectedHeader,
                ...recipient.unprotectedHeader,
            };
            const p2c = joseHeader.alg.startsWith('PBES2') ? 2048 + i : undefined;
            if (i === 0) {
                const flattened = await new _flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__.FlattenedEncrypt(this._plaintext)
                    .setAdditionalAuthenticatedData(this._aad)
                    .setContentEncryptionKey(cek)
                    .setProtectedHeader(this._protectedHeader)
                    .setSharedUnprotectedHeader(this._unprotectedHeader)
                    .setUnprotectedHeader(recipient.unprotectedHeader)
                    .setKeyManagementParameters({ p2c })
                    .encrypt(recipient.key, {
                    ...recipient.options,
                    ...options,
                    [_flattened_encrypt_js__WEBPACK_IMPORTED_MODULE_0__.unprotected]: true,
                });
                jwe.ciphertext = flattened.ciphertext;
                jwe.iv = flattened.iv;
                jwe.tag = flattened.tag;
                if (flattened.aad)
                    jwe.aad = flattened.aad;
                if (flattened.protected)
                    jwe.protected = flattened.protected;
                if (flattened.unprotected)
                    jwe.unprotected = flattened.unprotected;
                target.encrypted_key = flattened.encrypted_key;
                if (flattened.header)
                    target.header = flattened.header;
                continue;
            }
            const { encryptedKey, parameters } = await (0,_lib_encrypt_key_management_js__WEBPACK_IMPORTED_MODULE_4__["default"])(((_a = recipient.unprotectedHeader) === null || _a === void 0 ? void 0 : _a.alg) ||
                ((_b = this._protectedHeader) === null || _b === void 0 ? void 0 : _b.alg) ||
                ((_c = this._unprotectedHeader) === null || _c === void 0 ? void 0 : _c.alg), enc, recipient.key, cek, { p2c });
            target.encrypted_key = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_5__.encode)(encryptedKey);
            if (recipient.unprotectedHeader || parameters)
                target.header = { ...recipient.unprotectedHeader, ...parameters };
        }
        return jwe;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwk/embedded.js":
/*!********************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwk/embedded.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EmbeddedJWK: () => (/* binding */ EmbeddedJWK)
/* harmony export */ });
/* harmony import */ var _key_import_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../key/import.js */ "./node_modules/jose/dist/browser/key/import.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");



async function EmbeddedJWK(protectedHeader, token) {
    const joseHeader = {
        ...protectedHeader,
        ...token === null || token === void 0 ? void 0 : token.header,
    };
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_1__["default"])(joseHeader.jwk)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('"jwk" (JSON Web Key) Header Parameter must be a JSON object');
    }
    const key = await (0,_key_import_js__WEBPACK_IMPORTED_MODULE_0__.importJWK)({ ...joseHeader.jwk, ext: true }, joseHeader.alg, true);
    if (key instanceof Uint8Array || key.type !== 'public') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('"jwk" (JSON Web Key) Header Parameter must be a public key');
    }
    return key;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwk/thumbprint.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwk/thumbprint.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calculateJwkThumbprint: () => (/* binding */ calculateJwkThumbprint),
/* harmony export */   calculateJwkThumbprintUri: () => (/* binding */ calculateJwkThumbprintUri)
/* harmony export */ });
/* harmony import */ var _runtime_digest_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/digest.js */ "./node_modules/jose/dist/browser/runtime/digest.js");
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");





const check = (value, description) => {
    if (typeof value !== 'string' || !value) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWKInvalid(`${description} missing or invalid`);
    }
};
async function calculateJwkThumbprint(jwk, digestAlgorithm) {
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_4__["default"])(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    digestAlgorithm !== null && digestAlgorithm !== void 0 ? digestAlgorithm : (digestAlgorithm = 'sha256');
    if (digestAlgorithm !== 'sha256' &&
        digestAlgorithm !== 'sha384' &&
        digestAlgorithm !== 'sha512') {
        throw new TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
    }
    let components;
    switch (jwk.kty) {
        case 'EC':
            check(jwk.crv, '"crv" (Curve) Parameter');
            check(jwk.x, '"x" (X Coordinate) Parameter');
            check(jwk.y, '"y" (Y Coordinate) Parameter');
            components = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
            break;
        case 'OKP':
            check(jwk.crv, '"crv" (Subtype of Key Pair) Parameter');
            check(jwk.x, '"x" (Public Key) Parameter');
            components = { crv: jwk.crv, kty: jwk.kty, x: jwk.x };
            break;
        case 'RSA':
            check(jwk.e, '"e" (Exponent) Parameter');
            check(jwk.n, '"n" (Modulus) Parameter');
            components = { e: jwk.e, kty: jwk.kty, n: jwk.n };
            break;
        case 'oct':
            check(jwk.k, '"k" (Key Value) Parameter');
            components = { k: jwk.k, kty: jwk.kty };
            break;
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('"kty" (Key Type) Parameter missing or unsupported');
    }
    const data = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.encoder.encode(JSON.stringify(components));
    return (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_1__.encode)(await (0,_runtime_digest_js__WEBPACK_IMPORTED_MODULE_0__["default"])(digestAlgorithm, data));
}
async function calculateJwkThumbprintUri(jwk, digestAlgorithm) {
    digestAlgorithm !== null && digestAlgorithm !== void 0 ? digestAlgorithm : (digestAlgorithm = 'sha256');
    const thumbprint = await calculateJwkThumbprint(jwk, digestAlgorithm);
    return `urn:ietf:params:oauth:jwk-thumbprint:sha-${digestAlgorithm.slice(-3)}:${thumbprint}`;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwks/local.js":
/*!******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwks/local.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LocalJWKSet: () => (/* binding */ LocalJWKSet),
/* harmony export */   createLocalJWKSet: () => (/* binding */ createLocalJWKSet),
/* harmony export */   isJWKSLike: () => (/* binding */ isJWKSLike)
/* harmony export */ });
/* harmony import */ var _key_import_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../key/import.js */ "./node_modules/jose/dist/browser/key/import.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");



function getKtyFromAlg(alg) {
    switch (typeof alg === 'string' && alg.slice(0, 2)) {
        case 'RS':
        case 'PS':
            return 'RSA';
        case 'ES':
            return 'EC';
        case 'Ed':
            return 'OKP';
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    }
}
function isJWKSLike(jwks) {
    return (jwks &&
        typeof jwks === 'object' &&
        Array.isArray(jwks.keys) &&
        jwks.keys.every(isJWKLike));
}
function isJWKLike(key) {
    return (0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(key);
}
function clone(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}
class LocalJWKSet {
    constructor(jwks) {
        this._cached = new WeakMap();
        if (!isJWKSLike(jwks)) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWKSInvalid('JSON Web Key Set malformed');
        }
        this._jwks = clone(jwks);
    }
    async getKey(protectedHeader, token) {
        const { alg, kid } = { ...protectedHeader, ...token === null || token === void 0 ? void 0 : token.header };
        const kty = getKtyFromAlg(alg);
        const candidates = this._jwks.keys.filter((jwk) => {
            let candidate = kty === jwk.kty;
            if (candidate && typeof kid === 'string') {
                candidate = kid === jwk.kid;
            }
            if (candidate && typeof jwk.alg === 'string') {
                candidate = alg === jwk.alg;
            }
            if (candidate && typeof jwk.use === 'string') {
                candidate = jwk.use === 'sig';
            }
            if (candidate && Array.isArray(jwk.key_ops)) {
                candidate = jwk.key_ops.includes('verify');
            }
            if (candidate && alg === 'EdDSA') {
                candidate = jwk.crv === 'Ed25519' || jwk.crv === 'Ed448';
            }
            if (candidate) {
                switch (alg) {
                    case 'ES256':
                        candidate = jwk.crv === 'P-256';
                        break;
                    case 'ES256K':
                        candidate = jwk.crv === 'secp256k1';
                        break;
                    case 'ES384':
                        candidate = jwk.crv === 'P-384';
                        break;
                    case 'ES512':
                        candidate = jwk.crv === 'P-521';
                        break;
                }
            }
            return candidate;
        });
        const { 0: jwk, length } = candidates;
        if (length === 0) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWKSNoMatchingKey();
        }
        else if (length !== 1) {
            const error = new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWKSMultipleMatchingKeys();
            const { _cached } = this;
            error[Symbol.asyncIterator] = async function* () {
                for (const jwk of candidates) {
                    try {
                        yield await importWithAlgCache(_cached, jwk, alg);
                    }
                    catch (_a) {
                        continue;
                    }
                }
            };
            throw error;
        }
        return importWithAlgCache(this._cached, jwk, alg);
    }
}
async function importWithAlgCache(cache, jwk, alg) {
    const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
    if (cached[alg] === undefined) {
        const key = await (0,_key_import_js__WEBPACK_IMPORTED_MODULE_0__.importJWK)({ ...jwk, ext: true }, alg);
        if (key instanceof Uint8Array || key.type !== 'public') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWKSInvalid('JSON Web Key Set members must be public keys');
        }
        cached[alg] = key;
    }
    return cached[alg];
}
function createLocalJWKSet(jwks) {
    const set = new LocalJWKSet(jwks);
    return async function (protectedHeader, token) {
        return set.getKey(protectedHeader, token);
    };
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwks/remote.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwks/remote.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createRemoteJWKSet: () => (/* binding */ createRemoteJWKSet)
/* harmony export */ });
/* harmony import */ var _runtime_fetch_jwks_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/fetch_jwks.js */ "./node_modules/jose/dist/browser/runtime/fetch_jwks.js");
/* harmony import */ var _runtime_env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/env.js */ "./node_modules/jose/dist/browser/runtime/env.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _local_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./local.js */ "./node_modules/jose/dist/browser/jwks/local.js");




class RemoteJWKSet extends _local_js__WEBPACK_IMPORTED_MODULE_3__.LocalJWKSet {
    constructor(url, options) {
        super({ keys: [] });
        this._jwks = undefined;
        if (!(url instanceof URL)) {
            throw new TypeError('url must be an instance of URL');
        }
        this._url = new URL(url.href);
        this._options = { agent: options === null || options === void 0 ? void 0 : options.agent, headers: options === null || options === void 0 ? void 0 : options.headers };
        this._timeoutDuration =
            typeof (options === null || options === void 0 ? void 0 : options.timeoutDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.timeoutDuration : 5000;
        this._cooldownDuration =
            typeof (options === null || options === void 0 ? void 0 : options.cooldownDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.cooldownDuration : 30000;
        this._cacheMaxAge = typeof (options === null || options === void 0 ? void 0 : options.cacheMaxAge) === 'number' ? options === null || options === void 0 ? void 0 : options.cacheMaxAge : 600000;
    }
    coolingDown() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cooldownDuration
            : false;
    }
    fresh() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cacheMaxAge
            : false;
    }
    async getKey(protectedHeader, token) {
        if (!this._jwks || !this.fresh()) {
            await this.reload();
        }
        try {
            return await super.getKey(protectedHeader, token);
        }
        catch (err) {
            if (err instanceof _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWKSNoMatchingKey) {
                if (this.coolingDown() === false) {
                    await this.reload();
                    return super.getKey(protectedHeader, token);
                }
            }
            throw err;
        }
    }
    async reload() {
        if (this._pendingFetch && (0,_runtime_env_js__WEBPACK_IMPORTED_MODULE_1__.isCloudflareWorkers)()) {
            this._pendingFetch = undefined;
        }
        this._pendingFetch || (this._pendingFetch = (0,_runtime_fetch_jwks_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this._url, this._timeoutDuration, this._options)
            .then((json) => {
            if (!(0,_local_js__WEBPACK_IMPORTED_MODULE_3__.isJWKSLike)(json)) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWKSInvalid('JSON Web Key Set malformed');
            }
            this._jwks = { keys: json.keys };
            this._jwksTimestamp = Date.now();
            this._pendingFetch = undefined;
        })
            .catch((err) => {
            this._pendingFetch = undefined;
            throw err;
        }));
        await this._pendingFetch;
    }
}
function createRemoteJWKSet(url, options) {
    const set = new RemoteJWKSet(url, options);
    return async function (protectedHeader, token) {
        return set.getKey(protectedHeader, token);
    };
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/compact/sign.js":
/*!************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/compact/sign.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompactSign: () => (/* binding */ CompactSign)
/* harmony export */ });
/* harmony import */ var _flattened_sign_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/sign.js */ "./node_modules/jose/dist/browser/jws/flattened/sign.js");

class CompactSign {
    constructor(payload) {
        this._flattened = new _flattened_sign_js__WEBPACK_IMPORTED_MODULE_0__.FlattenedSign(payload);
    }
    setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    async sign(key, options) {
        const jws = await this._flattened.sign(key, options);
        if (jws.payload === undefined) {
            throw new TypeError('use the flattened module for creating JWS with b64: false');
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/compact/verify.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/compact/verify.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compactVerify: () => (/* binding */ compactVerify)
/* harmony export */ });
/* harmony import */ var _flattened_verify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/verify.js */ "./node_modules/jose/dist/browser/jws/flattened/verify.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");



async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
        jws = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__.decoder.decode(jws);
    }
    if (typeof jws !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('Compact JWS must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.');
    if (length !== 3) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('Invalid Compact JWS');
    }
    const verified = await (0,_flattened_verify_js__WEBPACK_IMPORTED_MODULE_0__.flattenedVerify)({ payload, protected: protectedHeader, signature }, key, options);
    const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/flattened/sign.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/flattened/sign.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FlattenedSign: () => (/* binding */ FlattenedSign)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _runtime_sign_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../runtime/sign.js */ "./node_modules/jose/dist/browser/runtime/sign.js");
/* harmony import */ var _lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/is_disjoint.js */ "./node_modules/jose/dist/browser/lib/is_disjoint.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_check_key_type_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../lib/check_key_type.js */ "./node_modules/jose/dist/browser/lib/check_key_type.js");
/* harmony import */ var _lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/validate_crit.js */ "./node_modules/jose/dist/browser/lib/validate_crit.js");







class FlattenedSign {
    constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
            throw new TypeError('payload must be an instance of Uint8Array');
        }
        this._payload = payload;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWSInvalid('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
        }
        if (!(0,_lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this._protectedHeader, this._unprotectedHeader)) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
        };
        const extensions = (0,_lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_6__["default"])(_util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWSInvalid, new Map([['b64', true]]), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has('b64')) {
            b64 = this._protectedHeader.b64;
            if (typeof b64 !== 'boolean') {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
            }
        }
        const { alg } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        (0,_lib_check_key_type_js__WEBPACK_IMPORTED_MODULE_5__["default"])(alg, key, 'sign');
        let payload = this._payload;
        if (b64) {
            payload = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.encoder.encode((0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
            protectedHeader = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.encoder.encode((0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(JSON.stringify(this._protectedHeader)));
        }
        else {
            protectedHeader = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.encoder.encode('');
        }
        const data = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.concat)(protectedHeader, _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.encoder.encode('.'), payload);
        const signature = await (0,_runtime_sign_js__WEBPACK_IMPORTED_MODULE_1__["default"])(alg, key, data);
        const jws = {
            signature: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode)(signature),
            payload: '',
        };
        if (b64) {
            jws.payload = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.decoder.decode(payload);
        }
        if (this._unprotectedHeader) {
            jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
            jws.protected = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_4__.decoder.decode(protectedHeader);
        }
        return jws;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/flattened/verify.js":
/*!****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/flattened/verify.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   flattenedVerify: () => (/* binding */ flattenedVerify)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _runtime_verify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../runtime/verify.js */ "./node_modules/jose/dist/browser/runtime/verify.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/is_disjoint.js */ "./node_modules/jose/dist/browser/lib/is_disjoint.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _lib_check_key_type_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/check_key_type.js */ "./node_modules/jose/dist/browser/lib/check_key_type.js");
/* harmony import */ var _lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../lib/validate_crit.js */ "./node_modules/jose/dist/browser/lib/validate_crit.js");
/* harmony import */ var _lib_validate_algorithms_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../lib/validate_algorithms.js */ "./node_modules/jose/dist/browser/lib/validate_algorithms.js");









async function flattenedVerify(jws, key, options) {
    var _a;
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__["default"])(jws)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_5__["default"])(jws.header)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        try {
            const protectedHeader = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jws.protected);
            parsedProt = JSON.parse(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.decoder.decode(protectedHeader));
        }
        catch (_b) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Protected Header is invalid');
        }
    }
    if (!(0,_lib_is_disjoint_js__WEBPACK_IMPORTED_MODULE_4__["default"])(parsedProt, jws.header)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header,
    };
    const extensions = (0,_lib_validate_crit_js__WEBPACK_IMPORTED_MODULE_7__["default"])(_util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid, new Map([['b64', true]]), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && (0,_lib_validate_algorithms_js__WEBPACK_IMPORTED_MODULE_8__["default"])('algorithms', options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Payload must be a string');
        }
    }
    else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSInvalid('JWS Payload must be a string or an Uint8Array instance');
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
        resolvedKey = true;
    }
    (0,_lib_check_key_type_js__WEBPACK_IMPORTED_MODULE_6__["default"])(alg, key, 'verify');
    const data = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.concat)(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.encoder.encode((_a = jws.protected) !== null && _a !== void 0 ? _a : ''), _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.encoder.encode('.'), typeof jws.payload === 'string' ? _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.encoder.encode(jws.payload) : jws.payload);
    const signature = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jws.signature);
    const verified = await (0,_runtime_verify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(alg, key, signature, data);
    if (!verified) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWSSignatureVerificationFailed();
    }
    let payload;
    if (b64) {
        payload = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jws.payload);
    }
    else if (typeof jws.payload === 'string') {
        payload = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_3__.encoder.encode(jws.payload);
    }
    else {
        payload = jws.payload;
    }
    const result = { payload };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
        return { ...result, key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/general/sign.js":
/*!************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/general/sign.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GeneralSign: () => (/* binding */ GeneralSign)
/* harmony export */ });
/* harmony import */ var _flattened_sign_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/sign.js */ "./node_modules/jose/dist/browser/jws/flattened/sign.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");


class IndividualSignature {
    constructor(sig, key, options) {
        this.parent = sig;
        this.key = key;
        this.options = options;
    }
    setProtectedHeader(protectedHeader) {
        if (this.protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this.protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this.unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this.unprotectedHeader = unprotectedHeader;
        return this;
    }
    addSignature(...args) {
        return this.parent.addSignature(...args);
    }
    sign(...args) {
        return this.parent.sign(...args);
    }
    done() {
        return this.parent;
    }
}
class GeneralSign {
    constructor(payload) {
        this._signatures = [];
        this._payload = payload;
    }
    addSignature(key, options) {
        const signature = new IndividualSignature(this, key, options);
        this._signatures.push(signature);
        return signature;
    }
    async sign() {
        if (!this._signatures.length) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('at least one signature must be added');
        }
        const jws = {
            signatures: [],
            payload: '',
        };
        for (let i = 0; i < this._signatures.length; i++) {
            const signature = this._signatures[i];
            const flattened = new _flattened_sign_js__WEBPACK_IMPORTED_MODULE_0__.FlattenedSign(this._payload);
            flattened.setProtectedHeader(signature.protectedHeader);
            flattened.setUnprotectedHeader(signature.unprotectedHeader);
            const { payload, ...rest } = await flattened.sign(signature.key, signature.options);
            if (i === 0) {
                jws.payload = payload;
            }
            else if (jws.payload !== payload) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('inconsistent use of JWS Unencoded Payload Option (RFC7797)');
            }
            jws.signatures.push(rest);
        }
        return jws;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jws/general/verify.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/jws/general/verify.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generalVerify: () => (/* binding */ generalVerify)
/* harmony export */ });
/* harmony import */ var _flattened_verify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flattened/verify.js */ "./node_modules/jose/dist/browser/jws/flattened/verify.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");



async function generalVerify(jws, key, options) {
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(jws)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('General JWS must be an object');
    }
    if (!Array.isArray(jws.signatures) || !jws.signatures.every(_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSInvalid('JWS Signatures missing or incorrect type');
    }
    for (const signature of jws.signatures) {
        try {
            return await (0,_flattened_verify_js__WEBPACK_IMPORTED_MODULE_0__.flattenedVerify)({
                header: signature.header,
                payload: jws.payload,
                protected: signature.protected,
                signature: signature.signature,
            }, key, options);
        }
        catch (_a) {
        }
    }
    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWSSignatureVerificationFailed();
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/decrypt.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/decrypt.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jwtDecrypt: () => (/* binding */ jwtDecrypt)
/* harmony export */ });
/* harmony import */ var _jwe_compact_decrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../jwe/compact/decrypt.js */ "./node_modules/jose/dist/browser/jwe/compact/decrypt.js");
/* harmony import */ var _lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/jwt_claims_set.js */ "./node_modules/jose/dist/browser/lib/jwt_claims_set.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");



async function jwtDecrypt(jwt, key, options) {
    const decrypted = await (0,_jwe_compact_decrypt_js__WEBPACK_IMPORTED_MODULE_0__.compactDecrypt)(jwt, key, options);
    const payload = (0,_lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_1__["default"])(decrypted.protectedHeader, decrypted.plaintext, options);
    const { protectedHeader } = decrypted;
    if (protectedHeader.iss !== undefined && protectedHeader.iss !== payload.iss) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTClaimValidationFailed('replicated "iss" claim header parameter mismatch', 'iss', 'mismatch');
    }
    if (protectedHeader.sub !== undefined && protectedHeader.sub !== payload.sub) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTClaimValidationFailed('replicated "sub" claim header parameter mismatch', 'sub', 'mismatch');
    }
    if (protectedHeader.aud !== undefined &&
        JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTClaimValidationFailed('replicated "aud" claim header parameter mismatch', 'aud', 'mismatch');
    }
    const result = { payload, protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: decrypted.key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/encrypt.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/encrypt.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EncryptJWT: () => (/* binding */ EncryptJWT)
/* harmony export */ });
/* harmony import */ var _jwe_compact_encrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../jwe/compact/encrypt.js */ "./node_modules/jose/dist/browser/jwe/compact/encrypt.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _produce_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./produce.js */ "./node_modules/jose/dist/browser/jwt/produce.js");



class EncryptJWT extends _produce_js__WEBPACK_IMPORTED_MODULE_2__.ProduceJWT {
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setKeyManagementParameters(parameters) {
        if (this._keyManagementParameters) {
            throw new TypeError('setKeyManagementParameters can only be called once');
        }
        this._keyManagementParameters = parameters;
        return this;
    }
    setContentEncryptionKey(cek) {
        if (this._cek) {
            throw new TypeError('setContentEncryptionKey can only be called once');
        }
        this._cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        if (this._iv) {
            throw new TypeError('setInitializationVector can only be called once');
        }
        this._iv = iv;
        return this;
    }
    replicateIssuerAsHeader() {
        this._replicateIssuerAsHeader = true;
        return this;
    }
    replicateSubjectAsHeader() {
        this._replicateSubjectAsHeader = true;
        return this;
    }
    replicateAudienceAsHeader() {
        this._replicateAudienceAsHeader = true;
        return this;
    }
    async encrypt(key, options) {
        const enc = new _jwe_compact_encrypt_js__WEBPACK_IMPORTED_MODULE_0__.CompactEncrypt(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.encoder.encode(JSON.stringify(this._payload)));
        if (this._replicateIssuerAsHeader) {
            this._protectedHeader = { ...this._protectedHeader, iss: this._payload.iss };
        }
        if (this._replicateSubjectAsHeader) {
            this._protectedHeader = { ...this._protectedHeader, sub: this._payload.sub };
        }
        if (this._replicateAudienceAsHeader) {
            this._protectedHeader = { ...this._protectedHeader, aud: this._payload.aud };
        }
        enc.setProtectedHeader(this._protectedHeader);
        if (this._iv) {
            enc.setInitializationVector(this._iv);
        }
        if (this._cek) {
            enc.setContentEncryptionKey(this._cek);
        }
        if (this._keyManagementParameters) {
            enc.setKeyManagementParameters(this._keyManagementParameters);
        }
        return enc.encrypt(key, options);
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/produce.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/produce.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProduceJWT: () => (/* binding */ ProduceJWT)
/* harmony export */ });
/* harmony import */ var _lib_epoch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/epoch.js */ "./node_modules/jose/dist/browser/lib/epoch.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _lib_secs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/secs.js */ "./node_modules/jose/dist/browser/lib/secs.js");



class ProduceJWT {
    constructor(payload) {
        if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_1__["default"])(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this._payload = payload;
    }
    setIssuer(issuer) {
        this._payload = { ...this._payload, iss: issuer };
        return this;
    }
    setSubject(subject) {
        this._payload = { ...this._payload, sub: subject };
        return this;
    }
    setAudience(audience) {
        this._payload = { ...this._payload, aud: audience };
        return this;
    }
    setJti(jwtId) {
        this._payload = { ...this._payload, jti: jwtId };
        return this;
    }
    setNotBefore(input) {
        if (typeof input === 'number') {
            this._payload = { ...this._payload, nbf: input };
        }
        else {
            this._payload = { ...this._payload, nbf: (0,_lib_epoch_js__WEBPACK_IMPORTED_MODULE_0__["default"])(new Date()) + (0,_lib_secs_js__WEBPACK_IMPORTED_MODULE_2__["default"])(input) };
        }
        return this;
    }
    setExpirationTime(input) {
        if (typeof input === 'number') {
            this._payload = { ...this._payload, exp: input };
        }
        else {
            this._payload = { ...this._payload, exp: (0,_lib_epoch_js__WEBPACK_IMPORTED_MODULE_0__["default"])(new Date()) + (0,_lib_secs_js__WEBPACK_IMPORTED_MODULE_2__["default"])(input) };
        }
        return this;
    }
    setIssuedAt(input) {
        if (typeof input === 'undefined') {
            this._payload = { ...this._payload, iat: (0,_lib_epoch_js__WEBPACK_IMPORTED_MODULE_0__["default"])(new Date()) };
        }
        else {
            this._payload = { ...this._payload, iat: input };
        }
        return this;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/sign.js":
/*!****************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/sign.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignJWT: () => (/* binding */ SignJWT)
/* harmony export */ });
/* harmony import */ var _jws_compact_sign_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../jws/compact/sign.js */ "./node_modules/jose/dist/browser/jws/compact/sign.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _produce_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./produce.js */ "./node_modules/jose/dist/browser/jwt/produce.js");




class SignJWT extends _produce_js__WEBPACK_IMPORTED_MODULE_3__.ProduceJWT {
    setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        var _a;
        const sig = new _jws_compact_sign_js__WEBPACK_IMPORTED_MODULE_0__.CompactSign(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_2__.encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (Array.isArray((_a = this._protectedHeader) === null || _a === void 0 ? void 0 : _a.crit) &&
            this._protectedHeader.crit.includes('b64') &&
            this._protectedHeader.b64 === false) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JWTInvalid('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/unsecured.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/unsecured.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnsecuredJWT: () => (/* binding */ UnsecuredJWT)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/jwt_claims_set.js */ "./node_modules/jose/dist/browser/lib/jwt_claims_set.js");
/* harmony import */ var _produce_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./produce.js */ "./node_modules/jose/dist/browser/jwt/produce.js");





class UnsecuredJWT extends _produce_js__WEBPACK_IMPORTED_MODULE_4__.ProduceJWT {
    encode() {
        const header = _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode(JSON.stringify({ alg: 'none' }));
        const payload = _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode(JSON.stringify(this._payload));
        return `${header}.${payload}.`;
    }
    static decode(jwt, options) {
        if (typeof jwt !== 'string') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTInvalid('Unsecured JWT must be a string');
        }
        const { 0: encodedHeader, 1: encodedPayload, 2: signature, length } = jwt.split('.');
        if (length !== 3 || signature !== '') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTInvalid('Invalid Unsecured JWT');
        }
        let header;
        try {
            header = JSON.parse(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.decoder.decode(_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode(encodedHeader)));
            if (header.alg !== 'none')
                throw new Error();
        }
        catch (_a) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTInvalid('Invalid Unsecured JWT');
        }
        const payload = (0,_lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_3__["default"])(header, _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode(encodedPayload), options);
        return { payload, header };
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/jwt/verify.js":
/*!******************************************************!*\
  !*** ./node_modules/jose/dist/browser/jwt/verify.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jwtVerify: () => (/* binding */ jwtVerify)
/* harmony export */ });
/* harmony import */ var _jws_compact_verify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../jws/compact/verify.js */ "./node_modules/jose/dist/browser/jws/compact/verify.js");
/* harmony import */ var _lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/jwt_claims_set.js */ "./node_modules/jose/dist/browser/lib/jwt_claims_set.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");



async function jwtVerify(jwt, key, options) {
    var _a;
    const verified = await (0,_jws_compact_verify_js__WEBPACK_IMPORTED_MODULE_0__.compactVerify)(jwt, key, options);
    if (((_a = verified.protectedHeader.crit) === null || _a === void 0 ? void 0 : _a.includes('b64')) && verified.protectedHeader.b64 === false) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JWTInvalid('JWTs MUST NOT use unencoded payload');
    }
    const payload = (0,_lib_jwt_claims_set_js__WEBPACK_IMPORTED_MODULE_1__["default"])(verified.protectedHeader, verified.payload, options);
    const result = { payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/key/export.js":
/*!******************************************************!*\
  !*** ./node_modules/jose/dist/browser/key/export.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportJWK: () => (/* binding */ exportJWK),
/* harmony export */   exportPKCS8: () => (/* binding */ exportPKCS8),
/* harmony export */   exportSPKI: () => (/* binding */ exportSPKI)
/* harmony export */ });
/* harmony import */ var _runtime_asn1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/asn1.js */ "./node_modules/jose/dist/browser/runtime/asn1.js");
/* harmony import */ var _runtime_key_to_jwk_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/key_to_jwk.js */ "./node_modules/jose/dist/browser/runtime/key_to_jwk.js");



async function exportSPKI(key) {
    return (0,_runtime_asn1_js__WEBPACK_IMPORTED_MODULE_0__.toSPKI)(key);
}
async function exportPKCS8(key) {
    return (0,_runtime_asn1_js__WEBPACK_IMPORTED_MODULE_0__.toPKCS8)(key);
}
async function exportJWK(key) {
    return (0,_runtime_key_to_jwk_js__WEBPACK_IMPORTED_MODULE_1__["default"])(key);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/key/generate_key_pair.js":
/*!*****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/key/generate_key_pair.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateKeyPair: () => (/* binding */ generateKeyPair)
/* harmony export */ });
/* harmony import */ var _runtime_generate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/generate.js */ "./node_modules/jose/dist/browser/runtime/generate.js");

async function generateKeyPair(alg, options) {
    return (0,_runtime_generate_js__WEBPACK_IMPORTED_MODULE_0__.generateKeyPair)(alg, options);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/key/generate_secret.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/key/generate_secret.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateSecret: () => (/* binding */ generateSecret)
/* harmony export */ });
/* harmony import */ var _runtime_generate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/generate.js */ "./node_modules/jose/dist/browser/runtime/generate.js");

async function generateSecret(alg, options) {
    return (0,_runtime_generate_js__WEBPACK_IMPORTED_MODULE_0__.generateSecret)(alg, options);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/key/import.js":
/*!******************************************************!*\
  !*** ./node_modules/jose/dist/browser/key/import.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   importJWK: () => (/* binding */ importJWK),
/* harmony export */   importPKCS8: () => (/* binding */ importPKCS8),
/* harmony export */   importSPKI: () => (/* binding */ importSPKI),
/* harmony export */   importX509: () => (/* binding */ importX509)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _runtime_asn1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/asn1.js */ "./node_modules/jose/dist/browser/runtime/asn1.js");
/* harmony import */ var _runtime_jwk_to_key_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../runtime/jwk_to_key.js */ "./node_modules/jose/dist/browser/runtime/jwk_to_key.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");





async function importSPKI(spki, alg, options) {
    if (typeof spki !== 'string' || spki.indexOf('-----BEGIN PUBLIC KEY-----') !== 0) {
        throw new TypeError('"spki" must be SPKI formatted string');
    }
    return (0,_runtime_asn1_js__WEBPACK_IMPORTED_MODULE_1__.fromSPKI)(spki, alg, options);
}
async function importX509(x509, alg, options) {
    if (typeof x509 !== 'string' || x509.indexOf('-----BEGIN CERTIFICATE-----') !== 0) {
        throw new TypeError('"x509" must be X.509 formatted string');
    }
    return (0,_runtime_asn1_js__WEBPACK_IMPORTED_MODULE_1__.fromX509)(x509, alg, options);
}
async function importPKCS8(pkcs8, alg, options) {
    if (typeof pkcs8 !== 'string' || pkcs8.indexOf('-----BEGIN PRIVATE KEY-----') !== 0) {
        throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
    }
    return (0,_runtime_asn1_js__WEBPACK_IMPORTED_MODULE_1__.fromPKCS8)(pkcs8, alg, options);
}
async function importJWK(jwk, alg, octAsKeyObject) {
    var _a;
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_4__["default"])(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    alg || (alg = jwk.alg);
    switch (jwk.kty) {
        case 'oct':
            if (typeof jwk.k !== 'string' || !jwk.k) {
                throw new TypeError('missing "k" (Key Value) Parameter value');
            }
            octAsKeyObject !== null && octAsKeyObject !== void 0 ? octAsKeyObject : (octAsKeyObject = jwk.ext !== true);
            if (octAsKeyObject) {
                return (0,_runtime_jwk_to_key_js__WEBPACK_IMPORTED_MODULE_2__["default"])({ ...jwk, alg, ext: (_a = jwk.ext) !== null && _a !== void 0 ? _a : false });
            }
            return (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(jwk.k);
        case 'RSA':
            if (jwk.oth !== undefined) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            }
        case 'EC':
        case 'OKP':
            return (0,_runtime_jwk_to_key_js__WEBPACK_IMPORTED_MODULE_2__["default"])({ ...jwk, alg });
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_3__.JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/aesgcmkw.js":
/*!********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/aesgcmkw.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unwrap: () => (/* binding */ unwrap),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _runtime_encrypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/encrypt.js */ "./node_modules/jose/dist/browser/runtime/encrypt.js");
/* harmony import */ var _runtime_decrypt_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/decrypt.js */ "./node_modules/jose/dist/browser/runtime/decrypt.js");
/* harmony import */ var _iv_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./iv.js */ "./node_modules/jose/dist/browser/lib/iv.js");
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");




async function wrap(alg, key, cek, iv) {
    const jweAlgorithm = alg.slice(0, 7);
    iv || (iv = (0,_iv_js__WEBPACK_IMPORTED_MODULE_2__["default"])(jweAlgorithm));
    const { ciphertext: encryptedKey, tag } = await (0,_runtime_encrypt_js__WEBPACK_IMPORTED_MODULE_0__["default"])(jweAlgorithm, cek, key, iv, new Uint8Array(0));
    return { encryptedKey, iv: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_3__.encode)(iv), tag: (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_3__.encode)(tag) };
}
async function unwrap(alg, key, encryptedKey, iv, tag) {
    const jweAlgorithm = alg.slice(0, 7);
    return (0,_runtime_decrypt_js__WEBPACK_IMPORTED_MODULE_1__["default"])(jweAlgorithm, key, encryptedKey, iv, tag, new Uint8Array(0));
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/buffer_utils.js":
/*!************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/buffer_utils.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concat: () => (/* binding */ concat),
/* harmony export */   concatKdf: () => (/* binding */ concatKdf),
/* harmony export */   decoder: () => (/* binding */ decoder),
/* harmony export */   encoder: () => (/* binding */ encoder),
/* harmony export */   lengthAndInput: () => (/* binding */ lengthAndInput),
/* harmony export */   p2s: () => (/* binding */ p2s),
/* harmony export */   uint32be: () => (/* binding */ uint32be),
/* harmony export */   uint64be: () => (/* binding */ uint64be)
/* harmony export */ });
/* harmony import */ var _runtime_digest_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/digest.js */ "./node_modules/jose/dist/browser/runtime/digest.js");

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAX_INT32 = 2 ** 32;
function concat(...buffers) {
    const size = buffers.reduce((acc, { length }) => acc + length, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    buffers.forEach((buffer) => {
        buf.set(buffer, i);
        i += buffer.length;
    });
    return buf;
}
function p2s(alg, p2sInput) {
    return concat(encoder.encode(alg), new Uint8Array([0]), p2sInput);
}
function writeUInt32BE(buf, value, offset) {
    if (value < 0 || value >= MAX_INT32) {
        throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`);
    }
    buf.set([value >>> 24, value >>> 16, value >>> 8, value & 0xff], offset);
}
function uint64be(value) {
    const high = Math.floor(value / MAX_INT32);
    const low = value % MAX_INT32;
    const buf = new Uint8Array(8);
    writeUInt32BE(buf, high, 0);
    writeUInt32BE(buf, low, 4);
    return buf;
}
function uint32be(value) {
    const buf = new Uint8Array(4);
    writeUInt32BE(buf, value);
    return buf;
}
function lengthAndInput(input) {
    return concat(uint32be(input.length), input);
}
async function concatKdf(secret, bits, value) {
    const iterations = Math.ceil((bits >> 3) / 32);
    const res = new Uint8Array(iterations * 32);
    for (let iter = 0; iter < iterations; iter++) {
        const buf = new Uint8Array(4 + secret.length + value.length);
        buf.set(uint32be(iter + 1));
        buf.set(secret, 4);
        buf.set(value, 4 + secret.length);
        res.set(await (0,_runtime_digest_js__WEBPACK_IMPORTED_MODULE_0__["default"])('sha256', buf), iter * 32);
    }
    return res.slice(0, bits >> 3);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/cek.js":
/*!***************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/cek.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bitLength: () => (/* binding */ bitLength),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _runtime_random_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/random.js */ "./node_modules/jose/dist/browser/runtime/random.js");


function bitLength(alg) {
    switch (alg) {
        case 'A128GCM':
            return 128;
        case 'A192GCM':
            return 192;
        case 'A256GCM':
        case 'A128CBC-HS256':
            return 256;
        case 'A192CBC-HS384':
            return 384;
        case 'A256CBC-HS512':
            return 512;
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((alg) => (0,_runtime_random_js__WEBPACK_IMPORTED_MODULE_1__["default"])(new Uint8Array(bitLength(alg) >> 3)));


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/check_iv_length.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/check_iv_length.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _iv_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iv.js */ "./node_modules/jose/dist/browser/lib/iv.js");


const checkIvLength = (enc, iv) => {
    if (iv.length << 3 !== (0,_iv_js__WEBPACK_IMPORTED_MODULE_1__.bitLength)(enc)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWEInvalid('Invalid Initialization Vector length');
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (checkIvLength);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/check_key_type.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/check_key_type.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _invalid_key_input_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");


const symmetricTypeCheck = (alg, key) => {
    if (key instanceof Uint8Array)
        return;
    if (!(0,_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__["default"])(key)) {
        throw new TypeError((0,_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_0__.withAlg)(alg, key, ..._runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types, 'Uint8Array'));
    }
    if (key.type !== 'secret') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for symmetric algorithms must be of type "secret"`);
    }
};
const asymmetricTypeCheck = (alg, key, usage) => {
    if (!(0,_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__["default"])(key)) {
        throw new TypeError((0,_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_0__.withAlg)(alg, key, ..._runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types));
    }
    if (key.type === 'secret') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (usage === 'sign' && key.type === 'public') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for asymmetric algorithm signing must be of type "private"`);
    }
    if (usage === 'decrypt' && key.type === 'public') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for asymmetric algorithm decryption must be of type "private"`);
    }
    if (key.algorithm && usage === 'verify' && key.type === 'private') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for asymmetric algorithm verifying must be of type "public"`);
    }
    if (key.algorithm && usage === 'encrypt' && key.type === 'private') {
        throw new TypeError(`${_runtime_is_key_like_js__WEBPACK_IMPORTED_MODULE_1__.types.join(' or ')} instances for asymmetric algorithm encryption must be of type "public"`);
    }
};
const checkKeyType = (alg, key, usage) => {
    const symmetric = alg.startsWith('HS') ||
        alg === 'dir' ||
        alg.startsWith('PBES2') ||
        /^A\d{3}(?:GCM)?KW$/.test(alg);
    if (symmetric) {
        symmetricTypeCheck(alg, key);
    }
    else {
        asymmetricTypeCheck(alg, key, usage);
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (checkKeyType);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/check_p2s.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/check_p2s.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ checkP2s)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

function checkP2s(p2s) {
    if (!(p2s instanceof Uint8Array) || p2s.length < 8) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWEInvalid('PBES2 Salt Input must be 8 or more octets');
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/crypto_key.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/crypto_key.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkEncCryptoKey: () => (/* binding */ checkEncCryptoKey),
/* harmony export */   checkSigCryptoKey: () => (/* binding */ checkSigCryptoKey)
/* harmony export */ });
/* harmony import */ var _runtime_env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/env.js */ "./node_modules/jose/dist/browser/runtime/env.js");

function unusable(name, prop = 'algorithm.name') {
    return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
    return algorithm.name === name;
}
function getHashLength(hash) {
    return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
    switch (alg) {
        case 'ES256':
            return 'P-256';
        case 'ES384':
            return 'P-384';
        case 'ES512':
            return 'P-521';
        default:
            throw new Error('unreachable');
    }
}
function checkUsage(key, usages) {
    if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
        let msg = 'CryptoKey does not support this operation, its usages must include ';
        if (usages.length > 2) {
            const last = usages.pop();
            msg += `one of ${usages.join(', ')}, or ${last}.`;
        }
        else if (usages.length === 2) {
            msg += `one of ${usages[0]} or ${usages[1]}.`;
        }
        else {
            msg += `${usages[0]}.`;
        }
        throw new TypeError(msg);
    }
}
function checkSigCryptoKey(key, alg, ...usages) {
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512': {
            if (!isAlgorithm(key.algorithm, 'HMAC'))
                throw unusable('HMAC');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'RS256':
        case 'RS384':
        case 'RS512': {
            if (!isAlgorithm(key.algorithm, 'RSASSA-PKCS1-v1_5'))
                throw unusable('RSASSA-PKCS1-v1_5');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'PS256':
        case 'PS384':
        case 'PS512': {
            if (!isAlgorithm(key.algorithm, 'RSA-PSS'))
                throw unusable('RSA-PSS');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'EdDSA': {
            if (key.algorithm.name !== 'Ed25519' && key.algorithm.name !== 'Ed448') {
                if ((0,_runtime_env_js__WEBPACK_IMPORTED_MODULE_0__.isCloudflareWorkers)()) {
                    if (isAlgorithm(key.algorithm, 'NODE-ED25519'))
                        break;
                    throw unusable('Ed25519, Ed448, or NODE-ED25519');
                }
                throw unusable('Ed25519 or Ed448');
            }
            break;
        }
        case 'ES256':
        case 'ES384':
        case 'ES512': {
            if (!isAlgorithm(key.algorithm, 'ECDSA'))
                throw unusable('ECDSA');
            const expected = getNamedCurve(alg);
            const actual = key.algorithm.namedCurve;
            if (actual !== expected)
                throw unusable(expected, 'algorithm.namedCurve');
            break;
        }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usages);
}
function checkEncCryptoKey(key, alg, ...usages) {
    switch (alg) {
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM': {
            if (!isAlgorithm(key.algorithm, 'AES-GCM'))
                throw unusable('AES-GCM');
            const expected = parseInt(alg.slice(1, 4), 10);
            const actual = key.algorithm.length;
            if (actual !== expected)
                throw unusable(expected, 'algorithm.length');
            break;
        }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW': {
            if (!isAlgorithm(key.algorithm, 'AES-KW'))
                throw unusable('AES-KW');
            const expected = parseInt(alg.slice(1, 4), 10);
            const actual = key.algorithm.length;
            if (actual !== expected)
                throw unusable(expected, 'algorithm.length');
            break;
        }
        case 'ECDH': {
            switch (key.algorithm.name) {
                case 'ECDH':
                case 'X25519':
                case 'X448':
                    break;
                default:
                    throw unusable('ECDH, X25519, or X448');
            }
            break;
        }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            if (!isAlgorithm(key.algorithm, 'PBKDF2'))
                throw unusable('PBKDF2');
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512': {
            if (!isAlgorithm(key.algorithm, 'RSA-OAEP'))
                throw unusable('RSA-OAEP');
            const expected = parseInt(alg.slice(9), 10) || 1;
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usages);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/decrypt_key_management.js":
/*!**********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/decrypt_key_management.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/aeskw.js */ "./node_modules/jose/dist/browser/runtime/aeskw.js");
/* harmony import */ var _runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/ecdhes.js */ "./node_modules/jose/dist/browser/runtime/ecdhes.js");
/* harmony import */ var _runtime_pbes2kw_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../runtime/pbes2kw.js */ "./node_modules/jose/dist/browser/runtime/pbes2kw.js");
/* harmony import */ var _runtime_rsaes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../runtime/rsaes.js */ "./node_modules/jose/dist/browser/runtime/rsaes.js");
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _lib_cek_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/cek.js */ "./node_modules/jose/dist/browser/lib/cek.js");
/* harmony import */ var _key_import_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../key/import.js */ "./node_modules/jose/dist/browser/key/import.js");
/* harmony import */ var _check_key_type_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./check_key_type.js */ "./node_modules/jose/dist/browser/lib/check_key_type.js");
/* harmony import */ var _is_object_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _aesgcmkw_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./aesgcmkw.js */ "./node_modules/jose/dist/browser/lib/aesgcmkw.js");











async function decryptKeyManagement(alg, key, encryptedKey, joseHeader, options) {
    (0,_check_key_type_js__WEBPACK_IMPORTED_MODULE_8__["default"])(alg, key, 'decrypt');
    switch (alg) {
        case 'dir': {
            if (encryptedKey !== undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('Encountered unexpected JWE Encrypted Key');
            return key;
        }
        case 'ECDH-ES':
            if (encryptedKey !== undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('Encountered unexpected JWE Encrypted Key');
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            if (!(0,_is_object_js__WEBPACK_IMPORTED_MODULE_9__["default"])(joseHeader.epk))
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
            if (!_runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__.ecdhAllowed(key))
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JOSENotSupported('ECDH with the provided key is not allowed or not supported by your javascript runtime');
            const epk = await (0,_key_import_js__WEBPACK_IMPORTED_MODULE_7__.importJWK)(joseHeader.epk, alg);
            let partyUInfo;
            let partyVInfo;
            if (joseHeader.apu !== undefined) {
                if (typeof joseHeader.apu !== 'string')
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
                partyUInfo = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.decode)(joseHeader.apu);
            }
            if (joseHeader.apv !== undefined) {
                if (typeof joseHeader.apv !== 'string')
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
                partyVInfo = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.decode)(joseHeader.apv);
            }
            const sharedSecret = await _runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__.deriveKey(epk, key, alg === 'ECDH-ES' ? joseHeader.enc : alg, alg === 'ECDH-ES' ? (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_6__.bitLength)(joseHeader.enc) : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
            if (alg === 'ECDH-ES')
                return sharedSecret;
            if (encryptedKey === undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Encrypted Key missing');
            return (0,_runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__.unwrap)(alg.slice(-6), sharedSecret, encryptedKey);
        }
        case 'RSA1_5':
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512': {
            if (encryptedKey === undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Encrypted Key missing');
            return (0,_runtime_rsaes_js__WEBPACK_IMPORTED_MODULE_3__.decrypt)(alg, key, encryptedKey);
        }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW': {
            if (encryptedKey === undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Encrypted Key missing');
            if (typeof joseHeader.p2c !== 'number')
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
            const p2cLimit = (options === null || options === void 0 ? void 0 : options.maxPBES2Count) || 10000;
            if (joseHeader.p2c > p2cLimit)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
            if (typeof joseHeader.p2s !== 'string')
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
            return (0,_runtime_pbes2kw_js__WEBPACK_IMPORTED_MODULE_2__.decrypt)(alg, key, encryptedKey, joseHeader.p2c, (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.decode)(joseHeader.p2s));
        }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW': {
            if (encryptedKey === undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Encrypted Key missing');
            return (0,_runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__.unwrap)(alg, key, encryptedKey);
        }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW': {
            if (encryptedKey === undefined)
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid('JWE Encrypted Key missing');
            if (typeof joseHeader.iv !== 'string')
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "iv" (Initialization Vector) missing or invalid`);
            if (typeof joseHeader.tag !== 'string')
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JWEInvalid(`JOSE Header "tag" (Authentication Tag) missing or invalid`);
            const iv = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.decode)(joseHeader.iv);
            const tag = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.decode)(joseHeader.tag);
            return (0,_aesgcmkw_js__WEBPACK_IMPORTED_MODULE_10__.unwrap)(alg, key, encryptedKey, iv, tag);
        }
        default: {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JOSENotSupported('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (decryptKeyManagement);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/encrypt_key_management.js":
/*!**********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/encrypt_key_management.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/aeskw.js */ "./node_modules/jose/dist/browser/runtime/aeskw.js");
/* harmony import */ var _runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/ecdhes.js */ "./node_modules/jose/dist/browser/runtime/ecdhes.js");
/* harmony import */ var _runtime_pbes2kw_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../runtime/pbes2kw.js */ "./node_modules/jose/dist/browser/runtime/pbes2kw.js");
/* harmony import */ var _runtime_rsaes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../runtime/rsaes.js */ "./node_modules/jose/dist/browser/runtime/rsaes.js");
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _lib_cek_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/cek.js */ "./node_modules/jose/dist/browser/lib/cek.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _key_export_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../key/export.js */ "./node_modules/jose/dist/browser/key/export.js");
/* harmony import */ var _check_key_type_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./check_key_type.js */ "./node_modules/jose/dist/browser/lib/check_key_type.js");
/* harmony import */ var _aesgcmkw_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./aesgcmkw.js */ "./node_modules/jose/dist/browser/lib/aesgcmkw.js");










async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
    let encryptedKey;
    let parameters;
    let cek;
    (0,_check_key_type_js__WEBPACK_IMPORTED_MODULE_8__["default"])(alg, key, 'encrypt');
    switch (alg) {
        case 'dir': {
            cek = key;
            break;
        }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            if (!_runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__.ecdhAllowed(key)) {
                throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_6__.JOSENotSupported('ECDH with the provided key is not allowed or not supported by your javascript runtime');
            }
            const { apu, apv } = providedParameters;
            let { epk: ephemeralKey } = providedParameters;
            ephemeralKey || (ephemeralKey = (await _runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__.generateEpk(key)).privateKey);
            const { x, y, crv, kty } = await (0,_key_export_js__WEBPACK_IMPORTED_MODULE_7__.exportJWK)(ephemeralKey);
            const sharedSecret = await _runtime_ecdhes_js__WEBPACK_IMPORTED_MODULE_1__.deriveKey(key, ephemeralKey, alg === 'ECDH-ES' ? enc : alg, alg === 'ECDH-ES' ? (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__.bitLength)(enc) : parseInt(alg.slice(-5, -2), 10), apu, apv);
            parameters = { epk: { x, crv, kty } };
            if (kty === 'EC')
                parameters.epk.y = y;
            if (apu)
                parameters.apu = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.encode)(apu);
            if (apv)
                parameters.apv = (0,_runtime_base64url_js__WEBPACK_IMPORTED_MODULE_4__.encode)(apv);
            if (alg === 'ECDH-ES') {
                cek = sharedSecret;
                break;
            }
            cek = providedCek || (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__["default"])(enc);
            const kwAlg = alg.slice(-6);
            encryptedKey = await (0,_runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__.wrap)(kwAlg, sharedSecret, cek);
            break;
        }
        case 'RSA1_5':
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512': {
            cek = providedCek || (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__["default"])(enc);
            encryptedKey = await (0,_runtime_rsaes_js__WEBPACK_IMPORTED_MODULE_3__.encrypt)(alg, key, cek);
            break;
        }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW': {
            cek = providedCek || (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__["default"])(enc);
            const { p2c, p2s } = providedParameters;
            ({ encryptedKey, ...parameters } = await (0,_runtime_pbes2kw_js__WEBPACK_IMPORTED_MODULE_2__.encrypt)(alg, key, cek, p2c, p2s));
            break;
        }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW': {
            cek = providedCek || (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__["default"])(enc);
            encryptedKey = await (0,_runtime_aeskw_js__WEBPACK_IMPORTED_MODULE_0__.wrap)(alg, key, cek);
            break;
        }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW': {
            cek = providedCek || (0,_lib_cek_js__WEBPACK_IMPORTED_MODULE_5__["default"])(enc);
            const { iv } = providedParameters;
            ({ encryptedKey, ...parameters } = await (0,_aesgcmkw_js__WEBPACK_IMPORTED_MODULE_9__.wrap)(alg, key, cek, iv));
            break;
        }
        default: {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_6__.JOSENotSupported('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
    }
    return { cek, encryptedKey, parameters };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (encryptKeyManagement);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/epoch.js":
/*!*****************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/epoch.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((date) => Math.floor(date.getTime() / 1000));


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/format_pem.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/format_pem.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((b64, descriptor) => {
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return `-----BEGIN ${descriptor}-----\n${newlined}\n-----END ${descriptor}-----`;
});


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/invalid_key_input.js":
/*!*****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/invalid_key_input.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   withAlg: () => (/* binding */ withAlg)
/* harmony export */ });
function message(msg, actual, ...types) {
    if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(', ')}, or ${last}.`;
    }
    else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}.`;
    }
    else {
        msg += `of type ${types[0]}.`;
    }
    if (actual == null) {
        msg += ` Received ${actual}`;
    }
    else if (typeof actual === 'function' && actual.name) {
        msg += ` Received function ${actual.name}`;
    }
    else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor && actual.constructor.name) {
            msg += ` Received an instance of ${actual.constructor.name}`;
        }
    }
    return msg;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((actual, ...types) => {
    return message('Key must be ', actual, ...types);
});
function withAlg(alg, actual, ...types) {
    return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/is_disjoint.js":
/*!***********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/is_disjoint.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const isDisjoint = (...headers) => {
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources) {
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters) {
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isDisjoint);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/is_object.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/is_object.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isObject)
/* harmony export */ });
function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/iv.js":
/*!**************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/iv.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bitLength: () => (/* binding */ bitLength),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _runtime_random_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/random.js */ "./node_modules/jose/dist/browser/runtime/random.js");


function bitLength(alg) {
    switch (alg) {
        case 'A128GCM':
        case 'A128GCMKW':
        case 'A192GCM':
        case 'A192GCMKW':
        case 'A256GCM':
        case 'A256GCMKW':
            return 96;
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            return 128;
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((alg) => (0,_runtime_random_js__WEBPACK_IMPORTED_MODULE_1__["default"])(new Uint8Array(bitLength(alg) >> 3)));


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/jwt_claims_set.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/jwt_claims_set.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _epoch_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./epoch.js */ "./node_modules/jose/dist/browser/lib/epoch.js");
/* harmony import */ var _secs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./secs.js */ "./node_modules/jose/dist/browser/lib/secs.js");
/* harmony import */ var _is_object_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");





const normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, '');
const checkAudiencePresence = (audPayload, audOption) => {
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((protectedHeader, encodedPayload, options = {}) => {
    const { typ } = options;
    if (typ &&
        (typeof protectedHeader.typ !== 'string' ||
            normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('unexpected "typ" JWT header value', 'typ', 'check_failed');
    }
    let payload;
    try {
        payload = JSON.parse(_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.decoder.decode(encodedPayload));
    }
    catch (_a) {
    }
    if (!(0,_is_object_js__WEBPACK_IMPORTED_MODULE_4__["default"])(payload)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTInvalid('JWT Claims Set must be a top-level JSON object');
    }
    const { issuer } = options;
    if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('unexpected "iss" claim value', 'iss', 'check_failed');
    }
    const { subject } = options;
    if (subject && payload.sub !== subject) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('unexpected "sub" claim value', 'sub', 'check_failed');
    }
    const { audience } = options;
    if (audience &&
        !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [audience] : audience)) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('unexpected "aud" claim value', 'aud', 'check_failed');
    }
    let tolerance;
    switch (typeof options.clockTolerance) {
        case 'string':
            tolerance = (0,_secs_js__WEBPACK_IMPORTED_MODULE_3__["default"])(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    const { currentDate } = options;
    const now = (0,_epoch_js__WEBPACK_IMPORTED_MODULE_2__["default"])(currentDate || new Date());
    if ((payload.iat !== undefined || options.maxTokenAge) && typeof payload.iat !== 'number') {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('"iat" claim must be a number', 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('"nbf" claim must be a number', 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('"nbf" claim timestamp check failed', 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('"exp" claim must be a number', 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTExpired('"exp" claim timestamp check failed', 'exp', 'check_failed');
        }
    }
    if (options.maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof options.maxTokenAge === 'number' ? options.maxTokenAge : (0,_secs_js__WEBPACK_IMPORTED_MODULE_3__["default"])(options.maxTokenAge);
        if (age - tolerance > max) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTExpired('"iat" claim timestamp check failed (too far in the past)', 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', 'iat', 'check_failed');
        }
    }
    return payload;
});


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/secs.js":
/*!****************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/secs.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((str) => {
    const matched = REGEX.exec(str);
    if (!matched) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[1]);
    const unit = matched[2].toLowerCase();
    switch (unit) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            return Math.round(value);
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            return Math.round(value * minute);
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            return Math.round(value * hour);
        case 'day':
        case 'days':
        case 'd':
            return Math.round(value * day);
        case 'week':
        case 'weeks':
        case 'w':
            return Math.round(value * week);
        default:
            return Math.round(value * year);
    }
});


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/validate_algorithms.js":
/*!*******************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/validate_algorithms.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const validateAlgorithms = (option, algorithms) => {
    if (algorithms !== undefined &&
        (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== 'string'))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validateAlgorithms);


/***/ }),

/***/ "./node_modules/jose/dist/browser/lib/validate_crit.js":
/*!*************************************************************!*\
  !*** ./node_modules/jose/dist/browser/lib/validate_crit.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== undefined && protectedHeader.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) ||
        protectedHeader.crit.length === 0 ||
        protectedHeader.crit.some((input) => typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
    }
    else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit) {
        if (!recognized.has(parameter)) {
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" is missing`);
        }
        else if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
        }
    }
    return new Set(protectedHeader.crit);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validateCrit);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/aeskw.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/aeskw.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unwrap: () => (/* binding */ unwrap),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _bogus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bogus.js */ "./node_modules/jose/dist/browser/runtime/bogus.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");





function checkKeySize(key, alg) {
    if (key.algorithm.length !== parseInt(alg.slice(1, 4), 10)) {
        throw new TypeError(`Invalid key size for alg: ${alg}`);
    }
}
function getCryptoKey(key, alg, usage) {
    if ((0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(key)) {
        (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_2__.checkEncCryptoKey)(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        return _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey('raw', key, 'AES-KW', true, [usage]);
    }
    throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_4__.types, 'Uint8Array'));
}
const wrap = async (alg, key, cek) => {
    const cryptoKey = await getCryptoKey(key, alg, 'wrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey('raw', cek, ..._bogus_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
    return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.wrapKey('raw', cryptoKeyCek, cryptoKey, 'AES-KW'));
};
const unwrap = async (alg, key, encryptedKey) => {
    const cryptoKey = await getCryptoKey(key, alg, 'unwrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.unwrapKey('raw', encryptedKey, cryptoKey, 'AES-KW', ..._bogus_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
    return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.exportKey('raw', cryptoKeyCek));
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/asn1.js":
/*!********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/asn1.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromPKCS8: () => (/* binding */ fromPKCS8),
/* harmony export */   fromSPKI: () => (/* binding */ fromSPKI),
/* harmony export */   fromX509: () => (/* binding */ fromX509),
/* harmony export */   toPKCS8: () => (/* binding */ toPKCS8),
/* harmony export */   toSPKI: () => (/* binding */ toSPKI)
/* harmony export */ });
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env.js */ "./node_modules/jose/dist/browser/runtime/env.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _lib_format_pem_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/format_pem.js */ "./node_modules/jose/dist/browser/lib/format_pem.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");







const genericExport = async (keyType, keyFormat, key) => {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_2__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_6__.types));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError(`key is not a ${keyType} key`);
    }
    return (0,_lib_format_pem_js__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_base64url_js__WEBPACK_IMPORTED_MODULE_3__.encodeBase64)(new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.exportKey(keyFormat, key))), `${keyType.toUpperCase()} KEY`);
};
const toSPKI = (key) => {
    return genericExport('public', 'spki', key);
};
const toPKCS8 = (key) => {
    return genericExport('private', 'pkcs8', key);
};
const findOid = (keyData, oid, from = 0) => {
    if (from === 0) {
        oid.unshift(oid.length);
        oid.unshift(0x06);
    }
    let i = keyData.indexOf(oid[0], from);
    if (i === -1)
        return false;
    const sub = keyData.subarray(i, i + oid.length);
    if (sub.length !== oid.length)
        return false;
    return sub.every((value, index) => value === oid[index]) || findOid(keyData, oid, i + 1);
};
const getNamedCurve = (keyData) => {
    switch (true) {
        case findOid(keyData, [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]):
            return 'P-256';
        case findOid(keyData, [0x2b, 0x81, 0x04, 0x00, 0x22]):
            return 'P-384';
        case findOid(keyData, [0x2b, 0x81, 0x04, 0x00, 0x23]):
            return 'P-521';
        case findOid(keyData, [0x2b, 0x65, 0x6e]):
            return 'X25519';
        case findOid(keyData, [0x2b, 0x65, 0x6f]):
            return 'X448';
        case findOid(keyData, [0x2b, 0x65, 0x70]):
            return 'Ed25519';
        case findOid(keyData, [0x2b, 0x65, 0x71]):
            return 'Ed448';
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JOSENotSupported('Invalid or unsupported EC Key Curve or OKP Key Sub Type');
    }
};
const genericImport = async (replace, keyFormat, pem, alg, options) => {
    var _a, _b;
    let algorithm;
    let keyUsages;
    const keyData = new Uint8Array(atob(pem.replace(replace, ''))
        .split('')
        .map((c) => c.charCodeAt(0)));
    const isPublic = keyFormat === 'spki';
    switch (alg) {
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = { name: 'RSA-PSS', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
            };
            keyUsages = isPublic ? ['encrypt', 'wrapKey'] : ['decrypt', 'unwrapKey'];
            break;
        case 'ES256':
            algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        case 'ES384':
            algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        case 'ES512':
            algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            const namedCurve = getNamedCurve(keyData);
            algorithm = namedCurve.startsWith('P-') ? { name: 'ECDH', namedCurve } : { name: namedCurve };
            keyUsages = isPublic ? [] : ['deriveBits'];
            break;
        }
        case 'EdDSA':
            algorithm = { name: getNamedCurve(keyData) };
            keyUsages = isPublic ? ['verify'] : ['sign'];
            break;
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_5__.JOSENotSupported('Invalid or unsupported "alg" (Algorithm) value');
    }
    try {
        return await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey(keyFormat, keyData, algorithm, (_a = options === null || options === void 0 ? void 0 : options.extractable) !== null && _a !== void 0 ? _a : false, keyUsages);
    }
    catch (err) {
        if (algorithm.name === 'Ed25519' &&
            (err === null || err === void 0 ? void 0 : err.name) === 'NotSupportedError' &&
            (0,_env_js__WEBPACK_IMPORTED_MODULE_0__.isCloudflareWorkers)()) {
            algorithm = { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' };
            return await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey(keyFormat, keyData, algorithm, (_b = options === null || options === void 0 ? void 0 : options.extractable) !== null && _b !== void 0 ? _b : false, keyUsages);
        }
        throw err;
    }
};
const fromPKCS8 = (pem, alg, options) => {
    return genericImport(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, 'pkcs8', pem, alg, options);
};
const fromSPKI = (pem, alg, options) => {
    return genericImport(/(?:-----(?:BEGIN|END) PUBLIC KEY-----|\s)/g, 'spki', pem, alg, options);
};
function getElement(seq) {
    let result = [];
    let next = 0;
    while (next < seq.length) {
        let nextPart = parseElement(seq.subarray(next));
        result.push(nextPart);
        next += nextPart.byteLength;
    }
    return result;
}
function parseElement(bytes) {
    let position = 0;
    let tag = bytes[0] & 0x1f;
    position++;
    if (tag === 0x1f) {
        tag = 0;
        while (bytes[position] >= 0x80) {
            tag = tag * 128 + bytes[position] - 0x80;
            position++;
        }
        tag = tag * 128 + bytes[position] - 0x80;
        position++;
    }
    let length = 0;
    if (bytes[position] < 0x80) {
        length = bytes[position];
        position++;
    }
    else if (length === 0x80) {
        length = 0;
        while (bytes[position + length] !== 0 || bytes[position + length + 1] !== 0) {
            if (length > bytes.byteLength) {
                throw new TypeError('invalid indefinite form length');
            }
            length++;
        }
        const byteLength = position + length + 2;
        return {
            byteLength,
            contents: bytes.subarray(position, position + length),
            raw: bytes.subarray(0, byteLength),
        };
    }
    else {
        let numberOfDigits = bytes[position] & 0x7f;
        position++;
        length = 0;
        for (let i = 0; i < numberOfDigits; i++) {
            length = length * 256 + bytes[position];
            position++;
        }
    }
    const byteLength = position + length;
    return {
        byteLength,
        contents: bytes.subarray(position, byteLength),
        raw: bytes.subarray(0, byteLength),
    };
}
function spkiFromX509(buf) {
    const tbsCertificate = getElement(getElement(parseElement(buf).contents)[0].contents);
    return (0,_base64url_js__WEBPACK_IMPORTED_MODULE_3__.encodeBase64)(tbsCertificate[tbsCertificate[0].raw[0] === 0xa0 ? 6 : 5].raw);
}
function getSPKI(x509) {
    const pem = x509.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');
    const raw = (0,_base64url_js__WEBPACK_IMPORTED_MODULE_3__.decodeBase64)(pem);
    return (0,_lib_format_pem_js__WEBPACK_IMPORTED_MODULE_4__["default"])(spkiFromX509(raw), 'PUBLIC KEY');
}
const fromX509 = (pem, alg, options) => {
    let spki;
    try {
        spki = getSPKI(pem);
    }
    catch (cause) {
        throw new TypeError('failed to parse the X.509 certificate', { cause });
    }
    return fromSPKI(spki, alg, options);
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/base64url.js":
/*!*************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/base64url.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decode: () => (/* binding */ decode),
/* harmony export */   decodeBase64: () => (/* binding */ decodeBase64),
/* harmony export */   encode: () => (/* binding */ encode),
/* harmony export */   encodeBase64: () => (/* binding */ encodeBase64)
/* harmony export */ });
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");

const encodeBase64 = (input) => {
    let unencoded = input;
    if (typeof unencoded === 'string') {
        unencoded = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.encoder.encode(unencoded);
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
};
const encode = (input) => {
    return encodeBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
const decodeBase64 = (encoded) => {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};
const decode = (input) => {
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.decoder.decode(encoded);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    try {
        return decodeBase64(encoded);
    }
    catch (_a) {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/bogus.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/bogus.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const bogusWebCrypto = [
    { hash: 'SHA-256', name: 'HMAC' },
    true,
    ['sign'],
];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bogusWebCrypto);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/check_cek_length.js":
/*!********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/check_cek_length.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

const checkCekLength = (cek, expected) => {
    const actual = cek.byteLength << 3;
    if (actual !== expected) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (checkCekLength);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/check_key_length.js":
/*!********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/check_key_length.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((alg, key) => {
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
    }
});


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/decrypt.js":
/*!***********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/decrypt.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_check_iv_length_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/check_iv_length.js */ "./node_modules/jose/dist/browser/lib/check_iv_length.js");
/* harmony import */ var _check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./check_cek_length.js */ "./node_modules/jose/dist/browser/runtime/check_cek_length.js");
/* harmony import */ var _timing_safe_equal_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./timing_safe_equal.js */ "./node_modules/jose/dist/browser/runtime/timing_safe_equal.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");









async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    if (!(cek instanceof Uint8Array)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_7__["default"])(cek, 'Uint8Array'));
    }
    const keySize = parseInt(enc.slice(1, 4), 10);
    const encKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, ['decrypt']);
    const macKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: `SHA-${keySize << 1}`,
        name: 'HMAC',
    }, false, ['sign']);
    const macData = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.concat)(aad, iv, ciphertext, (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.uint64be)(aad.length << 3));
    const expectedTag = new Uint8Array((await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
    let macCheckPassed;
    try {
        macCheckPassed = (0,_timing_safe_equal_js__WEBPACK_IMPORTED_MODULE_3__["default"])(tag, expectedTag);
    }
    catch (_a) {
    }
    if (!macCheckPassed) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_4__.JWEDecryptionFailed();
    }
    let plaintext;
    try {
        plaintext = new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.decrypt({ iv, name: 'AES-CBC' }, encKey, ciphertext));
    }
    catch (_b) {
    }
    if (!plaintext) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_4__.JWEDecryptionFailed();
    }
    return plaintext;
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
    }
    else {
        (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_6__.checkEncCryptoKey)(cek, enc, 'decrypt');
        encKey = cek;
    }
    try {
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.decrypt({
            additionalData: aad,
            iv,
            name: 'AES-GCM',
            tagLength: 128,
        }, encKey, (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.concat)(ciphertext, tag)));
    }
    catch (_a) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_4__.JWEDecryptionFailed();
    }
}
const decrypt = async (enc, cek, ciphertext, iv, tag, aad) => {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_5__.isCryptoKey)(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_7__["default"])(cek, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_8__.types, 'Uint8Array'));
    }
    (0,_lib_check_iv_length_js__WEBPACK_IMPORTED_MODULE_1__["default"])(enc, iv);
    switch (enc) {
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            if (cek instanceof Uint8Array)
                (0,_check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(cek, parseInt(enc.slice(-3), 10));
            return cbcDecrypt(enc, cek, ciphertext, iv, tag, aad);
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            if (cek instanceof Uint8Array)
                (0,_check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(cek, parseInt(enc.slice(1, 4), 10));
            return gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_4__.JOSENotSupported('Unsupported JWE Content Encryption Algorithm');
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (decrypt);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/digest.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/digest.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");

const digest = async (algorithm, data) => {
    const subtleDigest = `SHA-${algorithm.slice(-3)}`;
    return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__["default"].subtle.digest(subtleDigest, data));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (digest);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/ecdhes.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/ecdhes.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deriveKey: () => (/* binding */ deriveKey),
/* harmony export */   ecdhAllowed: () => (/* binding */ ecdhAllowed),
/* harmony export */   generateEpk: () => (/* binding */ generateEpk)
/* harmony export */ });
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");





async function deriveKey(publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(0), apv = new Uint8Array(0)) {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(publicKey)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__["default"])(publicKey, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_4__.types));
    }
    (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_2__.checkEncCryptoKey)(publicKey, 'ECDH');
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(privateKey)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__["default"])(privateKey, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_4__.types));
    }
    (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_2__.checkEncCryptoKey)(privateKey, 'ECDH', 'deriveBits');
    const value = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.concat)((0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.lengthAndInput)(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.encoder.encode(algorithm)), (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.lengthAndInput)(apu), (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.lengthAndInput)(apv), (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.uint32be)(keyLength));
    let length;
    if (publicKey.algorithm.name === 'X25519') {
        length = 256;
    }
    else if (publicKey.algorithm.name === 'X448') {
        length = 448;
    }
    else {
        length =
            Math.ceil(parseInt(publicKey.algorithm.namedCurve.substr(-3), 10) / 8) << 3;
    }
    const sharedSecret = new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.deriveBits({
        name: publicKey.algorithm.name,
        public: publicKey,
    }, privateKey, length));
    return (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.concatKdf)(sharedSecret, keyLength, value);
}
async function generateEpk(key) {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_4__.types));
    }
    return _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.generateKey(key.algorithm, true, ['deriveBits']);
}
function ecdhAllowed(key) {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_1__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_3__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_4__.types));
    }
    return (['P-256', 'P-384', 'P-521'].includes(key.algorithm.namedCurve) ||
        key.algorithm.name === 'X25519' ||
        key.algorithm.name === 'X448');
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/encrypt.js":
/*!***********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/encrypt.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_check_iv_length_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/check_iv_length.js */ "./node_modules/jose/dist/browser/lib/check_iv_length.js");
/* harmony import */ var _check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./check_cek_length.js */ "./node_modules/jose/dist/browser/runtime/check_cek_length.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");








async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    if (!(cek instanceof Uint8Array)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__["default"])(cek, 'Uint8Array'));
    }
    const keySize = parseInt(enc.slice(1, 4), 10);
    const encKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, ['encrypt']);
    const macKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: `SHA-${keySize << 1}`,
        name: 'HMAC',
    }, false, ['sign']);
    const ciphertext = new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.encrypt({
        iv,
        name: 'AES-CBC',
    }, encKey, plaintext));
    const macData = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.concat)(aad, iv, ciphertext, (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_0__.uint64be)(aad.length << 3));
    const tag = new Uint8Array((await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
    return { ciphertext, tag };
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
    }
    else {
        (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_4__.checkEncCryptoKey)(cek, enc, 'encrypt');
        encKey = cek;
    }
    const encrypted = new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_3__["default"].subtle.encrypt({
        additionalData: aad,
        iv,
        name: 'AES-GCM',
        tagLength: 128,
    }, encKey, plaintext));
    const tag = encrypted.slice(-16);
    const ciphertext = encrypted.slice(0, -16);
    return { ciphertext, tag };
}
const encrypt = async (enc, plaintext, cek, iv, aad) => {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_3__.isCryptoKey)(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__["default"])(cek, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_7__.types, 'Uint8Array'));
    }
    (0,_lib_check_iv_length_js__WEBPACK_IMPORTED_MODULE_1__["default"])(enc, iv);
    switch (enc) {
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            if (cek instanceof Uint8Array)
                (0,_check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(cek, parseInt(enc.slice(-3), 10));
            return cbcEncrypt(enc, plaintext, cek, iv, aad);
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            if (cek instanceof Uint8Array)
                (0,_check_cek_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(cek, parseInt(enc.slice(1, 4), 10));
            return gcmEncrypt(enc, plaintext, cek, iv, aad);
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_6__.JOSENotSupported('Unsupported JWE Content Encryption Algorithm');
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (encrypt);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/env.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/env.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isCloudflareWorkers: () => (/* binding */ isCloudflareWorkers)
/* harmony export */ });
function isCloudflareWorkers() {
    return (typeof WebSocketPair !== 'undefined' ||
        (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers') ||
        (typeof EdgeRuntime !== 'undefined' && EdgeRuntime === 'vercel'));
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/fetch_jwks.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/fetch_jwks.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

const fetchJwks = async (url, timeout, options) => {
    let controller;
    let id;
    let timedOut = false;
    if (typeof AbortController === 'function') {
        controller = new AbortController();
        id = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, timeout);
    }
    const response = await fetch(url.href, {
        signal: controller ? controller.signal : undefined,
        redirect: 'manual',
        headers: options.headers,
    }).catch((err) => {
        if (timedOut)
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JWKSTimeout();
        throw err;
    });
    if (id !== undefined)
        clearTimeout(id);
    if (response.status !== 200) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSEError('Expected 200 OK from the JSON Web Key Set HTTP response');
    }
    try {
        return await response.json();
    }
    catch (_a) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSEError('Failed to parse the JSON Web Key Set HTTP response as JSON');
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fetchJwks);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/generate.js":
/*!************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/generate.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateKeyPair: () => (/* binding */ generateKeyPair),
/* harmony export */   generateSecret: () => (/* binding */ generateSecret)
/* harmony export */ });
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env.js */ "./node_modules/jose/dist/browser/runtime/env.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _random_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./random.js */ "./node_modules/jose/dist/browser/runtime/random.js");




async function generateSecret(alg, options) {
    var _a;
    let length;
    let algorithm;
    let keyUsages;
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512':
            length = parseInt(alg.slice(-3), 10);
            algorithm = { name: 'HMAC', hash: `SHA-${length}`, length };
            keyUsages = ['sign', 'verify'];
            break;
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            length = parseInt(alg.slice(-3), 10);
            return (0,_random_js__WEBPACK_IMPORTED_MODULE_3__["default"])(new Uint8Array(length >> 3));
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            length = parseInt(alg.slice(1, 4), 10);
            algorithm = { name: 'AES-KW', length };
            keyUsages = ['wrapKey', 'unwrapKey'];
            break;
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            length = parseInt(alg.slice(1, 4), 10);
            algorithm = { name: 'AES-GCM', length };
            keyUsages = ['encrypt', 'decrypt'];
            break;
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    return _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.generateKey(algorithm, (_a = options === null || options === void 0 ? void 0 : options.extractable) !== null && _a !== void 0 ? _a : false, keyUsages);
}
function getModulusLengthOption(options) {
    var _a;
    const modulusLength = (_a = options === null || options === void 0 ? void 0 : options.modulusLength) !== null && _a !== void 0 ? _a : 2048;
    if (typeof modulusLength !== 'number' || modulusLength < 2048) {
        throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used');
    }
    return modulusLength;
}
async function generateKeyPair(alg, options) {
    var _a, _b, _c, _d;
    let algorithm;
    let keyUsages;
    switch (alg) {
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = {
                name: 'RSA-PSS',
                hash: `SHA-${alg.slice(-3)}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['sign', 'verify'];
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = {
                name: 'RSASSA-PKCS1-v1_5',
                hash: `SHA-${alg.slice(-3)}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['sign', 'verify'];
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['decrypt', 'unwrapKey', 'encrypt', 'wrapKey'];
            break;
        case 'ES256':
            algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'ES384':
            algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'ES512':
            algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'EdDSA':
            keyUsages = ['sign', 'verify'];
            const crv = (_a = options === null || options === void 0 ? void 0 : options.crv) !== null && _a !== void 0 ? _a : 'Ed25519';
            switch (crv) {
                case 'Ed25519':
                case 'Ed448':
                    algorithm = { name: crv };
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported crv option provided');
            }
            break;
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            keyUsages = ['deriveKey', 'deriveBits'];
            const crv = (_b = options === null || options === void 0 ? void 0 : options.crv) !== null && _b !== void 0 ? _b : 'P-256';
            switch (crv) {
                case 'P-256':
                case 'P-384':
                case 'P-521': {
                    algorithm = { name: 'ECDH', namedCurve: crv };
                    break;
                }
                case 'X25519':
                case 'X448':
                    algorithm = { name: crv };
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448');
            }
            break;
        }
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    try {
        return (await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.generateKey(algorithm, (_c = options === null || options === void 0 ? void 0 : options.extractable) !== null && _c !== void 0 ? _c : false, keyUsages));
    }
    catch (err) {
        if (algorithm.name === 'Ed25519' &&
            (err === null || err === void 0 ? void 0 : err.name) === 'NotSupportedError' &&
            (0,_env_js__WEBPACK_IMPORTED_MODULE_0__.isCloudflareWorkers)()) {
            algorithm = { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' };
            return (await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.generateKey(algorithm, (_d = options === null || options === void 0 ? void 0 : options.extractable) !== null && _d !== void 0 ? _d : false, keyUsages));
        }
        throw err;
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/get_sign_verify_key.js":
/*!***********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/get_sign_verify_key.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getCryptoKey)
/* harmony export */ });
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");




function getCryptoKey(alg, key, usage) {
    if ((0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_0__.isCryptoKey)(key)) {
        (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_1__.checkSigCryptoKey)(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_2__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_3__.types));
        }
        return _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__["default"].subtle.importKey('raw', key, { hash: `SHA-${alg.slice(-3)}`, name: 'HMAC' }, false, [usage]);
    }
    throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_2__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_3__.types, 'Uint8Array'));
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/is_key_like.js":
/*!***************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/is_key_like.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   types: () => (/* binding */ types)
/* harmony export */ });
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((key) => {
    return (0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_0__.isCryptoKey)(key);
});
const types = ['CryptoKey'];


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/jwk_to_key.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/jwk_to_key.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env.js */ "./node_modules/jose/dist/browser/runtime/env.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");




function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch (jwk.kty) {
        case 'oct': {
            switch (jwk.alg) {
                case 'HS256':
                case 'HS384':
                case 'HS512':
                    algorithm = { name: 'HMAC', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = ['sign', 'verify'];
                    break;
                case 'A128CBC-HS256':
                case 'A192CBC-HS384':
                case 'A256CBC-HS512':
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported(`${jwk.alg} keys cannot be imported as CryptoKey instances`);
                case 'A128GCM':
                case 'A192GCM':
                case 'A256GCM':
                case 'A128GCMKW':
                case 'A192GCMKW':
                case 'A256GCMKW':
                    algorithm = { name: 'AES-GCM' };
                    keyUsages = ['encrypt', 'decrypt'];
                    break;
                case 'A128KW':
                case 'A192KW':
                case 'A256KW':
                    algorithm = { name: 'AES-KW' };
                    keyUsages = ['wrapKey', 'unwrapKey'];
                    break;
                case 'PBES2-HS256+A128KW':
                case 'PBES2-HS384+A192KW':
                case 'PBES2-HS512+A256KW':
                    algorithm = { name: 'PBKDF2' };
                    keyUsages = ['deriveBits'];
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'RSA': {
            switch (jwk.alg) {
                case 'PS256':
                case 'PS384':
                case 'PS512':
                    algorithm = { name: 'RSA-PSS', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RS256':
                case 'RS384':
                case 'RS512':
                    algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RSA-OAEP':
                case 'RSA-OAEP-256':
                case 'RSA-OAEP-384':
                case 'RSA-OAEP-512':
                    algorithm = {
                        name: 'RSA-OAEP',
                        hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`,
                    };
                    keyUsages = jwk.d ? ['decrypt', 'unwrapKey'] : ['encrypt', 'wrapKey'];
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'EC': {
            switch (jwk.alg) {
                case 'ES256':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES384':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES512':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: 'ECDH', namedCurve: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'OKP': {
            switch (jwk.alg) {
                case 'EdDSA':
                    algorithm = { name: jwk.crv };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_2__.JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return { algorithm, keyUsages };
}
const parse = async (jwk) => {
    var _a, _b;
    if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const rest = [
        algorithm,
        (_a = jwk.ext) !== null && _a !== void 0 ? _a : false,
        (_b = jwk.key_ops) !== null && _b !== void 0 ? _b : keyUsages,
    ];
    if (algorithm.name === 'PBKDF2') {
        return _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey('raw', (0,_base64url_js__WEBPACK_IMPORTED_MODULE_3__.decode)(jwk.k), ...rest);
    }
    const keyData = { ...jwk };
    delete keyData.alg;
    delete keyData.use;
    try {
        return await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey('jwk', keyData, ...rest);
    }
    catch (err) {
        if (algorithm.name === 'Ed25519' &&
            (err === null || err === void 0 ? void 0 : err.name) === 'NotSupportedError' &&
            (0,_env_js__WEBPACK_IMPORTED_MODULE_0__.isCloudflareWorkers)()) {
            rest[0] = { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' };
            return await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.importKey('jwk', keyData, ...rest);
        }
        throw err;
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/key_to_jwk.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/key_to_jwk.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");




const keyToJWK = async (key) => {
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: (0,_base64url_js__WEBPACK_IMPORTED_MODULE_2__.encode)(key),
        };
    }
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_0__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_1__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_3__.types, 'Uint8Array'));
    }
    if (!key.extractable) {
        throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK');
    }
    const { ext, key_ops, alg, use, ...jwk } = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__["default"].subtle.exportKey('jwk', key);
    return jwk;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (keyToJWK);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/pbes2kw.js":
/*!***********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/pbes2kw.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decrypt: () => (/* binding */ decrypt),
/* harmony export */   encrypt: () => (/* binding */ encrypt)
/* harmony export */ });
/* harmony import */ var _random_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./random.js */ "./node_modules/jose/dist/browser/runtime/random.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");
/* harmony import */ var _aeskw_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./aeskw.js */ "./node_modules/jose/dist/browser/runtime/aeskw.js");
/* harmony import */ var _lib_check_p2s_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/check_p2s.js */ "./node_modules/jose/dist/browser/lib/check_p2s.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");









function getCryptoKey(key, alg) {
    if (key instanceof Uint8Array) {
        return _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.importKey('raw', key, 'PBKDF2', false, ['deriveBits']);
    }
    if ((0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_5__.isCryptoKey)(key)) {
        (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_6__.checkEncCryptoKey)(key, alg, 'deriveBits', 'deriveKey');
        return key;
    }
    throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_7__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_8__.types, 'Uint8Array'));
}
async function deriveKey(p2s, alg, p2c, key) {
    (0,_lib_check_p2s_js__WEBPACK_IMPORTED_MODULE_4__["default"])(p2s);
    const salt = (0,_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.p2s)(alg, p2s);
    const keylen = parseInt(alg.slice(13, 16), 10);
    const subtleAlg = {
        hash: `SHA-${alg.slice(8, 11)}`,
        iterations: p2c,
        name: 'PBKDF2',
        salt,
    };
    const wrapAlg = {
        length: keylen,
        name: 'AES-KW',
    };
    const cryptoKey = await getCryptoKey(key, alg);
    if (cryptoKey.usages.includes('deriveBits')) {
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.deriveBits(subtleAlg, cryptoKey, keylen));
    }
    if (cryptoKey.usages.includes('deriveKey')) {
        return _webcrypto_js__WEBPACK_IMPORTED_MODULE_5__["default"].subtle.deriveKey(subtleAlg, cryptoKey, wrapAlg, false, ['wrapKey', 'unwrapKey']);
    }
    throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');
}
const encrypt = async (alg, key, cek, p2c = 2048, p2s = (0,_random_js__WEBPACK_IMPORTED_MODULE_0__["default"])(new Uint8Array(16))) => {
    const derived = await deriveKey(p2s, alg, p2c, key);
    const encryptedKey = await (0,_aeskw_js__WEBPACK_IMPORTED_MODULE_3__.wrap)(alg.slice(-6), derived, cek);
    return { encryptedKey, p2c, p2s: (0,_base64url_js__WEBPACK_IMPORTED_MODULE_2__.encode)(p2s) };
};
const decrypt = async (alg, key, encryptedKey, p2c, p2s) => {
    const derived = await deriveKey(p2s, alg, p2c, key);
    return (0,_aeskw_js__WEBPACK_IMPORTED_MODULE_3__.unwrap)(alg.slice(-6), derived, encryptedKey);
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/random.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/random.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_webcrypto_js__WEBPACK_IMPORTED_MODULE_0__["default"].getRandomValues.bind(_webcrypto_js__WEBPACK_IMPORTED_MODULE_0__["default"]));


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/rsaes.js":
/*!*********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/rsaes.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decrypt: () => (/* binding */ decrypt),
/* harmony export */   encrypt: () => (/* binding */ encrypt)
/* harmony export */ });
/* harmony import */ var _subtle_rsaes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./subtle_rsaes.js */ "./node_modules/jose/dist/browser/runtime/subtle_rsaes.js");
/* harmony import */ var _bogus_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bogus.js */ "./node_modules/jose/dist/browser/runtime/bogus.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/crypto_key.js */ "./node_modules/jose/dist/browser/lib/crypto_key.js");
/* harmony import */ var _check_key_length_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./check_key_length.js */ "./node_modules/jose/dist/browser/runtime/check_key_length.js");
/* harmony import */ var _lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/invalid_key_input.js */ "./node_modules/jose/dist/browser/lib/invalid_key_input.js");
/* harmony import */ var _is_key_like_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./is_key_like.js */ "./node_modules/jose/dist/browser/runtime/is_key_like.js");







const encrypt = async (alg, key, cek) => {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_2__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_6__.types));
    }
    (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_3__.checkEncCryptoKey)(key, alg, 'encrypt', 'wrapKey');
    (0,_check_key_length_js__WEBPACK_IMPORTED_MODULE_4__["default"])(alg, key);
    if (key.usages.includes('encrypt')) {
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.encrypt((0,_subtle_rsaes_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg), key, cek));
    }
    if (key.usages.includes('wrapKey')) {
        const cryptoKeyCek = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.importKey('raw', cek, ..._bogus_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.wrapKey('raw', cryptoKeyCek, key, (0,_subtle_rsaes_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg)));
    }
    throw new TypeError('RSA-OAEP key "usages" must include "encrypt" or "wrapKey" for this operation');
};
const decrypt = async (alg, key, encryptedKey) => {
    if (!(0,_webcrypto_js__WEBPACK_IMPORTED_MODULE_2__.isCryptoKey)(key)) {
        throw new TypeError((0,_lib_invalid_key_input_js__WEBPACK_IMPORTED_MODULE_5__["default"])(key, ..._is_key_like_js__WEBPACK_IMPORTED_MODULE_6__.types));
    }
    (0,_lib_crypto_key_js__WEBPACK_IMPORTED_MODULE_3__.checkEncCryptoKey)(key, alg, 'decrypt', 'unwrapKey');
    (0,_check_key_length_js__WEBPACK_IMPORTED_MODULE_4__["default"])(alg, key);
    if (key.usages.includes('decrypt')) {
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.decrypt((0,_subtle_rsaes_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg), key, encryptedKey));
    }
    if (key.usages.includes('unwrapKey')) {
        const cryptoKeyCek = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.unwrapKey('raw', encryptedKey, key, (0,_subtle_rsaes_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg), ..._bogus_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
        return new Uint8Array(await _webcrypto_js__WEBPACK_IMPORTED_MODULE_2__["default"].subtle.exportKey('raw', cryptoKeyCek));
    }
    throw new TypeError('RSA-OAEP key "usages" must include "decrypt" or "unwrapKey" for this operation');
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/sign.js":
/*!********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/sign.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _subtle_dsa_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./subtle_dsa.js */ "./node_modules/jose/dist/browser/runtime/subtle_dsa.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _check_key_length_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./check_key_length.js */ "./node_modules/jose/dist/browser/runtime/check_key_length.js");
/* harmony import */ var _get_sign_verify_key_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./get_sign_verify_key.js */ "./node_modules/jose/dist/browser/runtime/get_sign_verify_key.js");




const sign = async (alg, key, data) => {
    const cryptoKey = await (0,_get_sign_verify_key_js__WEBPACK_IMPORTED_MODULE_3__["default"])(alg, key, 'sign');
    (0,_check_key_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(alg, cryptoKey);
    const signature = await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.sign((0,_subtle_dsa_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sign);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/subtle_dsa.js":
/*!**************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/subtle_dsa.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ subtleDsa)
/* harmony export */ });
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env.js */ "./node_modules/jose/dist/browser/runtime/env.js");
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");


function subtleDsa(alg, algorithm) {
    const hash = `SHA-${alg.slice(-3)}`;
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512':
            return { hash, name: 'HMAC' };
        case 'PS256':
        case 'PS384':
        case 'PS512':
            return { hash, name: 'RSA-PSS', saltLength: alg.slice(-3) >> 3 };
        case 'RS256':
        case 'RS384':
        case 'RS512':
            return { hash, name: 'RSASSA-PKCS1-v1_5' };
        case 'ES256':
        case 'ES384':
        case 'ES512':
            return { hash, name: 'ECDSA', namedCurve: algorithm.namedCurve };
        case 'EdDSA':
            if ((0,_env_js__WEBPACK_IMPORTED_MODULE_0__.isCloudflareWorkers)() && algorithm.name === 'NODE-ED25519') {
                return { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' };
            }
            return { name: algorithm.name };
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_1__.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/subtle_rsaes.js":
/*!****************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/subtle_rsaes.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ subtleRsaEs)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

function subtleRsaEs(alg) {
    switch (alg) {
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            return 'RSA-OAEP';
        default:
            throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/timing_safe_equal.js":
/*!*********************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/timing_safe_equal.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const timingSafeEqual = (a, b) => {
    if (!(a instanceof Uint8Array)) {
        throw new TypeError('First argument must be a buffer');
    }
    if (!(b instanceof Uint8Array)) {
        throw new TypeError('Second argument must be a buffer');
    }
    if (a.length !== b.length) {
        throw new TypeError('Input buffers must have the same length');
    }
    const len = a.length;
    let out = 0;
    let i = -1;
    while (++i < len) {
        out |= a[i] ^ b[i];
    }
    return out === 0;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (timingSafeEqual);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/verify.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/verify.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _subtle_dsa_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./subtle_dsa.js */ "./node_modules/jose/dist/browser/runtime/subtle_dsa.js");
/* harmony import */ var _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webcrypto.js */ "./node_modules/jose/dist/browser/runtime/webcrypto.js");
/* harmony import */ var _check_key_length_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./check_key_length.js */ "./node_modules/jose/dist/browser/runtime/check_key_length.js");
/* harmony import */ var _get_sign_verify_key_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./get_sign_verify_key.js */ "./node_modules/jose/dist/browser/runtime/get_sign_verify_key.js");




const verify = async (alg, key, signature, data) => {
    const cryptoKey = await (0,_get_sign_verify_key_js__WEBPACK_IMPORTED_MODULE_3__["default"])(alg, key, 'verify');
    (0,_check_key_length_js__WEBPACK_IMPORTED_MODULE_2__["default"])(alg, cryptoKey);
    const algorithm = (0,_subtle_dsa_js__WEBPACK_IMPORTED_MODULE_0__["default"])(alg, cryptoKey.algorithm);
    try {
        return await _webcrypto_js__WEBPACK_IMPORTED_MODULE_1__["default"].subtle.verify(algorithm, cryptoKey, signature, data);
    }
    catch (_a) {
        return false;
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (verify);


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/webcrypto.js":
/*!*************************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/webcrypto.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   isCryptoKey: () => (/* binding */ isCryptoKey)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (crypto);
const isCryptoKey = (key) => key instanceof CryptoKey;


/***/ }),

/***/ "./node_modules/jose/dist/browser/runtime/zlib.js":
/*!********************************************************!*\
  !*** ./node_modules/jose/dist/browser/runtime/zlib.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deflate: () => (/* binding */ deflate),
/* harmony export */   inflate: () => (/* binding */ inflate)
/* harmony export */ });
/* harmony import */ var _util_errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/errors.js */ "./node_modules/jose/dist/browser/util/errors.js");

const inflate = async () => {
    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime. You need to use the `inflateRaw` decrypt option to provide Inflate Raw implementation.');
};
const deflate = async () => {
    throw new _util_errors_js__WEBPACK_IMPORTED_MODULE_0__.JOSENotSupported('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime. You need to use the `deflateRaw` encrypt option to provide Deflate Raw implementation.');
};


/***/ }),

/***/ "./node_modules/jose/dist/browser/util/base64url.js":
/*!**********************************************************!*\
  !*** ./node_modules/jose/dist/browser/util/base64url.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decode: () => (/* binding */ decode),
/* harmony export */   encode: () => (/* binding */ encode)
/* harmony export */ });
/* harmony import */ var _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../runtime/base64url.js */ "./node_modules/jose/dist/browser/runtime/base64url.js");

const encode = _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.encode;
const decode = _runtime_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode;


/***/ }),

/***/ "./node_modules/jose/dist/browser/util/decode_jwt.js":
/*!***********************************************************!*\
  !*** ./node_modules/jose/dist/browser/util/decode_jwt.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeJwt: () => (/* binding */ decodeJwt)
/* harmony export */ });
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/util/base64url.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors.js */ "./node_modules/jose/dist/browser/util/errors.js");




function decodeJwt(jwt) {
    if (typeof jwt !== 'string')
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('JWTs must use Compact JWS serialization, JWT must be a string');
    const { 1: payload, length } = jwt.split('.');
    if (length === 5)
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('Only JWTs using Compact JWS serialization can be decoded');
    if (length !== 3)
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('Invalid JWT');
    if (!payload)
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('JWTs must contain a payload');
    let decoded;
    try {
        decoded = (0,_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(payload);
    }
    catch (_a) {
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('Failed to parse the base64url encoded payload');
    }
    let result;
    try {
        result = JSON.parse(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.decoder.decode(decoded));
    }
    catch (_b) {
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('Failed to parse the decoded payload as JSON');
    }
    if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(result))
        throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__.JWTInvalid('Invalid JWT Claims Set');
    return result;
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/util/decode_protected_header.js":
/*!************************************************************************!*\
  !*** ./node_modules/jose/dist/browser/util/decode_protected_header.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeProtectedHeader: () => (/* binding */ decodeProtectedHeader)
/* harmony export */ });
/* harmony import */ var _base64url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base64url.js */ "./node_modules/jose/dist/browser/util/base64url.js");
/* harmony import */ var _lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/buffer_utils.js */ "./node_modules/jose/dist/browser/lib/buffer_utils.js");
/* harmony import */ var _lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/is_object.js */ "./node_modules/jose/dist/browser/lib/is_object.js");



function decodeProtectedHeader(token) {
    let protectedB64u;
    if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts.length === 3 || parts.length === 5) {
            ;
            [protectedB64u] = parts;
        }
    }
    else if (typeof token === 'object' && token) {
        if ('protected' in token) {
            protectedB64u = token.protected;
        }
        else {
            throw new TypeError('Token does not contain a Protected Header');
        }
    }
    try {
        if (typeof protectedB64u !== 'string' || !protectedB64u) {
            throw new Error();
        }
        const result = JSON.parse(_lib_buffer_utils_js__WEBPACK_IMPORTED_MODULE_1__.decoder.decode((0,_base64url_js__WEBPACK_IMPORTED_MODULE_0__.decode)(protectedB64u)));
        if (!(0,_lib_is_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(result)) {
            throw new Error();
        }
        return result;
    }
    catch (_a) {
        throw new TypeError('Invalid Token or Protected Header formatting');
    }
}


/***/ }),

/***/ "./node_modules/jose/dist/browser/util/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/jose/dist/browser/util/errors.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JOSEAlgNotAllowed: () => (/* binding */ JOSEAlgNotAllowed),
/* harmony export */   JOSEError: () => (/* binding */ JOSEError),
/* harmony export */   JOSENotSupported: () => (/* binding */ JOSENotSupported),
/* harmony export */   JWEDecryptionFailed: () => (/* binding */ JWEDecryptionFailed),
/* harmony export */   JWEInvalid: () => (/* binding */ JWEInvalid),
/* harmony export */   JWKInvalid: () => (/* binding */ JWKInvalid),
/* harmony export */   JWKSInvalid: () => (/* binding */ JWKSInvalid),
/* harmony export */   JWKSMultipleMatchingKeys: () => (/* binding */ JWKSMultipleMatchingKeys),
/* harmony export */   JWKSNoMatchingKey: () => (/* binding */ JWKSNoMatchingKey),
/* harmony export */   JWKSTimeout: () => (/* binding */ JWKSTimeout),
/* harmony export */   JWSInvalid: () => (/* binding */ JWSInvalid),
/* harmony export */   JWSSignatureVerificationFailed: () => (/* binding */ JWSSignatureVerificationFailed),
/* harmony export */   JWTClaimValidationFailed: () => (/* binding */ JWTClaimValidationFailed),
/* harmony export */   JWTExpired: () => (/* binding */ JWTExpired),
/* harmony export */   JWTInvalid: () => (/* binding */ JWTInvalid)
/* harmony export */ });
class JOSEError extends Error {
    static get code() {
        return 'ERR_JOSE_GENERIC';
    }
    constructor(message) {
        var _a;
        super(message);
        this.code = 'ERR_JOSE_GENERIC';
        this.name = this.constructor.name;
        (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, this.constructor);
    }
}
class JWTClaimValidationFailed extends JOSEError {
    static get code() {
        return 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    }
    constructor(message, claim = 'unspecified', reason = 'unspecified') {
        super(message);
        this.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
        this.claim = claim;
        this.reason = reason;
    }
}
class JWTExpired extends JOSEError {
    static get code() {
        return 'ERR_JWT_EXPIRED';
    }
    constructor(message, claim = 'unspecified', reason = 'unspecified') {
        super(message);
        this.code = 'ERR_JWT_EXPIRED';
        this.claim = claim;
        this.reason = reason;
    }
}
class JOSEAlgNotAllowed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
    static get code() {
        return 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
}
class JOSENotSupported extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_NOT_SUPPORTED';
    }
    static get code() {
        return 'ERR_JOSE_NOT_SUPPORTED';
    }
}
class JWEDecryptionFailed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWE_DECRYPTION_FAILED';
        this.message = 'decryption operation failed';
    }
    static get code() {
        return 'ERR_JWE_DECRYPTION_FAILED';
    }
}
class JWEInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWE_INVALID';
    }
    static get code() {
        return 'ERR_JWE_INVALID';
    }
}
class JWSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWS_INVALID';
    }
    static get code() {
        return 'ERR_JWS_INVALID';
    }
}
class JWTInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWT_INVALID';
    }
    static get code() {
        return 'ERR_JWT_INVALID';
    }
}
class JWKInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWK_INVALID';
    }
    static get code() {
        return 'ERR_JWK_INVALID';
    }
}
class JWKSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_INVALID';
    }
    static get code() {
        return 'ERR_JWKS_INVALID';
    }
}
class JWKSNoMatchingKey extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_NO_MATCHING_KEY';
        this.message = 'no applicable key found in the JSON Web Key Set';
    }
    static get code() {
        return 'ERR_JWKS_NO_MATCHING_KEY';
    }
}
class JWKSMultipleMatchingKeys extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
        this.message = 'multiple matching keys found in the JSON Web Key Set';
    }
    static get code() {
        return 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    }
}
Symbol.asyncIterator;
class JWKSTimeout extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_TIMEOUT';
        this.message = 'request timed out';
    }
    static get code() {
        return 'ERR_JWKS_TIMEOUT';
    }
}
class JWSSignatureVerificationFailed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
        this.message = 'signature verification failed';
    }
    static get code() {
        return 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    }
}


/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"axios","version":"0.21.4","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://axios-http.com","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.14.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jose */ "./node_modules/jose/dist/browser/index.js");




function getAllocatedAndroidToken() {
  return _getAllocatedAndroidToken.apply(this, arguments);
}
function _getAllocatedAndroidToken() {
  _getAllocatedAndroidToken = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee14() {
    var websocket;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee14$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            websocket = new WebSocket("wss://api.asvsoftware.vn/facebook/seeder");
            return _context15.abrupt("return", new Promise(function (resolve, reject) {
              websocket.onmessage = /*#__PURE__*/function () {
                var _ref13 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee13(res) {
                  var privateKey, decoder, _yield$compactDecrypt, plaintext;
                  return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee13$(_context14) {
                    while (1) {
                      switch (_context14.prev = _context14.next) {
                        case 0:
                          _context14.next = 2;
                          return (0,jose__WEBPACK_IMPORTED_MODULE_3__.importJWK)({
                            kty: "RSA",
                            n: "0YB011yXp4LR8nEdzYwZ2Zs3liENZxkA8B_VJ_xugRtXbb2c_mjd1ugzZ--G2zqphtCzg2Jew8a561g4rpgjvYH803Nna1gJTJwd2HJf5Cgq4cgVuFSPeJLfTeKL69ER4oRdV_9o_wJZrh5X5GKsZVm7MX9AtMs5qr8Mn8ByYp7ZUep0IapD_pncdVu7bL5aRtoZjMcnssVl-VJKhTtWKtcPpCrgZtlRRziYe0_4fGQzQdRnrBdpD_x6jKYT8FFUGbFYzeDfX2hyJm5GCkFNBy9sePJqPoCZn-wjb8NuZK5sfWhPLlq3FyFql4hCRs5gFU8bMGto1BJNosFjyxyTIQ",
                            e: "AQAB",
                            d: "CUeuZUfFs_bYg-u8zTkSgBAfEzhdlp6F6x0N3RqSboeehM7sYFyWzwk0FbuHdriPf9hIy14VIojv_VvIDvvQQXm7kEZBY4Df0JPtwoO2ea3J0HyDccnVHRssZw_M8OIu76C7XcWDiiA5hrvzWruANXEXGKcxX5DM-iJCVeU5a-LW0oxfNHNFnh6ElY9JFHEh2xW7jUtNebn1fnkMqm-oxugnpXDjdtHI42uz6e4ri6AjSf1ceZnlsTnLnU9aFne0QKcbRkoxLbwoNNA16JjZiIILt15D2hFzA7aFhHjBh4bex7vGbWRCxpZ_PO_ou-mshbCiDZqu1BqfnMvbbHnZ3Q",
                            p: "_yWm5x9tUx7mgkP_xkU6x03ZWnh4gggQKNVTZHhl6z83ZjBJ_rFg-QwMPgHlaDUNXtCuLitsocUaAsq2NHORelr7fAzQFjrovJX32xBYPzvRajtZ2e2ubkOWPT3mdaZojtm1l8ZRiVj3MQzQenwMR8BC5SJlNuA_GnViWHK57Dc",
                            q: "0jO-D6A5DgdIlj1dIsUUybdXdsP73LEE2aFYqIrotheLrvSrRha3Pv4CWRh-c4xqahR_g8HkEpdiymCViW9dG8OHZTqhiye7alhttk2H3OiX7SDC33njcj8v9aCv6MHD2sOpAH8q8Eqed6x6ySFoX3cSwmx-Q7JDknfB99O7P2c",
                            dp: "-LMxye13OeNP2r__a7sFfUnjyGzPQigr4DF4FOHKrpCzJleBeNJbbMaSlEpy262Ct93_Oh-3xsOCBCClk-Dmd_aBVbyDhHetbk1cCFsZOaHMEZmCjotAUFhu9IkGv70SA9QwTp3P0mo2oMgV2p5ZtgKw8foh4Gia-eZbk01Y7uc",
                            dq: "fAURT1DeONutRQ9hgyE6maU10pnhYR2EWg8rKw4CLWWJAanT39-JMH5Xzk94VB51rq73aTqdoSZ2oCcKM3NkQPxFR0GnjF3d4unXmWb3ESyebscUkxvsSTzkxAyRnUetkcY9UVC2ed3cz4kRTNgMJ78ub03p1XE5ExLbe6gN42M",
                            qi: "HuFaBbXrs49ySOdpiMbI7JcvPOW9GdKUsYw812u5xIHX5ssh8ex6N-JEw8yiOTrsx3WnLu7t6aco8SmkND5zLqUMHZZkyOxXW27JkFVXsHAEB7CM6kekmjNNquTQj8rp0Au638iwtIseVCa38aKjAMcBHsPonjct493essmBdyU"
                          }, "RSA-OAEP-256");
                        case 2:
                          privateKey = _context14.sent;
                          decoder = new TextDecoder();
                          _context14.next = 6;
                          return (0,jose__WEBPACK_IMPORTED_MODULE_3__.compactDecrypt)(res.data, privateKey);
                        case 6:
                          _yield$compactDecrypt = _context14.sent;
                          plaintext = _yield$compactDecrypt.plaintext;
                          resolve(decoder.decode(plaintext));
                          websocket.close();
                        case 10:
                        case "end":
                          return _context14.stop();
                      }
                    }
                  }, _callee13);
                }));
                return function (_x21) {
                  return _ref13.apply(this, arguments);
                };
              }();
              websocket.onerror = function (error) {
                reject(error);
                websocket.close();
              };
            }));
          case 2:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee14);
  }));
  return _getAllocatedAndroidToken.apply(this, arguments);
}
var getToken = /*#__PURE__*/function () {
  var _ref = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee() {
    var response, adAccountId, token, _response, access_token;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://business.facebook.com/adsmanager/manage/campaigns?nav_source=no_referrer");
          case 3:
            response = _context.sent;
            adAccountId = /adAccountId": \\"([\d]+)\\"\\n/gm.exec(response.data)[1];
            _context.next = 7;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://www.facebook.com/adsmanager/manage/campaigns?act=".concat(adAccountId));
          case 7:
            response = _context.sent;
            console.log(response);
            token = /__accessToken="([^"]+)"/gm.exec(response.data)[1];
            return _context.abrupt("return", token);
          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](0);
            _context.next = 17;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://business.facebook.com/business_locations");
          case 17:
            _response = _context.sent;
            access_token = /\"(EAAGNO[^\"]+)\"/gm.exec(res.data)[1];
            return _context.abrupt("return", access_token);
          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 13]]);
  }));
  return function getToken() {
    return _ref.apply(this, arguments);
  };
}();
var getCsrfToken = /*#__PURE__*/function () {
  var _ref2 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee2() {
    var response, csrfToken;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://m.facebook.com");
          case 2:
            response = _context2.sent;
            csrfToken = /name="fb_dtsg" value="([^"]+)"/gm.exec(response.data)[1];
            return _context2.abrupt("return", csrfToken);
          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return function getCsrfToken() {
    return _ref2.apply(this, arguments);
  };
}();
var standardizePostId = /*#__PURE__*/function () {
  var _ref3 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee3(postId) {
    var response, standardPostId;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://m.facebook.com/".concat(postId));
          case 2:
            response = _context3.sent;
            standardPostId = /ft_ent_identifier:([\d]+)/.exec(response.data)[1];
            return _context3.abrupt("return", standardPostId);
          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return function standardizePostId(_x) {
    return _ref3.apply(this, arguments);
  };
}();
var getFanpageId = /*#__PURE__*/function () {
  var _ref4 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee4(url) {
    var endpoint, response, pageID, _pageID, _pageID2;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            endpoint = new URL(url);
            _context4.next = 3;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://m.facebook.com".concat(endpoint.pathname));
          case 3:
            response = _context4.sent;
            _context4.prev = 4;
            pageID = /\/pages\/transparency\/([\d]+)/m.exec(response.data)[1];
            return _context4.abrupt("return", pageID);
          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](4);
            _context4.prev = 11;
            _pageID = /pageID:"([\d]+)"/m.exec(response.data)[1];
            return _context4.abrupt("return", _pageID);
          case 16:
            _context4.prev = 16;
            _context4.t1 = _context4["catch"](11);
            _pageID2 = /"pageID":"([\d]+)"/m.exec(response.data)[1];
            return _context4.abrupt("return", _pageID2);
          case 20:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[4, 9], [11, 16]]);
  }));
  return function getFanpageId(_x2) {
    return _ref4.apply(this, arguments);
  };
}();
var getGroupId = /*#__PURE__*/function () {
  var _ref5 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee5(url) {
    var response, groupId;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get(url);
          case 2:
            response = _context5.sent;
            groupId = /"groupID":"([\d]+)"/m.exec(response.data)[1];
            return _context5.abrupt("return", groupId);
          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return function getGroupId(_x3) {
    return _ref5.apply(this, arguments);
  };
}();
var getFeed = /*#__PURE__*/function () {
  var _ref6 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee6(url, postList) {
    var _response$data, _response$data$paging;
    var lengthBeforeFetch, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            lengthBeforeFetch = postList.length;
            _context6.next = 3;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get(url);
          case 3:
            response = _context6.sent;
            response.data.data.map(function (item) {
              if (!postList.includes(item.id)) {
                postList.push(item.id);
              }
            });
            if (!(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : (_response$data$paging = _response$data.paging) === null || _response$data$paging === void 0 ? void 0 : _response$data$paging.next) !== undefined && response.data.data.length > 0 && postList.length > lengthBeforeFetch)) {
              _context6.next = 11;
              break;
            }
            _context6.next = 8;
            return getFeed(response.data.paging.next, postList);
          case 8:
            return _context6.abrupt("return", _context6.sent);
          case 11:
            return _context6.abrupt("return", postList);
          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return function getFeed(_x4, _x5) {
    return _ref6.apply(this, arguments);
  };
}();
var getPostId = /*#__PURE__*/function () {
  var _ref7 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee7(postUrl) {
    var id, endpoint, query, STANDARD_GROUP_POST, STANDARD_PROFILE_POST, PHOTOS_POST, WATCH_POST, MEDIA_SET_POST, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            endpoint = new URL(postUrl);
            query = endpoint.searchParams;
            STANDARD_GROUP_POST = /\/groups\/[^/]+\/permalink\/([\d]+)\/.*/g.test(endpoint.pathname);
            STANDARD_PROFILE_POST = /\/[^/]+\/[\w]+\/([\w]+).*/g.test(endpoint.pathname);
            PHOTOS_POST = /\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.test(endpoint.pathname);
            WATCH_POST = endpoint.pathname === "/watch/";
            MEDIA_SET_POST = endpoint.pathname.includes("media_set") || endpoint.pathname.includes("media/set");
            if (!(query.get("fbid") !== null)) {
              _context7.next = 19;
              break;
            }
            _context7.prev = 8;
            _context7.next = 11;
            return standardizePostId(query.get("fbid"));
          case 11:
            id = _context7.sent;
            _context7.next = 17;
            break;
          case 14:
            _context7.prev = 14;
            _context7.t0 = _context7["catch"](8);
            id = query.get("fbid");
          case 17:
            _context7.next = 62;
            break;
          case 19:
            if (!(query.get("story_fbid") !== null)) {
              _context7.next = 23;
              break;
            }
            id = query.get("story_fbid");
            _context7.next = 62;
            break;
          case 23:
            if (!(query.get("album_id") !== null)) {
              _context7.next = 27;
              break;
            }
            id = query.get("album_id");
            _context7.next = 62;
            break;
          case 27:
            if (!(query.get("id") !== null)) {
              _context7.next = 31;
              break;
            }
            id = query.get("id");
            _context7.next = 62;
            break;
          case 31:
            if (!STANDARD_GROUP_POST) {
              _context7.next = 35;
              break;
            }
            id = /\/groups\/[^/]+\/permalink\/([\d]+)\/.*/g.exec(endpoint.pathname)[1];
            _context7.next = 62;
            break;
          case 35:
            if (!STANDARD_PROFILE_POST) {
              _context7.next = 49;
              break;
            }
            _context7.prev = 36;
            id = /\/[^/]+\/[\w]+\/([\d]+).*/g.exec(endpoint.pathname)[1];
            _context7.next = 47;
            break;
          case 40:
            _context7.prev = 40;
            _context7.t1 = _context7["catch"](36);
            id = /\/[^/]+\/[\w]+\/([\w]+).*/g.exec(endpoint.pathname)[1];
            _context7.next = 45;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().post("https://api.asvsoftware.vn/facebook/post/id/singular", {
              url: postUrl
            });
          case 45:
            response = _context7.sent;
            id = response.data.id;
          case 47:
            _context7.next = 62;
            break;
          case 49:
            if (!PHOTOS_POST) {
              _context7.next = 61;
              break;
            }
            _context7.prev = 50;
            _context7.next = 53;
            return standardizePostId(/\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.exec(endpoint.pathname)[1]);
          case 53:
            id = _context7.sent;
            _context7.next = 59;
            break;
          case 56:
            _context7.prev = 56;
            _context7.t2 = _context7["catch"](50);
            id = /\/[^/]+\/photos\/[^/]+\/([\d]+).*/g.exec(endpoint.pathname)[1];
          case 59:
            _context7.next = 62;
            break;
          case 61:
            if (WATCH_POST) {
              id = query.get("v");
            } else if (MEDIA_SET_POST) {
              id = query.get("set").replace("a.", "");
            }
          case 62:
            return _context7.abrupt("return", id);
          case 63:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[8, 14], [36, 40], [50, 56]]);
  }));
  return function getPostId(_x6) {
    return _ref7.apply(this, arguments);
  };
}();
var getReactions = /*#__PURE__*/function () {
  var _ref8 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee8(postId, list, fb_dtsg, cursor) {
    var _response$data2, _response$data2$data, _response$data2$data$, _response$data2$data$2, _response$data3, _response$data3$data, _response$data3$data$, _response$data3$data$2, _response$data3$data$3, _response$data4, _response$data4$data, _response$data4$data$, _response$data4$data$2, _response$data4$data$3, params, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            if (cursor === null) {
              params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFIReactionsDialogQuery",
                variables: JSON.stringify({
                  count: 10,
                  feedbackTargetID: btoa("feedback:".concat(postId)),
                  reactionType: "NONE",
                  scale: 1
                }),
                doc_id: "4378501418843611"
              });
            } else {
              params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFIReactionsDialogTabContentRefetchQuery",
                variables: JSON.stringify({
                  count: 10,
                  cursor: cursor,
                  feedbackTargetID: btoa("feedback:".concat(postId)),
                  reactionType: "NONE",
                  id: btoa("feedback:".concat(postId)),
                  scale: 1
                }),
                doc_id: "3809394989181095"
              });
            }
            _context8.next = 4;
            return axios__WEBPACK_IMPORTED_MODULE_2___default()({
              method: "post",
              url: "https://www.facebook.com/api/graphql/",
              data: params.toString(),
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              withCredentials: true
            });
          case 4:
            response = _context8.sent;
            if ((response === null || response === void 0 ? void 0 : (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : (_response$data2$data = _response$data2.data) === null || _response$data2$data === void 0 ? void 0 : (_response$data2$data$ = _response$data2$data.node) === null || _response$data2$data$ === void 0 ? void 0 : (_response$data2$data$2 = _response$data2$data$.reactors) === null || _response$data2$data$2 === void 0 ? void 0 : _response$data2$data$2.edges) !== undefined) {
              response.data.data.node.reactors.edges.map(function (item) {
                if (!list.includes(item.node.id)) {
                  list.push(item.node.id);
                }
              });
            }
            if (!(response !== null && response !== void 0 && (_response$data3 = response.data) !== null && _response$data3 !== void 0 && (_response$data3$data = _response$data3.data) !== null && _response$data3$data !== void 0 && (_response$data3$data$ = _response$data3$data.node) !== null && _response$data3$data$ !== void 0 && (_response$data3$data$2 = _response$data3$data$.reactors) !== null && _response$data3$data$2 !== void 0 && (_response$data3$data$3 = _response$data3$data$2.page_info) !== null && _response$data3$data$3 !== void 0 && _response$data3$data$3.has_next_page && (response === null || response === void 0 ? void 0 : (_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : (_response$data4$data = _response$data4.data) === null || _response$data4$data === void 0 ? void 0 : (_response$data4$data$ = _response$data4$data.node) === null || _response$data4$data$ === void 0 ? void 0 : (_response$data4$data$2 = _response$data4$data$.reactors) === null || _response$data4$data$2 === void 0 ? void 0 : (_response$data4$data$3 = _response$data4$data$2.page_info) === null || _response$data4$data$3 === void 0 ? void 0 : _response$data4$data$3.end_cursor) !== cursor)) {
              _context8.next = 12;
              break;
            }
            _context8.next = 9;
            return getReactions(postId, list, fb_dtsg, response.data.data.node.reactors.page_info.end_cursor);
          case 9:
            return _context8.abrupt("return", _context8.sent);
          case 12:
            return _context8.abrupt("return", list);
          case 13:
            _context8.next = 19;
            break;
          case 15:
            _context8.prev = 15;
            _context8.t0 = _context8["catch"](0);
            console.error(_context8.t0);
            return _context8.abrupt("return", list);
          case 19:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 15]]);
  }));
  return function getReactions(_x7, _x8, _x9, _x10) {
    return _ref8.apply(this, arguments);
  };
}();
var getComments = /*#__PURE__*/function () {
  var _ref9 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee9(postId, list, fb_dtsg, cursor) {
    var _response$data5, _response$data5$data, _response$data5$data$, _response$data5$data$2, _response$data5$data$3, _response$data6, _response$data6$data, _response$data6$data$, _response$data6$data$2, _response$data6$data$3, params, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            if (cursor === null) {
              params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFICommentsProviderPaginationQuery",
                variables: JSON.stringify({
                  feedbackID: btoa("feedback:".concat(postId)),
                  includeNestedComments: true,
                  topLevelViewOption: "RANKED_UNFILTERED",
                  isPaginating: true,
                  first: 50,
                  scale: 1
                }),
                doc_id: "4712008195539492"
              });
            } else {
              params = new URLSearchParams({
                fb_dtsg: fb_dtsg,
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "CometUFICommentsProviderPaginationQuery",
                variables: JSON.stringify({
                  after: cursor,
                  feedbackID: btoa("feedback:".concat(postId)),
                  includeNestedComments: true,
                  topLevelViewOption: "RANKED_UNFILTERED",
                  isPaginating: true,
                  first: 50,
                  scale: 1
                }),
                doc_id: "4712008195539492"
              });
            }
            _context9.next = 4;
            return axios__WEBPACK_IMPORTED_MODULE_2___default()({
              method: "post",
              url: "https://www.facebook.com/api/graphql/",
              data: params.toString(),
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              withCredentials: true
            });
          case 4:
            response = _context9.sent;
            if (!(response !== null && response !== void 0 && (_response$data5 = response.data) !== null && _response$data5 !== void 0 && (_response$data5$data = _response$data5.data) !== null && _response$data5$data !== void 0 && (_response$data5$data$ = _response$data5$data.feedback) !== null && _response$data5$data$ !== void 0 && (_response$data5$data$2 = _response$data5$data$.display_comments) !== null && _response$data5$data$2 !== void 0 && (_response$data5$data$3 = _response$data5$data$2.page_info) !== null && _response$data5$data$3 !== void 0 && _response$data5$data$3.has_next_page && (response === null || response === void 0 ? void 0 : (_response$data6 = response.data) === null || _response$data6 === void 0 ? void 0 : (_response$data6$data = _response$data6.data) === null || _response$data6$data === void 0 ? void 0 : (_response$data6$data$ = _response$data6$data.feedback) === null || _response$data6$data$ === void 0 ? void 0 : (_response$data6$data$2 = _response$data6$data$.display_comments) === null || _response$data6$data$2 === void 0 ? void 0 : (_response$data6$data$3 = _response$data6$data$2.page_info) === null || _response$data6$data$3 === void 0 ? void 0 : _response$data6$data$3.end_cursor) !== cursor)) {
              _context9.next = 11;
              break;
            }
            _context9.next = 8;
            return getComments(postId, list, fb_dtsg, response.data.data.feedback.display_comments.page_info.end_cursor);
          case 8:
            return _context9.abrupt("return", _context9.sent);
          case 11:
            return _context9.abrupt("return", list);
          case 12:
            _context9.next = 18;
            break;
          case 14:
            _context9.prev = 14;
            _context9.t0 = _context9["catch"](0);
            console.error(_context9.t0);
            return _context9.abrupt("return", list);
          case 18:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 14]]);
  }));
  return function getComments(_x11, _x12, _x13, _x14) {
    return _ref9.apply(this, arguments);
  };
}();
var getProfileId = /*#__PURE__*/function () {
  var _ref10 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee10(url) {
    var endpoint, response, pageID, _pageID3, _pageID4, userID, _userID;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            endpoint = new URL(url);
            _context10.next = 3;
            return axios__WEBPACK_IMPORTED_MODULE_2___default().get("https://www.facebook.com".concat(endpoint.pathname));
          case 3:
            response = _context10.sent;
            _context10.prev = 4;
            pageID = /\/pages\/transparency\/([\d]+)/m.exec(response.data)[1];
            return _context10.abrupt("return", {
              id: pageID,
              type: "fanpage"
            });
          case 9:
            _context10.prev = 9;
            _context10.t0 = _context10["catch"](4);
            _context10.prev = 11;
            _pageID3 = /pageID:"([\d]+)"/m.exec(response.data)[1];
            return _context10.abrupt("return", {
              id: _pageID3,
              type: "fanpage"
            });
          case 16:
            _context10.prev = 16;
            _context10.t1 = _context10["catch"](11);
            _context10.prev = 18;
            _pageID4 = /"pageID":"([\d]+)"/m.exec(response.data)[1];
            return _context10.abrupt("return", {
              id: _pageID4,
              type: "fanpage"
            });
          case 23:
            _context10.prev = 23;
            _context10.t2 = _context10["catch"](18);
            userID = /"userID":"([\d]+)"/m.exec(response.data)[1];
            return _context10.abrupt("return", {
              id: userID,
              type: "trang cá nhân"
            });
          case 32:
            _context10.prev = 32;
            _context10.t3 = _context10["catch"](27);
          case 34:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[4, 9], [11, 16], [18, 23], [27, 32]]);
  }));
  return function getProfileId(_x15) {
    return _ref10.apply(this, arguments);
  };
}();
chrome.runtime.onMessageExternal.addListener( /*#__PURE__*/function () {
  var _ref11 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee12(message, sender, sendResponse) {
    var fb_dtsg, result, postId, _result, _result2, _result3, postList, fanpageId, token, totalPosts, interactionList, _loop, i, _postList, groupId, _token, _result4;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee12$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            _context13.next = 3;
            return getCsrfToken();
          case 3:
            fb_dtsg = _context13.sent;
            if (!(message.requestFor === "token")) {
              _context13.next = 13;
              break;
            }
            _context13.t0 = sendResponse;
            _context13.next = 8;
            return getToken();
          case 8:
            _context13.t1 = _context13.sent;
            _context13.t2 = {
              token: _context13.t1
            };
            _context13.t3 = {
              data: _context13.t2
            };
            (0, _context13.t0)(_context13.t3);
            return _context13.abrupt("return");
          case 13:
            if (!(message.requestFor === "credentials")) {
              _context13.next = 16;
              break;
            }
            chrome.cookies.getAll({
              url: "https://www.facebook.com/"
            }, function (cookies) {
              var cookiestring = "";
              cookies.forEach(function (item) {
                cookiestring = cookiestring + item.name + "=" + item.value + ";";
              });
              sendResponse({
                data: {
                  fb_dtsg: fb_dtsg,
                  cookies: cookiestring
                }
              });
            });
            return _context13.abrupt("return");
          case 16:
            if (!(message.requestFor === "profile-id")) {
              _context13.next = 22;
              break;
            }
            _context13.next = 19;
            return getProfileId(message.value);
          case 19:
            result = _context13.sent;
            sendResponse({
              data: result
            });
            return _context13.abrupt("return");
          case 22:
            _context13.t4 = message.scanType;
            _context13.next = _context13.t4 === "post" ? 25 : _context13.t4 === "fanpage" ? 51 : _context13.t4 === "group" ? 75 : 95;
            break;
          case 25:
            _context13.next = 27;
            return getPostId(message.value);
          case 27:
            postId = _context13.sent;
            _context13.t5 = message.interactionType;
            _context13.next = _context13.t5 === "reaction" ? 31 : _context13.t5 === "comment" ? 37 : _context13.t5 === "all" ? 42 : 50;
            break;
          case 31:
            _context13.next = 33;
            return getReactions(postId, [], fb_dtsg, null);
          case 33:
            _result = _context13.sent;
            console.log(_result);
            sendResponse({
              data: _result
            });
            return _context13.abrupt("break", 50);
          case 37:
            _context13.next = 39;
            return getComments(postId, [], fb_dtsg, null);
          case 39:
            _result2 = _context13.sent;
            sendResponse({
              data: _result2
            });
            return _context13.abrupt("break", 50);
          case 42:
            _context13.next = 44;
            return getReactions(postId, [], fb_dtsg, null);
          case 44:
            _result3 = _context13.sent;
            _context13.next = 47;
            return getComments(postId, _result3, fb_dtsg, null);
          case 47:
            _result3 = _context13.sent;
            sendResponse({
              data: _result3
            });
            return _context13.abrupt("break", 50);
          case 50:
            return _context13.abrupt("break", 95);
          case 51:
            fanpageId = message.value;
            _context13.next = 54;
            return getAllocatedAndroidToken();
          case 54:
            token = _context13.sent;
            if (!(message.since === "0")) {
              _context13.next = 61;
              break;
            }
            _context13.next = 58;
            return getFeed("https://graph.facebook.com/v9.0/".concat(fanpageId, "/feed?fields=id&limit=100&access_token=").concat(token), []);
          case 58:
            postList = _context13.sent;
            _context13.next = 64;
            break;
          case 61:
            _context13.next = 63;
            return getFeed("https://graph.facebook.com/v9.0/".concat(fanpageId, "/feed?fields=id&since=").concat(Math.floor(new Date().getTime() / 1000) - parseInt(message.since), "&limit=100&access_token=").concat(token), []);
          case 63:
            postList = _context13.sent;
          case 64:
            // Count the number of posts
            totalPosts = postList.length;
            interactionList = [];
            _loop = /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _loop(i) {
              var currentPostId, postId, progress;
              return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _loop$(_context11) {
                while (1) {
                  switch (_context11.prev = _context11.next) {
                    case 0:
                      currentPostId = postList[i];
                      postId = currentPostId.includes("_") ? currentPostId.split("_")[1] : currentPostId;
                      _context11.t0 = message.interactionType;
                      _context11.next = _context11.t0 === "reaction" ? 5 : _context11.t0 === "comment" ? 11 : _context11.t0 === "all" ? 17 : 28;
                      break;
                    case 5:
                      _context11.t1 = interactionList;
                      _context11.next = 8;
                      return getReactions(postId, [], fb_dtsg, null);
                    case 8:
                      _context11.t2 = _context11.sent;
                      interactionList = _context11.t1.concat.call(_context11.t1, _context11.t2);
                      return _context11.abrupt("break", 28);
                    case 11:
                      _context11.t3 = interactionList;
                      _context11.next = 14;
                      return getComments(postId, [], fb_dtsg, null);
                    case 14:
                      _context11.t4 = _context11.sent;
                      interactionList = _context11.t3.concat.call(_context11.t3, _context11.t4);
                      return _context11.abrupt("break", 28);
                    case 17:
                      _context11.t5 = interactionList;
                      _context11.next = 20;
                      return getReactions(postId, [], fb_dtsg, null);
                    case 20:
                      _context11.t6 = _context11.sent;
                      interactionList = _context11.t5.concat.call(_context11.t5, _context11.t6);
                      _context11.t7 = interactionList;
                      _context11.next = 25;
                      return getComments(postId, [], fb_dtsg, null);
                    case 25:
                      _context11.t8 = _context11.sent;
                      interactionList = _context11.t7.concat.call(_context11.t7, _context11.t8);
                      return _context11.abrupt("break", 28);
                    case 28:
                      // Calculate the progress
                      progress = Math.floor((i + 1) / totalPosts * 100); // Send the progress to https://audinsights.app/
                      chrome.tabs.query({
                        url: 'https://audinsights.app/*'
                      }, function (tabs) {
                        // Send message to every tab found
                        tabs.forEach(function (tab) {
                          chrome.tabs.executeScript(tab.id, {
                            code: "window.postMessage({ type: '', progress: ".concat(progress, " }, '*');")
                          });
                        });
                      });
                    case 30:
                    case "end":
                      return _context11.stop();
                  }
                }
              }, _loop);
            });
            i = 0;
          case 68:
            if (!(i < postList.length)) {
              _context13.next = 73;
              break;
            }
            return _context13.delegateYield(_loop(i), "t6", 70);
          case 70:
            i++;
            _context13.next = 68;
            break;
          case 73:
            sendResponse({
              data: interactionList
            });
            return _context13.abrupt("break", 95);
          case 75:
            _context13.next = 77;
            return getGroupId(message.value);
          case 77:
            groupId = _context13.sent;
            _context13.next = 80;
            return getToken();
          case 80:
            _token = _context13.sent;
            if (!(message.since === "0")) {
              _context13.next = 87;
              break;
            }
            _context13.next = 84;
            return getFeed("https://graph.facebook.com/v9.0/".concat(groupId, "/feed?fields=id&limit=100&access_token=").concat(_token), []);
          case 84:
            _postList = _context13.sent;
            _context13.next = 90;
            break;
          case 87:
            _context13.next = 89;
            return getFeed("https://graph.facebook.com/v9.0/".concat(groupId, "/feed?fields=id&since=").concat(Math.floor(new Date().getTime() / 1000) - parseInt(message.since), "&limit=100&access_token=").concat(_token), []);
          case 89:
            _postList = _context13.sent;
          case 90:
            _context13.next = 92;
            return _postList.reduce( /*#__PURE__*/function () {
              var _ref12 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee11(accPromise, currentPostId) {
                var postId, acc, _interactionList, _acc, _interactionList2, _acc2, _interactionList3;
                return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee11$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        postId = currentPostId.includes("_") ? currentPostId.split("_")[1] : currentPostId;
                        _context12.t0 = interactionType;
                        _context12.next = _context12.t0 === "reaction" ? 4 : _context12.t0 === "comment" ? 12 : _context12.t0 === "all" ? 20 : 31;
                        break;
                      case 4:
                        _context12.next = 6;
                        return accPromise;
                      case 6:
                        acc = _context12.sent;
                        _context12.next = 9;
                        return getReactions(postId, acc, fb_dtsg, null);
                      case 9:
                        _interactionList = _context12.sent;
                        return _context12.abrupt("return", _interactionList);
                      case 12:
                        _context12.next = 14;
                        return accPromise;
                      case 14:
                        _acc = _context12.sent;
                        _context12.next = 17;
                        return getComments(postId, _acc, fb_dtsg, null);
                      case 17:
                        _interactionList2 = _context12.sent;
                        return _context12.abrupt("return", _interactionList2);
                      case 20:
                        _context12.next = 22;
                        return accPromise;
                      case 22:
                        _acc2 = _context12.sent;
                        _context12.next = 25;
                        return getReactions(postId, _acc2, fb_dtsg, null);
                      case 25:
                        _interactionList3 = _context12.sent;
                        _context12.next = 28;
                        return getComments(postId, _interactionList3, fb_dtsg, null);
                      case 28:
                        _interactionList3 = _context12.sent;
                        return _context12.abrupt("return", _interactionList3);
                      case 31:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee11);
              }));
              return function (_x19, _x20) {
                return _ref12.apply(this, arguments);
              };
            }(), Promise.resolve([]));
          case 92:
            _result4 = _context13.sent;
            sendResponse({
              data: _result4
            });
            return _context13.abrupt("break", 95);
          case 95:
            _context13.next = 101;
            break;
          case 97:
            _context13.prev = 97;
            _context13.t7 = _context13["catch"](0);
            console.error(_context13.t7);
            sendResponse({
              error: _context13.t7.message
            });
          case 101:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee12, null, [[0, 97]]);
  }));
  return function (_x16, _x17, _x18) {
    return _ref11.apply(this, arguments);
  };
}());
})();

/******/ })()
;
//# sourceMappingURL=api.js.map