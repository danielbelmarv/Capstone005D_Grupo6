import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-agregar-disponibilidad',
  templateUrl: './agregar-disponibilidad.component.html',
  styleUrls: ['./agregar-disponibilidad.component.scss'],
})
export class AgregarDisponibilidadComponent implements OnInit {
  disponibilidadForm: FormGroup;
  fechasSeleccionadas: string[] = [];
  horasSeleccionadas: string[] = [];
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: AngularFirestore
  ) {
    this.disponibilidadForm = this.fb.group({
      fechas: ['', Validators.required],
      horas: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  agregarFecha(fecha: string | string[] | null | undefined) {
    if (!fecha) return;

    // Extraer solo la fecha en formato YYYY-MM-DD
    const fechaFormateada = Array.isArray(fecha) ? 
      fecha.map(f => f.slice(0, 10)) : 
      fecha.slice(0, 10);
      
      if (Array.isArray(fechaFormateada)) {
      fechaFormateada.forEach(f => {
        if (!this.fechasSeleccionadas.includes(f)) {
          this.fechasSeleccionadas.push(f);
        }
      });
    } else if (!this.fechasSeleccionadas.includes(fechaFormateada)) {
      this.fechasSeleccionadas.push(fechaFormateada);
    }
    
    this.disponibilidadForm.patchValue({ fechas: this.fechasSeleccionadas });
  }
  //Función para verificar si la fecha seleccionada es un día de semana
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
  
    return utcDay !== 0 && utcDay !== 6;
  };

  agregarHora(hora: string) {
    if (!this.horasSeleccionadas.includes(hora)) {
      this.horasSeleccionadas.push(hora);
    } else {
      // Si la hora ya está seleccionada, la removemos
      this.horasSeleccionadas = this.horasSeleccionadas.filter(h => h !== hora);
    }
    
    this.disponibilidadForm.patchValue({ horas: this.horasSeleccionadas });
  }
  
  onSubmit() {
    if (this.disponibilidadForm.valid) {
      const disponibilidad = {
        fechas: this.fechasSeleccionadas,
        horas: this.horasSeleccionadas,
        medicoId: this.userId
      };

      this.firestore.collection('disponibilidad').add(disponibilidad)
        .then(() => {
          console.log('Disponibilidad agregada exitosamente');
        })
        .catch(error => {
          console.error('Error al agregar disponibilidad: ', error);
        });
    }
  }
}







