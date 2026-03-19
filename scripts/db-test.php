<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');

$servername = "127.0.0.1";
$username = "u624100610_alexco2";
$password = "ZXas1234za";
$dbname = "u624100610_alexco2";
$port = 3306;

echo "<h1>Database Diagnostic Tool v2</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Check if mysqli is loaded
if (!extension_loaded('mysqli')) {
  die("<p style='color:red; font-weight:bold'>❌ Critical Error: 'mysqli' extension is not loaded.</p>");
}

echo "<p>Attempting connection...</p>";

try {
  // Create connection
  mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
  $conn = new mysqli($servername, $username, $password, $dbname, $port);
  echo "<p style='color:green; font-weight:bold'>✅ Connected successfully to database: " . $dbname . "</p>";
} catch (mysqli_sql_exception $e) {
  die("<p style='color:red; font-weight:bold'>❌ Connection Failed: " . $e->getMessage() . "</p>");
} catch (Exception $e) {
  die("<p style='color:red; font-weight:bold'>❌ General Error: " . $e->getMessage() . "</p>");
}

// Show tables check
$sql = "SHOW TABLES";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  echo "<h3>Tables Found: " . $result->num_rows . "</h3>";

  // Check products specifically
  $prod_sql = "SELECT COUNT(*) as count FROM products";
  $prod_result = $conn->query($prod_sql);
  if ($prod_result) {
    $row = $prod_result->fetch_assoc();
    echo "<h3>Product Count: " . $row['count'] . "</h3>";

    if ($row['count'] > 0) {
      echo "<p style='color:green'>✅ Products data exists in the database.</p>";

      // Show first 5 products
      echo "<h4>First 5 Products:</h4><ul>";
      $preview = $conn->query("SELECT name, sku FROM products LIMIT 5");
      while ($p = $preview->fetch_assoc()) {
        echo "<li>" . $p['name'] . " (" . $p['sku'] . ")</li>";
      }
      echo "</ul>";

    } else {
      echo "<p style='color:orange'>⚠️ Products table exists but is empty.</p>";
    }
  } else {
    echo "<p style='color:red'>❌ Could not query products table.</p>";
  }

} else {
  echo "<p style='color:red'>❌ 0 tables found. Database is empty.</p>";
}

$conn->close();
?>