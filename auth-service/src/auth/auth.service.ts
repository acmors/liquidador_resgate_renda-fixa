import {
  BadRequestException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { CadastroDTO, LoginDTO, Usuario, RespostaLoginDTO } from './auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

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
}
