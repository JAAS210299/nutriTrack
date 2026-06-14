-- Este archivo se ejecuta automáticamente la primera vez que MariaDB arranca.
-- TypeORM con synchronize:true creará las tablas, pero aquí puedes añadir
-- configuración de charset o datos iniciales si lo necesitas.

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Charset por defecto para la base de datos
ALTER DATABASE nutritrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
