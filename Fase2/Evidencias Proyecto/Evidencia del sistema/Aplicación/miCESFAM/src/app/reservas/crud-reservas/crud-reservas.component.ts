import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservaService } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crud-reservas',
  templateUrl: './crud-reservas.component.html',
  styleUrls: ['./crud-reservas.component.scss']
})
export class CrudReservasComponent implements OnInit {
  medicos: any[] = [];
  disponibilidad: any[] = [];
  horasDisponibles: string[] = [];
  especialidades: any[] = [];
  reservasForm!: FormGroup;
  horaSeleccionada: string = '';
  minDate: string;
  currentUser: any;

  constructor(private fb: FormBuilder, private reservasService: ReservaService, private authService: AuthService, private router: Router) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  ngOnInit() {
    this.reservasForm = this.fb.group({
      especialidad: ['', Validators.required],
      medicoId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    // Obtener información del usuario actual
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actual:', this.currentUser);
    });

    // Cargar especialidades desde el servicio
    this.reservasService.obtenerEspecialidades().subscribe(especialidades => {
      this.especialidades = especialidades;
      console.log('Especialidades cargadas:', this.especialidades);
    });
  }
    //Función para verificar si la fecha seleccionada es un día de semana
    isWeekday = (dateString: string) => {
      const date = new Date(dateString);
      const utcDay = date.getUTCDay();
    
      return utcDay !== 0 && utcDay !== 6;
    };

  // Manejar el cambio de especialidad
  onEspecialidadChange(especialidad: string) {
    console.log('Especialidad seleccionada:', especialidad);
    this.reservasService.obtenerMedicosPorEspecialidad(especialidad).subscribe(medicos => {
      this.medicos = medicos;
      console.log('Médicos cargados:', this.medicos);
      this.limpiarDisponibilidad();
    });
  }

  // Manejar el cambio de médico
  onMedicoChange(medicoId: string) {
    console.log('Médico seleccionado:', medicoId);
    this.reservasService.obtenerDisponibilidadPorMedico(medicoId).subscribe(disponibilidad => {
      this.disponibilidad = disponibilidad;
      console.log('Disponibilidad cargada:', this.disponibilidad);
      if (this.reservasForm?.get('fecha')?.value) {
        this.onFechaChange(this.reservasForm.get('fecha')?.value);
      }
    });
  }

  // Manejar el cambio de fecha
  onFechaChange(value: any) {
    const fechaSeleccionada = typeof value === 'string' ? value.split('T')[0] : '';
    console.log('Fecha seleccionada:', fechaSeleccionada);
    const disponibilidadFecha = this.disponibilidad.find(disp => disp.fechas.includes(fechaSeleccionada));
    if (disponibilidadFecha) {
      this.reservasService.obtenerReservasPorFecha(fechaSeleccionada).subscribe(reservas => {
        const horasOcupadas = reservas.map(reserva => reserva.hora);
        this.horasDisponibles = disponibilidadFecha.horas.filter((hora: any) => !horasOcupadas.includes(hora));
        console.log('Horas disponibles:', this.horasDisponibles);
      });
    } else {
      this.horasDisponibles = [];
    }
    this.reservasForm.get('fecha')?.setValue(fechaSeleccionada);
  }

  // Seleccionar hora
  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
    this.reservasForm.get('hora')?.setValue(hora);
  }

  // Limpiar disponibilidad
  limpiarDisponibilidad() {
    this.disponibilidad = [];
    this.horasDisponibles = [];
    this.horaSeleccionada = '';
  }

  // Manejar el envío del formulario
  reservarHora() {
    if (this.reservasForm.valid) {
      const reserva = this.reservasForm.value;
      const medico = this.medicos.find(m => m.id === reserva.medicoId);
      const reservaCompleta = {
        ...reserva,
        nombreCompletoPaciente: `${this.currentUser?.nombre || ''} ${this.currentUser?.apellido || ''}`,
        rutPaciente: this.currentUser?.rut || '',
        nombreCompletoMedico: `${medico.nombre} ${medico.apellido}`,
        estado: 'Pendiente' // Agregar el campo estado con valor inicial 'Pendiente'
      };
      console.log('Reserva realizada:', reservaCompleta);
      this.reservasService.crearReserva(reservaCompleta).then(() => {
        console.log('Reserva guardada exitosamente en Firestore');
        this.router.navigate(['/reservas-paciente']);
      }).catch(error => {
        console.error('Error al guardar la reserva en Firestore:', error);
      });
    } else {
      console.log('Formulario no válido:', this.reservasForm);
    }
  }
}

