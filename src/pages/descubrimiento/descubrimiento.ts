import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';

/**
 * Generated class for the DescubrimientoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-descubrimiento',
  templateUrl: 'descubrimiento.html',
})
export class DescubrimientoPage {

  @ViewChild('textarea') myInput; //trae el dato del 'textarea'

  class: string = "default-home"; //la clase del background de la pagina
  tabla: string;   //tabla a la envia datos
  descripcion: string;            //datos del textarea
  user: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loading: LoadingController,
    public alert: AlertController,
    public servicios: ServiciosProvider
    ) {
      this.user = navParams.get('user');
      this.tabla = navParams.get('tabla');
    }

  ionViewWillLoad() {  //focusea el text area cuando entra
    setTimeout(() => {
      this.myInput.setFocus();
    }, 100);
  }

  regHallazgo(){  //Hace la pregunta para confirmar la creacion del hallazgo
    this.alert.create({
      title:"¿Esta Seguro?",
      message: `¿Esta seguro de agregar el siguiente hallazgo?:<br>`+
      `<strong>"${this.descripcion}"</strong>`,
      buttons: ['Cancelar',{
        text: 'OK',
        handler: ()=>{
          this.newHallazgo();//en caso de que desee agregarlo, manda a llamar el evento que realiza el registro
        }
      }]
    }).present();
  }

  newHallazgo(){
    let load = this.loading.create({  //crea un loading para evitar que envie el mismo dato varias veces
      content: 'Agregando Hallazgo'
    });

    load.present();

    let body={  
      descripcion: this.descripcion,  //la descripcion que se agregara
      tabla: this.tabla,              //la tabla a la que envia info, solo es necesario la parte antes del guion bajo
      aksi: 'hallazgo',               //que solicitará en el aksi
      idUsuario: this.user.idUsuario,
    };

    this.servicios.etiquetaService(body).subscribe(data =>{
      load.dismiss(); //cuando regrese datos, para el loading indicando que se agrego correctamente
      this.alert.create({ //crea una alerta para decirle que ya esta creado
        title: 'Exito',
        message: `Se agrego correctamente el hallazgo: <strong>"${this.descripcion}"</strong>`,
        buttons: ['OK']
      }).present();
    })
  }

}
