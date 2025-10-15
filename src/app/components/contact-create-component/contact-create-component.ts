import { Component } from '@angular/core';
import { ContactService } from '../../services/contact-service';
import { AdressService } from '../../services/adress-service';
import { PhoneNumberService } from '../../services/phone-number-service';
import { PhoneNumberCreateModel } from '../../models/phone-number-create-model';
import { AdressCreateModel } from '../../models/adress-create-model';
import { ContactCreateModel } from '../../models/contact-create-model';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-contact-create-component',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './contact-create-component.html',
  styleUrls: ['./contact-create-component.css']
})
export class ContactCreateComponent {

  // Új kontakt alapértelmezett értékei
  contact: ContactCreateModel = {
    name: '',
    birthDate: '',
    motherName: '',
    tajNumber: '',
    taxNumber: '',
    email: ''
  };

  // Kezdeti cím lista (legalább 1 üres sor)
  addresses: AdressCreateModel[] = [
    { zipCode: '', city: '', street: '', houseNumber: '', contactId: 0 }
  ];

  // Kezdeti telefonszám lista
  phones: PhoneNumberCreateModel[] = [
    { phoneNumber: '', type: '', contactId: 0 }
  ];

  message = '';     // Felhasználói üzenet (hiba / siker)
  saving = false;   // Mentési folyamat állapota

  constructor(
    private contactService: ContactService,
    private adressService: AdressService,
    private phoneService: PhoneNumberService
  ) {}

  // Új cím mező hozzáadása
  addAddress() {
    this.addresses.push({ zipCode: '', city: '', street: '', houseNumber: '', contactId: 0 });
  }

  // Cím eltávolítása
  removeAddress(i: number) {
    this.addresses.splice(i, 1);
  }

  // Új telefonszám mező hozzáadása
  addPhone() {
    this.phones.push({ phoneNumber: '', type: '', contactId: 0 });
  }

  // Telefonszám eltávolítása
  removePhone(i: number) {
    this.phones.splice(i, 1);
  }

  /** FRONTEND VALIDÁCIÓ **/
  private validateForm(): string[] {
    const errors: string[] = [];

    // Kötelező mezők ellenőrzése
    if (!this.contact.name.trim()) errors.push('A név megadása kötelező.');
    if (!this.contact.birthDate) errors.push('A születési dátum megadása kötelező.');
    if (!this.contact.motherName.trim()) errors.push('Az anyja neve megadása kötelező.');
    if (!this.contact.tajNumber.trim()) errors.push('A TAJ szám megadása kötelező.');
    if (!this.contact.taxNumber.trim()) errors.push('Az adóazonosító megadása kötelező.');

    // E-mail vagy telefonszám közül legalább egy szükséges
    const hasEmail = !!this.contact.email.trim();
    const validPhones = this.phones.filter(
      p => p.phoneNumber.trim() && p.type.trim()
    );

    if (!hasEmail && validPhones.length === 0) {
      errors.push('Adj meg e-mail címet vagy legalább egy telefonszámot.');
    }

    // Telefonszám esetén a típus is kötelező
    this.phones.forEach((p, i) => {
      if (p.phoneNumber && !p.type) {
        errors.push(`A(z) ${i + 1}. telefonszámhoz típus megadása szükséges.`);
      }
    });

    return errors;
  }

  // Kontakt és kapcsolódó adatok mentése
  registerContact() {
    this.message = '';
    if (this.saving) return; // Ha épp mentés zajlik, ne induljon újra

    const errors = this.validateForm();
    if (errors.length > 0) {
      this.message = errors.join('\n');
      return;
    }

    this.saving = true;

    // Kontakt létrehozása, majd címek és telefonszámok mentése
    this.contactService.register(this.contact).pipe(
      switchMap((createdContactId: any) => {
        // Kapott contactId beállítása a címekhez és telefonszámokhoz
        const contactId = (typeof createdContactId === 'number')
          ? createdContactId
          : (createdContactId && createdContactId.id) ? createdContactId.id : createdContactId;

        this.addresses.forEach(a => a.contactId = contactId);
        this.phones.forEach(p => p.contactId = contactId);

        // Párhuzamos cím- és telefonszám mentés
        const addressRequests = this.addresses.length
          ? forkJoin(this.addresses.map(a =>
            this.adressService.register(a).pipe(catchError(() => of(null)))
          ))
          : of([]);

        const phoneRequests = this.phones.length
          ? forkJoin(this.phones.map(p =>
            this.phoneService.register(p).pipe(catchError(() => of(null)))
          ))
          : of([]);

        return forkJoin([addressRequests, phoneRequests]);
      }),
      tap(() => {
        this.message = 'Kapcsolattartó és adatai sikeresen létrehozva!';
      }),
      catchError(err => {
        console.error('Kontakt mentési hiba:', err);
        this.message = 'Hiba történt a kontakt létrehozásakor.';
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.resetForm(); // űrlap ürítése siker után
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  // Alapértelmezett űrlap visszaállítása
  resetForm() {
    this.contact = { name: '', birthDate: '', motherName: '', tajNumber: '', taxNumber: '', email: '' };
    this.addresses = [{ zipCode: '', city: '', street: '', houseNumber: '', contactId: 0 }];
    this.phones = [{ phoneNumber: '', type: '', contactId: 0 }];
  }
}
