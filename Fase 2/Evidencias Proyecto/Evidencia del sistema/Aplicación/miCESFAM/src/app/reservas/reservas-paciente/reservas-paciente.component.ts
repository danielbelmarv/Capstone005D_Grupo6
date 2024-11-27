import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reservas-paciente',
  templateUrl: './reservas-paciente.component.html',
  styleUrls: ['./reservas-paciente.component.scss'],
})
export class ReservasPacienteComponent implements OnInit {
  reservas: any[] = [];
  userRut: string = '';

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userRut = user.rut;
        this.obtenerReservas();
      }
    });
  }

  obtenerReservas() {
    this.reservaService.obtenerReservasPorPaciente(this.userRut).subscribe((reservas: any[]) => {
      this.reservas = reservas;
      console.log('Reservas obtenidas:', this.reservas);
    });
  }

  async eliminarReserva(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Está seguro de que desea cancelar esta reserva?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.reservaService.eliminarReserva(id).then(() => {
              this.obtenerReservas();  // Actualizar después de eliminar
            });
          },
        },
      ],
    });

    await alert.present();
  }
}