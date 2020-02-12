
let inputPort,
  outputPort;

export default function setup() {}

WebMidi.enable(err => {
  if (err) {
    console.log('Midi could not be enabled. Error: ', err);
  } else {
    const { inputs, outputs } = WebMidi;
    inputPort = setupPorts('inputs', inputs, true);
    outputPort = setupPorts('outputs', outputs, false);
    setupControls();
  }
});

/**
 * Populate MIDI port dropdowns.
 * @param {String} selectorId 
 * @param {Array} ports 
 * @param {Boolean} isInput 
 * @returns {Object} WebMidi port.
 */
function setupPorts(selectorId, ports, isInput) {
  const selectEl = document.getElementById(selectorId);
  selectEl.addEventListener('change', e => {
    if (isInput) {
      inputPort = WebMidi.getInputById(e.target.value);
    } else {
      outputPort = WebMidi.getOutputById(e.target.value);
    }
  });
  ports.forEach(port => {
    const optionEl = document.createElement('option');
    optionEl.appendChild(document.createTextNode(port.name));
    optionEl.value = port.id;
    selectEl.appendChild(optionEl);
  });
  return ports[0];
}

/**
 * 
 */
function setupControls() {
  const controlsEl = document.getElementById('controls');
  controlsEl.appendChild(createNoteButton(1, 60, 100));
  controlsEl.appendChild(createNoteButton(1, 61, 100));
  controlsEl.appendChild(createCCSlider(1, 17, 100));
  controlsEl.appendChild(createCCSlider(1, 18));
}

/**
 * 
 * @param {Number} channel 
 * @param {Number} pitch 
 * @param {Number} velocity 
 * @returns {Object} Button element.
 */
function createNoteButton(channel, pitch, velocity) {
  let isOn = false;
  const btnEl = document.createElement('button');
  btnEl.setAttribute('type', 'button');
  btnEl.textContent = `Note ch${channel} p${pitch} v${velocity}`;
  btnEl.addEventListener('mousedown', () => {
    if (!isOn) {
      outputPort.playNote(pitch, channel, { velocity, rawVelocity: true });
      isOn = true;
    }
  });
  const stopNote = () => {
    if (isOn) {
      isOn = false;
      outputPort.stopNote(pitch, channel, { velocity: 0 });
    }
  };
  btnEl.addEventListener('mouseup', stopNote);
  btnEl.addEventListener('mouseout', stopNote);
  return btnEl;
}

function createCCSlider(channel, controller, value = 0) {
  const spanEl = document.createElement('span');
  spanEl.textContent = `CControl ch${channel} ctr${controller}`;
  const onChange = e => {
    outputPort.sendControlChange(controller, e.target.value, channel);
  };
  const rangeEl = document.createElement('input');
  rangeEl.setAttribute('type', 'range');
  rangeEl.setAttribute('min', '0');
  rangeEl.setAttribute('max', '127');
  rangeEl.setAttribute('step', '1');
  rangeEl.setAttribute('value', value);
  rangeEl.addEventListener('input', onChange);
	rangeEl.addEventListener('change', onChange);
  const labelEl = document.createElement('label');
  labelEl.classList.add('range')
  labelEl.appendChild(spanEl);
  labelEl.appendChild(rangeEl);
  return labelEl;
}
