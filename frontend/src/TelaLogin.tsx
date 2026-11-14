import {useEffect, useState} from 'react';
import type { UsuarioLogado } from './types';

interface Props {
    aoLogar: (usuario: UsuarioLogado) => void;
}

type EtapaTela = 'LOGIN' | 'CADASTRO' | 'ESQUECI_SENHA' | 'REDEFINIR_SENHA';

export function TelaLogin({ aoLogar }: Props) {

    const AUTH_API = import.meta.env.VITE_AUTH_API_URL || '';

    const [etapa, setEtapa] = useState<EtapaTela>('LOGIN');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);

    function trocarEtapa(novaEtapa: EtapaTela) {
        setErro('');
        setSucesso('');
        setEtapa(novaEtapa);

        if (novaEtapa === 'LOGIN') window.history.pushState({}, '', '/login');
        if (novaEtapa === 'CADASTRO') window.history.pushState({}, '', '/criar-conta');
        if (novaEtapa === 'ESQUECI_SENHA' || novaEtapa === 'REDEFINIR_SENHA') {
            window.history.pushState({}, '', '/recuperar-senha');
        }
    }

    useEffect(() => {
        window.history.pushState({}, '', '/login');
    }, []);

    async function enviarFormulario(e: React.FormEvent) {
        e.preventDefault();
        setErro('');
        setSucesso('');
        setCarregando(true);

        try {
            if (etapa === 'LOGIN') {
                const resp = await fetch(`${AUTH_API}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha }),
                });
                const dados = await resp.json();
                if (!resp.ok) throw new Error(dados.message || 'E-mail ou senha incorretos.');
                aoLogar(dados);
            }
            else if (etapa === 'CADASTRO') {
                const resp = await fetch(`${AUTH_API}/auth/cadastro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha }),
                });
                const dados = await resp.json();
                if (!resp.ok) throw new Error(dados.message || 'Não foi possível criar a conta.');
                setSucesso('Conta criada com sucesso! Acesse com seu e-mail e senha.');
                setSenha('');
                setEtapa('LOGIN');
            }
            else if (etapa === 'ESQUECI_SENHA') {
                const resp = await fetch(`${AUTH_API}/auth/esqueci-senha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const dados = await resp.json();
                if (!resp.ok) throw new Error(dados.message || 'E-mail não encontrado.');
                setSucesso('Enviamos um código de 6 dígitos para o seu e-mail.');
                setEtapa('REDEFINIR_SENHA');
            }
            else if (etapa === 'REDEFINIR_SENHA') {
                const resp = await fetch(`${AUTH_API}/auth/redefinir-senha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, codigo, novaSenha }),
                });
                const dados = await resp.json();
                if (!resp.ok) throw new Error(dados.message || 'Código inválido ou expirado.');
                setSucesso('Senha alterada com sucesso! Faça seu login.');
                setSenha('');
                setCodigo('');
                setNovaSenha('');
                setEtapa('LOGIN');
            }
        } catch (err: any) {
            setErro(err.message || 'Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
            <div className="absolute top-0 left-0 right-0 h-[42vh] bg-[#1D4ED8]" />
            <div className="relative z-10 w-full max-w-md">
                <div className="text-white mb-5 text-center">
                    <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold">
                        Renda Fixa & Custódia
                    </p>
                    <h1 className="text-2xl font-bold mt-1">
                        {etapa === 'LOGIN' && 'Acesse sua conta'}
                        {etapa === 'CADASTRO' && 'Abra sua conta'}
                        {etapa === 'ESQUECI_SENHA' && 'Recuperar senha'}
                        {etapa === 'REDEFINIR_SENHA' && 'Validar código'}
                    </h1>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7">
                    {erro && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {erro}
                        </div>
                    )}
                    {sucesso && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                            {sucesso}
                        </div>
                    )}
                    <form onSubmit={enviarFormulario} className="space-y-4">
                        {etapa === 'CADASTRO' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Como quer ser chamado"
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                E-mail cadastrado
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seuemail@gmail.com"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                            />
                        </div>
                        {(etapa === 'LOGIN' || etapa === 'CADASTRO') && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-gray-600">
                                        Senha de acesso
                                    </label>
                                    {etapa === 'LOGIN' && (
                                        <button
                                            type="button"
                                            onClick={() => trocarEtapa('ESQUECI_SENHA')}
                                            className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                                        >
                                            Esqueci minha senha
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Digite sua senha"
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                                />
                            </div>
                        )}
                        {etapa === 'REDEFINIR_SENHA' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Código de 6 dígitos (enviado ao seu e-mail)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)}
                                        placeholder="000000"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-base tracking-widest font-semibold focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Nova senha
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Digite a nova senha"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:border-[#1D4ED8]"
                                    />
                                </div>
                            </>
                        )}
                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full py-3 bg-[#1D4ED8] hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer mt-2"
                        >
                            {carregando
                                ? 'Aguarde...'
                                : etapa === 'LOGIN'
                                    ? 'Continuar'
                                    : etapa === 'CADASTRO'
                                        ? 'Confirmar abertura de conta'
                                        : etapa === 'ESQUECI_SENHA'
                                            ? 'Enviar código por e-mail'
                                            : 'Salvar nova senha'}
                        </button>
                    </form>
                    <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm">
                        {etapa === 'LOGIN' && (
                            <p className="text-gray-600">
                                Ainda não é cliente?{' '}
                                <button
                                    type="button"
                                    onClick={() => trocarEtapa('CADASTRO')}
                                    className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                                >
                                    Abra sua conta
                                </button>
                            </p>
                        )}
                        {etapa !== 'LOGIN' && (
                            <button
                                type="button"
                                onClick={() => trocarEtapa('LOGIN')}
                                className="font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                                ← Voltar para o login
                            </button>
                        )}
                    </div>
                </div>
                <p className="mt-6 text-center text-xs text-gray-400">
                    Liquidador Renda Fixa • Integração Oficial SGS/BACEN
                </p>
            </div>
        </div>
    );
}