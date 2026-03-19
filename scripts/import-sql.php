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

$sql = file_get_contents('seed-data.sql');

if (!$sql) {
    die("Error reading seed-data.sql");
}

// execute multi query
if ($conn->multi_query($sql)) {
    do {
        /* store first result set */
        if ($result = $conn->store_result()) {
            while ($row = $result->fetch_row()) {
                // printf("%s\n", $row[0]);
            }
            $result->free();
        }
        /* print divider */
        if ($conn->more_results()) {
            // printf("-----------------\n");
        }
    } while ($conn->next_result());
    echo "SQL Import Successful\n";
} else {
    echo "Error: " . $conn->error . "\n";
}

$conn->close();
?>