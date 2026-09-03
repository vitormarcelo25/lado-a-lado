import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Pill, Droplets, Sparkles, 
  MessageCircleHeart, CheckCircle2, Shield, 
  ArrowLeft, Bell, Flame, Plus, Minus, Send, 
  Smile, Meh, Frown, PartyPopper
} from 'lucide-react';

export default function App() {
  const MENTOR_PHONE = import.meta.env.VITE_MENTOR_PHONE || '5581998324477';
  const PATIENT_PHONE = import.meta.env.VITE_PATIENT_PHONE || '5581997168709';
  const GUARDIAN_PIN = import.meta.env.VITE_GUARDIAN_PIN || '1234';

  const [visao, setVisao] = useState('paciente');
  const [pinDigitado, setPinDigitado] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [humorSelecionado, setHumorSelecionado] = useState('bem');
  
  // Metas e Hábitos
  const [remedio, setRemedio] = useState(false);
  const [alimentacao, setAlimentacao] = useState(false);
  const [coposAgua, setCoposAgua] = useState(4); // Cada copo = 250ml
  const metaCopos = 10; // 2.5L

  // Cálculo de progresso diário
  const calcularProgresso = () => {
    let pontos = 0;
    if (remedio) pontos += 35;
    if (alimentacao) pontos += 35;
    pontos += Math.min(30, Math.round((coposAgua / metaCopos) * 30));
    return pontos;
  };

  const progresso = calcularProgresso();

  const humores = [
    { id: 'otimo', icone: PartyPopper, label: 'Radiante', cor: 'text-amber-500 bg-amber-50' },
    { id: 'bem', icone: Smile, label: 'Firme', cor: 'text-emerald-500 bg-emerald-50' },
    { id: 'arrastado', icone: Meh, label: 'Cansada', cor: 'text-blue-500 bg-blue-50' },
    { id: 'dificil', icone: Frown, label: 'Difícil', cor: 'text-rose-500 bg-rose-50' }
  ];

  const linkSosMentor = `https://wa.me/${MENTOR_PHONE}?text=${encodeURIComponent(
    'Oi! Dei uma desanimada ou tive uma recaída agora... Preciso de um incentivo para não desistir. ❤️'
  )}`;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-linear-to-b from-rose-50/40 via-white to-slate-50 text-slate-800 flex flex-col justify-between p-5 pb-8">
      
      {/* ================= VISÃO DA PACIENTE ================= */}
      {visao === 'paciente' && (
        <div className="space-y-5">
          
          {/* Topo / Header */}
          <header className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-md shadow-rose-200">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base text-slate-900 leading-tight">Lado a Lado</h1>
                <p className="text-[11px] text-slate-600 font-medium">Seu espaço de recomeço</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>3 dias</span>
              </div>
              
              <button 
                onClick={() => setVisao('guardiao')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Área do Mentor"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Card de Progresso do Dia */}
          <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">Resumo de Hoje</span>
                <h2 className="text-xl font-black text-slate-800">
                  {progresso === 100 ? 'Dia Impecável! 🌟' : `${progresso}% Concluído`}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {remedio && alimentacao ? 'Quase tudo pronto!' : 'Um passo por vez'}
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-linear-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </section>

          {/* Frase / Motivação */}
          <div className="bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-5 text-white shadow-lg shadow-rose-200/60 relative overflow-hidden">
            <Sparkles className="w-20 h-20 text-white/10 absolute -right-4 -bottom-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Lembrete Vital
            </span>
            <p className="mt-2 text-sm font-semibold leading-snug text-white/95">
              "Recaídas não anulam o processo. O que constrói o resultado é a velocidade com que você volta."
            </p>
          </div>

          {/* Como se sente hoje */}
          <section className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Como você está agora?</span>
            <div className="grid grid-cols-4 gap-2">
              {humores.map((h) => {
                const Icone = h.icone;
                const selecionado = humorSelecionado === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => setHumorSelecionado(h.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      selecionado 
                        ? 'border-rose-400 bg-rose-50/60 shadow-xs scale-102' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <Icone className={`w-5 h-5 mb-1 ${selecionado ? 'text-rose-600' : 'text-slate-600'}`} />
                    <span className={`text-[11px] font-semibold ${selecionado ? 'text-rose-900' : 'text-slate-600'}`}>
                      {h.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Hábitos Diários */}
          <section className="space-y-2.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Metas de Hoje</span>

            {/* Medicamento */}
            <div 
              onClick={() => setRemedio(!remedio)}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                remedio 
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                  : 'bg-white border-slate-100 shadow-xs hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${remedio ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${remedio ? 'text-emerald-950' : 'text-slate-800'}`}>
                    Medicação diária
                  </h3>
                  <p className="text-[11px] text-slate-600">Dose planejada do tratamento</p>
                </div>
              </div>
              <CheckCircle2 className={`w-6 h-6 transition-transform ${remedio ? 'text-emerald-600 scale-110' : 'text-slate-200'}`} />
            </div>

            {/* Alimentação */}
            <div 
              onClick={() => setAlimentacao(!alimentacao)}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                alimentacao 
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                  : 'bg-white border-slate-100 shadow-xs hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alimentacao ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${alimentacao ? 'text-emerald-950' : 'text-slate-800'}`}>
                    Alimentação no plano
                  </h3>
                  <p className="text-[11px] text-slate-600">Comida limpa e sem excessos</p>
                </div>
              </div>
              <CheckCircle2 className={`w-6 h-6 transition-transform ${alimentacao ? 'text-emerald-600 scale-110' : 'text-slate-200'}`} />
            </div>

            {/* Hidratação Rápida */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Hidratação</h3>
                    <p className="text-[11px] text-slate-600">
                      {coposAgua * 250}ml de {(metaCopos * 250) / 1000}L batidos
                    </p>
                  </div>
                </div>

                {/* Controles de copos */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCoposAgua(Math.max(0, coposAgua - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-slate-800 w-5 text-center">{coposAgua}</span>
                  <button 
                    onClick={() => setCoposAgua(coposAgua + 1)}
                    className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </section>

          {/* Botão de Emergência Emocional */}
          <footer className="pt-2">
            <a
              href={linkSosMentor}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-slate-300 active:scale-[0.98] transition-all"
            >
              <MessageCircleHeart className="w-5 h-5 text-rose-400" />
              Tive uma recaída / Preciso de apoio
            </a>
          </footer>
        </div>
      )}

      {/* ================= VISÃO DO GUARDIÃO ================= */}
      {visao === 'guardiao' && (
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <button 
              onClick={() => { setVisao('paciente'); setAutenticado(false); setPinDigitado(''); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao App
            </button>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              Painel Mentor
            </span>
          </div>

          {!autenticado ? (
            <form onSubmit={(e) => { e.preventDefault(); if (pinDigitado === GUARDIAN_PIN) setAutenticado(true); else alert('PIN incorreto'); }} className="space-y-4 pt-12 text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-2">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="font-black text-xl text-slate-800">Acesso Restrito</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">Digite seu PIN para acompanhar o progresso e disparar lembretes.</p>

              <input
                type="password"
                maxLength={4}
                value={pinDigitado}
                onChange={(e) => setPinDigitado(e.target.value)}
                placeholder="••••"
                className="w-36 text-center tracking-[10px] text-2xl py-3 border border-slate-200 rounded-2xl mx-auto focus:ring-2 focus:ring-rose-500 outline-none"
                autoFocus
              />

              <div>
                <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-sm hover:bg-slate-800 transition-all">
                  Desbloquear
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status Atual Dela</span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`p-3 rounded-2xl border ${remedio ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <span className="text-[10px] font-bold block uppercase">Remédio</span>
                    <span className="text-xs font-black">{remedio ? 'Tomou ✅' : 'Pendente'}</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${coposAgua >= 8 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <span className="text-[10px] font-bold block uppercase">Água</span>
                    <span className="text-xs font-black">{coposAgua * 250}ml</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${alimentacao ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <span className="text-[10px] font-bold block uppercase">Plano</span>
                    <span className="text-xs font-black">{alimentacao ? '100% 🥗' : 'Pendente'}</span>
                  </div>
                </div>
              </div>

              {/* Ações de incentivo */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Disparar Incentivo no WhatsApp</span>

                <a
                  href={`https://wa.me/${PATIENT_PHONE}?text=${encodeURIComponent('Passando aqui para ver como você está! Orgulhoso de você não desistir. Vamos juntos! 🔥❤️')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
                >
                  <span>Mandar mensagem de orgulho / apoio</span>
                  <Send className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${PATIENT_PHONE}?text=${encodeURIComponent('Oi prima! Já bebeu sua água e conferiu os hábitos hoje? Passando pra dar aquela conferida! 💧💊')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
                >
                  <span>Lembrar do remédio & água</span>
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </section>
      )}

    </main>
  );
}