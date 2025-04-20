import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdgybatlakiukmhhwofr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZ3liYXRsYWtpdWttaGh3b2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDQ0NDAsImV4cCI6MjA1ODUyMDQ0MH0.T5Cyt2KUfjcp_4jUiNS65vQNGteXI0a3vUagEQSeD_I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
