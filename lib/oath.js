
// Since objects only compare === to the same object (i.e. the same reference)
// we can do something like this instead of using integer enums because we can't
// ever accidentally compare these to other values and get a false-positive.
//
// For instance, `rejected === resolved` will be false, even though they are
// both {}.
var rejected = {}, resolved = {}, waiting = {};

// This is a promise. It's a value with an associated temporal
// status. The value might exist or might not, depending on
// the status.
var Promise = function (value, status){
  this.value = value;
  this.status = waiting;
  this.successCB = null;
  this.failureCB = null;

};


// The user-facing way to add functions that want
// access to the value in the promise when the promise
// is resolved.
Promise.prototype.then = function (success, _failure) {
  var defer = new Deferred();
  this.successCB = {cb:success,
                  defer: defer};


  if(this.status === 'resolved') {
    this.runcb(this.successCB, this.value);
  }
  // if(_failure){
  //   this.failureCB = _failure;
  // }
  return defer.promise;
};


// The user-facing way to add functions that should fire on an error. This
// can be called at the end of a long chain of .then()s to catch all .reject()
// calls that happened at any time in the .then() chain. This makes chaining
// multiple failable computations together extremely easy.
Promise.prototype.catch = function (failure) {
  this.failureCB = failure;
};

Promise.prototype.runcb = function(cbObj, result) {
    setTimeout(function () {
      var res = cbObj.cb(result);
      if (res instanceof Promise) {
        cbObj.defer.bind(res);
      } else {
        cbObj.defer.resolve(res);
      }
    }, 0);
};






// This is the object returned by defer() that manages a promise.
// It provides an interface for resolving and rejecting promises
// and also provides a way to extract the promise it contains.

var Deferred = function(promise) {
  this.promise = promise;
};

// Resolve the contained promise with data.
//
// This will be called by the creator of the promise when the data
// associated with the promise is ready.
Deferred.prototype.resolve = function (data) {
  var that = this.promise;
  that.value = data;
  that.status = resolved;

  // setTimeout(function(){
   that.runcb(that.successCB, data);
  // }, 0);
};

// Reject the contained promise with an error.
//
// This will be called by the creator of the promise when there is
// an error in getting the data associated with the promise.
Deferred.prototype.reject = function (error) {
  this.promise.value = error;
  this.promise.status = rejected;
  var that = this.promise;
  // setTimeout(function(){
    that.failureCB(error);
  // }, 0);
};

Deferred.prototype.bind =  function (promise) {
    var that = this;
    promise.then(function (res) {
      that.resolve(res);
    }, function (err) {
      that.reject(err);
    })
  };

// The external interface for creating promises
// and resolving them. This returns a Deferred
// object with an empty promise.
var defer = function () {
 var promise = new Promise();
 return new Deferred(promise);
};


module.exports.defer = defer;

