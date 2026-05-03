import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bnwwlupqydjjwcwaapmh.supabase.co'
const supabaseKey = 'sb_publishable_JI9xJslDtky2QESmucC3jQ_eQYdRMKn'

export const supabase = createClient(supabaseUrl, supabaseKey)