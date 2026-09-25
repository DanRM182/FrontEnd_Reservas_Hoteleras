export function hoyLocal(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export function fechaApiAInput(fecha: string): string {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : '';
}

export function fechaInputAApi(fecha: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

export function fechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return year >= 1900 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function errorFechas(entrada: string, salida: string, enCurso: boolean, hoy = hoyLocal()): string {
  if (!fechaValida(entrada) || !fechaValida(salida)) return 'Ingresa fechas válidas.';
  if (salida <= entrada) return 'La salida debe ser posterior a la entrada.';
  if (!enCurso && entrada < hoy) return 'La entrada debe ser hoy o posterior.';
  if (salida < hoy) return 'La salida debe ser hoy o posterior.';
  return '';
}
