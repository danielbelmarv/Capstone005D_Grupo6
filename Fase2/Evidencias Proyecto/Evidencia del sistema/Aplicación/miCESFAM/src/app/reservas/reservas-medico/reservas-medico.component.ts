import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reservas-medico',
  templateUrl: './reservas-medico.component.html',
  styleUrls: ['./reservas-medico.component.scss'],
})
export class ReservasMedicoComponent implements OnInit {
  reservas: any[] = [];
  medicoId: string = '';

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.medicoId = user.uid;
        this.obtenerReservas();
      }
    });
  }

  obtenerReservas() {
    this.reservaService.obtenerReservasPorMedico(this.medicoId).subscribe((reservas: any[]) => {
      this.reservas = reservas;
      console.log('Reservas obtenidas:', this.reservas);
    });
  }

  confirmarReserva(id: string) {
    this.reservaService.actualizarEstadoReserva(id, 'Confirmada').then(() => {
      this.obtenerReservas();
    });
  }

  completarReserva(id: string) {
    this.reservaService.actualizarEstadoReserva(id, 'Completada').then(() => {
      this.obtenerReservas();
    });
  }

  async rechazarReserva(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Rechazo',
      message: '¿Está seguro de que desea rechazar esta reserva?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Rechazar',
          handler: () => {
            this.reservaService.actualizarEstadoReserva(id, 'Rechazada').then(() => {
              this.obtenerReservas();
            });
          },
        },
      ],
    });

    await alert.present();
  }
}