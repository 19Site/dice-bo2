	/* =====================================================================================
	 * xTable (Extended Table) for jQuery
	 * version: 0.1.1
	 * written by: Zell Wong
	 * content: a89514@gmail.com
	 * 
	 * The extended function of html table can be use SQL to control data.
	 * This library need run on jQuery.
	 * 
	 * HISTORY:
	 * 		10:30 16/3/2012
	 *			Complete most basic SQL functions
	 */
	
	jQuery.fn.xTable = function(data, handler) {
		
		// ====================================================================================
		// Variables ==========================================================================
		// ====================================================================================
		var p = {f:{}, v:{}}; // Private Variables
		// Setting 類
		
		// Boolean 類
		p.v.isNotTable = true; // 現時的 $(this) 是否為 Table
		
		// Object 類
		p.v.table = $(this); // 將會使用的 Table
		p.v.datasetIndex = []; // 最原本的資料檔頭
		p.v.datasetContent = []; // 最原本的資料身體
		
		p.v.datasetTempIndex = []; // Query 用的資料檔頭
		p.v.datasetTempContent = []; // Query 用的資料身體
		
		p.v.handlerObject = {} // 傳入 Handler function 內的主要 Object
		
		// ====================================================================================
		// Functions ==========================================================================
		// ====================================================================================
		
// Private Function =====================================================================
		// private call - [p.f.importData] [p.f.getColumnByIndex] [p.f.queryParse]
		//                [p.f.queryExecuteORDER_BY] [p.f.queryExecuteGROUP_BY]
		//                [p.f.queryExecuteLIMIT] [p.f.queryExecuteOFFSET]
		// public call - [query]
		// 傳回錯誤
		p.f.error = function(msg) {
			window.alert(msg);
			return false;
		};
		
// Private Function =====================================================================
		// private call - [Constructor] [p.f.formatDataHTML]
		// public call - [importData]
		// 分析傳入的 Data
		p.f.importData = function(data) {
			var result = {};
			if( /string/i.test(typeof data) )
				result = p.f.formatDataString(data);
			else if( /object/i.test(typeof data) ) {
				if( data[0] == undefined )
					return p.f.error("[p.f.importData] Undefined data imported")
				
				if( data[0][0] == undefined )
					result = p.f.formatDataHash(data);
				else
					result = p.f.formatDataArray(data);
			}
			p.v.datasetIndex = result.shift();
			p.v.datasetContent = result;
			
			for( var i in p.v.datasetContent )
				if( p.v.datasetContent[i].length == 1 && p.v.datasetContent[i][0] == "" )
					p.v.datasetContent.splice(i, 1);
			
			p.v.datasetTempIndex = p.f.arrayCopy(p.v.datasetIndex);
			p.v.datasetTempContent = p.f.arrayCopy(p.v.datasetContent);
		};
		
// Private Function =====================================================================
		// private call - [p.f.importData]
		// 處理傳入的 Data Type 為 String 的資料
		p.f.formatDataString = function(data) {
			// JSON data
			if( /^\[\{/.test(data) ) {
				eval("var e="+ data+";");
				return p.f.formatDataHash(e);
			}
			
			// Tabbed Text File
			var e = data.split(/\r/).join("\n").split(/\n\n/).join("\n").split(/\n/);
			for( var i in e ) {
				while( /\t\t/.test(e[i]) )
					e[i] = e[i].replace(/\t\t/, "\tEMPTY_BOX_HERE\t");
				
				e[i] = e[i].split(/\t/);
				for( var j in e[i] )
					e[i][j] = e[i][j].replace(/EMPTY_BOX_HERE/, "");
			}
			
			return e;
		};
		
// Private Function =====================================================================
		// private call - [p.f.importData]
		// 處理傳入的 Data Type 為 Hash 的資料
		p.f.formatDataHash = function(data) {
			var index = [];
			var content = [];
			for( var i in data[0] )
				index[index.length] = i;
			
			for( var i in data ) {
				content[content.length] = [];
				for( var j in index )
					content[content.length-1][content[content.length-1].length] = data[i][index[j]];
			}
			content.unshift(index);
			return content;
		};
		
// Private Function =====================================================================
		// private call - [p.f.importData]
		// 處理傳入的 Data Type 為 Array 的資料
		p.f.formatDataArray = function(data) {
			return data;
		};
		
// Private Function =====================================================================
		// private call - [Constrcutor]
		// 處理傳入的 Data Type 為 HTML 的資料
		p.f.formatDataHTML = function(ele) {
			var content = [];
			$(ele).find("TR").each(function(e) {
				content[content.length] = [];
				
				$(this).find("TD").each(function(e) {
					content[content.length-1][content[content.length-1].length] = $(this).html();
				});
			});
			
			p.f.importData(content);
		};
		
// Private Function =====================================================================
		// private call - [p.f.writeTable]
		// 清除 Table 
		p.f.clearTable = function() {
			p.v.table.html("");
		};
		
// Private Function =====================================================================
		// private call - [p.f.writeTableWithSort]
		// public call - [print]
		// 把資料寫入 p.v.table
		p.f.writeTable = function() {
			// 先清除目標 Table 的內容
			p.f.clearTable();
			
			// 複製暫時的資料 (如沒有暫時資料 - 則未執行過 Query, 將複製原本的資料)
			var index = p.f.arrayCopy(p.v.datasetTempIndex.length == 0? p.v.datasetIndex: p.v.datasetTempIndex);
			var data = p.f.arrayCopy(p.v.datasetTempContent.length == 0? p.v.datasetContent: p.v.datasetTempContent);
			data.unshift(index);
			
			// 整理 HTML 以輸出
			for( var i in data ) {
				data[i] = data[i].join("xTable_SPACE_HERE");
				while( /xTable_SPACE_HERExTable_SPACE_HERE/.test(data[i]) )
					data[i] = data[i].replace(/xTable_SPACE_HERExTable_SPACE_HERE/, "xTable_SPACE_HERExTable_EMPTY_DATAxTable_SPACE_HERE")
			}
			
			var ht = ("<tr><td>"+ data.join("</td></tr>\n<tr><td>").split(/xTable_SPACE_HERE/).join("</td><td>")+ "</td></tr>").split(/xTable_EMPTY_DATA/).join("");
			p.v.table.html(ht);
		};
		
// Private Function =====================================================================
		// public call - [print]
		// 建立有排序功能的 Table
		// 參數 - previousSettings: 從 Public Function 傳入來是要列印的資料表 Settings
		p.f.writeTableWithSort = function(previousSettings, handler) {
			var table = p.v.table;
			
			table.find("TR:eq(0) TD")
				.css({cursor: "pointer"})
				.bind("click", {tb: table, preSettings: previousSettings, handler: handler}, function(e) {
					// 排序前觸發 Event, 如條件不許可則退出
					if( !/^undefined$/i.test(e.data.handler) )
						if( e.data.handler($(this), 0) == false )
							return;
					
					var col = $(this).html();
					e.data.tb.xTable(function(tb) {
						tb.query("SELECT * ORDER BY "+col+" ASC;").print(e.data.preSettings);
					});
					
					// 排序後觸發 Event
					if( !/^undefined$/i.test(e.data.handler) )
						e.data.handler($(this), 1);
				});
		};
		
// Private Function =====================================================================
		// public call - [print]
		// 建立有修改功能的 Table
		// 參數 - previousSettings: 從 Public Function 傳入來是要列印的資料表 Settings
		p.f.writeTableWithEdit = function(previousSettings, handler) {
			var table = p.v.table;
			
			table.find("TR:gt(0)").find("TD")
				.each(function(e) {
					// 為每個欄位加入欄位的名稱
					$(this).attr("name", p.v.datasetTempIndex[e%p.v.datasetTempIndex.length]);
				})
				.bind("dblclick", {handler: handler}, function(e) {
					// 修改前觸發 Event, 如條件不許可則退出
					if( !/^undefined$/i.test(e.data.handler) )
						if( e.data.handler($(this), 0) == false )
							return;
					
					if( /<input/i.test($(this).html()) )
						return;
					
					var self = $(this);
					
					// 按下欄位時加入 text field 以修改欄位
					$("<input type='text' value='"+$(this).html()+"' />")
						.appendTo($(this).html(""))
						.focus()
						.bind("keyup", function(e) {
							if( e.keyCode == 13 )
								$(this).blur();
						})
						.bind("blur", {handler: e.data.handler, td: self}, function(e) {
							var value = $(this).val();
							$(this).parent().html(value);
							
							// 修改後觸發 Event
							if( !/^undefined$/i.test(e.data.handler) )
								e.data.handler(e.data.td, 1);
						});
				});
		};
// Private Function =====================================================================
		// private call - [p.f.writeTable] [p.f.queryExecuteWHERE]
		// 複製 Array
		p.f.arrayCopy = function(ary) {
			var result = [];
			for( var i in ary )
				result[result.length] = ary[i].slice();
			return result;
		};
		
// Private Function =====================================================================
		// public call - [query]
		// 解析 query 的內容
		p.f.queryParse = function(query) {
			// Query 內預留的字
			var cmd = [" FROM ", " WHERE ", " ORDER BY ", " GROUP BY ", " LIMIT ", " OFFSET ", "SELECT ", ";"];
			// 儲起各個 Query 指令
			var queryCommand = [];
			
			// 檢查 Query 是否為正確的開頭
			if( !/^(SELECT|INSERT|DELETE|UPDATE)\s/i.test(query) )
				return p.f.error("[p.f.queryParse] Valid input of query, Should be start with SELECT, INSERT, DELETE, UPDATE")
			query = " "+ query;
			
			// 剪出各個 query command 切口
			for( var i in cmd )
				queryCommand[cmd[i].replace(/^\s*/, "").replace(/\s*$/, "")] = (query.split(RegExp(cmd[i], "i")).length > 1? query.split(RegExp(cmd[i], "i"))[1]: "");
			for( var i in queryCommand )
				for( var j in cmd )
					queryCommand[i] = queryCommand[i].split(RegExp(cmd[j], "i"))[0];
			
			// 複製原本的資料集到暫時資料集中
			p.v.datasetTempIndex = p.f.arrayCopy(p.v.datasetIndex);
			p.v.datasetTempContent = p.f.arrayCopy(p.v.datasetContent);
			
			p.f.queryExeucte(queryCommand);
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryParse]
		// 執行 Query
		p.f.queryExeucte = function(queryObject) {
			var index = []
			for( var i in queryObject )
				if( queryObject[i] != "" )
					index[index.length] = i;
			
			for( var i in index )
				switch(index[i]) {
					case "SELECT":
						p.f.queryExecuteSELECT(queryObject[index[i]]);
						break;
					case "WHERE":
						p.f.queryExecuteWHERE(queryObject[index[i]]);
						break;
					case "ORDER BY":
						p.f.queryExecuteORDER_BY(queryObject[index[i]]);
						break;
					case "GROUP BY":
						p.f.queryExecuteGROUP_BY(queryObject[index[i]]);
						break;
					case "LIMIT":
						p.f.queryExecuteLIMIT(queryObject[index[i]]);
						break;
					case "OFFSET":
						p.f.queryExecuteOFFSET(queryObject[index[i]]);
						break;
					default:
						break;
				};
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Select
		p.f.queryExecuteSELECT = function(exp) {
			// 去掉開始和結尾的 \s
			exp = exp.replace(/^\s*/, "").replace(/\s*$/, "");
			
			// 如傳入為 * ,全選所有欄位
			if( exp == "*" )
				return;
			
			var index = [];
			var displayIndex = [];
			var content = [];
			var qCmd = exp.split(/,/);
			
			// 把 Expression 已 "," 再分開
			for( var i in qCmd ) {
				var name = qCmd[i].replace(/^\s*/, "").replace(/\s*$/, "");
				var value = name;
				
				// 如發現有 AS 的出現, 把它分割出來
				if( /\s*AS\s*/i.test(name) ) {
					value = name.split(/\s*AS\s*/)[1];
					name = name.split(/\s*AS\s*/)[0];
					
					if( /^(".*"|'.*')$/.test(value) )
						value = value.replace(/^./, "").replace(/.$/, "");
				}
				
				index[index.length] = name;
				displayIndex[displayIndex.length] = value;
			}
			
			// 抽出 Select Columns 的排列 及 檢查輸入的 Columns 是否存在
			for( var i in index ) {
				for( var j in p.v.datasetTempIndex )
					if( index[i] == p.v.datasetTempIndex[j] )
						index[i] = j;
				
				if( !/^\d*$/i.test(index[i]) )
					return p.f.error("[p.f.queryExecuteSELECT] Valid selected column \"" +index[i]+ "\"");
			}
			
			// 複製資料到 content (跟隨 index 的次序)
			for( var i in p.v.datasetTempContent ) {
				content[content.length] = [];
				for( var j in index )
					content[content.length-1][content[content.length-1].length] = p.v.datasetTempContent[i][index[j]];
			}
			
			// 儲存已選擇的項目
			p.v.datasetTempIndex = displayIndex;
			p.v.datasetTempContent = content;
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Where
		p.f.queryExecuteWHERE = function(exp) {
			// 先處理 OR
			var orCondition = exp.split(/ OR /i);
			var resultData = [];
			
			for( var i in orCondition ) {
				var sourceData = p.f.arrayCopy(p.v.datasetTempContent);
				var tempResultData = [];
				var andCondition = orCondition[i].split(/ AND /i);
				
				// 處理從 OR 分出的 AND
				for( var j in andCondition ) {
					var n = p.f.expressionParse(andCondition[j]);
					var index = p.f.getColumnByIndex(n.name);
					
					// 處理各個 Condition
					for( var k in sourceData ) {
						if( n.exp == "=" && sourceData[k][index] == n.value )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == ">" && (n.type=="string"? sourceData[k][index]>n.value: window.parseInt(sourceData[k][index])>window.parseInt(n.value)) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "<" && (n.type=="string"? sourceData[k][index]<n.value: window.parseInt(sourceData[k][index])<window.parseInt(n.value)) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == ">=" && (n.type=="string"? sourceData[k][index]>=n.value: window.parseInt(sourceData[k][index])>=window.parseInt(n.value)) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "<=" && (n.type=="string"? sourceData[k][index]<=n.value: window.parseInt(sourceData[k][index])<=window.parseInt(n.value)) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "!=" && (n.type=="string"? sourceData[k][index]!=n.value: window.parseInt(sourceData[k][index])!=window.parseInt(n.value)) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "^=" && RegExp("^"+ n.value).test(sourceData[k][index]) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "$=" && RegExp(n.value+ "$").test(sourceData[k][index]) )
							tempResultData[tempResultData.length] = sourceData[k];
						if( n.exp == "~=" && RegExp(n.value+ "$").test(sourceData[k][index]) )
							tempResultData[tempResultData.length] = sourceData[k];
					}
					
					sourceData = p.f.arrayCopy(tempResultData);
					tempResultData = [];
				}
				
				// 防止 OR 條件抽出相同的record
				lap1: for( var j in sourceData ) {
					lap2: for( var k in resultData )
						if( resultData[k].toString() == sourceData[j].toString() )
							continue lap1;
					resultData[resultData.length] = sourceData[j];
				}
			}
			
			p.v.datasetTempContent = resultData;
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Order BY
		p.f.queryExecuteORDER_BY = function(exp) {
			var orderList = exp.split(/,/);
			orderList.reverse();
			
			for( var i in orderList ) {
				orderList[i] = orderList[i].replace(/^\s*/, "").replace(/\s*$/, "");
				
				// 檢查 order by 的語法是否正確
				if( !/^[^\s\r\n\^\$=><]*\s*(ASC|DESC)$/i.test(orderList[i]) )
					return p.f.error("[p.f.queryExecuteORDER_BY] Invalid statement. \""+orderList[i]+"\"");
				
				// 抽最 index 號
				var index = p.f.getColumnByIndex(orderList[i].match(/^[^\s\r\n\^\$=><]*\s*/)[0].replace(/\s*$/, ""));
				var order = orderList[i].match(/\s*(ASC|DESC)$/i)[0].replace(/\s*/, "");
				
				// 準備temp變數
				var tmpIndex = [];
				var tmpResult = [];
				
				// 自動轉換內容格調, 分別為 number, float 及 string
				for( var j in p.v.datasetTempContent )
					tmpIndex[tmpIndex.length] = (function() {
						if( /^(-[0-9]|[0-9])$/.test(p.v.datasetTempContent[j][index]) )
							return window.parseInt(p.v.datasetTempContent[j][index]);
						else if( /^(-[0-9][0-9]*\.[0-9][0-9]*|[0-9][0-9]*\.[0-9][0-9]*)$/.test(p.v.datasetTempContent[j][index]) )
							return window.parseFloat(p.v.datasetTempContent[j][index]);
						else
							return p.v.datasetTempContent[j][index];
					})();
				
				tmpIndex.sort(function(a, b) {
					// 對比日期, 接受格調如下:
					// (2001-09-02) (2001/09/02) (2001\09\02)
					var reg1 = /^(\d{1,4}-\d{1,2}-\d{1,4}|\d{1,4}\\\d{1,2}\\\d{1,4}|\d{1,4}\/\d{1,2}\/\d{1,4})$/;
					if( reg1.test(a) && reg1.test(b) ) {
						var toDateStr = function(str) {
							var splitor = "";
							
							if( str.match(/-/) != null )
								splitor = "-";
							else if( str.match(/\//) != null )
								splitor = "\/";
							else if( str.match(/\\/) != null )
								splitor = "\\";
							
							str = str.split(splitor);
							
							if( str[0].length == 4 )
								return str[0]+ (str[1].length>1? str[1]: "0"+ str[1])+ (str[2].length>1? str[2]: "0"+ str[2]);
							else if( str[2].length == 4 )
								return str[2]+ (str[1].length>1? str[1]: "0"+ str[1])+ (str[0].length>1? str[0]: "0"+ str[0]);
							else
								return str;
						};
						
						a = toDateStr(a);
						b = toDateStr(b);
					}
					
					if( a > b )
						return 1;
					else if( a < b )
						return -1;
					else
						return 0;
				});
				
				if( /DESC/i.test(order) )
					tmpIndex.reverse();
				
				for( var j in tmpIndex )
					for( var k in p.v.datasetTempContent )
						if( tmpIndex[j] == p.v.datasetTempContent[k][index] ) {
							tmpResult[tmpResult.length] = p.v.datasetTempContent[k].slice();
							p.v.datasetTempContent.splice(k ,1);
							break;
						}
				
				p.v.datasetTempContent = tmpResult;
			}
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Group BY
		p.f.queryExecuteGROUP_BY = function(exp) {
			exp = exp.split(/,/);
			var index = [];
			var compare = [];
			var result = [];
			
			// 檢查傳入的 Expression 是否合法
			for( var i in exp ) {
				if( !/^\s*[^\s\r\n\^\=\$]*\s*$/.test(exp[i]) )
					return p.f.error("[p.f.queryExecuteGROUP_BY] Invalid parameter");
				index[index.length] = p.f.getColumnByIndex(exp[i].replace(/^\s*/, "").replace(/\s*$/, ""));
			}
			
			// 將傳入的各個 Columns 的文字連起上來作對比, 把不相同的抽出來
			lap1: for( var i in p.v.datasetTempContent ) {
				var groupCompare = "";
				for( var j in index )
					groupCompare += p.v.datasetTempContent[i][index[j]]+ "-";
				
				for( var j in compare )
					if( groupCompare == compare[j] )
						continue lap1;
				
				compare[compare.length] = groupCompare;
				result[result.length] = p.v.datasetTempContent[i].slice();
			}
			
			p.v.datasetTempContent = result;
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Limit
		p.f.queryExecuteLIMIT = function(exp) {
			exp = exp.replace(/^\s*/, "").replace(/\s*$/, "");
			
			// 檢查limit 的參數是否正確
			if( !/^([0-9][0-9]*\s[0-9][0-9]*|[0-9][0-9]*)$/.test(exp) )
				return p.f.error("[p.f.queryExecuteLIMIT] Invalid Parameter");
			
			var limit = window.parseInt(exp.match(/^[0-9]*\s*/)[0].replace(/\s*$/, ""));
			var offset = (/^([0-9][0-9]*\s[0-9][0-9]*)$/.test(exp)? window.parseInt(exp.match(/\s*[0-9]*$/)[0].replace(/^\s*/, "")): 0);
			
			var tmpResult = [];
			for( var i=offset; i< (limit+offset); i++ )
				if( p.v.datasetTempContent[i] != undefined )
					tmpResult[tmpResult.length] = p.v.datasetTempContent[i];
			
			p.v.datasetTempContent = tmpResult;
		};

// Private Function =====================================================================
		// private call - [p.f.queryExecute]
		// 執行 Query 的 Offset
		p.f.queryExecuteOFFSET = function(exp) {
			exp = exp.replace(/^\s*/, "").replace(/\s*$/, "");
			
			// 檢查limit 的參數是否正確
			if( !/^[0-9][0-9]*$/.test(exp) )
				return p.f.error("[p.f.queryExecuteOFFSET] Invalid Parameter");
			
			var offset = window.parseInt(exp);
			
			var tmpResult = [];
			for( var i=offset; i< p.v.datasetTempContent.length; i++ )
				tmpResult[tmpResult.length] = p.v.datasetTempContent[i];
			
			p.v.datasetTempContent = tmpResult;
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecuteWHERE] [p.f.queryExecuteORDER_BY] [p.f.queryExecuteGROUP_BY]
		// 對應出index name的位置
		p.f.getColumnByIndex = function(index) {
			for( var i in p.v.datasetTempIndex )
				if( p.v.datasetTempIndex[i] == index )
					return i;
			
			p.f.error("[p.f.getColumnByIndex] Unknow index \""+index+"\"");
			return -1;
		};
		
// Private Function =====================================================================
		// private call - [p.f.queryExecuteWHERE]
		// 分析從 Query 傳入來的 Expression ( A='b', ClassName=7A )
		p.f.expressionParse = function(expression) {
			// 檢查是否合法的 expression
			if( !/^\s*[^\s\r\n\^\$=><]*\s*([=><]|[\~\^\$\!><]=)\s*(\'.*\'|-[0-9]*|-[0-9][0-9]*\.[0-9][0-9]*|[0-9]*|[0-9][0-9]*\.[0-9][0-9]*)$/.test(expression) )
				sql.private.E.save("sql.private.F.expressionParse: invalid expression. \n["+expression+"]");
			
			var vName = expression.replace(expression.match(/\s*([=><]|[\~\^\$\!><]=).*$/)[0], "");
			var vVal = expression.replace(expression.match(/^.*([=><]|[\~\^\$\!><]=)\s*/)[0], "");
			var vExp = expression.match(/^.*([=><]|[\~\^\$\!><]=)\s*/)[0].replace(expression.match(/^[^\s\r\n\^\$\!=><]*\s*/)[0], "").split(/\s*/).join("");
			var type = "string";
			
			if( /^'.*'$/.test(vVal) )
				vVal = vVal.replace(/^\'/, "").replace(/\'$/, "");
			
			// 分出value 的類型
			if( /^(-[0-9]*|[0-9]*)$/.test(vVal) )
				type = "number";
			if( /^(-[0-9][0-9]*\.[0-9][0-9]*|[0-9][0-9]*\.[0-9][0-9]*)$/.test(vVal) )
				type = "float";
			
			return {name: vName, value: vVal, exp: vExp, type: type};
		};
		
		// ====================================================================================
		// Constructor ========================================================================
		// ====================================================================================
		
		// 檢查傳入的 Element 是否為 Table
		$(this).each(function(e) {
			if( /table/i.test(this.tagName) )
				p.v.isNotTable = false;
		});
		
		// 如果 $(this) 不是 Table, 建立一個 Table 並加入到 $(this)
		if( p.v.isNotTable )
			p.v.table = $("<table></table>").appendTo($(this));
		
		// 匯入資料
		if( !/undefined/i.test(typeof data) && !/function/i.test(typeof data) )
			p.f.importData(data);
		else if( !p.v.isNotTable )
			p.f.formatDataHTML(p.v.table);
		
		// 傳入 Function 內的控制項
		p.v.handlerObject = {
// Public Function ======================================================================
			// 用於匯入資料
			importData: function(data) {
				p.f.importData(data);
				return this;
			},
// Public Function ======================================================================
			// 用於執行 Query
			query: function(query) {
				if( !/^string$/i.test(typeof query) )
					return p.f.error("[xTable.query] Query data type must be String");
				
				p.f.queryParse(query);
				return this;
			},
// Public Function ======================================================================
			// 用於編印結果
			print: function(settings) {
				// 最普通的寫簡單的 Table
				if( /^undefined$/i.test(typeof settings) )
					p.f.writeTable();
				
				// 如傳入的參數為 Function, 把整個 Table Object 傳入去
				if( /^function$/i.test(typeof settings) )
					settings(p.v.table);
				
				// 跟隨用戶的需要為 Table 加入功能
				if( /^object$/i.test(typeof settings) ) {
					// 先弄好最基本的 Table
					p.f.writeTable();
					
					// 為各個 Settings 加入需要的功能, 並加入 event handler
					// handler 的參數
					// arg[0] - [jQuery TD] - 目標的 Object
					// arg[1] - [0|1] - 0 為動作發生前, 1 為動作發生後
					for( var i in settings ) {
						if( /^sort$/i.test(i) )
							p.f.writeTableWithSort(settings, (/^function$/i.test(typeof settings[i])? settings[i]: undefined));
						if( /^edit$/i.test(i) )
							p.f.writeTableWithEdit(settings, (/^function$/i.test(typeof settings[i])? settings[i]: undefined));
					}
					
					// 如有 Handler 處理事件, 傳 jQuery Table 入內
					if( !/^undefined$/i.test(settings.handler) )
						settings.handler(p.v.table);
				}
				
				return this;
			},
// Public Function ======================================================================
			// 為指定的行列加入一行記錄
			// position 為行數
			// arrayData 為 Array
			append: function(position, arrayData) {
				arrayData = ( /^object$/i.test(typeof arrayData)? arrayData: (/^object$/i.test(typeof position)? position: [] ));
				position = ( /^number$/i.test(typeof position)? position: 1 );
				
				var tr = $("<tr></tr>");
				for( var i in arrayData )
					$("<td>"+arrayData[i]+"</td>").appendTo(tr);
				
				p.v.table.find("TR:eq("+position+")").before(tr);
				return this;
			},
// Public Function ======================================================================
			// 用於輸出 Query 後的結果
			getData: function(handler) {
				if( /^function$/i.test(typeof handler) ) {
					handler(p.v.datasetTempContent);
					return this;
				}
				else
					return p.v.datasetTempContent;
			},
// Public Function ======================================================================
			// 用於逐一匯出結果
			each: function(handler) {
				if( !/^function$/i.test(typeof handler) )
					return this;
				
				for( var i in p.v.datasetTempContent )
					handler(p.v.datasetTempContent[i]);
				
				return this;
			},
// Public Function ======================================================================
			// 用於提取 Table Object
			getTable: function(handler) {
				if( /^function$/i.test(typeof handler) ) {
					handler(p.v.table);
					return this;
				}
				else
					return p.v.table;
			}
		};
		
		// 執行
		if( /function/i.test(typeof handler) )
			handler(p.v.handlerObject);
		else if( /function/i.test(typeof data) )
			data(p.v.handlerObject);
		
		// 傳回 jQuery
		return p.v.table;
	};