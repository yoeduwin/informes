// Code.gs (Google Apps Script) — VERSIÓN MEJORADA CON OT/OTB, ESTATUS Y CAMPOS ADICIONALES

const SPREADSHEET_ID = '1aa2uX6gqHINUP_h-HcNsxJzlwSI1OnSVzqMaFaI_8NE';
const SHEET_NAME     = 'Informes';
const ROOT_FOLDER_ID = '1kd13FVLhy7xQX7M9QrkKNB33DlIWHzGb';

// Configuración del Sheets de órdenes de trabajo
const ORDENES_SPREADSHEET_ID = '1pWIzrtLAh_YHow1LH55tIfgsCUoct-64JjPaBk5u10U';
const ORDENES_SHEET_NAME     = 'PANEL';

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

    if (action === 'getOrdenes') {
      const res = getOrdenesSafe_();
      return output_(res, callback);
    }

    if (action === 'getConsecutivo') {
      const res = getConsecutivoSafe_(e.parameter);
      return output_(res, callback);
    }

    if (action === 'getPerfilFromSheet') {
      const res = getPerfilFromSheetSafe_(e.parameter);
      return output_(res, callback);
    }

    return output_({
      success: true,
      message: 'Web App OK',
      actions: ['getTablero (GET)', 'getOrdenes (GET)', 'getConsecutivo (GET)', 'getPerfilFromSheet (GET)', 'createExpediente (POST)', 'updateEstatus (POST)']
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

    // Perfil de datos puede ser archivo o Google Sheet
    const tienePerfilArchivo = files.some(f => f.category === 'PERFIL_DATOS');
    const tienePerfilSheet = info.perfilSheetId && info.perfilSheetId.trim() !== '';

    if (!tienePerfilArchivo && !tienePerfilSheet) {
      return { success: false, error: 'Falta Perfil de Datos (archivo Excel o Google Sheet).' };
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
      CROQUIS:       expedienteFolder.createFolder('4. CROQUIS_PLANOS'),
      OTROS:         expedienteFolder.createFolder('5. OTROS')
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

    // Si se usó Google Sheet, crear un archivo de texto con el enlace
    if (tienePerfilSheet) {
      try {
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${info.perfilSheetId}`;
        const linkContent = `Perfil de Datos - Google Sheet\n\nEnlace: ${sheetUrl}\n\nID: ${info.perfilSheetId}`;
        const linkBlob = Utilities.newBlob(linkContent, 'text/plain', 'Perfil_GoogleSheet_Link.txt');
        folders.PERFIL_DATOS.createFile(linkBlob);
      } catch (err) {
        Logger.log('Error guardando link de Google Sheet: ' + err.message);
      }
    }

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

function getOrdenesSafe_() {
  try {
    const sheet = SpreadsheetApp.openById(ORDENES_SPREADSHEET_ID).getSheetByName(ORDENES_SHEET_NAME);
    if (!sheet) {
      return { success: false, error: `No existe la hoja "${ORDENES_SHEET_NAME}".`, data: [] };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, data: [] };

    // Leer columnas B (OT), E (Cliente) y Q (Estatus)
    // Columna B = 2, E = 5, Q = 17
    const values = sheet.getRange(2, 1, lastRow - 1, 17).getDisplayValues();

    // Filtrar: no mostrar si columna Q (índice 16) dice "ENTREGADO"
    const ordenes = values
      .filter(row => {
        const estatus = String(row[16] || '').trim().toUpperCase(); // Columna Q
        return estatus !== 'ENTREGADO';
      })
      .map(row => ({
        ot: row[1],      // Columna B (índice 1)
        cliente: row[4]  // Columna E (índice 4)
      }))
      .filter(orden => orden.ot && orden.ot.trim() !== ''); // Solo órdenes con número válido

    return { success: true, data: ordenes };
  } catch (err) {
    Logger.log('Error en getOrdenes: ' + err.message);
    return { success: false, error: 'getOrdenes error: ' + err.message, data: [] };
  }
}

function getConsecutivoSafe_(params) {
  try {
    const anio = params.anio || '';
    const mes = params.mes || '';
    const nom = params.nom || '';
    const tipo = params.tipo || 'OT'; // OT o OTB
    const cap = params.cap === '1';

    if (!anio || !mes || !nom) {
      return { success: false, error: 'Faltan parámetros: anio, mes o nom' };
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return { success: false, error: `No existe la hoja "${SHEET_NAME}".` };
    }

    // Construir prefijo del número de informe
    let prefix = `EA-${anio}${mes}-${nom}`;
    if (tipo === 'OTB' && cap) {
      prefix += '-CAP';
    }

    // Buscar el último consecutivo con este prefijo
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      // Primera vez, consecutivo 0001
      return { success: true, numeroInforme: `${prefix}-0001` };
    }

    // Leer columna B (NumInforme) desde la fila 2
    const values = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues().flat();

    // Filtrar por el prefijo y extraer consecutivos
    const regex = new RegExp(`^${escapeRegex_(prefix)}-(\\d{4})$`);
    let maxConsecutivo = 0;

    values.forEach(val => {
      const match = String(val || '').trim().match(regex);
      if (match) {
        const consecutivo = parseInt(match[1], 10);
        if (consecutivo > maxConsecutivo) {
          maxConsecutivo = consecutivo;
        }
      }
    });

    // Siguiente consecutivo
    const siguiente = String(maxConsecutivo + 1).padStart(4, '0');
    return { success: true, numeroInforme: `${prefix}-${siguiente}` };

  } catch (err) {
    Logger.log('Error en getConsecutivo: ' + err.message);
    return { success: false, error: 'getConsecutivo error: ' + err.message };
  }
}

function escapeRegex_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPerfilFromSheetSafe_(params) {
  try {
    const sheetId = params.sheetId || '';

    if (!sheetId) {
      return { success: false, error: 'Falta el parámetro sheetId' };
    }

    // Intentar abrir el Google Sheet
    let sheet;
    try {
      const ss = SpreadsheetApp.openById(sheetId);
      sheet = ss.getSheets()[0]; // Primera hoja
    } catch (err) {
      return { success: false, error: 'No se pudo acceder al Google Sheet. Verifica que el ID sea correcto y que el sheet sea accesible.' };
    }

    // Leer las mismas celdas que se leen del Excel
    const data = {
      solicitante: sheet.getRange('D3').getDisplayValue(),
      cliente: sheet.getRange('D5').getDisplayValue(),
      rfc: sheet.getRange('D7').getDisplayValue(),
      telefono: sheet.getRange('I7').getDisplayValue(),
      direccion: sheet.getRange('D13').getDisplayValue()  // Cambiado de D11 a D13
    };

    return { success: true, data };
  } catch (err) {
    Logger.log('Error en getPerfilFromSheet: ' + err.message);
    return { success: false, error: 'getPerfilFromSheet error: ' + err.message };
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
