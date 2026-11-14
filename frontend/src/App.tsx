import { useEffect, useState } from 'react';
import { TelaLogin } from './TelaLogin';
import type { ResultadoSimulacao, ResumoLote, UsuarioLogado } from './types';

const JAVA_API = import.meta.env.VITE_JAVA_API_URL || '/api/v1/cdb';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [mostrarValores, setMostrarValores] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'RESGATE' | 'APORTE'>('RESGATE');

  const [carteira, setCarteira] = useState<ResumoLote[]>([]);
  const [simulacao, setSimulacao] = useState<ResultadoSimulacao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [valorAporte, setValorAporte] = useState('1000');
  const [diasAtras, setDiasAtras] = useState('180');
  const [percentualCdi, setPercentualCdi] = useState('110');
  const [valorResgate, setValorResgate] = useState('2000');

  useEffect(() => {
    if (usuario) {
      window.history.pushState({}, '', '/home');
      carregarCarteira();
    }
  }, [usuario]);

  if (!usuario) {
    return <TelaLogin aoLogar={(user) => setUsuario(user)} />;
  }

  async function carregarCarteira() {
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    try {
      const resp = await fetch(`${JAVA_API}/carteira`,
          {
            headers: {'Authorization': `Bearer ${usuario.token}`}
          });

      if (!resp.ok) throw new Error('Não foi possível consultar a custódia.');
      const dados: ResumoLote[] = await resp.json();
      setCarteira(dados);
    } catch (e: any) {
      setErro(e.message || 'Serviço Java (:8080) indisponível.');
    } finally {
      setCarregando(false);
    }
  }

  async function criarNovoAporte(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    try {
      const url = `${JAVA_API}/aportes?valor=${valorAporte}&diasAtras=${diasAtras}&percentualCdi=${percentualCdi}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${usuario.token}`
        }
      });

      if (!resp.ok) throw new Error('Verifique os dados informados (valor mínimo R$ 1,00).');
      await carregarCarteira();
      setSimulacao(null);

    } catch (e: any) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function popularCarteiraDemo() {
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    try {
      const headers = { 'Authorization': `Bearer ${usuario.token}` };
      await fetch(`${JAVA_API}/aportes?valor=1000&diasAtras=750&percentualCdi=110`, { method: 'POST', headers });
      await fetch(`${JAVA_API}/aportes?valor=1500&diasAtras=200&percentualCdi=110`, { method: 'POST', headers });
      await fetch(`${JAVA_API}/aportes?valor=2000&diasAtras=12&percentualCdi=110`, { method: 'POST', headers });
      await carregarCarteira();
    } catch {
      setErro('Não foi possível gerar os aportes de exemplo.');
    } finally {
      setCarregando(false);
    }
  }

  async function executarSimulacao(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    try {
      const resp = await fetch(`${JAVA_API}/simular?valor=${valorResgate}`, {
        headers: {
          'Authorization': `Bearer ${usuario.token}`
        }
      });
      if (!resp.ok) {
        throw new Error('Saldo líquido insuficiente para o valor solicitado.');
      }
      const dados: ResultadoSimulacao = await resp.json();
      setSimulacao(dados);
      
    } catch (e: any) {
      setErro(e.message);
      setSimulacao(null);
    } finally {
      setCarregando(false);
    }
  }

  const totalAplicado = carteira.reduce((acc, l) => acc + l.valorAplicado, 0);
  const totalLucroBruto = carteira.reduce((acc, l) => acc + l.lucroBruto, 0);
  const totalSaldoLiquido = carteira.reduce((acc, l) => acc + l.saldoLiquidoDisponivel, 0);

  const moeda = (v: number) =>
      mostrarValores
          ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : 'R$ •••••';

  return (
      <div className="min-h-screen bg-[#F4F6F9] text-gray-900 font-sans pb-16">
        <header className="bg-[#1D4ED8] text-white px-6 py-4 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm">
                {usuario.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Olá, {usuario.nome}</h1>
                <p className="text-xs text-blue-200">Conta Digital</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                  type="button"
                  onClick={() => setMostrarValores(!mostrarValores)}
                  className="text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                {mostrarValores ? 'Ocultar saldos' : 'Mostrar saldos'}
              </button>
              <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/login');
                    setUsuario(null);
                    setCarteira([]);
                    setSimulacao(null);
                  }}
                  className="text-xs font-semibold hover:underline cursor-pointer"
              >
                Sair →
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 mt-5 space-y-6">
          <section className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Saldo líquido disponível</p>
                <p className="text-xl font-bold text-[#1D4ED8] mt-0.5">
                  {moeda(totalSaldoLiquido)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valor aplicado</p>
                <p className="text-base font-semibold text-gray-800 mt-1">
                  {moeda(totalAplicado)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <p className="text-xs text-gray-500">Rendimento bruto (BACEN)</p>
                <p className="text-base font-semibold text-emerald-700 mt-1">
                  +{moeda(totalLucroBruto)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-gray-100 text-center">
              <button
                  type="button"
                  onClick={() => setAbaAtiva('RESGATE')}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        abaAtiva === 'RESGATE'
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-blue-50 text-[#1D4ED8] group-hover:bg-blue-100'
                    }`}
                >
                  R$
                </div>
                <span className="text-xs font-medium text-gray-700">Simular Saque</span>
              </button>

              <button
                  type="button"
                  onClick={() => setAbaAtiva('APORTE')}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition ${
                        abaAtiva === 'APORTE'
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-blue-50 text-[#1D4ED8] group-hover:bg-blue-100'
                    }`}
                >
                  +
                </div>
                <span className="text-xs font-medium text-gray-700">Novo Aporte</span>
              </button>

              <button
                  type="button"
                  onClick={popularCarteiraDemo}
                  disabled={carregando}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D4ED8] group-hover:bg-blue-100 flex items-center justify-center text-xs font-bold transition">
                  3x
                </div>
                <span className="text-xs font-medium text-gray-700">Carga Demo</span>
              </button>

              <button
                  type="button"
                  onClick={carregarCarteira}
                  disabled={carregando}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D4ED8] group-hover:bg-blue-100 flex items-center justify-center text-sm font-bold transition">
                  ↻
                </div>
                <span className="text-xs font-medium text-gray-700">Atualizar CDI</span>
              </button>
            </div>
          </section>

          {erro && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {erro}
              </div>
          )}

          <section className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
            {abaAtiva === 'RESGATE' ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-gray-900">
                      Otimizador Tributário de Resgate
                    </h2>
                    <span className="text-xs text-gray-500">Menor imposto primeiro</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Informe o valor líquido que deseja resgatar para comparar a tributação entre seus lotes.
                  </p>

                  <form onSubmit={executarSimulacao} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="number"
                        step="0.01"
                        value={valorResgate}
                        onChange={(e) => setValorResgate(e.target.value)}
                        placeholder="Valor do resgate (R$)"
                        className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                    />
                    <button
                        type="submit"
                        disabled={carregando || carteira.length === 0}
                        className="px-6 py-2.5 bg-[#EC7000] hover:bg-[#d66500] disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
                    >
                      Simular Resgate
                    </button>
                  </form>

                  {simulacao && (
                      <div className="mt-5 p-4 bg-[#F8FAFC] border border-gray-200 rounded-xl space-y-2.5">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Imposto sem otimização (lotes mais tributados):</span>
                          <span className="font-semibold text-red-600">
                      {moeda(simulacao.impostoSemOtimizar)}
                    </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Imposto com otimização (algoritmo de menor custo):</span>
                          <span className="font-semibold text-emerald-700">
                      {moeda(simulacao.impostoOtimizado)}
                    </span>
                        </div>
                        <div className="pt-2.5 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">
                      Economia gerada no saque:
                    </span>
                          <span className="text-base font-bold text-[#1D4ED8]">
                      {moeda(simulacao.economiaGerada)}
                    </span>
                        </div>
                      </div>
                  )}
                </div>
            ) : (
                <form onSubmit={criarNovoAporte} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900">Aplicar em CDB</h2>
                    <span className="text-xs text-gray-500">Liquidez diária</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Valor da aplicação (R$)
                      </label>
                      <input
                          type="number"
                          step="0.01"
                          value={valorAporte}
                          onChange={(e) => setValorAporte(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Dias corridos (retroativo)
                      </label>
                      <input
                          type="number"
                          value={diasAtras}
                          onChange={(e) => setDiasAtras(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Taxa (% do CDI)
                      </label>
                      <input
                          type="number"
                          value={percentualCdi}
                          onChange={(e) => setPercentualCdi(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <button
                      type="submit"
                      disabled={carregando}
                      className="w-full py-2.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
                  >
                    Confirmar Aplicação
                  </button>
                </form>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">Meus Lotes em Custódia</h2>
              <span className="text-xs text-gray-500">
              {carregando ? 'Atualizando junto ao BACEN...' : `${carteira.length} lote(s)`}
            </span>
            </div>

            {carteira.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    Você ainda não possui lotes aplicados.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Toque no botão redondo <b>"3x Carga Demo"</b> acima para simular 3 depósitos.
                  </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                  {carteira.map((lote) => (
                      <div
                          key={lote.idLote}
                          className="p-5 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        CDB Pós-Fixado • Lote #{lote.idLote}
                      </span>
                            <span
                                className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                    lote.aliquotaIof > 0
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-blue-50 text-[#1D4ED8]'
                                }`}
                            >
                        {lote.aliquotaIof > 0 ? `IOF ${lote.aliquotaIof}%` : 'Isento de IOF'}
                      </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        IR {lote.aliquotaIr}%
                      </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Aplicado em {lote.dataAplicacao} ({lote.diasCorridos} dias) • Principal:{' '}
                            {moeda(lote.valorAplicado)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rendimento BACEN:{' '}
                            <span className="text-emerald-700 font-medium">
                        +{moeda(lote.lucroBruto)}
                      </span>{' '}
                            • Impostos retidos:{' '}
                            <span className="text-red-600 font-medium">
                        -{moeda(lote.impostoTotal)}
                      </span>
                          </p>
                        </div>

                        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                          <p className="text-[11px] text-gray-400 uppercase">Disponível Líquido</p>
                          <p className="text-base font-bold text-gray-900">
                            {moeda(lote.saldoLiquidoDisponivel)}
                          </p>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </section>
        </main>
      </div>
  );
}