import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';
import { Storage } from "@ionic/storage";

/**
 * Generated class for the InventarioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inventario',
  templateUrl: 'inventario.html',
})
export class InventarioPage {

  user: any;
  tablas: any;
  tipos: any;
  tipo: any;
  tabla: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private servicios: ServiciosProvider,
    private storage: Storage
    ) {     
  }

  lastIn(){
    this.storage.get('cat').then(data=>{
      if(data){
        this.tipo = data;
        this.getTablas(true);                   
      }else return;
    });
  }

  getTipos(){
    let body = {
      aksi:'get_Categorias'
    }

    this.servicios.etiquetaService(body).subscribe(data =>{
      this.tipos=JSON.parse((<any>data)._body)[0];
    });
  }

  verificar(){    
    this.storage.get('tabla').then(data=>{
      for (let i = 0; i < this.tablas.length; i++) {
        if (this.tablas[i].idTabla == data) {     
          //this.tabla= null;  
          this.tabla = data;
          break;
        }
      }
    });   
  }

  cerrar(){
    this.storage.clear();
    this.navCtrl.setRoot('HomePage');
  }

  getTablas(action?){
    let body = {
      aksi:'get_Tablas',
      id: this.tipo
    }

    this.servicios.etiquetaService(body).subscribe(data =>{
      this.tablas=JSON.parse((<any>data)._body)[0];       
      if (action) {
        this.verificar();
      }
    });
  }

  ionViewWillLoad() {
    this.user = this.navParams.get("user");
    if (!this.user){
      this.navCtrl.setRoot('HomePage');
    }else{
      this.getTipos();        
      this.lastIn();    
    }
  }

  entrar(){
    this.storage.set('cat', this.tipo);
    this.storage.set('tabla', this.tabla);    
    this.navCtrl.setRoot('TabsPage', {user:this.user, tabla: this.tabla, tipo: this.tipo});
  }

}
