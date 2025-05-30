import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the src directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug output to see what's being loaded
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'not found');
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY);

const router = express.Router();

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.SUPABASE_URL || 'https://gdgybatlakiukmhhwofr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZ3liYXRsYWtpdWttaGh3b2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDQ0NDAsImV4cCI6MjA1ODUyMDQ0MH0.T5Cyt2KUfjcp_4jUiNS65vQNGteXI0a3vUagEQSeD_I';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch sensor data from Supabase
router.get('/', async (req, res) => {
  try {
    // Get disabled sensor statuses
    const { data: disabledData, error: disabledError } = await supabase
      .from('DisabledSensors')
      .select('*');

    if (disabledError) throw disabledError;

    // Get the latest timestamp for each unique sensor from the Sensors table
    const { data: latestTimestamps, error: sensorError } = await supabase
      .from('Sensor')
      .select('sensor_name, timestamp')
      .order('timestamp', { ascending: false });

    if (sensorError) throw sensorError;

    const recentTimestamps = {};
    for (const row of latestTimestamps) {
      if (!recentTimestamps[row.sensor_name]) {
        recentTimestamps[row.sensor_name] = row.timestamp;
      }
    }

    const combinedData = disabledData.map(sensor => {
      const lastActive = recentTimestamps[sensor.sensor_name];
      let duration = 'N/A';
    
      if (lastActive) {
        const now = new Date();
        const then = new Date(lastActive + 'Z');
        const diffMs = now.getTime() - then.getTime();
    
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
        if (days > 0) {
          duration = `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
          duration = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          duration = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
      }
    
      return {
        ...sensor,
        last_active: lastActive,
        duration
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

// GET: Readings for all of a specific sensor
router.get('/read/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { start, end, type } = req.query;

    const column = type === "temperature" ? "temperature" : "humidity";
    console.log("Fetching column:", column);
    
    let query = supabase
      .from('Sensor')
      .select(`${column}, timestamp`)
      .eq('sensor_name', name)
      .order('timestamp', { ascending: true });

    // Apply time filtering if both start and end times are provided
    if (start && end) {
      query = query.gte('timestamp', start).lte('timestamp', end);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format data for the frontend
    const formattedData = {
      labels: data.map(entry => entry.timestamp), // X-axis (timestamps)
      values: data.map(entry => entry[column])   // Y-axis (humidity or temperature values)
    };


    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

// GET: Status of 1 sensors
router.get('/disabled/:name', async (req, res) => {
  try {
    const { name } = req.params;

    let query = supabase
      .from('DisabledSensors')
      .select(`*`)
      .eq('sensor_name', name);

    const { data, error } = await query;
    console.log(data);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

// GET: Status of ALL sensors
router.get('/disabled', async (req, res) => {
  try {
    let query = supabase
      .from('DisabledSensors')
      .select(`*`)

    const { data, error } = await query;
    console.log(data);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

// PUT: Toggle the status of a sensor
router.post('/disabled/:name/toggle', async (req, res) => {
  try {
    const { name } = req.params;

    const { data, error } = await supabase
      .from('DisabledSensors')
      .select('is_disabled')
      .eq('sensor_name', name)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Sensor not found" });

    const currentStatus = data.is_disabled;
    const newStatus = !currentStatus;

    const { error: updateError } = await supabase
      .from('DisabledSensors')
      .update({ is_disabled: newStatus })
      .eq('sensor_name', name);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Status updated successfully", is_disabled: newStatus });
  } catch (error) {
    console.error("Error toggling sensor status:", error);
    res.status(500).json({ error: "Error updating sensor status", details: error.message });
  }
});

// TEMP GET NETWORK CHANGE TO CURRENT supaBase
// GET: Fetch sensor data from Supabase
router.get('/network', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Network').select('*');
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

router.get('/network/read/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { start, end} = req.query;
    
    let query = supabase
      .from('Network')
      .select(`packet_length, created_at`)
      .eq('ip', name)
      .order('created_at', { ascending: true });

    // Apply time filtering if both start and end times are provided
    if (start && end) {
      query = query.gte('created_at', start).lte('created_at', end);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log("DATA: ", data)

    // Format data for the frontend
    const formattedData = {
      labels: data.map(entry => entry.created_at), // X-axis - Timestamp
      values: data.map(entry => entry.packet_length)   // Y-axis - Packet Length (bytes)
    };


    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});


export default router;