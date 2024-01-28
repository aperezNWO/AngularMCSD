import { Component, VERSION                } from '@angular/core';
import { CustomErrorHandler                } from 'src/app/app.module';
import { Observable,  throwError           } from 'rxjs';
import { MCSDService                       } from '../../../../_services/mcsd.service';
import { AppComponent                      } from '../../../../app.component';
import { HttpClient } from '@angular/common/http';
import { _ConfigService } from 'src/app/_services/-config.service';
//
@Component({
  selector: 'app-technical-specs',
  templateUrl: './technical-specs.component.html',
  styleUrls: ['./technical-specs.component.css']
})
//
export class TechnicalSpecsComponent {
    //
    _appName           : string | undefined;
    _appVersion        : string | undefined;
    _runtimeVersion    : string = VERSION.full;
    _webApiAppVersion  : string = "";
    //
    public static get PageTitle()   : string {
      //
      return '[ESPECIFICACIONES TÉCNICAS]';
    }
    //
    readonly pageTitle : string = TechnicalSpecsComponent.PageTitle;
    //
    public get _baseUrlNetCore(): string {
      //
      return this.__baseUrlNetCore;
    }
    //
    public get _baseUrlNodeJs(): string {
      //
      return this.__baseUrlNodeJs;
    }
    //
    protected __baseUrlNetCore        : string = '';
    protected __baseUrlNodeJs         : string = '';
    //
    ////////////////////////////////////////////////////////////////  
    // METODOS - [EVENT HANDLERS]
    ////////////////////////////////////////////////////////////////  
    //
    ngOnInit(): void {
      //
    }
    //
    constructor(
          public http               : HttpClient, 
          public _configService     : _ConfigService,
          private mcsdService       : MCSDService, 
          private customErrorHandler: CustomErrorHandler
    ) 
    {
      ////
      this._appName         = this._configService.getConfigValue('appName');
      this._appVersion      = this._configService.getConfigValue('appVersion');
      this.__baseUrlNetCore = this._configService.getConfigValue('baseUrlNetCore');
      this.__baseUrlNodeJs  = this._configService.getConfigValue('baseUrlNodeJs');
      //
      console.log("baseUrlNetCore : " + this.__baseUrlNetCore);
      console.log("baseUrlNodeJs  : " + this.__baseUrlNodeJs);
      //
      console.log(this.pageTitle + "- [INGRESO]");
      //
      mcsdService.SetLog(this.pageTitle,"PAGE_TECH_SPECS");
      //
      this._GetWebApiAppVersion();
    }
    //
    private _GetWebApiAppVersion() {
      //
      let appVersion : Observable<string> = this.mcsdService._GetWebApiAppVersion();
      //
      const appVersionObserver = {
        next: (jsondata: string)     => { 
          //
          console.log('_GetAppVersion - (return): ' + jsondata);
          //
          this._webApiAppVersion = jsondata;
          //
          console.log(this.pageTitle + "- [webApiVersion] - " + this._webApiAppVersion);
        },
        error           : (err: Error)      => {

          //
          console.error('_GetAppVersion- (ERROR) : ' + JSON.stringify(err.message));
        },
        complete        : ()                => {
          //
          console.log('_GetAppVersion -  (COMPLETE)');
        },
      };
      //
      appVersion.subscribe(appVersionObserver);
    }
}
