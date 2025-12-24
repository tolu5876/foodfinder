<?php
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "foodfindar";

// Create connection
$conn = new mysqli($servername, $useremail, $number, $password);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
// echo "Connected successfully";

// Create database
$sql = "CREATE DATABASE myDB";
if ($conn->query($sql) === TRUE) {
  echo "Database created successfully";
} else {
  echo "Error creating database: " . $conn->error;
}
$conn->close();
?>
