import { useState, useEffect } from 'react';
import { Syringe, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function MounjaroCard() {
  const [modalAberto, setModalAberto] = useState(false);
  const [ultimaDose, setUltimaDose] = useState(null);
  const [doseSelecionada, setDoseSelecionada] = useState('2.5mg');
  const [localSelecionado, setLocalSelecionado] = useState('Abdomen');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarUltimaDose();
  }, []);

  const carregarUltimaDose = async () => {
    const { data, error } = await supabase
      .from('mounjaro_applications')
      .select('*')
      .order('data_aplicacao', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao carregar:', error);
      return;
    }
    if (data) setUltimaDose(data);
  };

  const registrarAplicacao = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const hoje = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('mounjaro_applications')
      .insert({
        data_aplicacao: hoje,
        dose: doseSelecionada,
        local: localSelecionado,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar: ' + error.message);
      setSalvando(false);
      return;
    }

    if (data) setUltimaDose(data);
    setSalvando(false);
    setModalAberto(false);
  };

  const calcularDiasPassados = () => {
    if (!ultimaDose) return null;
    const diffMs = new Date() - new Date(ultimaDose.data_aplicacao);
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const diasPassados = calcularDiasPassados();

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Mounjaro</h3>
            <p className="text-[11px] text-slate-500">Acompanhamento da aplicacao</p>
          </div>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs px-3 py-2 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Dose</span>
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        {ultimaDose ? (
          <>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ultima Aplicacao</span>
              <span className="font-bold text-slate-800">
                {diasPassados === 0 ? 'Aplicado hoje!' : `Ha ${diasPassados} dia${diasPassados > 1 ? 's' : ''}`}
              </span>
              <span className="text-slate-400 text-[10px] block">
                {ultimaDose.dose} - {ultimaDose.local}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Proxima Sugerida</span>
              <span className={`font-bold ${diasPassados >= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                {diasPassados >= 7 ? 'Semana concluida' : `Em ${7 - diasPassados} dias`}
              </span>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-center w-full py-1">
            Nenhuma dose registrada ainda.
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Syringe className="w-5 h-5 text-violet-600" />
              Registrar Injecao de Mounjaro
            </h4>

            <form onSubmit={registrarAplicacao} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Dose da Caneta</label>
                <div className="grid grid-cols-3 gap-2">
                  {['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDoseSelecionada(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        doseSelecionada === d
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Local Aplicado</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Abdomen', 'Coxa', 'Braco'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocalSelecionado(l)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        localSelecionado === l
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  {salvando ? 'Salvando...' : 'Confirmar Dose'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
