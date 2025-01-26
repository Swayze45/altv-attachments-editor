import * as alt from 'alt-client';
import * as game from 'natives';

const localPlayer = alt.Player.local;

let browser = null;

let object = null;
let boneId = 0;
let modelName = '';

alt.on('keydown', (key) => {
  if (key == alt.KeyCode['=']) {
    if (!browser) {
      /** if you have other path to browser, set it here */
      browser = new alt.WebView('http://resource/client/index.html');
      
      if (browser) {
        browser.focus();
        alt.showCursor(true);
        subscribeToEvents();
      }
    }
    else {
      onClose();
    }
  }
})

const onUpdatePosition = (positions) => {
  if (!object) return;

  const offset = new alt.Vector3(positions.offsetX, positions.offsetY, positions.offsetZ);
  const rotation = new alt.Vector3(positions.rotationX, positions.rotationY, positions.rotationZ);

  object.attachToEntity(localPlayer.scriptID, boneId, offset, rotation, false, false, true);
}

const onReset = () => {
  onClear();
}

const onApply = (model, bone, positions) => {
  if (!game.isModelInCdimage(alt.hash(model))) return console.log('Invalid model');
  if (object) onClear();

  bone = parseInt(bone);
  if (isNaN(bone)) return console.log('Invalid bone');

  object = new alt.LocalObject(alt.hash(model), localPlayer.pos, new alt.Vector3(0, 0, 0), false, false, false, 200);

  if (!object) return console.log('Failed to create object');

  const offset = new alt.Vector3(positions.offsetX, positions.offsetY, positions.offsetZ);
  const rotation = new alt.Vector3(positions.rotationX, positions.rotationY, positions.rotationZ);

  boneId = bone;
  modelName = model;

  object.attachToEntity(localPlayer.scriptID, bone, offset, rotation, false, false, true);
}

const onClose = () => {
  unsubscribeFromEvents();

  onClear();

  browser.unfocus();
  browser.destroy();

  alt.showCursor(false);

  browser = null;
}

const onClear = () => {
  if (object) object.destroy();

  object = null;
  boneId = 0;
  modelName = '';
}

const subscribeToEvents = () => {
  browser.on('cef::attachmentsEditor:updatePosition', onUpdatePosition);
  browser.on('cef::attachmentsEditor:reset', onReset);
  browser.on('cef::attachmentsEditor:apply', onApply);
  browser.on('cef::attachmentsEditor:close', onClose);
}

const unsubscribeFromEvents = () => {
  browser.off('cef::attachmentsEditor:updatePosition', onUpdatePosition);
  browser.off('cef::attachmentsEditor:reset', onReset);
  browser.off('cef::attachmentsEditor:apply', onApply);
  browser.off('cef::attachmentsEditor:close', onClose);
}


