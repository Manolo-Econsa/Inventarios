import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';
//import { Camera, CameraOptions } from "@ionic-native/camera";

/**
 * Generated class for the ExtraordinarioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-extraordinario',
  templateUrl: 'extraordinario.html',
  providers: [ServiciosProvider]
})
export class ExtraordinarioPage {

  image: any;
  empresaBorder: string; //clase para el borde del ion-card
  //Datos
  empresa: any;
  bodega: any;
  UDM: any; 
  descripcion: any;
  etiqueta: any;
  codigo: any;
  //
  bodegas: any; //las bodegas como valor estatico
  user: any;    //el usuario logueado traido de tabs
  tabla: string; //tabla a la que se envia datos

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public servicio: ServiciosProvider,
    public loading: LoadingController,
    public alert: AlertController,
    public toast: ToastController,
    //public camara: Camera
    ) {
      this.user = navParams.get('user'); //recibe datos del usuario logueado
      this.tabla = navParams.get('tabla');
      this.setBodegas();        //setea las bodegas      
  }

  setBodegas(){ //Setea las bodegas como un valor estatico
    this.bodegas=[
      {id:'01', nombre:'BODEGA PRORRATEO'},
      {id:'02', nombre: 'BODEGA MATERIA PRIMA'},
      {id:'03', nombre: 'PRODUCCION MATERIA PRIMA'},
      {id:'04', nombre: 'PRODUCCION PROCESO'},
      {id:'05', nombre: 'PRODUCCION PRODUCTO TERMINADO'},
      {id:'06', nombre: 'BODEGA PRODUCTO TERMINADO'},
      {id:'07', nombre: 'BODEGA CUARENTENA'},
      {id:'08', nombre: 'BODEGA CONSIGNACION'},
      {id:'09', nombre: 'LABORATORIO'},
      {id:'10', nombre: 'BODEGA DE OBSOLETOS Y MAL ESTADO ANEXO 1'},
      {id:'11', nombre: 'BODEGA AUTOCONSUMOS'},
      {id:'12', nombre: 'BODEGA MATERIA PRIMA 29-89'},
      {id:'13', nombre: 'PRODUCCION MATERIA PRIMA 29-89'},
      {id:'14', nombre: 'PRODUCCION PROCESO 29-89'},
      {id:'15', nombre: 'PRODUCCION PRODUCTO TERMINADO 29-89'},
      {id:'16', nombre: 'BODEGA PRODUCTO TERMINADO 29-89'},
      {id:'17', nombre: 'BODEGA CUARENTENA 29-89'},
      {id:'18', nombre: 'Bodega Consignación Mariposa'},
      {id:'19', nombre: 'BODEGA PT MAL ESTADO'},
      {id:'20', nombre: 'BODEGA ALMAGUATE MATERIA PRIMA'},
      {id:'21', nombre: 'BODEGA MATERIAS PRIMAS (VENTAS) ALMACEN #21'},
      {id:'22', nombre: 'BODEGA DE FILTROS'},
      {id:'23', nombre: 'Bodega de Ruteo'},
      {id:'24', nombre: 'BODEGA UNIDAD MOVIL'},
      {id:'31', nombre: 'BODEGA CALIDADES'},
      {id:'35', nombre: 'BODEGA CALIDADES II'},
      {id:'36', nombre: 'BODEGA TRANSITO (BODEGA-PRODUCCION)'},
      {id:'37', nombre: 'BODEGA CONSIGNACION FILTROS'},
      {id:'99', nombre: 'BODEGA PRODUCTO PT MAL ESTADO DEST'}
    ]
  }

  setEmpresa(){ //setea el valor del borde que se incluira al ion-card y el background de la pagina
    if(this.empresa == 1)this.empresaBorder = 'true';    
    else if(this.empresa == 2) this.empresaBorder = 'false'; 
  }

  ionViewWillEnter() {
    this.limpiarVar();
  }

  antesDeNE(){  //aqui hace la pregunta de "¿esta seguro?"
    let bodega = JSON.parse(this.bodega); //parsea a json el parametro de bodega ya que lo devuelve como un string en formato json
    let empresa;
    if(this.empresa == 1) empresa = 'Unhesa';
    else if(this.empresa == 2)empresa = 'Proquima';
    this.alert.create({
      title: '¿Esta Seguro?',
      message: `Esta seguro de solicitar la etiqueta de <strong>"${this.descripcion}"</strong>, en la empresa <strong>"${empresa}"`+
      `</strong>, con el codigo <strong>"${this.codigo}</strong> y en la bodega <strong>"${bodega.CodigoBodega} - ${bodega.NombreBodega}"</strong>`,
      buttons: ['Cancelar',{
        text: 'OK',
        handler: ()=>{
          this.nuevaEtiqueta(); //en caso de que acepte, crea la nueva etiqueta
        }
      }]
    }).present();  
  }

  nuevaEtiqueta(){
    let load = this.loading.create({  //presenta un loading para evitar que envie el mismo dato varias veces.
      content: "Enviando información..."
    });
    load.present();
    let bodega = JSON.parse(this.bodega);
    this.etiqueta = { //setea los datos a mandar
      idEmpresa: this.empresa,
      CodigoBodega: bodega.CodigoBodega,
      NombreBodega: bodega.NombreBodega,
      unidadDeMedida: this.UDM,
      DescripcionSAP: this.descripcion,
      CodigoSAP: this.codigo,
      aksi: 'extraordinario',
      idUsuario: this.user.idUsuario,
      tabla: this.tabla,
      img: this.image
    }
    
    this.servicio.etiquetaService(this.etiqueta).subscribe(data =>{
      if(JSON.parse((<any>data)._body).Success == true){  //si funciona manda mensaje de exito
        this.alert.create({
          title: 'Exito',
          message: `La boleta para el producto <strong>"${this.descripcion}"</strong> ha sido generada exitosamente.`,
          buttons: ['OK']
        }).present();
        this.limpiarVar();
      }else{  //si falla manda un mensaje de error, en cualquier caso detiene el loading
        this.alert.create({
          title: 'Error',
          message: `La boleta para el producto <strong>"${this.descripcion}"</strong> no ha sido generada, asegurese de estar dentro de la red.`,
          buttons: ['OK']
        }).present();        
      }      
      load.dismiss();
    })
  }

  limpiarVar(){
    this.empresa = null;
    this.bodega = null;
    this.UDM = null;
    this.descripcion = null;
    this.codigo = null;
    this.etiqueta = null;
    this.empresaBorder = null;
  }

  warning(){ 
    if(this.codigo.length == 1){  
      let toast = this.toast.create({
        message: 'Por favor agregar todos los ceros del código...',
        duration: 4500,
        position: 'top'
      });
      
      toast.present();
    }
  }

  // getPicture(){ //por ahora cancelado
  //   try{
  //     let options: CameraOptions = {
  //       quality: 100,
  //       destinationType: this.camara.DestinationType.DATA_URL,
  //       encodingType: this.camara.EncodingType.JPEG,
  //       mediaType: this.camara.MediaType.PICTURE
  //     };

  //     this.camara.getPicture(options).then((imageData)=>{
  //       this.image = imageData;
  //     });
  //   }catch(e){
  //     console.error('Error',e);      
  //   }
  // }

}
