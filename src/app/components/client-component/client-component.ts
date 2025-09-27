import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientFormComponent } from '../forms/client-form-component/client-form-component';
import { Client } from '../../models/client';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';

declare var $: any;

@Component({
  selector: 'app-client-component',
  imports: [
    CommonModule,
    FormsModule,
    ClientFormComponent
  ],
  templateUrl: './client-component.html',
  styleUrl: './client-component.css'
})
export class ClientComponent implements OnInit {

  @ViewChild('clientFormModal') clientFormModal!: ClientFormComponent;

  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  clientForDetails: Client | null = null;
  searchTerm: string = '';
  showActivateClients: boolean = true;

  constructor(private clientService: ClientService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.getClients();
  }

  onTooggleChange(): void {
    this.getClients();
  }

  openCreateModal(): void {
    this.selectedClient = null;
    this.clientFormModal.resetFormAndModal();
    $('#clientModal').modal('show');
  }

  openEditModal(client: Client) {
    this.selectedClient = client;
    this.closeClientDetails();
    $('#clientModal').modal('show');
  }

  closeClientForm(): void {
    $('#clientModal').modal('hide');
  }

  viewClientDetails(client: Client): void {
    this.clientForDetails = client;
    $('#clientDetailsModal').modal('show');
  }

  closeClientDetails(): void {
    $('#clientDetailsModal').modal('hide');
  }

  getClients(): void {
    this.clientService.getClients(this.showActivateClients).subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = [...this.clients];
      },
      error: (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    });
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredClients = this.clients.filter(client => 
        client.firstName.toLowerCase().includes(lowerCaseSearchItem) ||
        client.lastName.toLowerCase().includes(lowerCaseSearchItem) ||
        client.rfc.toLowerCase().includes(lowerCaseSearchItem)
      );
    }
  }

  onClientSaved(client: Client): void {
    if (client.id) {
      this.clientService.updateClient(client.id, client).subscribe({
        next: (res) => {
          this.getClients()
          this.notify.success('¡Cliente actualizado!', res?.message);
          $('#clientModal').modal('hide');
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      console.log("Cliente para crear:" + client)
      this.clientService.createClient(client).subscribe({
        next: (res) => {
          this.getClients();
          this.notify.success('¡Cliente agregado!', res?.message)
          $('#clientModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }
}
