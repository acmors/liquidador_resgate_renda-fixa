import {
  BadRequestException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { CadastroDTO, LoginDTO, Usuario, RespostaLoginDTO, EsqueciSenhaDTO, RedefinirSenhaDTO } from './auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private usuarios: Usuario[] = [];
  private proximoId: number = 1;
  private readonly segredoJwt: string = process.env.JWT_SECRET as string;

  async cadastrarUsuario(dados: CadastroDTO) {
    if (!dados.nome || !dados.email || !dados.senha) {
      throw new BadRequestException('Nome, e-mail e senha são obrigatórios.');
    }

    const emailExiste = this.usuarios.find((e) => e.email === dados.email);
    if (emailExiste) {
      throw new BadRequestException('E-mail já cadastrado.');
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

    const novoUsuario: Usuario = {
      id: this.proximoId++,
      nome: dados.nome,
      email: dados.email,
      senhaHash: senhaCriptografada,
    };

    this.usuarios.push(novoUsuario);

    return {
      clientId: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    };
  }

  async login(dados: LoginDTO): Promise<RespostaLoginDTO> {

    const usuario = this.usuarios.find((e) => e.email === dados.email);
    if (!usuario) {
      throw new NotFoundException("Usuário não encontrado")
    }

    //essa bagaça compara a senha digitada no login com a senha armazenada no banco de dados (ambas criptografadas
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);
    if(!senhaValida) {
      throw new UnauthorizedException("E-mail ou senha incorretos.")
    }

    const token = jwt.sign({ clientId: usuario.id, email: usuario.email, }, this.segredoJwt, { expiresIn: '1d' });

    return {
      token: token,
      clientId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }

  async solicitarRecuperacaoSenha(dados: EsqueciSenhaDTO){
    const usuario = this.usuarios.find((e) => e.email === dados.email);
    if (!usuario) {
      throw new NotFoundException("Nenhum usuário encontrado com este e-mail");
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
      throw new BadRequestException('Este código já expirou. Solicite um novo.',);
    }

    const novaSenha = await bcrypt.hash(dados.novaSenha, 10);

    usuario.senhaHash = novaSenha
    usuario.codigoVerificacao = undefined;
    usuario.validadeCodigo = undefined;

    return {message: 'Senha alterada com sucesso!'};

  }

  private async enviarEmail(emailDesino: string, nome: string, codigo: string){
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
}
