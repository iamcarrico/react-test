'use strict';

describe('Main', function () {
  var React = require('react/addons');
  var TempoApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    TempoApp = require('components/TempoApp.js');
    component = React.createElement(TempoApp);
  });

  it('should create a new instance of TempoApp', function () {
    expect(component).toBeDefined();
  });
});
