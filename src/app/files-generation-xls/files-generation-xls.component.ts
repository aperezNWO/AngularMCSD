import { AfterViewInit, Component, ElementRef, OnInit, ViewChild   } from '@angular/core';
import { FormBuilder, Validators                       } from '@angular/forms';
import { MatTableDataSource                            } from '@angular/material/table';
import { MatPaginator                                  } from '@angular/material/paginator';
import { Observable                                    } from 'rxjs';
import { Chart, registerables                          } from 'chart.js';
import jsPDF                                             from 'jspdf';
import html2canvas                                       from 'html2canvas';
import { LogEntry,SearchCriteria                       } from '../log-info.model';
import { MCSDService                                   } from '../mcsd.service';
//
@Component({
  selector     : 'app-files-generation-xls',
  templateUrl  : './files-generation-xls.component.html',
  styleUrls    : ['./files-generation-xls.component.css']
})
//
export class FilesGenerationXLSComponent implements OnInit, AfterViewInit {
    //--------------------------------------------------------------------------
    // PROPIEDADES COMUNES
    //--------------------------------------------------------------------------
    pageTitle            : string = '[GENERAR ARCHIVO XLS]';
    //
    static pageTitle()   : string {
      return '[GENERAR ARCHIVOS XLS]';
    }
    //--------------------------------------------------------------------------
    // PROPIEADES - REACTIVE FORMS
    //--------------------------------------------------------------------------
    //
    rf_textStatus                      : string = "";
    //
    rf_buttonCaption                   : string = "[Buscar]";
    //
    rf_formSubmit                      : boolean = false;
    //
    rf_ExcelDownloadLink               : string  = "";
    //
    rf_buttonCaption_xls               : string  = "";
    //
    rf_textStatus_xls                  : string  = "";
    //
    rf_dataSource                      = new MatTableDataSource<LogEntry>();
    // 
    rf_displayedColumns                : string[] = ['id_Column', 'pageName', 'accessDate', 'ipValue'];
    //
    rf_model                           = new SearchCriteria( "1"
                                            ,"1"
                                            ,"999"
                                            ,"2023-01-01"
                                            ,"2023-12-31"
                                            ,""
                                            ,"");
    //
    @ViewChild("rf_paginator" ,{read:MatPaginator}) rf_paginator!:  MatPaginator;
    //
    rf_searchForm   = this.formBuilder.group({
      _P_ROW_NUM          : ["999"         , Validators.required],
      _P_FECHA_INICIO     : ["2023-01-01"  , Validators.required],
      _P_FECHA_FIN        : ["2022-12-31"  , Validators.required],
    });
    //--------------------------------------------------------------------------
    // PROPIEADES - TEMPLATE FORMS
    //--------------------------------------------------------------------------
    //
    td_textStatus                      : string  = "";
    //
    td_formSubmit                      : boolean = false;
    //
    td_buttonCaption                   : string  = "[Buscar]";
    //
    td_buttonCaption_xls               : string  = "[Generar Excel]";
    //
    td_textStatus_xls                  : string  = "";
    //
    td_ExcelDownloadLink               : string  = "#";
    //
    td_dataSource                      = new MatTableDataSource<LogEntry>();
    //
    td_model                           = new SearchCriteria( 
      "1"
     ,"1"
     ,"999"
     ,"2022-09-01"
     ,"2022-09-30"
     ,""
     ,"");
    //
    @ViewChild("td_paginator" ,{read:MatPaginator}) td_paginator!:  MatPaginator;
    //--------------------------------------------------------------------------
    // PROPIEDADES - ESTADISTICA
    //--------------------------------------------------------------------------
    //
    @ViewChild('canvas') canvas          : any;
    //
    @ViewChild('divPieChart') divPieChart: any;
    //
    public pieChartVar         : any;
    //--------------------------------------------------------------------------
    // EVENT HANDLERS FORMIULARIO 
    //--------------------------------------------------------------------------
    constructor(private mcsdService: MCSDService, private formBuilder: FormBuilder) {
      //
      Chart.register(...registerables);
      //
    }
    //
    ngOnInit(): void {
        //
        this.rf_newSearch();
        this.td_newSearch();
        //
        this.SetChart();
    }
    //
    ngAfterViewInit() {
      //
    }
    //--------------------------------------------------------------------------
    // METODOS COMUNES 
    //--------------------------------------------------------------------------
    //
    DebugHostingContent(msg : string) : string {
      //
      console.log("cadena a evaular : " + msg);
      //
      let regEx   = /(.*)(<!--SCRIPT GENERATED BY SERVER! PLEASE REMOVE-->)(.*\w+.*)(<!--SCRIPT GENERATED BY SERVER! PLEASE REMOVE-->)(.*)/;
      //
      var strMsg  = msg.replace(/(\r\n|\n|\r)/gm, "");
      //
      var matches = strMsg.match(regEx);
      //
      if (matches != null) {
          //
          for (var index = 1; index < matches.length; index++) {
              //
              var matchValue = matches[index];
              //        
              console.log("coincidencia : " + matchValue);

              //
              if ((matchValue.indexOf("<!--SCRIPT GENERATED BY SERVER! PLEASE REMOVE-->") != -1) && (matchValue.trim() != "")) {
                  //
                  strMsg = strMsg.replace(matchValue, "");
                  //
                  console.log("REEMPLAZANDO. NUEVA CADENA : " + strMsg);
              }

              //
              if ((matchValue.indexOf("<center>") != -1) && (matchValue.trim() != "")) {
                  //
                  strMsg = strMsg.replace(matchValue, "");
                  //
                  console.log("REEMPLAZANDO. NUEVA CADENA : " + strMsg);
              }
          }
        }
        else
            console.log("NO_HAY_COINCIDENCIAS");
        //
        console.log("CADENA DEPURADA : " + strMsg);
        //
        strMsg = strMsg.replace("unsafe:", "");
        //
        return strMsg;
    };
    //
    GetFormattedDate(p_date : /*Date*/ string, order : number) {
      //
      var today = '';
      switch (order) {
          case 0:  // FECHA COMPLATIBLE CON ORACLE
              var p_dates = p_date.toString().split('-'); // P_DATE   = 2022-04-09
              var day     = p_dates[2];
              var month   = p_dates[1];
              var year    = p_dates[0];
              today       = day + "/" + month + "/" + year;
              //
              break;
          case 1:  // FECHA COMPATIBLE  CON UIX
              //
              /*
              var _day      :number  = p_date.getDate();
              var _month    :number  = p_date.getMonth() + 1;
              var _yearStr  :string  = p_date.getFullYear().toString();
              var _monthStr :string  = "";
              var _dayStr   :string  = "";
              //
              if (_month < 10) _monthStr = "0"   + _month.toString();
              if (_day < 10)   _dayStr   = "0"   + _day.toString();
              //
              today                 = _yearStr  + "-" + _monthStr + "-" + _dayStr;*/
              //
              break;
      }
      //
      return today;
    } 
    //--------------------------------------------------------------------------
    // METODOS REACTIVE FORMS 
    //--------------------------------------------------------------------------
    //
    rf_newSearch()
    {
        //
        console.warn("(NEW SEARCH RF)");
        //
        this.rf_dataSource           = new MatTableDataSource<LogEntry>();
        this.rf_dataSource.paginator = this.rf_paginator;
        //
        this.rf_searchForm   = this.formBuilder.group({
          //_P_DATA_SOURCE_ID   : ["1"           , Validators.required],
          //_P_ID_TIPO_LOG      : ["1"           , Validators.required],
          _P_ROW_NUM          : ["999"         , Validators.required],
          _P_FECHA_INICIO     : ["2023-01-01"  , Validators.required],
          _P_FECHA_FIN        : ["2023-12-31"  , Validators.required],
        });
        //
        console.log("(DEFAULT VALUES - INIT)");
        console.log("P_ROW_NUM         : " + (this.rf_searchForm.value["_P_ROW_NUM"]        || ""));
        console.log("P_FECHA_INICIO    : " + (this.rf_searchForm.value["_P_FECHA_INICIO"]   || ""));      
        console.log("P_FECHA_FIN       : " + (this.rf_searchForm.value["_P_FECHA_FIN"]      || "")); 
        console.log("(DEFAULT VALUES - END)");
        //
        this.rf_buttonCaption     = "[Buscar]";
        //
        this.rf_formSubmit        = false;
        //
        this.rf_textStatus        = "";
        //
        this.rf_buttonCaption_xls               = "[Generar Excel]";
        //
        this.rf_textStatus_xls                  = "";
        //
        this.rf_ExcelDownloadLink               = "#";
    }
    //
    rf_onSubmit() 
    {
        //
        console.warn("(SUBMIT 1)");
        //
        let _P_DATA_SOURCE_ID  : string = ""/*this.searchForm.value["_P_DATA_SOURCE_ID"] || ""*/;
        let _P_ID_TIPO_LOG     : string = ""/*this.searchForm.value["_P_ID_TIPO_LOG"]    || ""*/;
        let _P_ROW_NUM         : string = this.rf_searchForm.value["_P_ROW_NUM"]        || "";
        let _P_FECHA_INICIO    : string = this.rf_searchForm.value["_P_FECHA_INICIO"]   || "";      
        let _P_FECHA_FIN       : string = this.rf_searchForm.value["_P_FECHA_FIN"]      || "";

        //
        let _model  = new SearchCriteria( 
                                _P_DATA_SOURCE_ID
                              , _P_ID_TIPO_LOG
                              , _P_ROW_NUM
                              , _P_FECHA_INICIO
                              , _P_FECHA_FIN
                              , "","");
        //
        this.rf_formSubmit        = true;
        //
        this.rf_textStatus        = "";
        //
        if ((this.rf_searchForm.valid == true))
            this.rf_update(_model);
    }
    //
    rf_update(_searchCriteria : SearchCriteria):void {
      //
      this.rf_buttonCaption     = "[Buscando por favor espere]";
      //
      this.rf_formSubmit        = true;
      //
      let rf_informeLogRemoto!  : Observable<LogEntry[]>;
      //
      rf_informeLogRemoto       = this.mcsdService.getLogRemoto(_searchCriteria);
      //
      const logSearchObserver   = {
        //
        next: (p_logEntry: LogEntry[])     => { 
          //
          console.log('Observer got a next value: ' + JSON.stringify(p_logEntry));
          //
          let recordCount : number  = p_logEntry.length;
          //
          this.rf_textStatus        = "Se encontraton [" + recordCount  + "] registros";
          //
          this.rf_dataSource           = new MatTableDataSource<LogEntry>(p_logEntry);
          this.rf_dataSource.paginator = this.rf_paginator;
          //
          // los botones se configuran en el evento "complete()".
        },
        error: (err: Error) => {
          //
          console.error('Observer got an error: ' + err);
          //
          this.rf_textStatus        = "Ha ocurrido un error";
          //
          this.rf_buttonCaption     = "[Buscar]";
          //
          this.rf_formSubmit        = false;
        },       
        complete: ()        => {
          //
          console.log('Observer got a complete notification');
          //
          this.rf_buttonCaption     = "[Buscar]";
          //
          this.rf_formSubmit        = false;
        },
      };
      //
      rf_informeLogRemoto.subscribe(logSearchObserver);
    }
    //
    rf_GenerarInformeXLSValidate():void{
      //
      this.rf_GenerarInformeXLSPost();
    };
    //
    rf_GenerarInformeXLSPost():void  {
      //
      console.log("GENERAR EXCEL (RF) - POST");
      //
      let rf_excelFileName!                   : Observable<string>;
      //
      rf_excelFileName                        = this.mcsdService.getInformeExcel(this.rf_model);
      //
      this.rf_ExcelDownloadLink               = "#";
      //
      this.rf_buttonCaption_xls               = "[Generando por favor espere...]";
      //
      this.rf_textStatus_xls                  = "[Generando por favor espere...]";
      //
      const xlsObserver                       = {
        //
        next: (_excelFileName: string) => { 
          //
          console.log('Observer got a next value: ' + _excelFileName);
          //
          let urlFile               = 'https://mcsd.somee.com/xlsx/' + _excelFileName;
          this.rf_ExcelDownloadLink = this. DebugHostingContent(urlFile);
          //
          this.rf_textStatus_xls     = "[Descargar Excel]";
        },
        error   : (err: Error)  => {
          //
          console.error('Observer got an error: ' + err.cause);
          //
          console.error('Observer got an error: ' + err.message);
          //
          this.rf_buttonCaption_xls  = "[Ha ocurrido un error]";
          //
          this.rf_textStatus_xls     = "[Ha ocurrido un error]";
        },
        complete: () => {
          //
          console.log('Observer got a complete notification')
          //
          this.rf_buttonCaption_xls  = "[Generar Excel]";
        },
      };
      //
      rf_excelFileName.subscribe(xlsObserver);
    }
    //--------------------------------------------------------------------------
    // METODOS REACTIVE FORMS 
    //--------------------------------------------------------------------------
    //
    td_newSearch() : void {
      //
      console.warn("(NEW SEARCH TD)");
      //
      this.td_dataSource           = new MatTableDataSource<LogEntry>();
      this.td_dataSource.paginator = this.rf_paginator;
      //
      this.td_model                  = new SearchCriteria( 
          "1"
         ,"1"
         ,"999"
         ,"2022-09-01"
         ,"2022-09-30"
         ,""
         ,"");
      //
      console.log("(DEFAULT VALUES - INIT)");
      console.log("P_ROW_NUM         : " + this.td_model.P_ROW_NUM);
      console.log("P_FECHA_INICIO    : " + this.td_model.P_FECHA_INICIO);      
      console.log("P_FECHA_FIN       : " + this.td_model.P_FECHA_FIN); 
      console.log("(DEFAULT VALUES - END)");
      //
      this.td_buttonCaption     = "[Buscar]";
      //
      this.td_formSubmit        = false;
      //
      this.td_textStatus        = "";
      //
      this.td_buttonCaption_xls               = "[Generar Excel]";
      //
      this.td_textStatus_xls                  = "";
      //
      this.td_ExcelDownloadLink               = "#";
    }
    //
    td_valid_form() : boolean {
      return (     
             ( ( this.td_model.P_ROW_NUM        != "" ) && (this.td_model.P_ROW_NUM       !=  null) && (this.td_model.P_ROW_NUM      != "0") ) 
          && ( ( this.td_model.P_FECHA_INICIO   != "" ) && (this.td_model.P_FECHA_INICIO  !=  null) ) 
          && ( ( this.td_model.P_FECHA_FIN      != "" ) && (this.td_model.P_FECHA_FIN     !=  null) ) 
      );  
    }
    //
    td_onSubmit() 
    { 
        //
        console.warn("TEMPLATE DRIVEN - (SUBMIT)");
        //
        console.warn("TEMPLATE DRIVEN - FORM VALID : " + this.td_valid_form());
        //
        this.td_formSubmit    = true;
        //
        if (this.td_valid_form())
            this.td_update(this.td_model);
    }
    //
    td_update(td_searchCriteria : SearchCriteria):void {
      //
      this.td_buttonCaption = "[Favor espere...]";
      //
      this.td_textStatus    = "";
      //
      td_searchCriteria.P_FECHA_INICIO_STR = this.GetFormattedDate(td_searchCriteria.P_FECHA_INICIO,0);
      td_searchCriteria.P_FECHA_FIN_STR    = this.GetFormattedDate(td_searchCriteria.P_FECHA_FIN   ,0); 
      //
      console.log("(FROM PARAM) : P_DATA_SOURCE_ID                     : " + td_searchCriteria.P_DATA_SOURCE_ID);
      console.log("(FROM PARAM) : P_ROW_NUM                            : " + td_searchCriteria.P_ROW_NUM);  
      console.log("(FROM PARAM) : P_FECHA_INICIO (origen)              : " + td_searchCriteria.P_FECHA_INICIO);
      console.log("(FROM PARAM) : P_FECHA_FIN    (origen)              : " + td_searchCriteria.P_FECHA_FIN);  
      console.log("(FROM PARAM) : P_FECHA_INICIO (valid : 01/09/2022)  : " + td_searchCriteria.P_FECHA_INICIO_STR);
      console.log("(FROM PARAM) : P_FECHA_FIN    (valid : 30/09/2022)  : " + td_searchCriteria.P_FECHA_FIN_STR);
      console.log("(SEARCH INIT)");
      // 
      let td_informeLogRemoto!                 : Observable<LogEntry[]>;
      td_informeLogRemoto                      = this.mcsdService.getLogRemoto(td_searchCriteria);
      //
      const td_observer = {
        next: (td_logEntry: LogEntry[])     => { 
          //
          console.log('TEMPLATE DRIVEN - RETURN VALUES (Record Count): ' + td_logEntry.length);
          //
          this.td_dataSource           = new MatTableDataSource<LogEntry>(td_logEntry);
          this.td_dataSource.paginator = this.td_paginator;
          //
          this.td_textStatus           = "Se encontraron [" + td_logEntry.length + "] registros ";
          this.td_formSubmit           = false;
        },
        error           : (err: Error)      => {
          //
          console.error('TEMPLATE DRIVEN - (ERROR) : ' + JSON.stringify(err.message));
          //
          this.td_textStatus           = "Ha ocurrido un error. Favor intente de nuevo";
          this.td_formSubmit           = false;
          this.td_buttonCaption        = "[Buscar]";
          //
        },
        complete        : ()                => {
          //
          console.log('TEMPLATE DRIVEN -  (SEARCH END)');
          //
          this.td_formSubmit           = false;
          this.td_buttonCaption        = "[Buscar]";
        },
    }; 
    //
    td_informeLogRemoto.subscribe(td_observer);
    };
    //
    td_GenerarInformeXLSValidate():void
    {
        this.td_GenerarInformeXLS(this.td_model);
    }
    td_GenerarInformeXLS(_searchCriteria : SearchCriteria)
    {
      //
      console.log("GENERAR EXCEL (td) - POST");
      //
      let td_excelFileName!                   : Observable<string>;
      //
      td_excelFileName                        = this.mcsdService.getInformeExcel(this.rf_model);
      //
      this.td_ExcelDownloadLink               = "#";
      //
      this.td_buttonCaption_xls               = "[Generando por favor espere...]";
      //
      this.td_textStatus_xls                  = "[Generando por favor espere...]";
      //
      const xlsObserver                       = {
        //
        next: (_excelFileName: string) => { 
          //
          console.log('Observer got a next value: ' + _excelFileName);
          //
          let urlFile               = 'https://mcsd.somee.com/xlsx/' + _excelFileName;
          this.td_ExcelDownloadLink = this.DebugHostingContent(urlFile);
          //
          this.td_textStatus_xls     = "[Descargar Excel]";
        },
        error   : (err: Error)  => {
          //
          console.error('Observer got an error: ' + err.cause);
          //
          console.error('Observer got an error: ' + err.message);
          //
          this.td_buttonCaption_xls  = "[Ha ocurrido un error]";
          //
          this.td_textStatus_xls     = "[Ha ocurrido un error]";
        },
        complete: () => {
          //
          console.log('Observer got a complete notification')
          //
          this.td_buttonCaption_xls  = "[Generar Excel]";
        },
      };
      //
      td_excelFileName.subscribe(xlsObserver);
    }
    //--------------------------------------------------------------------------
    // METODOS - ESTADISTICAS
    //--------------------------------------------------------------------------
    //
    SetChart():void {
      //
      console.log(this.pageTitle + " - SET CHART ");
      //
      const statLabels          : string[]          = [];
      const statData            : Number[]          = [];
      const statBackgroundColor : string[]          = [];
      // 
      let td_informeLogStat!                 : Observable<string>;
      td_informeLogStat                      = this.mcsdService.getLogStatPOST();
      //
      const td_observer = {
        next: (td_logEntry: string)     => { 
          //
          let jsondata     = JSON.parse(JSON.stringify(td_logEntry));
          //
          let recordNumber = jsondata.length;
          //
          console.log('ESTADISTICA - (return): ' + recordNumber);
          //
          jsondata.forEach((element: JSON, index : number) => {
              //
              console.log(index + " " + JSON.stringify(element));
              //
              console.log("[SI-SPAE-WEB] - GET STAT - RESULT : index [" + index + "] value={"
              + jsondata[index]["pageName"]
              + "," + jsondata[index]["ipValue"] + "}");
                //
                statLabels.push(jsondata[index]["pageName"] + " - " + jsondata[index]["ipValue"]);
                statData.push(Number(jsondata[index]["ipValue"]));
                statBackgroundColor.push('rgb('
                    + (Number(jsondata[index]["ipValue"]) / 4) + ','
                    + (Number(jsondata[index]["ipValue"]) / 3) + ','
                    + (Number(jsondata[index]["ipValue"]) / 2) + ')');
          });
        },
        error           : (err: Error)      => {
          //
          console.error('ESTADISTICA- (ERROR) : ' + JSON.stringify(err.message));
          //
        },
        complete        : ()                => {
          //
          console.log('ESTADISTICA -  (SEARCH END)');
          //
          const data = {
            labels              : statLabels,
            datasets            : [{
                label           : 'CONTEO DE SESIONES',
                data            : statData,
                backgroundColor : statBackgroundColor,
                hoverOffset     : 4
            }]
          };
          //
          let context = this.canvas.nativeElement.getContext('2d');
          //
          this.pieChartVar = new Chart(context, 
          {
                type    : 'bar',
                data    : data,
                options : {
                    responsive: true,
                    plugins   : {
                            legend      : {
                                position: 'top',
                            },
                            title       : {
                                display : true,
                                text    : 'CONTEO DE SESIONES'
                              }
                          }
                }
          });
        },
      };
      //
      td_informeLogStat.subscribe(td_observer);
    }   
    //--------------------------------------------------------------------------
    // METODOS - PDF
    //--------------------------------------------------------------------------
    //
    GetPDF():void
    {
      //
      html2canvas(this.canvas.nativeElement[0]).then((canvas) => {
          //
          var w = this.divPieChart.offsetWidth;
          var h = this.divPieChart.offsetHeight;
          //
          var imgData              = canvas.toDataURL('image/png');
          //
          var img = canvas.toDataURL("image/jpeg", 1);
          var doc = new jsPDF("landscape", "px", [w, h]);
          //
          doc.addImage(img, 'JPEG', 0, 0, w, h);
          doc.save('sample-file.pdf');
      });
    }
}


