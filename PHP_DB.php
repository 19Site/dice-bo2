<?PHP
	// get http parameter
	function param($method, $name) { $param; if( $method == "get" )	$param = $_GET; else if( $method == "post" ) $param = $_POST; else return "null"; $param_keys = array_keys($param); foreach( $param_keys as $i ) if( $i == $name ) return $param[$i]; return "null";}
	
	// stop all error reporting
	//error_reporting(0);
	
	// set time of execution limit to infinity
	set_time_limit(0);
	
	// remote sql server data
	$dbUser = "root";
	$dbPass = "";
	$dbHost = "localhost";
	
	$noOfSelectStatement = 0; // 0 for no select statement, 1 for only one select statement, 2 or over for more than one select statement
	$selectResult = ""; // result set of sql select statement
	
	// normal load data from db
	if( param("get", "cmd") == "local" ) {
		$db = sqlite_open(param("post", "file"));
		$query = param("post", "query");
		if( $query != "null" )
			foreach( $query as $q )
				if( preg_match("/^SELECT /i", $q) == 1 ) {
					$resultSet = sqlite_array_query($db, $q, SQLITE_ASSOC);
					echo json_encode($resultSet);
				}
				else
					sqlite_query($db, $q);
		exit;
	}
	
	/*
	 *	此部份已用 urlencode 加密支援 utf8 輸出
	 *	多可處理多於一個的 Select Statement
	 *	對於單一的 Select Statement 會用舊有的方法 [{column1: "value1", column2: "value2"}]
	 *	對於多於一個的 Select Statement 會用 [[{tb1_column1: "value1", tb1_column2: "value2"}], [{tb2_column1: "value1", tb2_column2: "value2"}]]
	 */
	if( param("get", "cmd") == "remote" ) {
		$db = mysql_connect($dbHost, $dbUser, $dbPass);
		$query = param("post", "query");
		if( $query != "null" )
			foreach( $query as $q )
				if( preg_match("/^SELECT /i", $q) == 1 ) {
					$noOfSelectStatement++;
					$data = "";
					
					$resultSet = mysql_query($q, $db);
					while( $line = mysql_fetch_assoc($resultSet) ) {
						foreach( $line as $k => $v )
							$line[$k] = urlencode($line[$k]);
						$data[] = $line;
					}
					
					$res = urldecode(json_encode($data));
					$res = ($res == "\"\""? "null": $res);
					
					
					if( $noOfSelectStatement > 1 )
						$selectResult .= ",". $res;
					else
						$selectResult .= $res;
				}
				else
					mysql_query($q, $db);
		
		if( $noOfSelectStatement == 1 )
			echo $selectResult;
		else if( $noOfSelectStatement > 1 )
			echo "[", $selectResult. "]";
		else if( $noOfSelectStatement == 0 )
			echo "finish". mysql_error();
		
		
		exit;
	}
	
	if( param("get", "cmd") == "null" ) {
?>
function PHPDB(type) {
	if( type != "remote" )
		type = "local";
	
	// private methods
	var P = {V:{},F:{}};
	
	P.V.type = type;
	P.V.path = (function() {
		var path = "";
		$("SCRIPT").each(function(e) {
			if( /PHP_DB.php$/.test($(this).attr("src")) )
				path = $(this).attr("src").replace(/PHP_DB.php$/, "");
		});
		return path;
	})();
	
	P.F.query = function(file, query, handler) {
		$.post(P.V.path+ "PHP_DB.php?cmd="+ P.V.type, {file: file, query: query}, handler);
	};
	
	// public methods
	return {
		query: function(file, query, handler) {
			if( P.V.type == "remote" && handler == undefined ) {
				handler = query;
				query = file;
				file = "";
			}
			P.F.query(file, query, handler);
			return this;
		}
	};
}
<?PHP } ?>