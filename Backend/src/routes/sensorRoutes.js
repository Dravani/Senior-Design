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

    res.status(200).json({ message: "Status updated successfully", newStatus });
  } catch (error) {
    console.error("Error toggling sensor status:", error);
    res.status(500).json({ error: "Error updating sensor status", details: error.message });
  }
});


export default router;