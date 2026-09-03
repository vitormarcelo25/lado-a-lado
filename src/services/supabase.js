import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const today = () => new Date().toISOString().slice(0, 10)

export async function getTodayCheckin() {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('data', today())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertTodayCheckin(fields) {
  const { data: existing } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('daily_checkins')
      .update(fields)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('daily_checkins')
    .insert({ data: today(), ...fields })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRecentCheckins(days = 60) {
  const start = new Date()
  start.setDate(start.getDate() - days)
  const startDate = start.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .gte('data', startDate)
    .order('data', { ascending: false })

  if (error) throw error
  return data
}

export async function addWeightLog(peso, cintura, nota) {
  const { data: existing } = await supabase
    .from('weight_logs')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('weight_logs')
      .update({ peso, cintura: cintura || null, nota: nota || null })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .insert({ data: today(), peso, cintura: cintura || null, nota: nota || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getWeightLogs() {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .order('data', { ascending: true })

  if (error) throw error
  return data
}

export async function getRandomQuote(tipo = 'geral') {
  const { data, error } = await supabase
    .from('motivational_quotes')
    .select('frase')
    .eq('tipo', tipo)

  if (error || !data || data.length === 0) {
    return 'Um dia difícil não anula uma semana inteira de esforço. Recomeçar faz parte do plano.'
  }

  return data[Math.floor(Math.random() * data.length)].frase
}

export async function getAllCheckinsForDate(date) {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('data', date)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getLatestWeight() {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('peso, data')
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}
