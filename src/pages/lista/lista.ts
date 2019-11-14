import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events, LoadingController } from 'ionic-angular';
import { ServiciosProvider } from '../../providers/servicios/servicios';

/**
 * Generated class for the ListaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lista',
  templateUrl: 'lista.html',
})
export class ListaPage {

  etiquetas: any;             //datos de etiquetas traidas de la base de datos
  user: any;                  //usuario logueado
  filterItems: any = null;    //datos de las etiquetas filtrado
  searchTerm: string = null;  //el termino con le que realiza la busqueda
  busqueda: string = "ID";    //Para saber que datos buscar, en este caso es por ID del producto
  busquedaicon: string = "md-barcode";//Icono que varia para cambiar el estilo del boton de filtros
  tabla: string;//tabla a la que se hacen las consultas
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public servicios: ServiciosProvider,
    public alert: AlertController,
    public events: Events,
    public loading: LoadingController,
    ) {
      this.tabla = navParams.get("tabla");
      this.user = navParams.get("user");;       //recoge datos enviados desde "tabs"
      this.busqueda = "ID";             //Para saber que datos buscar, en este caso es por ID del producto
  }

  ionViewWillLeave(){
    this.events.unsubscribe('reconteo');//cada vez que se sale de la pagina se desubscribe del evento "reconteo"
    //esto porque en caso de seguir subscrito al estar fuera de la pagina y existe un cambio, el loading se ejecuta.
  }

  getData(){
    let body = {
      aksi : 'getEtiquetas_User',   //evento
      idUsuario: this.user.idUsuario, //id del usuario para saber que traer
      tabla: this.tabla               //a donde va a traer los datos
    };    

    this.servicios.etiquetaService(body).subscribe(data => {
      try{  
        /**
         * Intenta parsear los datos traidos de la base de datos a JSON, en caso de no poder,
         * solo manda un error, practicamente nunca deberia de fallar.
         * NOTA*:se dice que nunca va a fallar ya que cuando la conexion falla se bloquea la aplicacion.
         * y los datos que regresa ya son JSON de por si, pero nosotros solo buscamos el "_body[0]" que es
         * donde se encuentran los datos, si fuera "_body[0][0]" es la primera serie de datos.
         */
        this.etiquetas=JSON.parse((<any>data)._body)[0];
        this.filterItems = this.etiquetas;  
        if(this.searchTerm != null) this.getItems();
      }catch(e){
        console.error('error', e);
      }
    });
  }

  ionViewWillEnter() {  //obtiene datos cuando entra por primera vez
    if(!this.etiquetas){
      let load = this.loading.create({
        content: 'Obteniendo datos...'
      })    
      load.present();
      this.getData();
      load.dismiss();
    }
    
    this.events.subscribe('reconteo', _value =>{//se subscribe al evento de tabs llamado "reconteo"    
        if(_value){                    
          /**
           * En este caso el if verifica si existe "value". eso debido a que el evento
           * llamado "reconteo" no manda informacion si no hay cambio de datos.
           * Al detectar un cambio de datos, crea un loading y recarga los datos.
           * Al decir "cambio de datos", se refiere puramente a que se agregue un reconteo a un registro.
           */
          const loader = this.loading.create({
            content: "Recargando datos..."
          });

          loader.present(); 
          
          this.getData();

          loader.dismiss();
        }
      })
  }

  getItems() {        
    //Aqui se hace el filtro al buscar, todo dependiendo de los datos que nos mandan
    if(this.busqueda == 'Descripción'){
      this.filterItems = this.etiquetas.filter(item =>  item.DescripcionSAP.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
    }else if(this.busqueda == 'ID'){
      this.filterItems = this.etiquetas.filter(item =>  item.idConteo.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
    }else if(this.busqueda == 'Numero Bodega'){
      this.filterItems = this.etiquetas.filter(item =>  item.CodigoBodega.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
    }
  }

  buscar(busqueda, icon){
    this.busqueda = busqueda; //setea parte del placeholder que tiene la barra de busqueda
    this.busquedaicon = icon; //setea el icono del boton fab en la barra de busqueda
    if(this.searchTerm) this.getItems();//si existe termino de busqueda, hace un filtro, esto porque si esta en blanco manda error
  }

  doRefresh(refresher) {  //refresh manual como en cualquier aplicacion.
    setTimeout(() => {        
      refresher.complete();
      this.getData();
    }, 1500);
  }

  ver(id){      
    /**
     * Este manda datos a la pagina de "qr-scam" para poder visualizar los dato, en este caso
     * la pagina carecera de botones e inputs. 
     */
    let etiqueta;
    for (let i in this.etiquetas) {
      if(id == this.etiquetas[i].idConteo)etiqueta = this.etiquetas[i]
    }
    this.navCtrl.push('QrScanPage', {etiquetaDeLista: etiqueta})
  }
  
}
