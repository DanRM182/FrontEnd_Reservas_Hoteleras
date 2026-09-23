export interface HuespedRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  documento: string;
  nacionalidad: string;
}

// El backend devuelve el nombre completo, sin separar los apellidos.
export interface HuespedResponse {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  nacionalidad: string;
}
