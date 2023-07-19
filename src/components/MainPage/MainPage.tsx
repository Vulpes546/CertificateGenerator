import "./MainPage.css";
import Button from "../Button/Button";
// @ts-ignore
import { useState, useEffect } from "react";
import React from "react";
import Utils from "../../utils/Utils";
import IState from "../../interfaces/IState";
import IPdfCoords from "../../interfaces/IPdfCoords";

export default function MainPage() {
	const [state, setState] = useState<IState>({
		pdfs: [],
		data: [] as string[][],
		url: "" as string,
		statusCode: 1,
		showDialog: false,
		pdfCoords: {
			certNumber: {
				x: 210,
				y: 430,
				fontSize: 16,
			},
			courseName: {
				x: 38,
				y: 555,
				fontSize: 22,
			},
			courseDate: {
				x: 40,
				y: 190,
				fontSize: 11,
			},
			gender: {
				x: 38,
				y: 385,
				fontSize: 11,
			},
			name: {
				x: 38,
				y: 350,
				fontSize: 24,
			},
			birth: {
				x: 38,
				y: 330,
				fontSize: 11,
			},
			date: {
				x: 400,
				y: 60,
				fontSize: 11,
			},
		},
	});

	useEffect(() => {
		console.log("Fetching pdf template");
		const url = "/data/certyfikat_szablon_1_EZN_pusty.pdf";
		let blob: Blob;
		fetch(url)
			.then((response) => response.blob())
			.then((blob) => {
				setState((prev) => ({ ...prev, pdfTemplate: blob }));
			});
	}, []);

	const [formData, setFormData] = useState<IPdfCoords>({ ...state.pdfCoords });

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
		setFormData({ ...state.pdfCoords });
		setState((prev) => ({ ...prev, showDialog: true }));
	}

	function hideDialog() {
		setState((prev) => ({ ...prev, showDialog: false }));
	}

	return (
		<>
			<main>
				<label className="templateImput">
					Szablon pdf:{" "}
					<input
						type="file"
						accept=".pdf"
						onChange={(e) => {
							if (e.target.files) {
								const blob: Blob = e.target.files[0];
								setState((prev) => ({ ...prev, pdfTemplate: blob }));
							}
						}}
					/>
				</label>
				<Button
					text="Podaj koordynaty"
					clickHandler={showDialog}
					className="btnCoords"
				/>
				<label>
					Plik xlsx/csv z danymi:{" "}
					<input
						className="upload"
						id="upload"
						type="file"
						name="files[]"
						onChange={handleUpload}
						accept=".csv, .xls, .xlsx"
					/>
				</label>

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
					clickHandler={() =>
						Utils.generatePdfs(
							state.data,
							setState,
							state.pdfCoords,
							state.pdfTemplate
						)
					}
					className="btnLeft"
					disabled={state.statusCode % 100 !== 0 ? true : false}
				/>
				<Button
					text="Pobierz plik .zip"
					className="btnRight"
					clickHandler={() =>
						Utils.downloadZip(state.pdfs, setState, state.data)
					}
					disabled={
						state.statusCode !== 200 && state.statusCode !== 300 ? true : false
					}
				/>
			</main>
			<dialog open={state.showDialog}>
				<ul>
					<li>Numer certyfikatu</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.certNumber.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										certNumber: {
											...prev.certNumber,
											x: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.certNumber.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										certNumber: {
											...prev.certNumber,
											y: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.certNumber.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										certNumber: {
											...prev.certNumber,
											fontSize: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
					</ul>
					<li>Nazwa kursu</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.courseName.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseName: {
											...prev.courseName,
											x: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.courseName.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseName: {
											...prev.courseName,
											y: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.courseName.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseName: {
											...prev.courseName,
											fontSize: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
					</ul>
					<li>Data kursu</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.courseDate.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseDate: {
											...prev.courseDate,
											x: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.courseDate.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseDate: {
											...prev.courseDate,
											y: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.courseDate.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										courseDate: {
											...prev.courseDate,
											fontSize: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
					</ul>
					<li>Pan/Pani</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.gender.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										gender: { ...prev.gender, x: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.gender.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										gender: { ...prev.gender, y: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.gender.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										gender: {
											...prev.gender,
											fontSize: Number(e.target.value),
										},
									}));
								}}
							/>
						</li>
					</ul>
					<li>Imię i nazwisko</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.name.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										name: { ...prev.name, x: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.name.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										name: { ...prev.name, y: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.name.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										name: { ...prev.name, fontSize: Number(e.target.value) },
									}));
								}}
							/>
						</li>
					</ul>
					<li>Data urodzenia</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.birth.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										birth: { ...prev.birth, x: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.birth.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										birth: { ...prev.birth, y: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.birth.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										birth: { ...prev.birth, fontSize: Number(e.target.value) },
									}));
								}}
							/>
						</li>
					</ul>
					<li>Data wydania certyfikatu</li>
					<ul>
						<li>
							<label>X:</label>
							<input
								type="number"
								required
								value={formData.date.x}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										date: { ...prev.date, x: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Y:</label>
							<input
								type="number"
								required
								value={formData.date.y}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										date: { ...prev.date, y: Number(e.target.value) },
									}));
								}}
							/>
						</li>
						<li>
							<label>Rozmiar czcionki:</label>
							<input
								type="number"
								required
								value={formData.date.fontSize}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										date: { ...prev.date, fontSize: Number(e.target.value) },
									}));
								}}
							/>
						</li>
					</ul>
				</ul>
				<br />
				<button
					onClick={() => {
						if (
							window.confirm("Czy na pewno chcesz ustawić nowe koordynaty?")
						) {
							setState((prev) => ({ ...prev, pdfCoords: { ...formData } }));
							hideDialog();
						}
					}}
				>
					Ustaw
				</button>
				<br />
				<button onClick={hideDialog}>Zamknij bez ustawiania</button>
			</dialog>
		</>
	);
}
