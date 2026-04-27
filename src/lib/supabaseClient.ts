import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dicuecwkfmlqjkzrbivm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3VlY3drZm1scWprenJiaXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjU4NjgsImV4cCI6MjA5Mjc0MTg2OH0.XP9eEg-W5xSEYVMFl5JbLPi3beOWWz56vkI0YD9GZkg"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)