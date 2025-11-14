import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientFormComponent } from '../forms/client-form-component/client-form-component';
import { Client } from '../../models/client';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { HasRoleDirective } from '../../core/has-role.directive';
import { OrderByPipe } from '../../shared/pipes/order-by-pipe';

declare var $: any;

@Component({
  selector: 'app-client-component',
  imports: [
    CommonModule,
    FormsModule,
    ClientFormComponent,
    FilterByPipe,
    HasRoleDirective,
    OrderByPipe
  ],
  templateUrl: './client-component.html',
  styleUrl: './client-component.css'
})
export class ClientComponent implements OnInit {

  @ViewChild('clientFormModal') clientFormModal!: ClientFormComponent;

  clients: Client[] = [];
  selectedClient: Client | null = null;
  searchTerm: string = '';
  showActivateClients: boolean = true;
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc'; 

  constructor(private clientService: ClientService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.getClients();
  }

  openCreateModal(): void {
    this.selectedClient = null;
    this.clientFormModal.resetFormAndModal();
    $('#clientModal').modal('show');
  }

  openEditModal(client: Client) {
    this.selectedClient = client;
    $('#clientModal').modal('show');
  }

  closeClientForm(): void {
    $('#clientModal').modal('hide');
  }

  getClients(): void {
    this.clientService.getClients(this.showActivateClients).subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    });
  }

  changeSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'fa fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
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

  deleteClient(client: Client): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar el cliente "${client.name}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = client.id ?? 0;
          this.clientService.deleteClient(id).subscribe({
            next: () => {
              this.getClients();
              this.notify.success('Cliente eliminado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByClient(index: number, item: Client): number {
    return item.id ?? index;
  }
}
