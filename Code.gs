// Code.gs (Google Apps Script) — VERSIÓN MEJORADA CON OT/OTB, ESTATUS Y CAMPOS ADICIONALES

const SPREADSHEET_ID = '1aa2uX6gqHINUP_h-HcNsxJzlwSI1OnSVzqMaFaI_8NE';
const SHEET_NAME     = 'Informes';
const ROOT_FOLDER_ID = '1kd13FVLhy7xQX7M9QrkKNB33DlIWHzGb';

// Estructura actualizada en la hoja (fila 1 como encabezados):
// A: Timestamp
// B: NumInforme
// C: TipoOrden (OT/OTB)
// D: OT
// E: NOM
// F: Cliente
// G: Solicitante
// H: RFC
// I: Telefono
// J: Direccion
// K: FechaServicio
// L: FechaEntrega
// M: EsCapacitacion (SI/NO)
// N: Estatus
// O: LinkDrive

function doGet(e) {
  const action   = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : '';
  const callback = (e && e.parameter && e.parameter.callback) ? String(e.parameter.callback) : '';

  try {
    if (action === 'getTablero') {
      const res = getTableroSafe_();
      return output_(res, callback);
    }
    return output_({
      success: true,
      message: 'Web App OK',
      actions: ['getTablero (GET)', 'createExpediente (POST)', 'updateEstatus (POST)']
    }, callback);
  } catch (err) {
    return output_({ success: false, error: 'doGet fatal: ' + err.message, data: [] }, callback);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return output_({ success: false, error: 'Sin postData.contents' });
    }
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'createExpediente') {
      const res = createExpedienteSafe_(data);
      return output_(res);
    }

    if (data.action === 'updateEstatus') {
      const res = updateEstatusSafe_(data);
      return output_(res);
    }

    return output_({ success: false, error: 'Acción no soportada: ' + String(data.action) });
  } catch (err) {
    return output_({ success: false, error: 'doPost fatal: ' + err.message });
  }
}

function createExpedienteSafe_(payload) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    const info  = payload.data  || {};
    const files = payload.files || [];

    // Validaciones
    if (!info.ot) return { success: false, error: 'Falta OT.' };
    if (!info.numInforme) return { success: false, error: 'Falta número de informe.' };
    if (!files.length) return { success: false, error: 'No se recibieron archivos.' };
    if (!files.some(f => f.category === 'ORDEN_TRABAJO')) {
      return { success: false, error: 'Falta archivo ORDEN_TRABAJO.' };
    }
    if (!files.some(f => f.category === 'PERFIL_DATOS')) {
      return { success: false, error: 'Falta archivo PERFIL_DATOS.' };
    }

    // Usar el número de informe que ya viene generado del frontend
    const numInforme = info.numInforme;
    const tipoOrden = info.tipoOrden || 'OT'; // OT o OTB

    // 1) Crear carpeta de expediente
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const folderName = `${numInforme} - ${info.ot} - ${(info.cliente || 'SIN_CLIENTE')}`;
    const expedienteFolder = rootFolder.createFolder(folderName);

    // 2) Crear subcarpetas
    const folders = {
      ORDEN_TRABAJO: expedienteFolder.createFolder('1. ORDEN_TRABAJO'),
      PERFIL_DATOS:  expedienteFolder.createFolder('2. PERFIL_DATOS'),
      HOJAS_CAMPO:   expedienteFolder.createFolder('3. HOJAS_CAMPO'),
      CROQUIS:       expedienteFolder.createFolder('4. CROQUIS_PLANOS')
    };

    // 3) Guardar archivos en sus respectivas carpetas
    files.forEach(file => {
      if (!file || !file.content) return;
      try {
        const decoded = Utilities.base64Decode(file.content);
        const blob = Utilities.newBlob(
          decoded,
          file.type || 'application/octet-stream',
          file.name || 'archivo'
        );
        const targetFolder = folders[file.category] || expedienteFolder;
        targetFolder.createFile(blob);
      } catch (err) {
        Logger.log('Error guardando archivo: ' + file.name + ' - ' + err.message);
      }
    });

    // 4) Registrar en Sheets
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return { success: false, error: `No existe la hoja "${SHEET_NAME}".` };

    // Verificar si la fila 1 tiene encabezados, si no, crearlos
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow([
        'Timestamp', 'NumInforme', 'TipoOrden', 'OT', 'NOM', 'Cliente',
        'Solicitante', 'RFC', 'Telefono', 'Direccion', 'FechaServicio',
        'FechaEntrega', 'EsCapacitacion', 'Estatus', 'LinkDrive'
      ]);
    }

    // Agregar registro
    sheet.appendRow([
      new Date(),                           // A: Timestamp
      numInforme,                           // B: NumInforme
      tipoOrden,                            // C: TipoOrden
      info.ot,                              // D: OT
      info.nom || '',                       // E: NOM
      info.cliente || '',                   // F: Cliente
      info.solicitante || '',               // G: Solicitante
      info.rfc || '',                       // H: RFC
      info.telefono || '',                  // I: Telefono
      info.direccion || '',                 // J: Direccion
      info.fecha || '',                     // K: FechaServicio
      info.entrega || '',                   // L: FechaEntrega
      info.esCapacitacion ? 'SI' : 'NO',   // M: EsCapacitacion
      'EN PROCESO',                         // N: Estatus
      expedienteFolder.getUrl()             // O: LinkDrive
    ]);

    return {
      success: true,
      numInforme,
      tipoOrden,
      ot: info.ot,
      fechaEntrega: info.entrega || '',
      driveLink: expedienteFolder.getUrl()
    };

  } catch (err) {
    Logger.log('Error en createExpediente: ' + err.message);
    return { success: false, error: 'createExpediente error: ' + err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function updateEstatusSafe_(data) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    const ot = data.ot;
    const nuevoEstatus = data.estatus;

    if (!ot || !nuevoEstatus) {
      return { success: false, error: 'Faltan parámetros: ot o estatus.' };
    }

    // Validar estatus
    const estatusValidos = ['EN PROCESO', 'FINALIZADO', 'CANCELADO'];
    if (!estatusValidos.includes(nuevoEstatus.toUpperCase())) {
      return { success: false, error: 'Estatus no válido. Usa: EN PROCESO, FINALIZADO o CANCELADO.' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return { success: false, error: `No existe la hoja "${SHEET_NAME}".` };

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: false, error: 'No hay datos en la hoja.' };

    // Buscar la OT en la columna D (columna 4)
    const otRange = sheet.getRange(2, 4, lastRow - 1, 1);
    const otValues = otRange.getDisplayValues().flat();

    const rowIndex = otValues.findIndex(val =>
      String(val || '').trim().toUpperCase() === ot.trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return { success: false, error: 'No se encontró la OT: ' + ot };
    }

    // Actualizar estatus en columna N (columna 14)
    const targetRow = rowIndex + 2; // +2 porque: +1 por índice 0-based, +1 por encabezado
    sheet.getRange(targetRow, 14).setValue(nuevoEstatus.toUpperCase());

    return {
      success: true,
      message: `Estatus actualizado a "${nuevoEstatus}" para OT: ${ot}`,
      ot,
      estatus: nuevoEstatus.toUpperCase()
    };

  } catch (err) {
    Logger.log('Error en updateEstatus: ' + err.message);
    return { success: false, error: 'updateEstatus error: ' + err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getTableroSafe_() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return { success: false, error: `No existe la hoja "${SHEET_NAME}".`, data: [] };

    const values = sheet.getDataRange().getDisplayValues();
    if (values.length <= 1) return { success: true, data: [] };

    // Mapear según la nueva estructura
    const data = values.slice(1).map(r => ({
      timestamp:      r[0],  // A: Timestamp
      numInforme:     r[1],  // B: NumInforme
      tipoOrden:      r[2],  // C: TipoOrden
      ot:             r[3],  // D: OT
      nom:            r[4],  // E: NOM
      cliente:        r[5],  // F: Cliente
      solicitante:    r[6],  // G: Solicitante
      rfc:            r[7],  // H: RFC
      telefono:       r[8],  // I: Telefono
      direccion:      r[9],  // J: Direccion
      fecha:          r[10], // K: FechaServicio
      fechaEntrega:   r[11], // L: FechaEntrega
      esCapacitacion: r[12], // M: EsCapacitacion
      estatus:        r[13], // N: Estatus
      linkDrive:      r[14]  // O: LinkDrive
    })).reverse();

    return { success: true, data };
  } catch (err) {
    Logger.log('Error en getTablero: ' + err.message);
    return { success: false, error: 'getTablero error: ' + err.message, data: [] };
  }
}

function output_(obj, callback) {
  const text = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${text});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Función de prueba para crear encabezados si no existen
 */
function inicializarHoja() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'NumInforme', 'TipoOrden', 'OT', 'NOM', 'Cliente',
      'Solicitante', 'RFC', 'Telefono', 'Direccion', 'FechaServicio',
      'FechaEntrega', 'EsCapacitacion', 'Estatus', 'LinkDrive'
    ]);

    // Formatear encabezados
    const headerRange = sheet.getRange(1, 1, 1, 15);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1e5a3e');
    headerRange.setFontColor('#ffffff');

    // Congelar primera fila
    sheet.setFrozenRows(1);

    // Ajustar ancho de columnas
    sheet.setColumnWidth(1, 150);  // Timestamp
    sheet.setColumnWidth(2, 130);  // NumInforme
    sheet.setColumnWidth(3, 80);   // TipoOrden
    sheet.setColumnWidth(4, 130);  // OT
    sheet.setColumnWidth(5, 80);   // NOM
    sheet.setColumnWidth(6, 200);  // Cliente
    sheet.setColumnWidth(7, 150);  // Solicitante
    sheet.setColumnWidth(8, 120);  // RFC
    sheet.setColumnWidth(9, 100);  // Telefono
    sheet.setColumnWidth(10, 250); // Direccion
    sheet.setColumnWidth(11, 100); // FechaServicio
    sheet.setColumnWidth(12, 100); // FechaEntrega
    sheet.setColumnWidth(13, 100); // EsCapacitacion
    sheet.setColumnWidth(14, 100); // Estatus
    sheet.setColumnWidth(15, 300); // LinkDrive

    Logger.log('✅ Hoja inicializada correctamente');
  } else {
    Logger.log('⚠️ La hoja ya tiene datos');
  }
}

/**
 * Función de utilidad para obtener estadísticas
 */
function obtenerEstadisticas() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('❌ No existe la hoja');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('📊 No hay expedientes registrados');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();

  let totalOT = 0;
  let totalOTB = 0;
  let enProceso = 0;
  let finalizados = 0;
  let cancelados = 0;
  let conCapacitacion = 0;

  data.forEach(row => {
    const tipoOrden = String(row[2]).toUpperCase();
    const estatus = String(row[13]).toUpperCase();
    const esCapacitacion = String(row[12]).toUpperCase();

    if (tipoOrden === 'OTB') totalOTB++;
    else totalOT++;

    if (estatus.includes('PROCESO')) enProceso++;
    else if (estatus.includes('FINALIZADO')) finalizados++;
    else if (estatus.includes('CANCELADO')) cancelados++;

    if (esCapacitacion === 'SI') conCapacitacion++;
  });

  Logger.log('📊 ESTADÍSTICAS DEL SISTEMA');
  Logger.log('═══════════════════════════');
  Logger.log(`Total de expedientes: ${data.length}`);
  Logger.log(`  - OT (Serie Regular): ${totalOT}`);
  Logger.log(`  - OTB (Serie Independiente): ${totalOTB}`);
  Logger.log(`  - Con Capacitación: ${conCapacitacion}`);
  Logger.log('');
  Logger.log('Por Estatus:');
  Logger.log(`  - En Proceso: ${enProceso}`);
  Logger.log(`  - Finalizados: ${finalizados}`);
  Logger.log(`  - Cancelados: ${cancelados}`);
}
