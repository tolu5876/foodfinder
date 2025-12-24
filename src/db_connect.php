<?php
/**
 * Database connection helper (PDO)
 *
 * Usage:
 *   require_once __DIR__ . '/db_connect.php';
 *   $pdo = getPDO();
 *
 * Configure using environment variables (recommended):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
 *
 * If environment variables are not set, sensible defaults are used for
 * local development (adjust as needed for production/XAMPP/etc.).
 */

declare(strict_types=1);

// Do not display errors in production; they are logged instead
ini_set('display_errors', '0');

$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'foodfinder';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

function getPDO(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;

    $dsn = sprintf('mysql:host=%s;port=%s;charset=utf8mb4', $DB_HOST, $DB_PORT);

    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);

        // Ensure database exists and use it
        $pdo->exec(sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", $DB_NAME));
        $pdo->exec(sprintf("USE `%s`", $DB_NAME));

        // Create users table if it doesn't exist (idempotent)
        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) DEFAULT NULL,
  lastname VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQL
        );

        return $pdo;
    } catch (PDOException $e) {
        // Log the real error for the administrator
        error_log('Database error: ' . $e->getMessage());

        // If running via HTTP return a minimal JSON error and stop.
        if (php_sapi_name() !== 'cli') {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Internal server error (database).']);
            exit;
        }

        // In CLI mode rethrow so developer can see the stack trace
        throw $e;
    }
}

// Provide a convenient variable for legacy code that expects $conn/$pdo
$pdo = getPDO();

?>
