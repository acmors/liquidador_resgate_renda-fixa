export interface Usuario{
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  codigoVerificacao?: string;
  validadeCodigo?: Date;
}

export interface CadastroDTO{
  nome: string;
  email: string;
  senha: string;
}

export interface LoginDTO{
  email: string;
  senha: string;
}

export interface RespostaLoginDTO{
  token: string;
  clientId: number;
  nome: string;
  email: string;
}

export interface EsqueciSenhaDTO{
  email: string;
}

export interface RedefinirSenhaDTO{
  email: string;
  codigo: String;
  novaSenha: string;
}