# 📁 Sistema de Gestión de Expedientes - Ejecutiva Ambiental

Sistema web completo para la gestión de expedientes de servicios ambientales, con generación automática de números de informe, detección de tipos de orden (OT/OTB), y gestión de estatus en tiempo real.

![Versión](https://img.shields.io/badge/versi%C3%B3n-2.0-brightgreen)
![Estado](https://img.shields.io/badge/estado-producción-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-yellow)

---

## 🌟 Características Principales

### 🔍 Detección Automática
- **Tipo de Orden**: Detecta automáticamente OT vs OTB
- **Número de Informe**: Genera formato `EA-AAMM-NOM` o `EA-AAMM-NOM-CAP`
- **Series Independientes**: OT y OTB tienen numeración separada

### 📋 Gestión Completa de Expedientes
- **Formulario Inteligente**: Extrae datos del Perfil de Datos (Excel)
- **Múltiples Archivos**: Soporta varias hojas de campo y croquis
- **Validaciones**: Campos obligatorios y formatos correctos
- **Organización**: 4 subcarpetas automáticas en Google Drive

### 📊 Tablero de Control
- **Cambio de Estatus**: Editable directamente desde el tablero
- **Filtros Avanzados**: Búsqueda, estatus y NOM
- **Exportación**: Descarga a Excel con un clic
- **Tiempo Real**: Actualización instantánea de datos

### 🎨 Interfaz Moderna
- **Responsive Design**: Compatible con PC, tablet y móvil
- **Feedback Visual**: Indicadores claros de estado
- **Colores Distintivos**: Por tipo de orden y estatus
- **Experiencia Fluida**: Sin recargas innecesarias

---

## 📸 Capturas de Pantalla

### Formulario de Nuevo Expediente
```
┌──────────────────────────────────────────────┐
│ ✨ MEJORAS DEL SISTEMA                       │
│ • Detección automática OT/OTB                │
│ • Generación automática de N° de Informe     │
│ • Perfil de Datos se adjunta automáticamente │
└──────────────────────────────────────────────┘

📗 PASO 1: IMPORTAR PERFIL DE DATOS
[Seleccionar archivo Excel...]

📝 PASO 2: VERIFICAR INFORMACIÓN
OT: [OT25-0106-001____________] Tipo: OT (Serie Regular)
NOM: [011 - Ruido ▼]            ☐ ¿Es Capacitación?
N° Informe: EA-2501-011

📂 PASO 3: ADJUNTAR DOCUMENTACIÓN
OT Firmada: [Seleccionar PDF...]
Hojas Campo: [Múltiples archivos...]
Croquis:     [Múltiples archivos...]

[🚀 GENERAR EXPEDIENTE EN DRIVE]
```

### Tablero de Informes
```
┌────────────────────────────────────────────────────────────┐
│ 🔍 EXPEDIENTES RECIENTES        [📥 EXPORTAR A EXCEL]      │
├────────────────────────────────────────────────────────────┤
│ Buscar: [____________] Estatus:[Todos ▼] NOM:[Todas ▼]    │
├────────────────────────────────────────────────────────────┤
│ N° Informe  │ Tipo │ OT         │ Cliente    │ Estatus    │
├─────────────┼──────┼────────────┼────────────┼────────────┤
│ EA-2501-011 │ OT   │ OT25-01... │ Empresa SA │[Proceso ▼] │
│ EA-2501-022 │ OTB  │ OTB25-01...│ Cliente XY │[Final.. ▼] │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Cuenta de Google (Gmail)
- Acceso a Google Drive
- Acceso a Google Sheets
- Navegador web moderno (Chrome, Firefox, Edge)

### Instalación

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/yoeduwin/informes.git
cd informes
```

#### 2. Configurar Google Apps Script
```
1. Abre Google Sheets (ID: 1aa2uX6gqHINUP_h-HcNsxJzlwSI1OnSVzqMaFaI_8NE)
2. Ve a Extensiones → Apps Script
3. Copia el contenido de Code.gs
4. Pégalo en el editor
5. Guarda (Ctrl+S)
6. Implementar → Nueva implementación
   - Tipo: Aplicación web
   - Ejecutar como: Tu cuenta
   - Acceso: Cualquier persona
7. Copia la URL de la aplicación web
```

#### 3. Inicializar la Hoja de Cálculo
```
1. En Apps Script, selecciona: inicializarHoja
2. Ejecuta (▶️)
3. Autoriza permisos
4. Verifica que se crearon los encabezados
```

#### 4. Configurar el HTML (si cambió la URL)
```javascript
// En index.html, línea 322
const SCRIPT_URL = 'TU_URL_AQUI';
```

#### 5. Abrir la Aplicación
```
Abre index.html en tu navegador
```

---

## 📚 Documentación

### Guías Disponibles

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| 📘 **Instrucciones Apps Script** | Guía completa de implementación del backend | [Ver](INSTRUCCIONES_APPS_SCRIPT.md) |
| 📊 **Resumen de Mejoras** | Lista detallada de todas las funcionalidades | [Ver](RESUMEN_MEJORAS.md) |
| 🔧 **Code.gs** | Código fuente del Google Apps Script | [Ver](Code.gs) |

### Estructura de Archivos

```
informes/
├── index.html                      # Aplicación web principal
├── Code.gs                         # Google Apps Script
├── INSTRUCCIONES_APPS_SCRIPT.md   # Guía de implementación
├── RESUMEN_MEJORAS.md             # Resumen ejecutivo
└── README.md                       # Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables y animaciones
- **JavaScript ES6+**: Async/await, módulos, arrow functions
- **XLSX.js**: Librería para exportar Excel

### Backend
- **Google Apps Script**: Lógica de servidor
- **Google Sheets API**: Base de datos
- **Google Drive API**: Almacenamiento de archivos

### Integraciones
- **Fetch API**: Comunicación con el servidor
- **JSONP**: Lectura de datos (compatibilidad CORS)

---

## 📋 Uso del Sistema

### Crear un Nuevo Expediente

1. **Cargar Perfil de Datos**
   - Selecciona el archivo Excel del cliente
   - El sistema extrae automáticamente: solicitante, cliente, RFC, teléfono, dirección

2. **Completar Información**
   - Ingresa el número de OT (ej: `OT25-0106-001` o `OTB25-0106-001`)
   - El sistema detecta el tipo y genera el número de informe
   - Selecciona la NOM o servicio
   - Marca si es capacitación (para OTB)
   - Verifica los datos del cliente
   - Ingresa la fecha de emisión de OT

3. **Adjuntar Archivos**
   - OT firmada (PDF) - **obligatorio**
   - Hojas de campo (múltiples) - opcional
   - Croquis/planos (múltiples) - opcional
   - El perfil de datos se adjunta automáticamente

4. **Generar Expediente**
   - Haz clic en "🚀 GENERAR EXPEDIENTE EN DRIVE"
   - El sistema crea:
     - Carpeta en Drive con 4 subcarpetas
     - Registro en Google Sheets
     - Número de informe único

### Gestionar Expedientes en el Tablero

1. **Ver Expedientes**
   - Haz clic en "📊 TABLERO DE INFORMES"
   - Se cargan todos los expedientes

2. **Buscar y Filtrar**
   - Usa la barra de búsqueda para encontrar por OT, cliente o número
   - Filtra por estatus o NOM
   - Limpia filtros con el botón 🔄

3. **Cambiar Estatus**
   - Haz clic en el dropdown de estatus de cualquier fila
   - Selecciona: EN PROCESO, FINALIZADO o CANCELADO
   - Confirma el cambio

4. **Exportar Datos**
   - Haz clic en "📥 EXPORTAR A EXCEL"
   - Se descarga un archivo con todos los expedientes

5. **Acceder a Carpeta Drive**
   - Haz clic en "📁 Ver" en la columna de acciones
   - Se abre la carpeta del expediente en Drive

---

## 🔧 Configuración

### Variables de Configuración

En `Code.gs`:
```javascript
const SPREADSHEET_ID = '1aa2uX6gqHINUP_h-HcNsxJzlwSI1OnSVzqMaFaI_8NE';
const SHEET_NAME     = 'Informes';
const ROOT_FOLDER_ID = '1kd13FVLhy7xQX7M9QrkKNB33DlIWHzGb';
```

En `index.html`:
```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';
```

### Estructura del Spreadsheet

| Columna | Nombre | Tipo | Descripción |
|---------|--------|------|-------------|
| A | Timestamp | Fecha/Hora | Fecha de registro |
| B | NumInforme | Texto | EA-AAMM-NOM(-CAP) |
| C | TipoOrden | Texto | OT o OTB |
| D | OT | Texto | Número de orden |
| E | NOM | Texto | Código de norma |
| F | Cliente | Texto | Razón social |
| G | Solicitante | Texto | Nombre del solicitante |
| H | RFC | Texto | RFC del cliente |
| I | Telefono | Texto | Teléfono |
| J | Direccion | Texto | Dirección |
| K | FechaServicio | Fecha | Fecha de emisión OT |
| L | FechaEntrega | Fecha | Fecha compromiso |
| M | EsCapacitacion | Texto | SI/NO |
| N | Estatus | Texto | Estado actual |
| O | LinkDrive | URL | Enlace a carpeta |

---

## 🐛 Solución de Problemas

### Error: "No se ha cargado ningún perfil de datos"
**Solución**: Carga el archivo Excel en el PASO 1 antes de enviar

### Error: "El número de OT no tiene un formato válido"
**Solución**: Usa formato `OT##-####-###` o `OTB##-####-###`

### El tablero no carga datos
**Solución**:
1. Verifica que la hoja "Informes" existe
2. Ejecuta `inicializarHoja()` desde Apps Script
3. Revisa la consola del navegador (F12) para errores

### Los archivos no se guardan en Drive
**Solución**:
1. Verifica permisos de Drive en Apps Script
2. Revisa los logs: Apps Script → Ver → Registros
3. Confirma que ROOT_FOLDER_ID es correcto

### Más ayuda
Consulta [INSTRUCCIONES_APPS_SCRIPT.md](INSTRUCCIONES_APPS_SCRIPT.md) sección "Solución de Problemas"

---

## 📊 Estadísticas del Sistema

Para ver estadísticas:
```
1. Abre Apps Script
2. Selecciona: obtenerEstadisticas
3. Ejecuta (▶️)
4. Ve a: Ver → Registros
```

Muestra:
- Total de expedientes
- Desglose OT vs OTB
- Expedientes con capacitación
- Expedientes por estatus

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Changelog

### Versión 2.0 (2025-01-17)
- ✨ Detección automática de tipo OT/OTB
- ✨ Generación automática de número de informe
- ✨ Sistema de cambio de estatus en tablero
- ✨ Soporte para múltiples archivos
- ✨ Perfil de datos se adjunta automáticamente
- ✨ Filtros avanzados y búsqueda
- ✨ Exportación a Excel
- ✨ Validaciones completas
- ✨ Interfaz responsive
- ✨ 15 campos de datos (vs 9)
- 🔧 Apps Script completamente renovado
- 📚 Documentación completa

### Versión 1.0 (2025-01-10)
- 🎉 Versión inicial
- 📝 Formulario básico
- 📊 Tablero simple
- 📁 Creación de carpetas en Drive
- 📋 Registro en Sheets

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Ejecutiva Ambiental** - Ingeniería, Seguridad e Higiene Industrial
- **Desarrollador Principal** - [yoeduwin](https://github.com/yoeduwin)

---

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@ejecutivaambiental.com
- 🐛 Issues: [GitHub Issues](https://github.com/yoeduwin/informes/issues)
- 📖 Docs: Ver archivos `.md` en este repositorio

---

## 🙏 Agradecimientos

- Google Apps Script por la plataforma
- XLSX.js por la librería de Excel
- Comunidad de desarrolladores de Google Apps Script

---

## 🔗 Enlaces Útiles

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Drive API](https://developers.google.com/drive)
- [XLSX.js GitHub](https://github.com/SheetJS/sheetjs)

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Made with ❤️ by Ejecutiva Ambiental

</div>
