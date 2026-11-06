import { Sequelize } from 'sequelize';

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      folio VARCHAR(20) NOT NULL UNIQUE,
      tipo_procedimiento VARCHAR(50) NOT NULL,
      asunto VARCHAR(255) NOT NULL,
      categoria VARCHAR(150) NULL,
      descripcion TEXT NULL,
      id_dependencia INT NULL,
      id_unidad_administrativa INT NULL,
      rfc_solicitante VARCHAR(13) NULL,
      nombre_solicitante VARCHAR(255) NULL,
      correo_solicitante VARCHAR(150) NULL,
      extension_solicitante VARCHAR(20) NULL,
      numero_oficio_turno VARCHAR(100) NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'nuevo',
      rfc_asignado VARCHAR(13) NULL,
      fecha_programada DATETIME NULL,
      modalidad_lugar VARCHAR(150) NULL,
      ruta_acta VARCHAR(255) NULL,
      comentarios_cierre TEXT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_directorio_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL UNIQUE,
      subtipo VARCHAR(20) NULL,
      nombre_completo_entrante VARCHAR(255) NULL,
      cargo_puesto VARCHAR(150) NULL,
      correo_institucional VARCHAR(150) NULL,
      telefono_extension VARCHAR(20) NULL,
      ruta_oficio_designacion VARCHAR(255) NULL,
      CONSTRAINT fk_tdd_ticket FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_baja_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL UNIQUE,
      dictamen_procedencia VARCHAR(20) NULL,
      programacion_traslado TEXT NULL,
      CONSTRAINT fk_tbd_ticket FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_transferencia_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL UNIQUE,
      id_solicitud_transferencia BIGINT UNSIGNED NULL,
      CONSTRAINT fk_ttd_ticket FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
      CONSTRAINT fk_ttd_solicitud FOREIGN KEY (id_solicitud_transferencia) REFERENCES solicitudes_transferencia(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_prestamo_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL UNIQUE,
      id_solicitud_consulta BIGINT UNSIGNED NULL,
      tipo_solicitud VARCHAR(20) NULL,
      persona_habilitada VARCHAR(255) NULL,
      CONSTRAINT fk_tpd_ticket FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
      CONSTRAINT fk_tpd_solicitud FOREIGN KEY (id_solicitud_consulta) REFERENCES solicitudes_consulta(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_historial (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL,
      rfc_actor VARCHAR(13) NULL,
      rol_actor VARCHAR(50) NULL,
      accion VARCHAR(255) NOT NULL,
      estado_resultante VARCHAR(30) NULL,
      created_at DATETIME NOT NULL,
      CONSTRAINT fk_th_ticket FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}
