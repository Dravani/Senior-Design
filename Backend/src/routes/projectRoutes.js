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

// GET: Fetch all projects for a user
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    
    let query = supabase
      .from('projects')
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
    console.error('Error in GET /projects:', error);
    res.status(500).json({ 
      error: 'Error fetching projects', 
      details: error.message 
    });
  }
});

// GET: Fetch a specific project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching project', 
      details: error.message 
    });
  }
});

// POST: Create a new project
router.post('/', async (req, res) => {
  try {
    const projectData = {
      name: req.body.name,
      description: req.body.description,
      username: req.body.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating project with data:', projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error in POST /projects:', error);
    res.status(500).json({ 
      error: 'Error creating project', 
      details: error.message 
    });
  }
});

// PUT: Update an existing project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = {
      name: req.body.name,
      description: req.body.description,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Project not found' });
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error updating project', 
      details: error.message 
    });
  }
});

// DELETE: Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Attempting to delete project with ID: ${id}`);
    
    // First delete all charts associated with this project
    console.log(`Deleting charts for project ${id}`);
    const { data: chartsData, error: chartsDeleteError } = await supabase
      .from('newCharts')
      .delete()
      .eq('project_id', id)
      .select();
    
    if (chartsDeleteError) {
      console.error('Error deleting associated charts:', chartsDeleteError);
      throw chartsDeleteError;
    }
    
    console.log(`Deleted ${chartsData?.length || 0} charts. Now deleting project.`);
    
    // Then delete the project itself - note the lowercase 'projects'
    const { data: projectData, error: projectDeleteError } = await supabase
      .from('projects')  // Changed from 'Projects' to 'projects'
      .delete()
      .eq('id', id)
      .select();
    
    if (projectDeleteError) {
      console.error('Error deleting project:', projectDeleteError);
      throw projectDeleteError;
    }
    
    console.log(`Project deletion response:`, projectData);
    
    if (!projectData || projectData.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json({ message: 'Project and associated charts deleted successfully' });
  } catch (error) {
    console.error('Error in delete project endpoint:', error);
    res.status(500).json({ 
      error: 'Error deleting project', 
      details: error.message 
    });
  }
});

export default router;
