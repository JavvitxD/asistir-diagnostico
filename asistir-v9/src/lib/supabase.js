import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mpmlqiuuidzugxwhhvnw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWxxaXV1aWR6dWd4d2hodm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjA5MTgsImV4cCI6MjA5MzgzNjkxOH0.-C_m9lNy6iOPp5I78tu_Xpc_jtDzjt-BnVo5L-cP30A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
