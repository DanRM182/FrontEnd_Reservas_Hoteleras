# ReservasApp

## Conexiones con los servicios

El frontend usa URLs relativas. Habitaciones, huéspedes y reservas pasan por el
gateway, que localiza los servicios mediante Eureka. Auth sigue siendo un servicio
separado, accesible a través del proxy del frontend.

Para una instalación nueva, copia `.env.example` a `.env` y ajusta las direcciones:

```powershell
Copy-Item .env.example .env
ng serve
```

Requiere Node 22 (como el Dockerfile). `proxy.conf.cjs` carga `.env` automáticamente;
las variables ya definidas en la terminal tienen prioridad. `.env` no se versiona
ni se incluye en la imagen Docker. Los valores de `.env.example` son ejemplos locales.

| Variable | Uso |
| --- | --- |
| `GATEWAY_URL` | Dirección del gateway para `ng serve` |
| `AUTH_URL` | Dirección de Auth para `ng serve` |
| `DOCKER_GATEWAY_URL` | Dirección del gateway desde el contenedor Nginx |
| `DOCKER_AUTH_URL` | Dirección de Auth desde el contenedor Nginx |
| `FRONTEND_PORT` | Puerto publicado por Docker Compose |

Usa direcciones con protocolo y host (y puerto cuando corresponda), sin rutas,
credenciales ni barra final. Para cambiar temporalmente el destino en PowerShell:

```powershell
$env:GATEWAY_URL = 'http://localhost:8090'
$env:AUTH_URL = 'http://localhost:9000'
ng serve
```

No es necesario configurar en el frontend los puertos de habitaciones o reservas.
El proxy conserva `/api/habitaciones`, `/api/huespedes` y `/api/reservas`; el gateway
es el único que elimina esos prefijos con `StripPrefix=2`.
`/auth-api/api/login` se convierte en `/api/login` en Auth, y
`/auth-api/admin/usuarios` en `/admin/usuarios`. El interceptor JWT se conserva.

Reinicia `ng serve` después de cambiar `.env`. Para Docker Desktop, los ejemplos
usan `host.docker.internal` porque los servicios Java corren en el equipo anfitrión.
Si corren en contenedores, usa sus nombres DNS y puertos internos accesibles desde
Nginx. El arranque es `docker compose up --build -d`.
Nginx genera su configuración desde `nginx.conf` al iniciar el contenedor;
para cambiar solo los destinos basta editar `.env` y recrear el contenedor con
`docker compose up -d --force-recreate`, sin recompilar Angular.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
