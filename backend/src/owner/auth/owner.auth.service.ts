import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { OwnerService } from '../owner.service';
import { OwnerDTO, loginDTO } from '../dto/owner.dto';

@Injectable()
export class OwnerAuthService {
  constructor(
    private ownerService: OwnerService,
    private jwtService: JwtService,
  ) {}

  async signUp(myobj: OwnerDTO) {
    return await this.ownerService.createOwner(myobj);
  }

  async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
    const user = await this.ownerService.findOne(logindata);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(
      logindata.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = logindata;

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}