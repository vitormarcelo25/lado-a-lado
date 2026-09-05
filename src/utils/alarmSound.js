// Gerenciador de som de alarme usando a Web Audio API
// Garante funcionamento sem depender de arquivos externos de MP3 e funciona em celulares/desktops

let audioCtx = null
let alarmInterval = null
let isAlarmPlaying = false

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Toca uma sequência de bips ("bi-bi-bi-bi")
function playBeepPattern(ctx) {
  if (!ctx || ctx.state !== 'running') return

  const now = ctx.currentTime
  const beeps = [0, 0.12, 0.24, 0.36] // 4 pulsos rápidos
  const freq = 987.77 // Nota B5 (frequência de alarme digital clássico bem audível)

  beeps.forEach((delay) => {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square' // Timbre clássico de despertador digital
      osc.frequency.setValueAtTime(freq, now + delay)

      // Envelope de volume suave para não estalar o som
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + delay)
      osc.stop(now + delay + 0.08)
    } catch {
      // ignore
    }
  })
}

export function startAlarmSound() {
  if (isAlarmPlaying) return
  isAlarmPlaying = true

  const ctx = getAudioContext()

  const triggerCycle = () => {
    if (!isAlarmPlaying) return
    if (ctx && ctx.state === 'running') {
      playBeepPattern(ctx)
    }
    // Vibração no celular (se suportado pelo navegador)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400])
    }
  }

  // Toca imediatamente e repete a cada 1.2 segundos
  triggerCycle()
  alarmInterval = setInterval(triggerCycle, 1200)
}

export function stopAlarmSound() {
  isAlarmPlaying = false
  if (alarmInterval) {
    clearInterval(alarmInterval)
    alarmInterval = null
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(0)
  }
}

export function previewAlarmSound() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      playBeepPattern(ctx)
    })
  } else if (ctx) {
    playBeepPattern(ctx)
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([150, 80, 150])
  }
}
