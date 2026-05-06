import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssyckywijlrkgcwvkwlr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzeWNreXdpamxya2djd3Zrd2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTQwMTYsImV4cCI6MjA2Njg5MDAxNn0.37eckNOnwyE7MimpqBNYddf8pECEtkSiVHVaNv93ZUw';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
