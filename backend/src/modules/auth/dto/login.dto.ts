import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { normalizeEmail } from '../../../common/utils/normalize-email.util';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeEmail(value) : value,
  )
  @IsEmail({}, { message: 'Introduce un correo válido' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
