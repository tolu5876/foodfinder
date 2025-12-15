<?php
// send_reset.php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $code = rand(100000, 999999); // Generate a 6-digit code
        // You should save this code in your database for later verification
        $subject = "Your FoodieFindr Password Reset Code";
        $message = "Your password reset code is: $code";
        $headers = "From: no-reply@foodiefindr.com";
        // Send the email
        if (mail($email, $subject, $message, $headers)) {
            echo json_encode(['success' => true, 'message' => 'Reset code sent!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to send email.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?>
