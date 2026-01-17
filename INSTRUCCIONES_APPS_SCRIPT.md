# 📘 Instrucciones de Actualización - Google Apps Script

## 🚀 Pasos para Actualizar el Apps Script

### 1. Acceder a Google Apps Script

1. Abre tu Google Spreadsheet (ID: `1aa2uX6gqHINUP_h-HcNsxJzlwSI1OnSVzqMaFaI_8NE`)
2. Ve a **Extensiones → Apps Script**
3. Verás el editor de código

### 2. Reemplazar el Código

1. Selecciona todo el contenido actual de `Code.gs`
2. Bórralo completamente
3. Copia todo el contenido del archivo `Code.gs` que se encuentra en este repositorio
4. Pégalo en el editor

### 3. Guardar y Desplegar

1. Haz clic en el icono de **💾 Guardar** (o `Ctrl+S`)
2. Ve a **Implementar → Nueva implementación**
3. Selecciona tipo: **Aplicación web**
4. Configuración:
   - **Descripción**: "Sistema Gestión Expedientes v2.0"
   - **Ejecutar como**: Tu cuenta
   - **Quien tiene acceso**: Cualquier persona
5. Haz clic en **Implementar**
6. Copia la **URL de la aplicación web** (necesitarás actualizarla en el HTML si cambió)

### 4. Inicializar la Hoja (IMPORTANTE)

1. En el editor de Apps Script, selecciona la función `inicializarHoja` del menú desplegable
2. Haz clic en **▶️ Ejecutar**
3. Autoriza los permisos si te lo solicita
4. Verifica en tu hoja de cálculo que se crearon los encabezados correctamente

La función creará automáticamente:
- 15 columnas con encabezados formateados
- Fondo verde oscuro (#1e5a3e) con texto blanco
- Primera fila congelada
- Anchos de columna optimizados

---

## 📋 Estructura Actualizada del Spreadsheet

Tu hoja "Informes" ahora tendrá estas columnas:

| Col | Nombre          | Descripción                              |
|-----|-----------------|------------------------------------------|
| A   | Timestamp       | Fecha y hora de registro                 |
| B   | NumInforme      | Número de informe generado (EA-AAMM-NOM) |
| C   | TipoOrden       | OT o OTB                                 |
| D   | OT              | Número de orden de trabajo               |
| E   | NOM             | Código de NOM (011, 022, 025, etc.)      |
| F   | Cliente         | Razón social del cliente                 |
| G   | Solicitante     | Nombre del solicitante                   |
| H   | RFC             | RFC del cliente                          |
| I   | Telefono        | Teléfono de contacto                     |
| J   | Direccion       | Dirección del centro de trabajo          |
| K   | FechaServicio   | Fecha de emisión de OT                   |
| L   | FechaEntrega    | Fecha compromiso de entrega (+15 días)   |
| M   | EsCapacitacion  | SI o NO (para OTB-CAP)                   |
| N   | Estatus         | EN PROCESO / FINALIZADO / CANCELADO      |
| O   | LinkDrive       | URL de la carpeta en Drive               |

---

## 🆕 Nuevas Funcionalidades del Apps Script

### 1. Acción: `createExpediente` (POST)

**Cambios principales:**
- ✅ Acepta el `numInforme` ya generado desde el frontend
- ✅ Guarda el `tipoOrden` (OT o OTB)
- ✅ Guarda todos los campos adicionales: solicitante, RFC, teléfono, dirección
- ✅ Maneja la categoría `PERFIL_DATOS` para guardar el Excel
- ✅ Crea 4 subcarpetas organizadas:
  - `1. ORDEN_TRABAJO`
  - `2. PERFIL_DATOS`
  - `3. HOJAS_CAMPO`
  - `4. CROQUIS_PLANOS`
- ✅ Valida que exista OT, numInforme, archivo ORDEN_TRABAJO y PERFIL_DATOS

**Payload esperado:**
```json
{
  "action": "createExpediente",
  "data": {
    "ot": "OT25-0106-001",
    "numInforme": "EA-2501-011",
    "tipoOrden": "OT",
    "nom": "011",
    "cliente": "Empresa SA de CV",
    "solicitante": "Juan Pérez",
    "rfc": "EMP123456ABC",
    "telefono": "5512345678",
    "direccion": "Calle Principal 123",
    "fecha": "2025-01-15",
    "entrega": "2025-01-30",
    "esCapacitacion": false
  },
  "files": [
    {
      "name": "OT-001.pdf",
      "type": "application/pdf",
      "content": "base64string...",
      "category": "ORDEN_TRABAJO"
    },
    {
      "name": "Perfil.xlsx",
      "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content": "base64string...",
      "category": "PERFIL_DATOS"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "numInforme": "EA-2501-011",
  "tipoOrden": "OT",
  "ot": "OT25-0106-001",
  "fechaEntrega": "2025-01-30",
  "driveLink": "https://drive.google.com/..."
}
```

---

### 2. Acción: `updateEstatus` (POST) - ¡NUEVA!

Permite cambiar el estatus de un expediente desde el tablero.

**Payload:**
```json
{
  "action": "updateEstatus",
  "ot": "OT25-0106-001",
  "estatus": "FINALIZADO"
}
```

**Estatus válidos:**
- `EN PROCESO`
- `FINALIZADO`
- `CANCELADO`

**Respuesta:**
```json
{
  "success": true,
  "message": "Estatus actualizado a 'FINALIZADO' para OT: OT25-0106-001",
  "ot": "OT25-0106-001",
  "estatus": "FINALIZADO"
}
```

---

### 3. Acción: `getTablero` (GET) - Actualizada

Retorna todos los expedientes con los campos nuevos.

**URL:**
```
https://script.google.com/macros/s/TU_SCRIPT_ID/exec?action=getTablero&callback=miCallback
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-01-15 10:30:00",
      "numInforme": "EA-2501-011",
      "tipoOrden": "OT",
      "ot": "OT25-0106-001",
      "nom": "011",
      "cliente": "Empresa SA",
      "solicitante": "Juan Pérez",
      "rfc": "EMP123456ABC",
      "telefono": "5512345678",
      "direccion": "Calle Principal 123",
      "fecha": "2025-01-15",
      "fechaEntrega": "2025-01-30",
      "esCapacitacion": "NO",
      "estatus": "EN PROCESO",
      "linkDrive": "https://drive.google.com/..."
    }
  ]
}
```

---

## 🛠️ Funciones de Utilidad

### `inicializarHoja()`

Crea los encabezados en la hoja de cálculo si no existen.

**Cómo ejecutarla:**
1. Selecciona `inicializarHoja` en el menú de funciones
2. Haz clic en ▶️ Ejecutar
3. Autoriza permisos si es necesario

### `obtenerEstadisticas()`

Muestra estadísticas del sistema en los logs.

**Cómo ejecutarla:**
1. Selecciona `obtenerEstadisticas` en el menú de funciones
2. Haz clic en ▶️ Ejecutar
3. Ve a **Ver → Registros** para ver las estadísticas

**Ejemplo de salida:**
```
📊 ESTADÍSTICAS DEL SISTEMA
═══════════════════════════
Total de expedientes: 45
  - OT (Serie Regular): 32
  - OTB (Serie Independiente): 13
  - Con Capacitación: 5

Por Estatus:
  - En Proceso: 12
  - Finalizados: 28
  - Cancelados: 5
```

---

## 🔒 Seguridad y Concurrencia

El script utiliza `LockService.getScriptLock()` para evitar conflictos cuando múltiples usuarios envían datos simultáneamente.

- **Tiempo de espera**: 30 segundos
- **Operaciones protegidas**: `createExpediente` y `updateEstatus`

---

## 📝 Migración de Datos Existentes

Si ya tienes datos en la hoja con la estructura antigua:

1. **Exporta** los datos actuales como respaldo
2. **Crea** una nueva hoja temporal
3. **Ejecuta** `inicializarHoja()` en la hoja "Informes"
4. **Migra** manualmente los datos o usa un script de migración

### Script de Migración (Opcional)

```javascript
function migrarDatosAntiguos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const oldSheet = ss.getSheetByName('Informes_OLD'); // Renombra tu hoja antigua
  const newSheet = ss.getSheetByName(SHEET_NAME);

  if (!oldSheet || !newSheet) {
    Logger.log('❌ Verifica que existan las hojas');
    return;
  }

  const oldData = oldSheet.getRange(2, 1, oldSheet.getLastRow() - 1, 9).getValues();

  oldData.forEach(row => {
    newSheet.appendRow([
      row[0],        // A: Timestamp (mantener)
      row[1],        // B: NumInforme (mantener)
      row[2].includes('OTB') ? 'OTB' : 'OT', // C: TipoOrden (detectar)
      row[2],        // D: OT (mantener)
      row[3],        // E: NOM (mantener)
      row[4],        // F: Cliente (mantener)
      '',            // G: Solicitante (vacío)
      '',            // H: RFC (vacío)
      '',            // I: Telefono (vacío)
      '',            // J: Direccion (vacío)
      row[5],        // K: FechaServicio (mantener)
      row[6],        // L: FechaEntrega (mantener)
      'NO',          // M: EsCapacitacion (por defecto NO)
      row[7],        // N: Estatus (mantener)
      row[8]         // O: LinkDrive (mantener)
    ]);
  });

  Logger.log('✅ Migración completada');
}
```

---

## ✅ Checklist de Implementación

- [ ] Código del Apps Script actualizado
- [ ] Nueva implementación creada
- [ ] URL de la aplicación web verificada en el HTML
- [ ] Función `inicializarHoja()` ejecutada
- [ ] Encabezados verificados en el spreadsheet
- [ ] Permisos autorizados correctamente
- [ ] Prueba de crear expediente desde el HTML
- [ ] Prueba de cambiar estatus desde el tablero
- [ ] Prueba de filtros y búsqueda
- [ ] Prueba de exportar a Excel
- [ ] Verificar que se crean las 4 subcarpetas en Drive
- [ ] Verificar que el perfil de datos se guarda correctamente

---

## 🐛 Solución de Problemas

### Error: "No se ha cargado ningún perfil de datos"

- **Causa**: No se seleccionó el Excel en el PASO 1
- **Solución**: Cargar el archivo Excel antes de enviar

### Error: "El número de OT no tiene un formato válido"

- **Causa**: El número no empieza con "OT" o "OTB"
- **Solución**: Usar formato correcto: `OT25-0106-001` o `OTB25-0106-001`

### Error: "No existe la hoja 'Informes'"

- **Causa**: La hoja no se ha creado en el Spreadsheet
- **Solución**: Ejecutar función `inicializarHoja()` desde Apps Script

### El estatus no se actualiza

- **Causa**: La acción `updateEstatus` no está implementada
- **Solución**: Verificar que el código del Apps Script esté actualizado

### Los archivos no se guardan en Drive

- **Causa**: Permisos insuficientes o error en la conversión base64
- **Solución**:
  - Verificar permisos de Drive
  - Revisar logs en Apps Script → Ver → Registros

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los **Logs** en Apps Script (Ver → Registros)
2. Verifica la **consola del navegador** (F12) para errores JavaScript
3. Ejecuta `obtenerEstadisticas()` para verificar el estado del sistema

---

**Versión**: 2.0
**Última actualización**: 2025-01-17
**Compatibilidad**: Google Apps Script, Google Sheets, Google Drive
