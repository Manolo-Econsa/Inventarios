import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Platform } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  user: any;           //para el usuario logueado
  reconteo: number = null;    //para un badge en lista para saber cuantos reconteos se han solicitado
  reconteoAnt: number = null; //obtiene el numero de reconteos que se tenia antes para hace comparativa
  mycolor: string = 'danger'; //el color que se encia en el evento "mycolor"
  tabla: string;//tabla a la que se le hace solicitudes
  random: boolean;
      
  //tabs
  tab1 = 'QrScanPage';        
  tab2 = 'ListaPage';
  tab3 = 'ExtraordinarioPage';
  tab4 = 'DescubrimientoPage';
  //

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public servicios: ServiciosProvider,
    public events: Events,
    public plat: Platform
    ) {    
    this.user = navParams.get('user')  //se recibe el dato "user" que contiene toda la información del usuario logueado        
    this.tabla = navParams.get('tabla')  //se recibe el dato "tabla" que contiene la tabla a usar
    let tipo = navParams.get('tipo');
    if(tipo == 1) this.random = true;
    else this.random = false;
    let body = {    //datos para mandar
      aksi : 'reconteos',
      idUsuario: this.user.idUsuario,
      tabla: this.tabla
    };    
    //this.close();
    setInterval(()=>{
      this.conteo(body);  //cada 2 segundos manda a realizar una busqueda de los reconteos solicitados
    },2000)
  }

  ionViewDidLoad() {    
  }

  conteo(body){
    this.servicios.etiquetaService(body).subscribe(data => { 
      /**
       * Al regresar data lo intenta parsear para obtener el numero de reconteos
       * si funciona settea la variable "mycolor" con color verde,
       * en caso contrario solo settea la variable "mycolor" con color rojo,
       * tras eso manda el evento "mycolor", eso lo hara siempre, muentras que si las 2 variables de reconteo
       * no coindiden, envia el evento de "reconteo", escuchado por "list"
       */           
      try{
        this.reconteo = JSON.parse((<any>data)._body)[0];
        this.mycolor = "secondary"
      }catch{
        this.mycolor = "danger"
      }                        
      this.events.publish('mycolor',this.mycolor);            
      if(this.reconteo != this.reconteoAnt)this.events.publish('reconteo',true); 
      this.reconteoAnt = this.reconteo;     
    }, 
    error =>{
      console.error(error);
      
      this.mycolor = "danger"
      this.events.publish('mycolor',this.mycolor);
    });
  }

  // close(){
  //   document.addEventListener('pause', this.onPause, false);
  // }

  // onPause(){
  //   navigator['app'].exitApp();
  // }
}
