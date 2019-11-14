import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ServiciosProvider {

  server: string = "http://192.168.0.5:81/conexionServer5/";
  type: string;
  headers: any;
  options: any;

	constructor(public http: Http){
    this.type = "application/json; charset=UTF-8";
    this.headers = new Headers({ 'Content-Type': this.type });
    this.options = new RequestOptions({ headers: this.headers });
	}

	etiquetaService( body){  
      return this.http.post(this.server + 'aksi_etiqueta.php', JSON.stringify(body), this.options)
      .map (res => res)      
  }
}