import { Injectable } from '@nestjs/common';
import { parseXml } from 'libxmljs';
import { ConfigService } from '@nestjs/config';

const validator = require("schematron-runner");
import * as appRoot from 'app-root-path';
import * as path from 'path';
import * as xslt4node from 'xslt4node';
import * as fs from 'fs';
import { xpathParse, ExprContext, xmlParse  } from 'xslt-processor'

@Injectable()
export class ValidateService {
  private baseUrl = '';

  constructor(public readonly config: ConfigService) {
    this.baseUrl = `${appRoot.path}${path.sep}dist`;
  }

  public validateWithDtd(xml) {
    const {errors} = parseXml(xml, {
      dtdload: true,
      dtdvalid: true,
      nonet: true,
      recover: true,
      noblanks: true,
      nocdata: true,
      noent: true,
      nsclean: true,
      baseUrl: this.baseUrl,
    });
    const selectOutput = ({line, column, message}) => ({
      line,
      column,
      message,
    })

    return {
      errors: errors.map(selectOutput),
    };
  }

  public validateStyle(xml) {
    const xsltResource = `${this.baseUrl}${path.sep}nlm${path.sep}pensoft-stylechecker.xsl`;
    const xsltString = fs.readFileSync(xsltResource, "utf8");

    const config = {
      xslt: xsltString,
      source: xml,
      result: String,
      props: {
        indent: 'yes'
      }
    };

    const selectOutput = ({firstChild: { nodeValue }}) => nodeValue

    try {
      const output = xslt4node.transformSync(config);
      const actor = xpathParse(".//error").evaluate(
        new ExprContext(xmlParse(output))
      );

      return {
        errors: (actor.value || []).map(selectOutput),
      };
    } catch (e){
      console.log(e);
    }




  }

  public async validateWithSchematron(xml) {
    const resourceDir = `${this.baseUrl}${path.sep}schematrons${path.sep}@jats4r${path.sep}schematrons${path.sep}schematrons${path.sep}1.0`;
    const res = await validator.validate(xml, `${resourceDir}${path.sep}jats4r.sch`, {resourceDir});

    return {
      errors: res.errors
    };
  }

  public async validate(xml){
    const { errors: schematronErrors } = await this.validateWithSchematron(xml);
    const { errors: dtdErrors } = this.validateWithDtd(xml);
    const { errors: styleErrors } = this.validateStyle(xml);
    const errors = [...schematronErrors, ...dtdErrors, ...styleErrors];
    const valid = !errors.length;
    return { valid, ...(!valid && { errors })};
  }
}
