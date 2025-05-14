<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('content-type: application/json');
if (strtolower($_SERVER["REQUEST_METHOD"]) === "options") {
	http_response_code(200);
	return;
}

@parseRequest();

function parseRequest() {

	//mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
	$isDatabaseAction = false;
	$request = json_decode(file_get_contents("php://input"));
	if(!isset($request)) {
		http_response_code(400);
		echo json_encode(array("error"=>"Need to provide a request body."));
		return;
	}

	$username = isset($request->{'username'}) ? $request->{'username'} : false;
	$password = isset($request->{'password'}) ? $request->{'password'} : false;
	$database = isset($request->{'database'}) ? $request->{'database'} : false;
	$colour_id = isset($request->{'colour-id'}) ? $request->{'colour-id'} : false;
	$colour_name = isset($request->{'colour-name'}) ? $request->{'colour-name'} : false;
	$colour_hex = isset($request->{'colour-hex'}) ? $request->{'colour-hex'} : false;
	$new_name = isset($request->{'new-colour-name'}) ? $request->{'new-colour-name'} : false;
	$new_hex = isset($request->{'new-colour-hex'}) ? $request->{'new-colour-hex'} : false;
	$db_action = isset($request->{'database-action'}) ? $request->{'database-action'} : false;

	if(!($username && $password && $database)) {
		http_response_code(400);
		echo json_encode(array("error"=>"Must provide a username, password, and database to connect to (we currently do not support non-Faure databases)."));
		return;
	}

	if($db_action) {
		switch(strtolower($_SERVER["REQUEST_METHOD"])) {
			case "post":
				setup_db($username, $password, $database);
				break;
			case "delete":
				$conn = open_db($username, $password, $database);
				if (!$conn) { return; }
				delete_db($conn);
				$conn->close();
				break;
			default:
				http_response_code(400);
				echo json_encode(array("error"=>"Invalid database-action: can only create or delete."));
		}
		return;
	}

	if ($colour_hex[0]===['#']) {
		 $colour_hex = substr($colour_hex, 1);
	}
	if ($new_hex[0]===['#']) {
		 $new_hex = substr($new_hex, 1);
	}
	$conn = open_db($username, $password, $database);
	if (!$conn) { return; }
	switch(strtolower($_SERVER["REQUEST_METHOD"])) {
		case "post":
			if(!($colour_name && $colour_hex)) {
				get_colours($conn);
			} else {
				$insert_id = add_colour($conn, $colour_name, $colour_hex);
				$return_body = array("colors"=>array());
				array_push($return_body["colors"], array("id"=>$insert_id, "name"=>$colour_name,"hex"=>'#'.$colour_hex));
				echo json_encode($return_body);
			}
			break;
		case "put":
			edit_colour($conn, $colour_id, $colour_name, $colour_hex, $new_name, $new_hex);
			break;
		case "delete":
			delete_colour($conn, $colour_id,  $colour_name, $colour_hex);
			break;
		default:
			http_response_code(405);
			echo json_encode(array("error"=>"Request method ".$_SERVER["REQUEST_METHOD"]." is not supported."));
	}

	$conn->close();
}

function open_server($username, $password, $server="faure") {
	$conn = new mysqli($server, $username, $password);
	if ($conn->connect_error) {
		http_response_code(400);
		echo json_encode(array("error"=>"Connection to database failed: ".$conn->connect_error));
		return false;
	}

	return $conn;
}

function open_db($username, $password, $database, $server="faure") {
	$conn = new mysqli($server, $username, $password, $database);
	if ($conn->connect_error) {
		http_response_code(400);
		echo json_encode(array("error"=>"Connection to database failed: " . $conn->connect_error));
		return false;
	}

	return $conn;
}

function setup_db($username, $password, $database) {
	$conn = open_server($username, $password);
	if (!$conn) { return; }
	$db_exists = $conn->query("select exists (
		select schemata.schema_name 
		from information_schema.schemata 
		where schemata.schema_name='" . $database . "'
	)")->fetch_array()[0];
	if (!$db_exists) {
		create_db($conn, $database);
	}
	$conn->close();

	$conn = open_db($username, $password, $database);
	if (!$conn) { return; }
	$table_exists = $conn->query("select exists (
		select `table_name` 
		from information_schema.tables 
		where `table_name` = 'colours'
	)")->fetch_array()[0];
	if (!$table_exists) {
		create_table($conn, $database);
	}

	$result = $conn->query("select name from `colours`")->fetch_all();
	$return_body = array("colors"=>array());
	switch (count($result)) {
		case 0:
			$insert_id = add_colour($conn, "black", "000000");
			array_push($return_body["colors"], array("id"=>$insert_id, "name"=>"black", "hex"=>"#000000"));
			$insert_id = add_colour($conn, "white", "ffffff");
			array_push($return_body["colors"], array("id"=>$insert_id, "name"=>"white", "hex"=>"#ffffff"));
			break;
		case 1:
			if(isset($result[0][0]) && strtolower($result[0][0])==="white") {
				$insert_id = add_colour($conn, "black", "000000");
				array_push($return_body["colors"], array("id"=>$insert_id, "name"=>"black", "hex"=>"#000000"));
			} else {
				$insert_id = add_colour($conn, "white", "ffffff");
				array_push($return_body["colors"], array("id"=>$insert_id, "name"=>"white", "hex"=>"#ffffff"));
			}
			break;
		default:
			get_colours($conn);
			return;
	}

	$conn->close();
	http_response_code(201);
	echo json_encode($return_body);
}

function create_table($conn) {
	if (!$conn->query("create table colours (
		id int auto_increment primary key, 
		name varchar(256) unique not null, 
		hex char(6) unique not null
	)")) {
		http_response_code(400);
		echo json_encode(array("error"=>"Could not create database: " . $conn->error));
		return;
	}
}

function create_db($conn, $database) {
	$stmt = $conn->prepare("create database ?");
	if (!$stmt) {
		http_response_code(500);
		echo json_encode(array("error"=>"Internal server error"));
		return;
	}
	$stmt->bind_param("s", $database);
	$result = $stmt->execute();
	if (!$result) {
		http_response_code(400);
		echo json_encode(array("error"=>"Database does not exist and could not create one: " . $conn->error));
		return;
	}
}

function delete_db($conn) {
	$stmt = $conn->prepare("drop table `colours`");
	if (!$stmt) {
		http_response_code(500);
		echo json_encode(array("error"=>"Internal server error"));
		return;
	}
	$stmt->bind_param("s", $database);
	$result = $stmt->execute();
	if (!$result) {
		http_response_code(400);
		echo json_encode(array("error"=>"Could not delete database table: " . $conn->error));
		return;
	}
	$conn->close();

	http_response_code(204);
}

function get_colours($conn) {
	$result = $conn->query('select * from colours');
	if ($result) {
		http_response_code(200);
		$return_body = array("colors"=>array());
		while($row = $result->fetch_assoc()) {
			$row["hex"]='#'.$row["hex"];
			array_push($return_body["colors"], $row);
		}
		echo json_encode($return_body);
	} else {
		http_response_code(400);
		echo json_encode(array("error"=>"Could not retreive colours: " . $conn->error));
		return;
	}
}

function add_colour($conn, $colour_name, $colour_hex) {
	if(!$colour_name || !$colour_hex) {
		http_response_code(400);
		echo json_encode(array("error"=>"Must provide a colour-name and a colour-hex value to add a new colour."));
	}

	$stmt = $conn->prepare("insert into `colours` (name, hex) values (?, ?)");
	if (!$stmt) {
		http_response_code(500);
		echo json_encode(array("error"=>"Internal server error"));
		return;
	}
	$stmt->bind_param("ss", $colour_name, $colour_hex);
	$result = $stmt->execute();
	if ($result) {
		http_response_code(201);
		return $stmt->insert_id;
	} else {
		http_response_code(400);
		echo json_encode(array("error"=>"Could not add colour: " . $conn->error . ""));
		return -1;
	}
}

function edit_colour($conn, $colour_id, $colour_name, $colour_hex, $new_name, $new_hex) {
	$selectors = array();
	$select_binders = array();
	if ($colour_id) {
		$selectors[] = "id = ?";
		$select_binders[] = array($colour_id);
	}
	if($colour_name) {
		$selectors[] = "name = ?";
		$select_binders[] = array($colour_name);
	}
	if ($colour_hex) {
		if (isset($selectors[1])) {
			$selectors[1] .= " and hex = ?";
			$select_binders[1][] = $colour_hex;
		} else {
			$selectors[] = "hex = ?";
			$select_binders[] = array($colour_hex);
		}
	}
	if (!$colour_name && !$colour_hex && !colour_id) {
		http_response_code(400);
		echo json_encode(array("error"=>"Must provide a colour-id, colour-name, or colour-hex value to edit an existing colour."));
		return;
	}

	$updates = '';
	$update_binders = array();
	if($new_name) {
		$updates .= "name = ?";
		$update_binders[] = $new_name;
	}
	if ($new_hex) {
		$updates .= $updates==='' ? '' : " and ";
		$updates .= "hex = ?" ;
		$update_binders[] = $new_hex;
	}
	if (!$new_name && !$new_hex) {
		http_response_code(400);
		echo json_encode(array("error"=>"Must provide a new-colour-name and//or a new-colour-hex value to edit the existing colour."));
		return;
	}

	foreach ($selectors as $i => $selector) {
		$binders = $update_binders;
		foreach ($select_binders[$i] as $select_binder) {
			$binders[] = $select_binder;
		}
		$bind_types = '';
		foreach ($binders as $binder) {
			$bind_types .= gettype($binder)==="integer" ? 'i' : 's';
		}

		$stmt = $conn->prepare("update `colours` set $updates where $selectors[$i]");
		if (!$stmt) {
			http_response_code(500);
			echo json_encode(array("error"=>"Internal server error"));
			return;
		}
		$stmt->bind_param($bind_types, ...$binders);
		$stmt->execute();
		$result = $stmt->affected_rows;
		if ($result>0) {
			$stmt = $conn->prepare("select * from `colours` where $selectors[$i]");
			$new_binders = array_slice($binders, count($update_binders));
			foreach($new_binders as $j => $binder) {
				$new_binders[$j] = ($binder === $colour_name) ? $new_name : $binder;
				$new_binders[$j] = ($binder === $colour_hex) ? $new_hex : $binder;
			}
			$stmt->bind_param(substr($bind_types, count($update_binders)), ...$new_binders);
			$stmt->execute();

			$result = $stmt->get_result()->fetch_assoc();
			$return_body = array("colors"=>array());
			array_push($return_body["colors"], array(
				"id"=>$result["id"],
				"name"=>$result["name"],
				"hex"=>'#'.$result["hex"]
			));

			http_response_code(200);
			echo json_encode($return_body);
			return;
		}
	}

	http_response_code(400);
	$nameSubStr = $colour_name ? "'$colour_name' " : '';
	$hexSubStr = $colour_hex ? "#$colour_hex" : '';
	$hexSubStr = ($colour_name && $colour_hex) ? "($hexSubStr) " : "$hexSubStr ";
	$idSubStr = $colour_id ? "with ID $colour_id " : '';
	echo json_encode(array("error"=>"Colour ".$nameSubStr.$hexSubStr.$idSubStr."doesn't exist."));
}

function delete_colour($conn, $colour_id, $colour_name, $colour_hex) {
	$selectors = array();
	$binders = array();
	if($colour_name) {
		array_push($selectors, 'name = ?');
		array_push($binders, $colour_name);
	}
	if ($colour_hex) {
		array_push($selectors, 'hex = ?');
		array_push($binders, $colour_hex);
	}
	if (!$colour_name || !$colour_hex) {
		http_response_code(400);
		echo json_encode(array("error"=>"Must provide a colour-name or a colour-hex value to delete a colour."));
		return;
	}

	foreach ($selectors as $i => $selector) {
		$stmt = $conn->prepare('delete from `colours` where ' . $selectors[$i]);
		if (!$stmt) {
			http_response_code(500);
			echo json_encode(array("error"=>"Internal server error"));
			return;
		}
		$stmt->bind_param("s", $binders[$i]);
		$stmt->execute();
		$result = $stmt->affected_rows;
		if ($result) {
			http_response_code(204);
			return;
		}
	}

	http_response_code(400);
	echo json_encode(array("error"=>"Could not delete colour: " . $conn->error));
}
?>
