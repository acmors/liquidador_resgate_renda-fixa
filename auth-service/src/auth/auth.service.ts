import {
  BadRequestException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { CadastroDTO, LoginDTO, Usuario, RespostaLoginDTO, EsqueciSenhaDTO, RedefinirSenhaDTO } from './auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const DATA_FILE = path.join(DATA_DIR, 'usuarios.json');


@Injectable()
export class AuthService {
  private usuarios: Usuario[] = [];
  private proximoId: number = 1;
  private readonly segredoJwt: string = process.env.JWT_SECRET as string;

  constructor() {
    this.carregarUsuarios();
  }

  private carregarUsuarios() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const conteudo = fs.readFileSync(DATA_FILE, 'utf-8');
        this.usuarios = JSON.parse(conteudo);
        if (this.usuarios.length > 0) {
          this.proximoId = Math.max(...this.usuarios.map((u) => u.id)) + 1;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar usuarios persistidos:', e);
    }
  }

  private salvarUsuarios() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(this.usuarios, null, 2),
        'utf-8',
      );
    } catch (e) {
      console.error('Erro ao salvar usuarios:', e);
    }
  }

  async cadastrarUsuario(dados: CadastroDTO) {
    if (!dados.nome || !dados.email || !dados.senha) {
      throw new BadRequestException('Nome, e-mail e senha são obrigatórios.');
    }

    const emailValidado = this.validarEmail(dados.email);
    this.validarSenhaForte(dados.senha);

    const emailExiste = this.usuarios.find((e) => e.email === emailValidado);
    if (emailExiste) {
      throw new BadRequestException('E-mail já cadastrado.');
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

    const novoUsuario: Usuario = {
      id: this.proximoId++,
      nome: dados.nome,
      email: emailValidado,
      senhaHash: senhaCriptografada,
    };

    this.usuarios.push(novoUsuario);
    this.salvarUsuarios();

    return {
      clientId: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    };
  }

  async login(dados: LoginDTO): Promise<RespostaLoginDTO> {
    const emailValidado = dados.email ? dados.email.trim().toLowerCase() : '';

    const usuario = this.usuarios.find((e) => e.email === emailValidado);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    //essa bagaça compara a senha digitada no login com a senha armazenada no banco de dados (ambas criptografadas
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const token = jwt.sign(
      { clientId: usuario.id, email: usuario.email },
      this.segredoJwt,
      { expiresIn: '1d' },
    );

    return {
      token: token,
      clientId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }

  async solicitarRecuperacaoSenha(dados: EsqueciSenhaDTO) {
    const usuario = this.usuarios.find((e) => e.email === dados.email);
    if (!usuario) {
      throw new NotFoundException('Nenhum usuário encontrado com este e-mail');
    }

    const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000);
    await this.enviarEmail(usuario.email, usuario.nome, codigoGerado);

    usuario.codigoVerificacao = codigoGerado;
    usuario.validadeCodigo = expiraEm;

    return { mensagem: 'Código de recuperação enviado para o seu e-mail!' };
  }

  async redefinirSenha(dados: RedefinirSenhaDTO) {
    const usuario = this.usuarios.find((e) => e.email === dados.email);
    if (!usuario) {
      throw new NotFoundException('Nenhum usuário encontrado com este e-mail');
    }

    if (!usuario.validadeCodigo || new Date() > usuario.validadeCodigo) {
      throw new BadRequestException(
        'Este código já expirou. Solicite um novo.',
      );
    }

    this.validarSenhaForte(dados.novaSenha);
    const novaSenha = await bcrypt.hash(dados.novaSenha, 10);

    usuario.senhaHash = novaSenha;
    usuario.codigoVerificacao = undefined;
    usuario.validadeCodigo = undefined;
    this.salvarUsuarios();

    return { message: 'Senha alterada com sucesso!' };
  }

  private async enviarEmail(emailDesino: string, nome: string, codigo: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Liquidador CDB" <${process.env.EMAIL_USER}>`,
      to: emailDesino,
      subject: 'Código de recuperação de senha',
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Seu código de recuperação de senha é: <strong style="font-size: 22px">${codigo}</strong></p>
        <p><em>Esse código expira em 15 minutos.</em></p>
        `,
    });
  }

  //metodos para validações de senha forte e email

  private validarEmail(email: string): string {
    const emailLimpo = email ? email.trim().toLowerCase() : '';
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexEmail.test(email)) {
      throw new BadRequestException('Formato de e-mail inválido.');
    }

    return emailLimpo;
  }

  private validarSenhaForte(senha: string): void {
    if (!senha || senha.length < 8) {
      throw new BadRequestException(
        'Senha deve conter no mínimo 8 caracteres.',
      );
    }

    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const temEspecial = /[@$!%*?&#^()_+\-=\[\]{}|;:,.<>]/.test(senha);

    if (!temMaiuscula || !temMinuscula || !temNumero || !temEspecial) {
      throw new BadRequestException(
        'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).',
      );
    }

    if (/(.)\1\1/.test(senha)) {
      throw new BadRequestException(
        'A senha não pode conter 3 ou mais caracteres repetidos em sequência (ex: 111, aaa).',
      );
    }

    const sequenciasProibidas = [
      '012',
      '123',
      '234',
      '345',
      '456',
      '567',
      '678',
      '789',
      '987',
      '876',
      '765',
      '654',
      '543',
      '432',
      '321',
      '210',
    ];

    for (const seq of sequenciasProibidas) {
      if (senha.includes(seq)) {
        throw new BadRequestException(
          'A senha não pode conter sequência numéricas obvias',
        );
      }
    }
  }
}
