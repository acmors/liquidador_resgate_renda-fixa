import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as authDto from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('Cadastro')
  async cadastrar(@Body() dados: authDto.CadastroDTO) {
    return this.authService.cadastrarUsuario(dados);
  }

  @Post('login')
  async login(@Body() dados: authDto.LoginDTO) {
    return this.authService.login(dados);
  }

  @Post('esqueci-senha')
  async esqueciSenha(@Body() dados: authDto.EsqueciSenhaDTO) {
    return this.authService.solicitarRecuperacaoSenha(dados);
  }

  @Post('redefinir-senha')
  async redefinirSenha(@Body() dados: authDto.RedefinirSenhaDTO) {
    return this.authService.redefinirSenha(dados);
  }
}