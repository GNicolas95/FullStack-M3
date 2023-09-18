'use strict';

function $Promise(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('The executor must be a function');
  }

  this._state = 'pending';
  this._value = undefined;
  this._handlerGroups = [];

  try {
    executor(
      value => {
        this._internalResolve(value);
      },
      reason => {
        this._internalReject(reason);
      }
    );
  } catch (error) {
    this._internalReject(error);
  }
}

$Promise.prototype._internalResolve = function (value) {
  if (this._state === 'pending') {
    this._state = 'fulfilled';
    this._value = value;
    this._callHandlers();
  }
};

$Promise.prototype._internalReject = function (reason) {
  if (this._state === 'pending') {
    this._state = 'rejected';
    this._value = reason;
    this._callHandlers();
  }
};

$Promise.prototype.catch = function (errorCb) {
  return this.then(null, errorCb);
};

$Promise.prototype.then = function (successCb, errorCb) {
  if (typeof successCb !== 'function' && typeof errorCb !== 'function') {
    successCb = null;
    errorCb = null;
  }

  const downstreamPromise = new $Promise(() => {});

  this._handlerGroups.push({
    successCb,
    errorCb,
    downstreamPromise,
  });

  if (this._state !== 'pending') this._callHandlers();

  return downstreamPromise;
};

$Promise.prototype._callHandlers = function () {
  while (this._handlerGroups.length) {
    const handler = this._handlerGroups.shift();

    if (this._state === 'fulfilled') {
      if (handler.successCb) {
        try {
          const response = handler.successCb(this._value);

          if (response instanceof $Promise) {
            response.then(
              value => {
                handler.downstreamPromise._internalResolve(value);
              },
              error => {
                handler.downstreamPromise._internalReject(error);
              }
            );
          } else {
            handler.downstreamPromise._internalResolve(response);
          }
        } catch (error) {
          handler.downstreamPromise._internalReject(error);
        }
      } else {
        handler.downstreamPromise._internalResolve(this._value);
      }
    }

    if (this._state === 'rejected') {
      if (handler.errorCb) {
        try {
          const response = handler.errorCb(this._value);

          if (response instanceof $Promise) {
            response.then(
              value => {
                handler.downstreamPromise._internalResolve(value);
              },
              error => {
                handler.downstreamPromise._internalReject(error);
              }
            );
          } else {
            handler.downstreamPromise._internalResolve(response);
          }
        } catch (error) {
          handler.downstreamPromise._internalReject(error);
        }
      } else {
        handler.downstreamPromise._internalReject(this._value);
      }
    }
  }
};

// Método estático $Promise.resolve
$Promise.resolve = function (value) {
  // Verificar si el valor es una promesa.
  if (value instanceof $Promise) {
    return value; // Si ya es una promesa, devolverla sin cambios.
  }

  // Si no es una promesa, crear una nueva promesa y resolverla con el valor.
  return new $Promise(resolve => {
    resolve(value);
  });
};

// Método estático $Promise.all
$Promise.all = function (promises) {
  if (!Array.isArray(promises)) {
    throw new TypeError('Promise.all() expects an array');
  }

  return new $Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let completedPromises = 0;

    for (let i = 0; i < promises.length; i++) {
      let promise = promises[i];

      if (!(promise instanceof $Promise)) {
        promise = $Promise.resolve(promise); // Convierte valores en promesas si es necesario.
      }

      promise.then(
        value => {
          results[i] = value;
          completedPromises++;

          if (completedPromises === promises.length) {
            resolve(results); // Resuelve la promesa con el arreglo de valores completos.
          }
        },
        reason => {
          reject(reason); // Rechaza la promesa si una de las promesas ingresadas se rechaza.
        }
      );
    }
  });
};

module.exports = $Promise;




/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
