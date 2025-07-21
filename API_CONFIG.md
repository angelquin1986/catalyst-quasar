# Configuración de la API

## Variables de Entorno

Para que la aplicación funcione correctamente, necesitas crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Auth API Configuration (if different from main API)
VITE_AUTH_API_BASE_URL=http://localhost:3000
```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto
2. Copia las variables de ejemplo arriba
3. Cambia la URL base según tu configuración del backend
4. Reinicia el servidor de desarrollo

## Endpoints Utilizados

### Teams
- `GET /api/v1/teams` - Listar todos los equipos
- `POST /api/v1/teams` - Crear equipo
- `PUT /api/v1/teams/{id}` - Actualizar equipo
- `DELETE /api/v1/teams/{id}` - Eliminar equipo
- `GET /api/v1/teams/{id}` - Obtener equipo por ID
- `GET /api/v1/teams/{id}/players` - Obtener jugadores del equipo

### Players
- `GET /api/v1/players` - Listar todos los jugadores
- `POST /api/v1/players` - Crear jugador
- `PUT /api/v1/players/{cedula}` - Actualizar jugador
- `DELETE /api/v1/players/{cedula}` - Eliminar jugador
- `GET /api/v1/players/{cedula}` - Obtener jugador por cédula
- `GET /api/v1/players/{cedula}/team` - Obtener jugador con su equipo

## Validaciones Implementadas

### Fotos
- Tamaño máximo: 500KB
- Formatos permitidos: JPG, JPEG, PNG
- Conversión automática a base64

### Cédula de Identidad
- Formato: 10-13 dígitos
- Solo números permitidos
- Validación en frontend y backend

### Edad del Jugador
- Mínimo 5 años de edad
- Validación automática en frontend

### Número de Camiseta
- Debe ser mayor a 0
- Campo requerido 