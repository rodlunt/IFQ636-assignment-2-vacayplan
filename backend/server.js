
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Prefer IPv4 for outbound requests. Open-Meteo's geocoding host advertises an
// IPv6 address this deployment cannot route, and Node's fetch does not fall back
// to IPv4 on its own, so the weather lookup times out unless we force the order.
require('dns').setDefaultResultOrder('ipv4first');
require('net').setDefaultAutoSelectFamily(false);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/trips/:tripId/activities', require('./routes/activityRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Export the app object for testing
if (require.main === module) {
    connectDB();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
