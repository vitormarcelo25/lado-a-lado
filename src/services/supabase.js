import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const today = () => new Date().toISOString().slice(0, 10)

// ============================================================
// CHECKINS DIARIOS (alimentacao, agua, humor)
// ============================================================

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

export async function getAllCheckinsForDate(date) {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('data', date)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getRecentCheckins(days = 90) {
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

// ============================================================
// PESO E METAS
// ============================================================

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

export async function getMetas() {
  const { data, error } = await supabase
    .from('metas_progresso')
    .select('*')
    .eq('id', 'meta_unica')
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertMetas(dados) {
  const { data, error } = await supabase
    .from('metas_progresso')
    .upsert({
      id: 'meta_unica',
      peso_inicial: parseFloat(dados.peso_inicial) || 0,
      peso_atual: parseFloat(dados.peso_atual) || 0,
      peso_meta: parseFloat(dados.peso_meta) || 0,
      cintura: parseFloat(dados.cintura) || 0,
      objetivo_pessoal: dados.objetivo_pessoal || '',
      updated_at: new Date()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// FRASES MOTIVACIONAIS
// ============================================================

export async function getRandomQuote(tipo = 'geral') {
  const { data, error } = await supabase
    .from('motivational_quotes')
    .select('frase')
    .eq('tipo', tipo)

  if (error || !data || data.length === 0) {
    return 'Um dia dificil nao anula uma semana inteira de esforco. Recomecar faz parte do plano.'
  }

  return data[Math.floor(Math.random() * data.length)].frase
}

// ============================================================
// MOUNJARO: AGENDAMENTO E APLICACAO
// ============================================================

export async function getMounjaroSchedule() {
  const { data, error } = await supabase
    .from('mounjaro_schedule')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateMounjaroSchedule(diaSemana) {
  const schedule = await getMounjaroSchedule()
  if (schedule) {
    const { data, error } = await supabase
      .from('mounjaro_schedule')
      .update({ dia_semana: diaSemana })
      .eq('id', schedule.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('mounjaro_schedule')
    .insert({ dia_semana: diaSemana })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function confirmMounjaroApplication() {
  const { data: existing } = await supabase
    .from('mounjaro_applications')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('mounjaro_applications')
      .update({ aplicado: true })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('mounjaro_applications')
    .insert({ data: today(), aplicado: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMounjaroApplications(weeks = 4) {
  const start = new Date()
  start.setDate(start.getDate() - (weeks * 7))
  const startDate = start.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('mounjaro_applications')
    .select('*')
    .gte('data', startDate)
    .order('data', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================
// EFEITOS COLATERAIS
// ============================================================

export async function getTodaySideEffects() {
  const { data, error } = await supabase
    .from('side_effects')
    .select('*')
    .eq('data', today())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertSideEffects(effects) {
  const { data: existing } = await supabase
    .from('side_effects')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('side_effects')
      .update(effects)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('side_effects')
    .insert({ data: today(), ...effects })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRecentSideEffects(weeks = 2) {
  const start = new Date()
  start.setDate(start.getDate() - (weeks * 7))
  const startDate = start.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('side_effects')
    .select('*')
    .gte('data', startDate)
    .order('data', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================
// TERMOMETRO DA FOME
// ============================================================

export async function getTodayHunger() {
  const { data, error } = await supabase
    .from('hunger_tracker')
    .select('*')
    .eq('data', today())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertHunger(tipo) {
  const { data: existing } = await supabase
    .from('hunger_tracker')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('hunger_tracker')
      .update({ tipo })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('hunger_tracker')
    .insert({ data: today(), tipo })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// PROTEINA E FIBRAS
// ============================================================

export async function getTodayProteinFiber() {
  const { data, error } = await supabase
    .from('protein_fiber')
    .select('*')
    .eq('data', today())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProteinFiber(fields) {
  const { data: existing } = await supabase
    .from('protein_fiber')
    .select('id')
    .eq('data', today())
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('protein_fiber')
      .update(fields)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('protein_fiber')
    .insert({ data: today(), ...fields })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// VITORIAS ALEM DA BALANCA
// ============================================================

export async function getCurrentWeekVictories() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const mondayStr = monday.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('non_scale_victories')
    .select('*')
    .eq('semana', mondayStr)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertWeekVictories(fields) {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const mondayStr = monday.toISOString().slice(0, 10)

  const existing = await getCurrentWeekVictories()

  if (existing) {
    const { data, error } = await supabase
      .from('non_scale_victories')
      .update(fields)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('non_scale_victories')
    .insert({ semana: mondayStr, ...fields })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// MISSAO DO DIA
// ============================================================

const MISSOES_POR_DIA = [
  'Caminhe por 10 minutos hoje. Qualquer ritmo, so comeca.',
  'Troque um refrigerante por agua com gas e limao.',
  'Coma proteina antes do carboidrato na proxima refeicao.',
  'Beba 1 copo de agua 30 minutos antes de cada refeicao.',
  'Escreva 3 coisas pelas quais voce e grata hoje.',
  'Durma 30 minutos mais cedo esta noite.',
  'Estique por 5 minutos ao acordar.',
]

export function getMissionForDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const dayIndex = date.getDay()
  return MISSOES_POR_DIA[dayIndex]
}

export async function getTodayMission() {
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('data', today())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error

  if (!data) {
    const missao = getMissionForDate(today())
    const { data: newData, error: insertError } = await supabase
      .from('daily_missions')
      .insert({ data: today(), missao, concluida: false })
      .select()
      .single()
    if (insertError) throw insertError
    return newData
  }

  return data
}

export async function toggleMission(missionId, concluida) {
  const { data, error } = await supabase
    .from('daily_missions')
    .update({ concluida })
    .eq('id', missionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// PAUSA (URGE SURFING)
// ============================================================

export async function savePause(concluida, duracao) {
  const { data, error } = await supabase
    .from('pause_tracker')
    .insert({
      data: today(),
      duracao_segundos: duracao,
      concluida
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTodayPauseCount() {
  const { count, error } = await supabase
    .from('pause_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('data', today())
    .eq('concluida', true)

  if (error) throw error
  return count || 0
}

// ============================================================
// NOTIFICACOES DO GUARDIAO
// ============================================================

export async function getGuardianNotifications() {
  const { data, error } = await supabase
    .from('guardian_notifications')
    .select('*')
    .order('horario', { ascending: true })

  if (error) throw error
  return data
}

export async function addGuardianNotification(titulo, mensagem, horario) {
  const { data, error } = await supabase
    .from('guardian_notifications')
    .insert({ titulo, mensagem, horario, ativa: true })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleGuardianNotification(id, ativa) {
  const { data, error } = await supabase
    .from('guardian_notifications')
    .update({ ativa })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGuardianNotification(id) {
  const { error } = await supabase
    .from('guardian_notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function subscribeGuardianNotifications(callback) {
  return supabase
    .channel('realtime-guardian-notifications')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guardian_notifications' }, callback)
    .subscribe()
}

// ============================================================
// TOKENS FCM (DEVICE TOKENS)
// ============================================================

export async function salvarDeviceToken(token, plataforma = 'web') {
  const { data, error } = await supabase
    .from('device_tokens')
    .upsert({ token, plataforma, ativo: true }, { onConflict: 'token' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removerDeviceToken(token) {
  const { error } = await supabase
    .from('device_tokens')
    .update({ ativo: false })
    .eq('token', token)

  if (error) throw error
}

export async function getDeviceTokensAtivos() {
  const { data, error } = await supabase
    .from('device_tokens')
    .select('*')
    .eq('ativo', true)

  if (error) throw error
  return data
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export function subscribeCheckins(callback) {
  return supabase
    .channel('realtime-checkins')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checkins' }, callback)
    .subscribe()
}

export function subscribeMetas(callback) {
  return supabase
    .channel('realtime-metas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'metas_progresso' }, callback)
    .subscribe()
}

export function subscribeSideEffects(callback) {
  return supabase
    .channel('realtime-side-effects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'side_effects' }, callback)
    .subscribe()
}

export function subscribeMounjaro(callback) {
  return supabase
    .channel('realtime-mounjaro')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mounjaro_applications' }, callback)
    .subscribe()
}

export function subscribeProteinFiber(callback) {
  return supabase
    .channel('realtime-protein-fiber')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'protein_fiber' }, callback)
    .subscribe()
}

export function subscribeVictories(callback) {
  return supabase
    .channel('realtime-victories')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'non_scale_victories' }, callback)
    .subscribe()
}

export function removeChannel(channel) {
  return supabase.removeChannel(channel)
}
