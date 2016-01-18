import Ember from 'ember';

export default Ember.Mixin.create({
  submitBinds: {},
  bindToParent: function() {
    let submitBinds = this.get('submitBinds');
    if (typeof submitBinds !== 'undefined') {
      submitBinds[this] = this;
    }
  }.on('didInitAttrs'),

  unbindToParent: function() {
    let submitBinds = this.get('submitBinds');
    delete submitBinds[this];
  },

  willDestroy() {
    this._super();
    this.unbindToParent();
  },
});
