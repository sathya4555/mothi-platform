import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format',
  })
  gstNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'Invalid phone number format',
  })
  phone: string;
}
