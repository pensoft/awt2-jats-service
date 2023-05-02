import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ValidateService } from '../service/validate.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SampleDto } from '../dto/sample.dto';

@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('xml')
  public validateFile(
    @Body() body: SampleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.validateService.validate(file.buffer.toString())
      .catch(e => {
        throw new BadRequestException(e.message);
      })

  }
}
