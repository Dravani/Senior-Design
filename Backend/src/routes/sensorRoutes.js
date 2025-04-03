import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET: Fetch sensor data from Supabase
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Sensor').select('*');
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

// 
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Fetch data for the specific sensor
    const { data, error } = await supabase
      .from('Sensor')
      .select('humidity, timestamp')
      .eq('sensor_name', name)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Format data for the frontend
    const formattedData = {
      labels: data.map(entry => entry.timestamp), // X-axis (timestamps)
      values: data.map(entry => entry.humidity)   // Y-axis (humidity values)
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

export default router;