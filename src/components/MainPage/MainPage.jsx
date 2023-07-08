import "./MainPage.css";
import * as XLSX from "xlsx";
import generatePdfs from "../../functions/generatePdfs";
import downloadZip from "../../functions/downloadZip";
import Button from "../Button/Button";
import { useState } from "react";

export default function MainPage() {
	const [state, setState] = useState({
		pdfs: [],
		data: [],
		statusCode: 1,
	});

	/**
		status codes:
			1 - no file uploaded
			100 - file uploaded and validated
			101 - file validation failed
			200 - pdfs generated
			201 - pdfs generation in progress
			202 - pdfs generation failed
			300 - zip file generated
			301 - zip file generation in progress
			302 - zip file generation failed
	**/

	function handleUpload(e) {
		if (e.target.value === "") {
			return setState((prevState) => ({ ...prevState, statusCode: 0 }));
		}
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
			if (parsedData[0].length === 11) {
				if (
					(parsedData[0][0] === "imię" || parsedData[0][0] === "imie") &&
					parsedData[0][1] === "nazwisko"
				) {
					parsedData = parsedData.slice(1);
					console.log(parsedData);
				}
				return setState((prevState) => ({
					...prevState,
					data: parsedData,
					statusCode: 100,
				}));
			}
			return setState((prevState) => ({ ...prevState, statusCode: 101 }));
		};
	}

	const renderStatus = () => {
		console.log(state.statusCode);
		switch (state.statusCode) {
			case 1:
				return "Nie wybrano pliku";
			case 100:
				return "Plik załadowany i zwalidowany";
			case 101:
				return "Plik niepoprawny";
			case 200:
				return "Pliki PDF wygenerowane";
			case 201:
				return "Generowanie plików PDF w toku";
			case 202:
				return "Generowanie plików PDF nie powiodło się";
			case 300:
				return "Plik .zip wygenerowany";
			case 301:
				return "Generowanie pliku .zip w toku";
			case 302:
				return "Generowanie pliku .zip nie powiodło się";
		}
	};

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
			<p className="statusBar">{renderStatus()}</p>
			<Button
				text="Wygeneruj PDF"
				clickHandler={() => generatePdfs(state.data, setState)}
				className="btnLeft"
				disabled={state.statusCode % 100 !== 0 ? true : false}
			/>
			<Button
				text="Pobierz plik .zip"
				className="btnRight"
				clickHandler={() => downloadZip(state.pdfs, setState)}
				disabled={
					state.statusCode !== 200 && state.statusCode !== 300 ? true : false
				}
			/>
		</main>
	);
}
