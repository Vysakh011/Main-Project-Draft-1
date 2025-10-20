// MQTT over WebSocket
const broker = 'wss://test.mosquitto.org:8081';
const client = mqtt.connect(broker);

// You can replace this with your actual topic(s)
const topics = ['your/topic/here'];
const plugs = {};

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  topics.forEach(t => client.subscribe(t));
});

client.on('message', (topic, message) => {
  try {
    // Example message: "plug_id:1, voltage:230, current:0.5"
    const text = message.toString();
    const parts = Object.fromEntries(
      text.split(',').map(p => {
        const [k, v] = p.split(':').map(s => s.trim());
        return [k, parseFloat(v)];
      })
    );

    const id = parts.plug_id || 0;
    const voltage = parts.voltage || 0;
    const current = parts.current || 0;
    const power = voltage * current;

    plugs[id] = { id, voltage, current, power };
    updateUI();
  } catch (err) {
    console.error('Parse error:', err);
  }
});

function updateUI() {
  const plugDiv = document.getElementById('plugs');
  plugDiv.innerHTML = '';

  let total = 0;
  for (const id in plugs) {
    const p = plugs[id];
    total += p.power;

    plugDiv.innerHTML += `
      <div class="plug">
        <h2>Plug ID: ${p.id}</h2>
        <div class="value">Voltage: ${p.voltage.toFixed(2)} V</div>
        <div class="value">Current: ${p.current.toFixed(2)} A</div>
        <div class="value"><b>Power: ${p.power.toFixed(2)} W</b></div>
      </div>
    `;
  }

  document.getElementById('total').textContent =
    `Total Power: ${total.toFixed(2)} W`;
}
