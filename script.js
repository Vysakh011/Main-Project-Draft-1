// MQTT setup for browser
const broker = 'wss://test.mosquitto.org:8081';
const client = mqtt.connect(broker);

// Add your topic(s) here
// *** MODIFIED: Set to the topic used by the ESP32 code ***
const topics = ['ece/power_monitor/PowerMonitor-01']; 
const plugs = {};

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  topics.forEach(t => client.subscribe(t));
});

client.on('message', (topic, message) => {
  try {
    // *** MODIFIED: Parse the incoming message as JSON ***
    // Expected message format from Arduino: 
    // {"device":"ESP32-PowerMonitor-01","voltage":230.00,"current":0.500,"power":115.00}
    const text = message.toString();
    const parts = JSON.parse(text); // Parse the JSON string

    // The 'id' for the plug card will be the 'device' name/ID
    const id = parts.device;
    const voltage = parts.voltage || 0;
    const current = parts.current || 0;
    // The Arduino code calculates power, so we use it directly
    const power = parts.power || 0; 

    if (id) {
        plugs[id] = { id, voltage, current, power };
        updateUI();
    } else {
        console.warn('⚠️ Received message with no device ID:', text);
    }
    
  } catch (err) {
    console.error('⚠️ Parse or Process error:', err);
    console.error('Raw message:', message.toString());
  }
});

function updateUI() {
  const container = document.getElementById('plugs');
  container.innerHTML = '';

  let total = 0;

  for (const id in plugs) {
    const p = plugs[id];
    total += p.power;

    const card = `
      <div class="plug-card">
        <h2><i class="bi bi-plug-fill"></i> ${p.id}</h2>
        <div class="value"><i class="bi bi-lightning-charge"></i> Voltage: ${p.voltage.toFixed(2)} V</div>
        <div class="value"><i class="bi bi-current"></i> Current: ${p.current.toFixed(3)} A</div>
        <div class="value"><i class="bi bi-bar-chart-line"></i> <b>Power: ${p.power.toFixed(2)} W</b></div>
      </div>
    `;

    container.innerHTML += card;
  }

  document.getElementById('total').innerHTML =
    `<i class="bi bi-graph-up-arrow"></i> Total Power: ${total.toFixed(2)} W`;
}
