import { Component, OnInit } from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ContactListModel} from '../../models/contact-list-model';
import {PhoneNumberListModel} from '../../models/phone-number-list-model';
import {AdressListModel} from '../../models/adress-list-model';
import {ContactService} from '../../services/contact-service';
import {PhoneNumberService} from '../../services/phone-number-service';
import {AdressService} from '../../services/adress-service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, ReactiveFormsModule, FormsModule],
  templateUrl: './contact-list-component.html',
  styleUrls: ['./contact-list-component.css']
})
export class ContactListComponent implements OnInit {

  // Adattárolók a kontaktokhoz, telefonszámokhoz és címekhez
  contacts: ContactListModel[] = [];
  phones: PhoneNumberListModel[] = [];
  addresses: AdressListModel[] = [];

  // Minden kontakt egyedi formját itt tároljuk
  editForms: { [id: number]: FormGroup } = {};

  editingContactId: number | null = null; // éppen szerkesztett kontakt
  loading = false;                        // betöltés állapota
  error: string | null = null;            // hibaüzenet

  // Oldalazás beállításai
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pageSizes = [10, 20, 50];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private phoneService: PhoneNumberService,
    private addressService: AdressService
  ) {}

  // Komponens inicializálása
  ngOnInit(): void {
    this.loadAll();
  }

  // Minden adat betöltése (kontaktok, telefonszámok, címek)
  async loadAll(): Promise<void> {
    this.loading = true;
    try {
      const [contacts, phones, addresses] = await Promise.all([
        this.contactService.list().toPromise(),
        this.phoneService.list().toPromise(),
        this.addressService.list().toPromise()
      ]);

      // Eredmények elmentése a komponens állapotába
      this.contacts = contacts || [];
      this.phones = phones || [];
      this.addresses = addresses || [];

      // Minden kontakthoz külön űrlap létrehozása
      this.contacts.forEach(c => this.createFormFor(c));

      // Oldal számítás
      this.calculateTotalPages();
    } catch (err: any) {
      this.error = err?.message || 'Hiba történt a betöltés során.';
    } finally {
      this.loading = false;
    }
  }

  // Egy kontakt szerkesztő űrlapjának létrehozása
  createFormFor(contact: ContactListModel): void {
    const form = this.fb.group({
      id: [contact.id],
      name: [contact.name, Validators.required],
      birthDate: [contact.birthDate],
      motherName: [contact.motherName],
      tajNumber: [contact.tajNumber, Validators.required],
      taxNumber: [contact.taxNumber, Validators.required],
      email: [contact.email, [Validators.required, Validators.email]],
      // Kapcsolódó telefonszámok és címek hozzáadása
      phoneNumbers: this.fb.array(
        this.phones.filter(p => p.contactId === contact.id).map(p => this.createPhoneGroup(p))
      ),
      addresses: this.fb.array(
        this.addresses.filter(a => a.contactId === contact.id).map(a => this.createAddressGroup(a))
      )
    });
    this.editForms[contact.id] = form;
  }

  // Telefonszám űrlapcsoport létrehozása
  createPhoneGroup(p?: any): FormGroup {
    return this.fb.group({
      id: [p?.id || null],
      phoneNumber: [p?.phoneNumber || '', Validators.required],
      type: [p?.type || 'MOBILE', Validators.required],
      contactId: [p?.contactId || null, Validators.required]
    });
  }

  // Cím űrlapcsoport létrehozása
  createAddressGroup(a?: any): FormGroup {
    return this.fb.group({
      id: [a?.id || null],
      zipCode: [a?.zipCode || '', Validators.required],
      city: [a?.city || ''],
      street: [a?.street || ''],
      houseNumber: [a?.houseNumber || ''],
      contactId: [a?.contactId || null, Validators.required]
    });
  }

  // Telefonszám FormArray lekérése adott kontakt azonosítóhoz
  phoneArray(id: number): FormArray {
    return this.editForms[id].get('phoneNumbers') as FormArray;
  }

  // Cím FormArray lekérése adott kontakt azonosítóhoz
  addressArray(id: number): FormArray {
    return this.editForms[id].get('addresses') as FormArray;
  }

  // Szerkesztés megkezdése / megszakítása
  startEdit(id: number): void { this.editingContactId = id; }
  cancelEdit(): void { this.editingContactId = null; }

  // Kontakt mentése (szerkesztés után)
  saveContact(id: number): void {
    const form = this.editForms[id];
    if (form.invalid) { form.markAllAsTouched(); return; }

    this.contactService.modify(form.value).subscribe({
      next: () => { this.editingContactId = null; this.loadAll(); },
      error: err => this.error = err?.message
    });
  }

  // Kontakt törlése megerősítéssel
  confirmAndDelete(id: number): void {
    if (confirm('Biztosan törölni szeretnéd ezt a kontaktot?')) {
      this.contactService.delete(id).subscribe(() => this.loadAll());
    }
  }

  // 📞 Telefonszám kezelése
  addPhone(id: number): void { this.phoneArray(id).push(this.createPhoneGroup({ contactId: id })); }

  savePhone(id: number, index: number): void {
    const phoneForm = this.phoneArray(id).at(index);
    if (phoneForm.invalid) { phoneForm.markAllAsTouched(); return; }

    const phoneData = phoneForm.value;
    const service = phoneData.id ? this.phoneService.modify(phoneData) : this.phoneService.register(phoneData);

    service.subscribe({
      next: () => this.loadAll(),
      error: err => this.error = err?.message
    });
  }

  deletePhone(id: number, index: number): void {
    const phoneId = this.phoneArray(id).at(index).get('id')?.value;
    if (phoneId) this.phoneService.delete(phoneId).subscribe(() => this.loadAll());
  }

  // 🏠 Cím kezelése
  addAddress(id: number): void { this.addressArray(id).push(this.createAddressGroup({ contactId: id })); }

  saveAddress(id: number, index: number): void {
    const addrForm = this.addressArray(id).at(index);
    if (addrForm.invalid) { addrForm.markAllAsTouched(); return; }

    const addrData = addrForm.value;
    const service = addrData.id ? this.addressService.modify(addrData) : this.addressService.register(addrData);

    service.subscribe({
      next: () => this.loadAll(),
      error: err => this.error = err?.message
    });
  }

  deleteAddress(id: number, index: number): void {
    const addrId = this.addressArray(id).at(index).get('id')?.value;
    if (addrId) this.addressService.delete(addrId).subscribe(() => this.loadAll());
  }

  // Segédmetódusok: adott kontakt telefonszámai és címei
  getPhonesForContact(contactId: number): PhoneNumberListModel[] { return this.phones.filter(p => p.contactId === contactId); }
  getAddressesForContact(contactId: number): AdressListModel[] { return this.addresses.filter(a => a.contactId === contactId); }

  // 📄 Oldalazás logika
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  }

  // Csak az aktuális oldalon lévő kontaktok
  get pagedContacts(): ContactListModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.contacts.slice(start, start + this.pageSize);
  }

  // Lapozás vezérlése
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  changePageSize(): void { this.calculateTotalPages(); this.currentPage = 1; }
}
