import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events, LoadingController } from 'ionic-angular';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ServiciosProvider } from '../../providers/servicios/servicios';

/**
 * Generated class for the QrScanPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()  //para lazy login, aunque viene por defecto
@Component({
  selector: 'page-qr-scan',
  templateUrl: 'qr-scan.html',
  providers: [ServiciosProvider] //llamamos a los servicios
})
export class QrScanPage {

  etiquetaDeLista: any;             //en caso que nos manden datos desde la vista "lista", mas especidicaciones en "Notas.txt"

  mycolor: string;                  //varible para verificar conexion
  empresacolor: string;             //color de proquima y unhesa
  user: any;                        //usuario logueado
  options: BarcodeScannerOptions;   //opciones del escaner de qr
  id: string;                       //codigo qr
  etiqueta: any;                    //etiqueta buscada
  imagen: string;                   //imagen de la empresa
  empresa: boolean;                 //color del borde del card
  empresaclass: string = "default"; //color del background
  contado: boolean;                 //para saber si el id ya ha sido contado

  //-----datos-----
  observaciones: string;            //observaciones del contador hechas durante el conteo
  conteo: string;                   //conteo final del producto.

  //-----tabla de base de datos-----
  tabla: any;                       //tabla a la que se le hace pedido a php

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alert: AlertController,
    public scanner: BarcodeScanner,
    public servicios: ServiciosProvider,
    public events: Events,
    public load: LoadingController
    ) {   
      this.tabla = navParams.get('tabla');       //tabla en la que se trabaja
      this.mycolor = "danger";         //color basico de conexion, tarda cerca de 2 segundos en confirmar conexion
      this.user = navParams.get('user');     //trae datos del usuario logueado de "tabs"
      this.etiquetaDeLista = navParams.get('etiquetaDeLista');  //en caso de que venga data desde la pagina "Lista"
      if(this.etiquetaDeLista) {  
        this.etiqueta = this.etiquetaDeLista;   //si trae data desde "Lista", setea todo para poder verlo, pero no para poder editarlo
        this.setEmpresa();
      }      
      if(!this.etiquetaDeLista){  //en caso de que no, empieza la revision de la conexion global, practicamente al loguearse
        this.revisarConexion();
      }    
  }

  revisarConexion(){
    this.events.subscribe('mycolor', (mycolor)=>{       //se subscribe al event "mycolor" de tabs
    /*
    Este evento tiene como objetivo revisar la conexion hacia la base de datos,
    siempre regresara un color estando las variables en la carpeta "theme/variables.scss",
    en caso que falle la conexion no regresa error, regresa el color danger, asi que bloquea la aplicación intentando
    reestablecer la conexion.
    */
      if(mycolor == 'secondary')this.mycolor = mycolor;
      else {
        this.mycolor = mycolor;   //en caso de que el color no sea "secondary" setea "danger"
        
        this.events.unsubscribe('mycolor');//se desubscribe del evento
        
        let reconexion =this.load.create({  
          spinner: 'hide',
          content: "Intentando reconectar con el servidor.",
          cssClass: 'custom-alertDanger'
        });
          
        reconexion.present(); //muestra un loading mientras que bloquea la aplicacion

        this.events.subscribe('mycolor', (rec)=>{ 
          /*se buelve a subscribir, esto ya que si no se desubscribe, nunca llega aqui y no 
          puede parar el loading
          */
          if(rec == 'secondary') {  //espera hasta que responda el servidor
            this.events.unsubscribe('mycolor'); //se vuelve a desubscribir, para evitar un error adelante
            reconexion.dismiss(); //para el loading
            this.revisarConexion(); //llama esta misma funcion, volviendose a subscribir al evento
          }          
        });
        
        
      }
      
    }) 
  }

  ionViewDidLoad() {
  }

  estado(){ //esto era para el boton de conexion, pero el mensaje de error es imposible de ver, posibles cambios
    if(this.mycolor == "secondary"){
      this.alert.create({
        title: "Estado",
        message: "Conectado con el servidor correctamente"
      }).present()
    }else{
      this.alert.create({
        title: "Estado",
        message: "Error al conectarse con el servidor",
        cssClass: 'custom-alertDanger'
      }).present()
    }
  }

  escanerQr(){
    this.options = {
      prompt : "Escanea el codigo", //texto en la parte inferior
      showTorchButton: true,        //boton para flash del celular
      disableAnimations: true,      //Deshabilita animacion, mejora rendimiento
      disableSuccessBeep: true      //Deshabilita pitido de exito
    };
    this.scanner.scan(this.options).then(data=>{    //obtiene los datos que trae el escaner
      
      if(parseInt(data.text) > 0){//busca si el dato obtenido es numero entero positivo
        this.id = data.text //setea el id              
        this.buscar();
      }else{
        this.alert.create({ //en cas de que el escaneo tire string o decimal
          title: 'Error',
          message: 'La lectura del QR es incorrecto, no representa un valor valido.'
        }).present();
      }
    }, (err)=>{
      console.error('Error', err);      
    })
  }


  buscar() {  
    this.conteo = null; //setea las variables para poder comenzar un nuevo conteo
    this.observaciones = null;
    if(!this.id || parseInt(this.id) <= 0){ //hace una segunda revision en caso que se llame desde el boton y no desde el escaner
      return null;      
    }
    return new Promise(resolve => {  
      let load = this.load.create({ //crea un load para evitar la consulta multiples veces
        content: 'Buscando etiqueta...',
      });

      let i = 0;      

      load.present();        
      let intervalo = setInterval(()=>{
        i = i + 1;
        if(i == 10) {
          clearInterval(intervalo);
          this.alert.create({
            message: "No se ha podido establecer conexion con el servidor, reinicie la aplicación",
            buttons: [{
              text: 'Salir',
              handler: () =>{navigator['app'].exitApp();}
            },'Ok']
          }).present();
        }             
      },1500);
      
      let body = {
        id: parseInt(this.id),  //el id de la etiqueta
        aksi : 'get_oneData',
        tabla: this.tabla,      //la tabla a la que se realiza el pedido
      };      
      
      this.servicios.etiquetaService(body).subscribe(data => {  
        /**
         * En esta parte lo que hace es setear el valor de los datos traidos y
         * poner las clases de diseño, este si puede fallar en caso de que se ingrese un id positivo
         * entero pero que no tenga datos, por lo que no podria parsearse a JSON, en tal caso elimina
         * todas las clases y tira un aviso de error
         */  
        try {
          let datos = JSON.parse((<any>data)._body);
          this.etiqueta = datos[0][0];   
          this.setEmpresa();           
          if((this.etiqueta.idEstado%2)==0)  this.contado = true;
          else this.contado = false;  
          if(this.contado){
            this.alert.create({
              title: 'Advertencia',
              message: `El producto <strong>"${this.etiqueta.DescripcionSAP}"</strong> ya ha sido contado`,
              buttons: ['OK']
            }).present();
          }      
        } catch {
          this.empresacolor = null;
          this.empresa = null;
          this.etiqueta=null;
          this.empresaclass = 'default';
          this.alert.create({
            title: 'ID Invalido',
            message: 'El ID marcado no es valido, no existe o no pertenece a este inventario',
            buttons: ['OK']
          }).present();
        }
        load.dismiss();   
        clearInterval(intervalo);
      });  
    }); 
  }

  setEmpresa() {
    //este es para poner imagen, colores y clases a la etiqueta y background de la vista
    if(this.etiqueta.idEmpresa == 1){
      this.empresacolor = 'danger';
      this.imagen = '../../assets/imgs/unhesa.png';
      this.empresa = true;
      this.empresaclass = "unhesa";
    }else if(this.etiqueta.idEmpresa == 2){
      this.empresacolor = 'primary';
      this.imagen = '../../assets/imgs/proquima.png';
      this.empresa = false;
      this.empresaclass = "proquima"
    }
  }

  preRegistrar(){
    /**
     * En esta funcion lo unico que hace es preguntar si quieres ingresar el conteo
     * Lo pregunta 2 veces, uno para asegurarse de que el producto sea el seleccionado 
     * y el otro para que el conteo sea el correcto, si le da que si a los 2, pues hace el registro
     */
    if(!this.etiqueta.CodigoSAP) this.etiqueta.CodigoSAP = 'SIN CÓDIGO';
    this.alert.create({
      title: '¿Está seguro?',
      message: `¿Está seguro de registrar el conteo del producto:`+
      ` <strong>${this.etiqueta.DescripcionSAP}</strong> de la etiqueta:`+
      ` <strong>${this.id}</strong>`+
      ` con el valor: <strong>${this.conteo}</strong>?`,
      buttons: ['Cancelar',{
        text:'Ok',
        handler: () =>{
          this.registrar();
        }  
      }]
    }).present();
  }

  registrar(){    
    let load = this.load.create({
      content: 'Registrando conteo' 
    });
    
    load.present();// crea y presenta un loading

    if(!parseFloat(this.conteo) && parseInt(this.conteo) != 0){
      //aqui lo que hace es crear una alerta al recibir que el conteo no sea numero con decimal.
      this.alert.create({
        title: 'Error',
        message: 'El conteo debe de ser un numero decimal',
        buttons:['Ok']
      }).present();
      load.dismiss();      
      return null;
    }

    let costo = ((parseFloat(this.conteo) - this.etiqueta.ExistenciaSAP)*this.etiqueta.CostoPromedio).toFixed(6);
    let estado;
    if(this.etiqueta.idEstado == 1) estado = 2;
    else if(this.etiqueta.idEstado == 3) estado = 4;
    else if(this.etiqueta.idEstado == 5) estado = 6;
    else if(this.etiqueta.idEstado == 7) estado = 8;
    //En lo anterior hace los calculos del costo diferencia y manda el estado en el que se encontrara despues
 
      let body = {
        id: parseInt(this.id),
        aksi : 'update_conteo',
        ObservacionesContador: this.observaciones,
        ConteoFisico: parseFloat(this.conteo).toFixed(6),
        CantidadDiferencia: (parseFloat(this.conteo) - this.etiqueta.ExistenciaSAP).toFixed(6),
        CostoDiferencia: costo,
        CostoDiferenciaAbsoluto: Math.abs(parseFloat(costo)).toFixed(6),
        idUsuario: this.user.idUsuario,
        idEstado: estado,
        tabla: this.tabla
      };//setea los valores que va a mandar
             
      this.servicios.etiquetaService(body).subscribe(data => {
        /**
         * Crea una alerta de exito y bloquea el boton para que no pueda hacer un reconteo no autorizado
         */
        load.dismiss();
        this.alert.create({
          title: 'Exito',
          message: `Se ha realizado el conteo de: <strong>"${this.etiqueta.DescripcionSAP}"</strong>`,
          buttons: [{
            text: 'Ok',
          }]
        }).present();
        this.contado = true;
      })    
  }
}
