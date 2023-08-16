import { Component, VERSION            } from '@angular/core';
import { Router                        } from '@angular/router';
import { CustomErrorHandler            } from './app.module';
import { HomeWebComponent              } from './_modules/home/home-web/home-web.component';
import { AlgorithmWebComponent         } from './_modules/algorithm/algorithm-web/algorithm-web.component';
import { AngularTutorialsnWebComponent } from './_modules/topics/angular-tutorialsn-web/angular-tutorialsn-web.component';
import { FilesGenerationWebComponent   } from './_modules/files-generation/files-generation-web/files-generation-web.component';
import { AAboutWebComponent            } from './_modules/about/a-about-web/a-about-web.component';
import { HttpClient                    } from '@angular/common/http';
import { environment                   } from 'src/environments/environment';
//
@Component({
  selector    : 'app-root',
  templateUrl : './app.component.html',
  styleUrls   : ['./app.component.css']
})

//
export class AppComponent {
    //
    title             : string = "[MCSD - CONSULTAS]"; 
    appName           : string = "[MCSD - CONSULTAS]";
    appVersion        : string = '1.0.0.79';
    runtimeVersion    : string = VERSION.full;
    //
    readonly HomeWebComponent_pageTitle                   : string  = HomeWebComponent.PageTitle;
    readonly AlgorithmWebComponent_pageTitle              : string  = AlgorithmWebComponent.PageTitle;
    readonly FilesGenerationWebComponent_pageTitle        : string  = FilesGenerationWebComponent.PageTitle;
    readonly AngularTutorialsnWebComponent_pageTitle      : string  = AngularTutorialsnWebComponent.PageTitle;
    readonly AAboutWebComponent_pageTitle                 : string  = AAboutWebComponent.PageTitle
    //
    private  navbarCollapsed                              : boolean = true;
    //
    public get NavbarCollapsed() : boolean {
      //
      return this.navbarCollapsed;
    }
    //
    public set NavbarCollapsed(p_navbarCollapsed: boolean) {
        //
        this.navbarCollapsed = p_navbarCollapsed;
    }
    //-----------------------------------------------------------------------------------------------------
    constructor(private http : HttpClient, private router : Router, private _customErrorHandler : CustomErrorHandler) {
      //
      console.log(this.title + "- [INGRESO]") ;
      //
      console.log(this.title + "- [ENV_NAME] : " + environment.serviceName) ;      
      //
      router.navigateByUrl("/Home");
    }
    //-----------------------------------------------------------------------------------------------------
 }   

