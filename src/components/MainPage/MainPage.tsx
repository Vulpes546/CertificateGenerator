import "./MainPage.css";
import Button from "../Button/Button";
import { useState } from "react";
import React from "react";
import Utils from "../../utils/Utils";
import IState from "../../interfaces/IState";

export default function MainPage() {
	const [state, setState] = useState<IState>({
		pdfs: [],
		data: [] as string[][],
		url: "" as string,
		statusCode: 1,
		showDialog: false
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
			401 - fetching file in progress
			402 - fetching file failed
	**/

	function handleUpload(e) {
		if (e.target.value === "") {
			return setState((prevState) => ({ ...prevState, statusCode: 0 }));
		}
		const file = e.target.files[0];
		try {
			setState((prevState) => ({ ...prevState, statusCode: 101 }));
			Utils.parseData(file).then((res) => {
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

	function handleUrlChange(e) {
		setState((prev) => ({ ...prev, url: e.target.value }));
	}

	function fetchXlsx() {
		setState((prev) => ({ ...prev, statusCode: 401 }));
		try {
			fetch(state.url)
				.then((res) => {
					console.log("Response recieved", res);
					return res.blob();
				})
				.then((blob) => {
					console.log("Blob generated", blob);
					const file = new File([blob], "data.xls", {
						type: "application/vnd.ms-excel",
					});
					console.log("File generated", file);
					return Utils.parseData(file);
				})
				.then((data) => {
					console.log("Data parsed", data);
					return setState((prev) => ({ ...prev, data: data }));
				})
				.finally(() => setState((prev) => ({ ...prev, statusCode: 100 })));
		} catch (error) {
			console.error(error);
			setState((prev) => ({ ...prev, statusCode: 402 }));
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
			case 401:
				return "Pobieranie pliku";
			case 402:
				return "Pobieranie pliku nie powiodło się";
		}
		return "Nie wybrano pliku";
	};

	function showDialog() {
		setState((prev) => ({...prev, showDialog: true}))
	}

	function hideDialog() {
		setState((prev) => ({...prev, showDialog: false}))
	}

	return (
		<main>
			<dialog open={state.showDialog}>
				Placeholderowy dialog
				<br />
				<button onClick={hideDialog}>
					Zamknij
				</button>
			</dialog>
			<Button
				text="Dodaj szablon"
				clickHandler={() => {}}
				className="btnTemplate"
			/>
			<Button
				text="Podaj koordynaty"
				clickHandler={showDialog}
				className="btnCoords"
			/>
			<input
				className="upload"
				id="upload"
				type="file"
				name="files[]"
				onChange={handleUpload}
				accept=".csv, .xls, .xlsx"
			/>
			<div id="urlForm">
				<input
					className="link"
					id="link"
					type="url"
					name="url[]"
					value={state.url}
					onChange={handleUrlChange}
				/>
				<button value={state.url} onClick={fetchXlsx}>
					Pobierz
				</button>
			</div>

			<p className="statusBar">{renderStatus()}</p>
			<Button
				text="Wygeneruj PDF"
				clickHandler={() => Utils.generatePdfs(state.data, setState)}
				className="btnLeft"
				disabled={state.statusCode % 100 !== 0 ? true : false}
			/>
			<Button
				text="Pobierz plik .zip"
				className="btnRight"
				clickHandler={() => Utils.downloadZip(state.pdfs, setState, state.data)}
				disabled={
					state.statusCode !== 200 && state.statusCode !== 300 ? true : false
				}
			/>
		</main>
	);
}
