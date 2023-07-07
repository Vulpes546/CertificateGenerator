import "./MainPage.css";
import * as XLSX from "xlsx";

export default function MainPage() {
	function handleUpload(e) {
		const reader = new FileReader();
		reader.readAsBinaryString(e.target.files[0]);
		reader.onload = (ev) => {
			const data = ev.target.result;
			let parsedData;
			let workbook;
			let sheetName;
			let sheet;
			console.log(e.target.files[0].type);
			switch (e.target.files[0].type) {
				case "application/vnd.ms-excel":
					workbook = XLSX.read(data, { type: "binary" });
					sheetName = workbook.SheetNames[0];
					sheet = workbook.Sheets[sheetName];
					parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
					break;
				case "text/csv":
					parsedData = data
						.slice(data.indexOf("\n") + 1)
						.split("\n")
						.map((element) => element.split(","));

					parsedData = parsedData.map((element) => {
						return element.map((el) => {
							return el.trim();
						});
					});
					break;
			}
			console.log(parsedData);
		};
	}
	return (
		<main>
			<input
				className="upload"
				id="upload"
				type="file"
				name="files[]"
				onChange={handleUpload}
				accept=".csv, .xls, .xlsx"
			/>
		</main>
	);
}
