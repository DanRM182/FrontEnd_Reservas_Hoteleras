# Integración y comprobación del frontend

Se conserva la arquitectura de NgModules, servicios por recurso, formularios reactivos y Angular Material. Las URLs siguen siendo relativas; los destinos se configuran en `.env` como explica README.md.

## Acceso

USER puede registrar y consultar huéspedes, consultar habitaciones y registrar, modificar fechas, cancelar y realizar check-in/check-out de reservas según su estado. ADMIN además administra habitaciones, edita/elimina huéspedes, elimina reservas permitidas, registra/elimina usuarios y consulta reportes. Guards, botones y el interceptor aplican estos permisos en Angular. Una sesión expirada vuelve al login.

El gateway inspeccionado permite POST/PUT/PATCH a ambos roles de forma general. Por tanto, todavía necesita restricciones por recurso en el backend para impedir que USER modifique habitaciones mediante solicitudes externas. Los controles del navegador no sustituyen esa autorización. No se modificó el backend.

## Reservas

1. Registrar un huésped y disponer de una habitación disponible.
2. Crear la reserva desde Reservaciones. Angular envía las fechas como `dd/MM/yyyy`. El backend ocupa la habitación desde el registro, incluso para una entrada futura.
3. Una reserva confirmada permite modificar fechas, cancelar o hacer check-in.
4. En curso solamente permite modificar la salida o realizar check-out. No permite eliminarla.
5. Finalizadas y canceladas no permiten modificar fechas ni transiciones adicionales.

El frontend no llama a los endpoints internos ocupar/liberar: Reservas realiza esas operaciones. Las habitaciones ocupadas no permiten cambios manuales de estado desde la interfaz para evitar romper este flujo. Después de un error de operación se exige actualizar el listado antes de otra acción; no se muestra éxito ni se cambia el estado local al fallar.

Si Habitaciones devuelve «La habitacion debe de estar ocupada para liberarla», el estado de la habitación no cumple la precondición del backend. Actualizar el listado no repara esa inconsistencia. Se deben revisar los estados de la reserva y habitación y la operación que los cambió antes de corregir los datos en el backend. No se fuerza la ocupación desde Angular.

## Límites del contrato actual

- Usuarios ofrece GET, POST y DELETE, pero no PUT. La edición permanece deshabilitada hasta que exista ese contrato.
- La respuesta de reserva no incluye el ID del huésped. Para editar fechas se busca una coincidencia única entre todos sus datos y los huéspedes activos. Si no existe o es ambigua, se bloquea la edición. Incorporar el ID al contrato eliminaría esta limitación.
- Reportes muestra un resumen de los registros actuales obtenido de los listados existentes, exclusivo de ADMIN. No representa un histórico ni calcula ingresos; no hay un endpoint de reportes disponible.

## Validación

```powershell
ng build
ng test --watch=false --browsers=ChromeHeadless
ng serve
```

Con los servicios iniciados, comprobar con cuentas USER y ADMIN: login, navegación directa a módulos restringidos, registro de huésped, reserva sobre habitación disponible, edición de fechas, check-in y check-out. Probar cancelación con otra reserva confirmada. No repetir operaciones después de un error remoto sin consultar el estado actualizado. Las pruebas automáticas usan servicios simulados y no verifican las transacciones reales entre microservicios.
