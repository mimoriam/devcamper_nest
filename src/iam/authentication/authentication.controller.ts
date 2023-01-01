import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from './decorators/auth.decrator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Response } from 'express';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { ResetPassDto } from './dto/reset-pass.dto';

@Controller('api/v1/auth')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Auth(AuthType.None)
  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    // This following approach is to send tokens without cookies:
    // return this.authService.signIn(signInDto);

    // The following approach is to send cookies:
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto,
    );
    response.cookie('accessToken', accessToken, {
      // secure: true,
      httpOnly: true,
      sameSite: true,
    });
    response.cookie('refreshToken', refreshToken, {
      // secure: true,
      httpOnly: true,
      sameSite: true,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  @Get('logout')
  async logOut(@Res({ passthrough: true }) response: Response) {
    response.cookie('accessToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      secure: true,
      httpOnly: true,
      sameSite: true,
    });

    response.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      secure: true,
      httpOnly: true,
      sameSite: true,
    });

    return {
      message: 'Logged out!',
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(AuthType.Bearer)
  @Get('me')
  async getMe(@ActiveUser() user: ActiveUserData) {
    return this.authService.getMe(user);
  }

  @Auth(AuthType.None)
  @Post('forgotpassword')
  async forgotPass(@Body() forgotPassDto: ForgotPassDto) {
    return this.authService.forgotPass(forgotPassDto);
  }

  @Auth(AuthType.None)
  @Patch('resetpassword/:resetToken')
  async resetPass(
    @Body() resetPassDto: ResetPassDto,
    @Param('resetToken') resetToken: string,
  ) {
    return this.authService.resetPass(resetPassDto, resetToken);
  }
}
