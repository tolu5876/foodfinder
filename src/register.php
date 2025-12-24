<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$firstname = isset($_POST['firstname']) ? trim($_POST['firstname']) : null;
$lastname = isset($_POST['lastname']) ? trim($_POST['lastname']) : null;
$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : null;
$gender = isset($_POST['gender']) ? trim($_POST['gender']) : null;
$country = isset($_POST['country']) ? trim($_POST['country']) : null;
$password = isset($_POST['password']) ? $_POST['password'] : null;

if (!$email || !$password) {
  echo json_encode(["success" => false, "message" => "Email and password are required."]);
  exit;
}

// basic email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(["success" => false, "message" => "Invalid email address."]);
  exit;
}

// check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "User with that email already exists."]);
  exit;
}
$stmt->close();

// hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$insert = $conn->prepare("INSERT INTO users (firstname, lastname, email, phone, gender, country, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
$insert->bind_param('sssssss', $firstname, $lastname, $email, $phone, $gender, $country, $passwordHash);
if ($insert->execute()) {
  echo json_encode(["success" => true, "message" => "Registration successful."]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to register user."]);
}
$insert->close();
$conn->close();
?>
