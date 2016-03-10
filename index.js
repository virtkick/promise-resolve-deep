'use strict';

module.exports = function setupResolveDeep(Promise) {
  let promiseMap = Promise.map || function(promiseList, functor) {
    return Promise.all(promiseList.map((promiseOrValue, idx) => {
      return Promise.resolve(promiseOrValue).then(functor).then(value => {
        promiseList[idx] = value;
      });
    })).then(() => promiseList);
  };
  
  return Promise.resolveDeep = function resolveNestedPromises(obj) {
    return Promise.resolve(obj).then(obj => {
      if(Array.isArray(obj)) {
        return promiseMap(obj, resolveNestedPromises);
      }
      else if(obj && typeof obj === 'object' ) {
        let promisesToResolve = [];
        Object.keys(obj).map(key => {
          let promise = resolveNestedPromises(obj[key]).then(val=> {
            obj[key] = val;
          });
          promisesToResolve.push(promise)
        });
        if(promisesToResolve.length) {
          return Promise.all(promisesToResolve).then(() => obj);
        }
      }
      return obj;
    });
  };
};