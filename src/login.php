<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$password = isset($_POST['password']) ? $_POST['password'] : null;

if (!$email || !$password) {
  echo json_encode(["success" => false, "message" => "Email and password are required."]);
  exit;
}

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
  echo json_encode(["success" => false, "message" => "User not found."]);
  exit;
}
$stmt->bind_result($id, $hash);
$stmt->fetch();
$stmt->close();

if (password_verify($password, $hash)) {
  echo json_encode(["success" => true, "message" => "Login successful."]);
} else {
  echo json_encode(["success" => false, "message" => "Incorrect password."]);
}

$conn->close();
?>
