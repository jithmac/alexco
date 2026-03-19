<?php
$servername = "127.0.0.1";
$username = "u624100610_alexco2";
$password = "ZXas1234za";
$dbname = "u624100610_alexco2";
$port = 3306;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully\n";

$sql = "SELECT id, username, email, role, role_id, is_active FROM users";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "User: " . $row["username"] . " | Email: " . $row["email"] . " | Role: " . $row["role"] . " | Active: " . $row["is_active"] . "\n";
    }
} else {
    echo "No users found\n";
}

$conn->close();
?>