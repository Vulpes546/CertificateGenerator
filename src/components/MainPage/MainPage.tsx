import "./MainPage.css";
import parseData from "../../functions/parseData";
import generatePdfs from "../../functions/generatePdfs";
import downloadZip from "../../functions/downloadZip";
import Button from "../Button/Button";
import { useState } from "react";
import React from "react";

export default function MainPage() {
	const [state, setState] = useState({
		pdfs: [],
		data: [] as string[][],
		statusCode: 1,
	});

	/**
		status codes:
			1 - no file uploaded
			100 - file uploaded and validated
			101 - file validation and upload in progress
			102 - file validation failed
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
		const file = e.target.files[0];
		try {
			setState((prevState) => ({ ...prevState, statusCode: 101 }));
			parseData(file).then((res) => {
				setState((prevState) => ({
					...prevState,
					statusCode: 100,
					data: res,
				}));
			});
			return;
		} catch (err) {
			console.error(err);
			return setState((prevState) => ({ ...prevState, statusCode: 102 }));
		}
	}

	const renderStatus = () => {
		switch (state.statusCode) {
			case 1:
				return "Nie wybrano pliku";
			case 100:
				return "Plik załadowany i zwalidowany";
			case 101:
				return "Weryfikacja pliku w toku";
			case 102:
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
		return "Nie wybrano pliku";
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
				clickHandler={() => downloadZip(state.pdfs, setState, state.data)}
				disabled={
					state.statusCode !== 200 && state.statusCode !== 300 ? true : false
				}
			/>
		</main>
	);
}
