import { Component, OnInit } from '@angular/core';
import { UPLOAD_IMPORTS } from './importsModule';
import Swal from 'sweetalert2';
import { VerifyDocumentService } from '../../../services/verifyDocument/verify-document.service';
import { HttpClientModule } from '@angular/common/http';

interface VerifiDocument {
  id: string;
  cedula: string;
  nombresCompletos: string;
  tipoCurso: string;
  notaGrado: number;
  documento: string;
  estadoVerificacion: string;
  estadoDocumento: string;
}

@Component({
  selector: 'app-end-process',
  standalone: true,
  imports: [UPLOAD_IMPORTS, HttpClientModule],
  templateUrl: './end-process.component.html',
  styleUrl: './end-process.component.scss',
  providers: [VerifyDocumentService],
})
export class EndProcessComponent implements OnInit {

  data: VerifiDocument[] = [];
  searchTerm: string = '';
  filteredData: VerifiDocument[] = [];

  Comprobante: boolean = false;

  constructor(private VerifyDocumentService: VerifyDocumentService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.VerifyDocumentService.getRelationsVerifyDocument().subscribe(
      (response) => {
        this.data = response.map((item: any) => ({
          id: item._id,
          cedula: item.identification,
          nombresCompletos: item.name,
          tipoCurso: item.commandType,
          notaGrado: item.gradeNote,
          documento: item.document,
          estadoVerificacion: item.verifyDocumentState,
          estadoDocumento: item.uploadDocumentState,
        }));
        this.filteredData = this.data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  filterData(): void {
    if (this.searchTerm) {
      this.filteredData = this.data.filter(
        (curso) =>
          curso.id.toString().includes(this.searchTerm) ||
          curso.cedula.includes(this.searchTerm) ||
          curso.nombresCompletos
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          curso.tipoCurso
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          curso.estadoVerificacion
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          curso.estadoDocumento
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredData = this.data;
    }
  }

  filterGlobal(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const searchValue = input.value;
      this.searchTerm = searchValue;
      this.filterData();
    }
  }

  verComprobante(rowData: VerifiDocument): void {
    this.Comprobante = true;
  }

  updateVerifyData(id: string, updatedData: any): void {
    this.VerifyDocumentService.updateVerifyDocument(id, updatedData).subscribe(
      (response) => {
        console.log('Dato actualizado:', response);
      },
      (error) => {
        console.error('Error al actualizar el dato:', error);
      }
    );
  }

  aceptar(rowData: VerifiDocument): void {
    if (rowData.estadoVerificacion === 'Pendiente') {
      Swal.fire({
        title: 'Estas seguro?',
        text: 'Se aceptará la inscripcion del aspirante.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedData = {
            updated_at: new Date()
          };
          this.updateVerifyData(rowData.id, updatedData);
          Swal.fire({
            title: 'Inscripcion aceptada',
            text: 'Se emitira el correo de confirmación al aspirante.',
            icon: 'success',
          }).then(() => {
            this.updateTable();
          });
        }
      });
    }
  }

  rechazar(rowData: VerifiDocument): void {
    if (rowData.estadoVerificacion === 'Pendiente') {
      Swal.fire({
        title: 'Estas seguro?',
        text: 'Se rechazara la inscripcion del aspirante.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Rechazar',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Inscripcion rechazada',
            text: 'Se emitira el correo al aspirante.',
            icon: 'success',
          }).then(() => {
            this.updateTable();
          });
        }
      });
    }
  }

  updateTable(): void {
    this.fetchData();
    this.filterData();
  }
}
