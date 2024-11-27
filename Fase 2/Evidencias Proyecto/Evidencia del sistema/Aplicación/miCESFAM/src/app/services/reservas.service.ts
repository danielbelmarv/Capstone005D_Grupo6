import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, query, where } from 'firebase/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  constructor(private firestore: AngularFirestore) {}

   // Crear reserva
  crearReserva(reserva: any): Promise<void> {
    const id = this.firestore.createId();
    console.log('Guardando reserva con ID:', id, 'y datos:', reserva);
    return this.firestore.collection('reservas').doc(id).set(reserva);
  }

  // Obtener médicos
  getMedicos(): Observable<any[]> {
    return this.firestore.collection('users', ref => ref.where('role', '==', 'Médico')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  // Obtener médicos por especialidad
  obtenerMedicosPorEspecialidad(especialidad: string): Observable<any[]> {
    return this.firestore.collection('users', ref => ref.where('role', '==', 'Médico').where('especialidad', '==', especialidad)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  

  // Obtener especialidades desde la colección 'especialidades' en Firestore
  obtenerEspecialidades(): Observable<any[]> {
    return this.firestore.collection('especialidades').valueChanges();
  }

    // Obtener disponibilidad por médico
  obtenerDisponibilidadPorMedico(medicoId: string): Observable<any[]> {
    console.log('Obteniendo disponibilidad para el médico con ID:', medicoId);
    return this.firestore.collection('disponibilidad', ref => ref.where('medicoId', '==', medicoId)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        console.log('Disponibilidad encontrada:', data);
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  // reservas.service.ts
  obtenerReservasPorUsuario(usuarioId: string): Observable<any[]> {
  return this.firestore.collection('reservas', ref => ref.where('usuarioId', '==', usuarioId)).valueChanges();
  }

   // Obtener reservas por paciente
    obtenerReservasPorPaciente(rut: string): Observable<any[]> {
    return this.firestore.collection('reservas', ref => ref.where('rutPaciente', '==', rut)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  // Obtener reservas por médico
  obtenerReservasPorMedico(medicoId: string): Observable<any[]> {
    return this.firestore.collection('reservas', ref => ref.where('medicoId', '==', medicoId)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  // Obtener todas las reservas (para administrativo)
  obtenerTodasReservas(): Observable<any[]> {
    return this.firestore.collection('reservas').valueChanges();
  }

  // Obtener una reserva específica por ID
  obtenerReserva(id: string): Observable<any> {
    return this.firestore.collection('reservas').doc(id).valueChanges();
  }

  // Actualizar estado de la reserva
  actualizarEstadoReserva(id: string, estado: string): Promise<void> {
    return this.firestore.collection('reservas').doc(id).update({ estado });
  }

  // Actualizar una reserva
  actualizarReserva(id: string, reserva: any): Promise<void> {
    return this.firestore.collection('reservas').doc(id).update(reserva);
  }

  // Eliminar una reserva
  eliminarReserva(id: string): Promise<void> {
    return this.firestore.collection('reservas').doc(id).delete();
  }

  // Obtener reservas por fecha
  obtenerReservasPorFecha(fecha: string): Observable<any[]> {
    return this.firestore.collection('reservas', ref => ref.where('fecha', '==', fecha)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...(typeof data === 'object' ? data : {}) };
      }))
    );
  }

  // Obtener médicos disponibles por especialidad y fecha
  obtenerMedicosDisponiblesPorEspecialidadYFecha(especialidad: string, fecha: string): Observable<any[]> {
    return this.firestore.collection('users', ref =>
      ref.where('role', '==', 'Médico').where('especialidad', '==', especialidad))
      .snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const medico = a.payload.doc.data() as any;
            medico.id = a.payload.doc.id;

            // Ahora obtenemos la disponibilidad del médico desde la colección 'disponibilidad'
            return this.firestore.collection('disponibilidad', ref => ref
              .where('medicoId', '==', medico.id))  // Solo buscamos por 'medicoId'
              .valueChanges().pipe(
                map(disponibilidades => {
                  if (disponibilidades.length > 0) {
                    const disp = disponibilidades[0];  // Suponemos que el primer resultado tiene la disponibilidad
                    const disponibilidad = disp as { fechas: string[], horas: any[] };
                    medico.horasDisponibles = disponibilidad.fechas.includes(fecha) ? disponibilidad.horas : [];  // Filtrar por la fecha seleccionada
                  } else {
                    medico.horasDisponibles = [];  // Si no hay disponibilidad, devolvemos un array vacío
                  }
                  return medico;  // Devolver el médico con sus horas disponibles
                })
              );
          });
        })
      );
  }

  // Obtener médicos disponibles en una fecha específica
  obtenerMedicosDisponibles(fecha: string): Observable<any[]> {
    return this.firestore.collection('users', ref => ref.where('role', '==', 'Médico')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const medico = a.payload.doc.data() as any;
        medico.id = a.payload.doc.id;

        // Filtrar los médicos con disponibilidad en la fecha seleccionada
        medico.horasDisponibles = medico.horarios.filter((hora: any) => hora.fecha === fecha && !hora.reservada);
        return medico;
      }))
    );
  }

  // Obtener estado de la reserva (si está disponible o reservada)
  obtenerEstadoReserva(reservaId: string): Observable<any> {
    return this.firestore.collection('reservas').doc(reservaId).valueChanges();
  }
}