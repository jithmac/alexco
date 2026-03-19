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

$tables = ['users', 'products', 'categories', 'roles', 'permissions'];

foreach ($tables as $table) {
    $sql = "SELECT COUNT(*) as count FROM " . $table;
    $result = $conn->query($sql);
    if ($result) {
        $row = $result->fetch_assoc();
        echo $table . ": " . $row['count'] . " rows\n";
    } else {
        echo $table . ": Error or table missing\n";
    }
}

$conn->close();
?>