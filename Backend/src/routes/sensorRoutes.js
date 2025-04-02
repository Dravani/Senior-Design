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
    console.log("hello");
    const { data, error } = await supabase.from('Sensor').select('*');
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sensor data', details: error.message });
  }
});

export default router;