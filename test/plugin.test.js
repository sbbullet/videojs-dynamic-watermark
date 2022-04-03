import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-dynamic-watermark', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.dynamicWatermark,
    'function',
    'videojs-dynamic-watermark plugin was registered'
  );

  this.player.dynamicWatermark();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-dynamic-watermark'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('watermark element inserted', function(assert) {
  this.player.dynamicWatermark({
    elementId: 'unique-id'
  });

  this.clock.tick(1);

  assert.notStrictEqual(document.getElementById('unique-id'), null, 'Watermark element not inserted');
});

QUnit.test('watermark text is accurate', function(assert) {
  this.player.dynamicWatermark({
    elementId: 'unique-id',
    watermarkText: 'watermark-text'
  });

  this.clock.tick(1);

  assert.strictEqual(document.getElementById('unique-id').innerHTML, 'watermark-text', 'Watermark text is different than passed in the options');
});
