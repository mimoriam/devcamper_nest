import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { randomUUID, randomBytes, createHash } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  InvalidateRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { createTransport } from 'nodemailer';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ResetPassDto } from './dto/reset-pass.dto';
import { ConfirmEmailQueryDto } from './dto/confirm-email-query.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { OtpAuthenticationService } from './otp-authentication.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguation: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    @Inject(REQUEST)
    private readonly req: Request,
    private readonly otpAuthService: OtpAuthenticationService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = new User();

      user.name = signUpDto.name;
      user.email = signUpDto.email;
      user.role = signUpDto.role;
      user.password = await this.hashingService.hash(signUpDto.password);

      // grab token and send to email:
      const confirmEmailToken = await this.generateEmailConfirmToken(user);

      // Create reset url
      const confirmEmailURL = `${this.req.protocol}://${this.req.get(
        'host',
      )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

      const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

      await this.userRepository.save(user);

      const transporter = createTransport({
        host: '0.0.0.0',
        port: 1025,
      });

      try {
        await transporter.sendMail({
          from: 'from@example.com',
          to: signUpDto.email,
          subject: 'Email Confirm token',
          text: message,
          html: `Click <a href="${confirmEmailURL}">here</a> to reset your password!`,
        });

        return {
          message: 'Confirmation Email Sent!',
        };
      } catch (err) {
        user.confirmEmailToken = null;
        user.isEmailConfirmed = false;
        await this.userRepository.save(user);
        throw new UnauthorizedException(`Email could not be sent`);
      }
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw err;
    }
  }

  async confirmEmail(confirmEmailQueryDto: ConfirmEmailQueryDto) {
    const token = confirmEmailQueryDto.token;

    if (!token) {
      throw new UnauthorizedException(`Invalid`);
    }

    console.log(token);

    const splitToken = token.split('.')[0];
    console.log(splitToken);

    const confirmEmailToken = createHash('sha256')
      .update(splitToken)
      .digest('hex');

    console.log(confirmEmailToken);

    const user = await this.userRepository.findOne({
      where: {
        confirmEmailToken: confirmEmailToken,
        isEmailConfirmed: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException(`Invalid`);
    }

    user.confirmEmailToken = null;
    user.isEmailConfirmed = true;

    await this.userRepository.save(user);

    return {
      message: 'Email confirmed',
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOneBy({
      email: signInDto.email,
    });

    if (!user) {
      throw new UnauthorizedException(`User does not exist`);
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException(`Password does not match`);
    }

    if (user.isTfaEnabled) {
      const isValid = this.otpAuthService.verifyCode(
        signInDto.tfaCode,
        user.tfaSecret,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    return await this.generateTokens(user);
  }

  public async generateTokens(user: User) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguation.accessTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfiguation.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.refreshTokenIdsStorage.insert(parseInt(user.id), refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getMe(user: ActiveUserData) {
    const user_in_db = await this.userRepository.findOneBy({
      id: user.sub.toString(),
    });

    if (!user) {
      throw new UnauthorizedException(`User does not exist`);
    }

    return user_in_db;
  }

  async forgotPass(forgotPassDto: ForgotPassDto) {
    const user = await this.userRepository.findOneBy({
      email: forgotPassDto.email,
    });

    const resetToken = randomBytes(20).toString('hex');
    user.resetPasswordToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // This one is for the un-hashed token version:
    // const resetToken = Math.random().toString(20).substring(2, 12);
    // user.resetPasswordToken = resetToken;

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.save(user);

    const transporter = createTransport({
      host: '0.0.0.0',
      port: 1025,
    });

    const resetUrl = `${this.req.protocol}://${this.req.get(
      'host',
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await transporter.sendMail({
        from: 'from@example.com',
        to: forgotPassDto.email,
        subject: 'Password reset token',
        text: message,
        html: `Click <a href="${resetUrl}">here</a> to reset your password!`,
      });

      return {
        message: 'Email sent!',
      };
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException(`Email could not be sent`);
    }
  }

  async resetPass(resetPassDto: ResetPassDto, resetToken: string) {
    const resetPasswordToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        // resetPasswordToken: resetToken,
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: MoreThan(new Date(Date.now())),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Token');
    }

    user.password = await this.hashingService.hash(resetPassDto.password);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await this.userRepository.save(user);

    return {
      message: 'Password resetted!',
    };
  }

  async updatePass(updatePassDto: UpdatePassDto, user: ActiveUserData) {
    const user_in_db = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (!user) {
      throw new UnauthorizedException(`User does not exist`);
    }

    const isEqual = await this.hashingService.compare(
      updatePassDto.currentPassword,
      user_in_db.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException(`Password does not match`);
    }

    user_in_db.password = await this.hashingService.hash(
      updatePassDto.newPassword,
    );
    await this.userRepository.save(user_in_db);

    return {
      message: 'Password updated!',
    };
  }

  async generateEmailConfirmToken(user: User) {
    const confirmationToken = randomBytes(20).toString('hex');

    user.confirmEmailToken = createHash('sha256')
      .update(confirmationToken)
      .digest('hex');

    const confirmTokenExtend = randomBytes(100).toString('hex');
    return `${confirmationToken}.${confirmTokenExtend}`;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguation.secret,
        audience: this.jwtConfiguation.audience,
        issuer: this.jwtConfiguation.issuer,
      });

      const user = await this.userRepository.findOneByOrFail({
        id: sub.toString(),
      });

      const isValid = await this.refreshTokenIdsStorage.validate(
        parseInt(user.id),
        refreshTokenId,
      );

      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(parseInt(user.id));
      } else {
        throw new Error(`Refresh token is invalid`);
      }

      return await this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidateRefreshTokenError) {
        // Take action: Notify user that his refresh token may have been stolen
        throw new UnauthorizedException(`Access denied`);
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguation.audience,
        issuer: this.jwtConfiguation.issuer,
        secret: this.jwtConfiguation.secret,
        expiresIn,
      },
    );
  }
}
