// import React from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
	function handleUpload(e) {
		const reader = new FileReader();
		reader.readAsBinaryString(e.target.files[0]);
		reader.onload = (e) => {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
			console.log(parsedData);
		};
	}
	return (
		<>
			<input id="upload" type="file" name="files[]" onChange={handleUpload} />
		</>
	);
}

export default App;
