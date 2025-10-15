import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PhoneNumberCreateModel} from '../models/phone-number-create-model';
import {PhoneNumberListModel} from '../models/phone-number-list-model';
import {PhoneNumberModifyModel} from '../models/phone-number-modify-model';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberService {

  private baseURL ='http://localhost:8080/api/phone_number'


  constructor(private http:HttpClient) {  }

  //új telefonszám létrehozása
  register(phoneNumberCreate:PhoneNumberCreateModel) : Observable<any>{
    return this.http.post(this.baseURL+'/create',phoneNumberCreate,{ responseType: 'text' })
  }

  //telefonszámok listázása
  list():Observable<PhoneNumberListModel[]>{
    return this.http.get<PhoneNumberListModel[]>(this.baseURL+'/list')
  }

  //telefonszám módosítása
  modify(phoneNumberModify:PhoneNumberModifyModel):Observable<any>{
    return this.http.put ( this.baseURL+'/modify' , phoneNumberModify,{ responseType: 'text' })
  }

  //telefonszám törlése
  delete( id : number) : Observable<any>{
    return  this.http.delete<any> (this.baseURL+'/delete/' + id)
  }


}
