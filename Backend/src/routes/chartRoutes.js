import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gdgybatlakiukmhhwofr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZ3liYXRsYWtpdWttaGh3b2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDQ0NDAsImV4cCI6MjA1ODUyMDQ0MH0.T5Cyt2KUfjcp_4jUiNS65vQNGteXI0a3vUagEQSeD_I';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch all saved charts
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    
    let query = supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .select('*')
      .order('created_at', { ascending: false });
      
    // Filter by username if provided
    if (username) {
      query = query.eq('username', username);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching charts', 
      details: error.message 
    });
  }
});

// GET: Fetch charts by project_id
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching project charts', 
      details: error.message 
    });
  }
});

// GET: Fetch a specific chart by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Chart not found' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching chart', 
      details: error.message 
    });
  }
});

// POST: Create a new chart
router.post('/', async (req, res) => {
  try {
    const chartData = {
      name: req.body.name,
      type: req.body.type,
      title: req.body.title,
      config: req.body.data,
      project_id: req.body.project_id,
      username: req.body.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating chart with data:', chartData);

    const { data, error } = await supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .insert([chartData])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error in POST /charts:', error);
    res.status(500).json({ 
      error: 'Error creating chart', 
      details: error.message 
    });
  }
});

// PUT: Update an existing chart
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chartData = {
      name: req.body.name,
      title: req.body.title,
      config: req.body.data,
      updated_at: new Date().toISOString()
    };

    // Only update project_id and username if provided
    if (req.body.project_id) {
      chartData.project_id = req.body.project_id;
    }
    
    if (req.body.username) {
      chartData.username = req.body.username;
    }

    const { data, error } = await supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .update(chartData)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Chart not found' });
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error updating chart', 
      details: error.message 
    });
  }
});

// DELETE: Delete a chart
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('newCharts')  // Using newCharts - the actual table name
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Chart deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error deleting chart', 
      details: error.message 
    });
  }
});

export default router;
