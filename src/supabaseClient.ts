import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjtzvwazglhcblizuqnz.supabase.co';
const supabaseAnonKey = 'sb_publishable_cUB6cb2ZTIK0-jXgMs59Wg_-sUWDvZc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);