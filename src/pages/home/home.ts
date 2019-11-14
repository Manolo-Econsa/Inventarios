import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, IonicPage, Keyboard } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';
import { Storage } from "@ionic/storage";

@IonicPage()

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  user: any;              //el usuario logueado
  nombre: string;         //nombre ingresado para el login 
  password: string;       //pass ingresado para el login
  login: boolean = false; //confirmación de haber logrador

  constructor(
    public navCtrl: NavController,
    public servicios: ServiciosProvider,
    public alert: AlertController,
    public loading: LoadingController,
    private keyboard: Keyboard,
    private storage: Storage
    ) {     
      this.usuarioLog();
      // this.getTablas();
  }

  // getTablas(){
  //   let body = {
  //     aksi:'get_Tablas'
  //   }

  //   this.servicios.etiquetaService(body).subscribe(data =>{
  //     this.tablas=JSON.parse((<any>data)._body)[0];       
  //   });
  // }

  usuarioLog(){
    this.storage.get('name').then(data => {
      if(!data) return;
      this.storage.get('name').then((val)=>{
        this.nombre = val;
        this.storage.get('pass').then((val)=>{
          this.password = val;
          this.inicioSesion();
        })
      })      
    })
  }

  inicioSesion(){
    return new Promise(resolve => {  
      let body = {  //se manda los valores para ser revisado en php
        nombre: this.nombre,
        password: this.password,
        aksi : 'login',
      };
      
      let load = this.loading.create({ //un loading para que no presionen el boton mas de 1 vez
        content: 'Iniciando Sesión...',
        duration: 15000,  //tiene una duración maxima de 15 seg.
      });

      load.present(); //presentar el loading

      load.onWillDismiss(()=>{   
        if(!this.login){        //en caso de llegar al maximo de 15 seg, sin obtener respuesta del servidor
          this.alert.create({
            title: 'Sin conexión',
            message: 'No se logro conectar con el servidor, revise la conexión del dispositivo'
          }).present();  
        }  
        this.login = false 
      });

      this.servicios.etiquetaService(body).subscribe(data => { //pide la confirmacion del login
        if(JSON.parse((<any>data)._body).Success == false){ //esto en caso de que el pass o el user esten malos 
          this.login = true;    //para que no muestr el mensaje "sin conexion" siendo que llego al database
          load.dismiss();       //para el loading
          this.alert.create({   //alerta que dice que el usuario no existe como tal (pass o user)
            title: 'Usuario Erróneo',
            message: 'El usuario o la contraseña son incorrectos, <br>vuelva a intentarlo',
            buttons:['Ok']
          }).present();
        }else{              //en caso que si exista
          this.storage.set('name', this.nombre);
          this.storage.set('pass', this.password);
          let datos =JSON.parse((<any>data)._body); //obtiene los datos, en forma ".0.0.json"
          this.user = datos[0][0];                  //obtiene los datos del json y los setea en la variable user
          this.login = true;                        //indica que si existe el usuario y evita el mensaje
          load.dismiss();                           //para el loading
          this.navCtrl.setRoot('InventarioPage', {user: this.user}); //lleva al usuario a la pagina de tabs, en especifico al escanes de qr          
        }        
      },
      err=>{
        console.error(err);        
      });
    });
  }
}
