import Ember from 'ember';

export default Ember.Mixin.create({
  saveWithSubComponents(parentComponent, success, options) {
    const self = this;
    let submitBinds = parentComponent.get('submitBinds');
    submitBinds[parentComponent] = parentComponent;

    let validatePromises = Object.keys(submitBinds).filter((k) => {
      return typeof submitBinds[k].validate === 'function';
    }).map((k) => {
      return submitBinds[k].validate();
    });

    let promise = Ember.RSVP.allSettled(validatePromises, 'validation').then(
      function(array) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          for (let i = 0; i < array.length; i++) {
            if (array[i].state === 'rejected') {
              reject(new Error('validation error'));
              return;
            }
          }
          resolve();
        }, 'validator checker');
      }
    );

    if (options.beforeSave) {
      promise = promise.then(function() {
        return options.beforeSave();
      });
    }

    if (options.validationErrors) {
      promise = promise.then(function() {
        return Ember.RSVP.all(self._getSavePromises(submitBinds), 'data save promises');
      }, function() {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          options.validationErrors(); reject('validation error');
        });
      });
    } else {
      promise = promise.then(function() {
        return Ember.RSVP.all(self._getSavePromises(submitBinds), 'data save promises');
      });
    }

    return promise.then(function() {
      return success();
    }).then(function() {
      parentComponent.set('submitBinds', {});
    });
  },

  _getSavePromises(submitBinds) {
    return Object.keys(submitBinds).filter((k) => {
      return typeof submitBinds[k].bindSave === 'function';
    }).map((k) => {
      return submitBinds[k].bindSave(this.get('store'));
    });
  },
});
