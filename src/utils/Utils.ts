import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { rgb } from "pdf-lib";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { Dispatch, SetStateAction } from "react";
import IState from "../interfaces/IState";

export default class Utils {
	static async downloadZip(
		files: any,
		setState: Dispatch<SetStateAction<IState>>,
		data: any[]
	) {
		setState((state) => ({ ...state, statusCode: 301 }));
		try {
			document.createElement("a");
			const zip = await this.generateZip(files, data);
			const url = window.URL.createObjectURL(zip);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "certyfikaty.zip");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			return setState((state) => ({ ...state, statusCode: 302 }));
		}
		return setState((state) => ({ ...state, statusCode: 300 }));
	}

	static async generatePdf(data: string[]) {
		const url = "../../data/certyfikat_szablon_1_EZN_pusty.pdf";
		const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
		const pdfDoc = await PDFDocument.load(existingPdfBytes);
		pdfDoc.registerFontkit(fontkit);
		const pages = pdfDoc.getPages();
		const firstPage = pages[0];
		const bahnschriftFontBytes = await fetch(
			"../../data/fonts/BAHNSCHRIFT.TTF"
		).then((res) => res.arrayBuffer());
		const bahnschriftFont = await pdfDoc.embedFont(bahnschriftFontBytes);

		// certificate number

		let fontSize = 16;
		firstPage.drawText("Nr " + data[9], {
			x: 210,
			y: 430,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.5, 0.5, 0.5),
		});

		// course name

		fontSize = 22;
		firstPage.drawText(data[2].toUpperCase(), {
			x: 38,
			y: 555,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.5, 0.5, 0.5),
		});

		// course date(s)

		fontSize = 11;
		firstPage.drawText(data[7].toUpperCase(), {
			x: 40,
			y: 190,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.5, 0.5, 0.5),
		});

		// Mr/Ms

		fontSize = 11;
		firstPage.drawText("Pan(i)", {
			x: 38,
			y: 385,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.5, 0.5, 0.5),
		});

		// name

		fontSize = 24;
		firstPage.drawText(`${data[0].toUpperCase()} ${data[1].toUpperCase()}`, {
			x: 38,
			y: 350,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.375, 0.375, 0.375),
		});

		// date and place of birth

		fontSize = 11;
		firstPage.drawText(`ur. ${data[3]} w ${data[4]}`, {
			x: 38,
			y: 330,
			size: fontSize,
			font: bahnschriftFont,
			color: rgb(0.5, 0.5, 0.5),
		});

		// date of issue

		let today = "";

		const date = new Date();

		const monthNames = [
			"stycznia",
			"lutego",
			"marca",
			"kwietnia",
			"maja",
			"czerwca",
			"lipca",
			"sierpnia",
			"września",
			"października",
			"listopada",
			"grudnia",
		];

		fontSize = 11;
		firstPage.drawText(
			`Toruń, ${date.getDate()} ${
				monthNames[date.getMonth()]
			} ${date.getFullYear()} r.`,
			{
				x: 400,
				y: 60,
				size: fontSize,
				font: bahnschriftFont,
				color: rgb(0.5, 0.5, 0.5),
			}
		);

		const pdfBytes = await pdfDoc.save();
		return pdfBytes;
	}

	static async generatePdfs(
		data: string[][],
		setState: Dispatch<SetStateAction<IState>>
	) {
		console.log(data);
		setState((state) => ({ ...state, statusCode: 201 }));
		const pdfs: any[] = [];
		try {
			for (let i = 0; i < data.length; i++) {
				const pdf = await this.generatePdf(data[i]);
				pdfs.push(pdf);
			}
		} catch (error) {
			console.error(error);
			return setState((state) => ({ ...state, statusCode: 202 }));
		}
		return setState((state) => ({ ...state, pdfs: pdfs, statusCode: 200 }));
	}

	static async generateZip(files: any, data: any[]) {
		const zip = new JSZip();
		for (let i = 0; i < files.length; i++) {
			zip.file(
				`certyfikat_${data[i][0]}_${data[i][1]}_${data[i][8]}.pdf`,
				files[i]
			);
		}
		const content = await zip.generateAsync({ type: "blob" });
		return content;
	}

	static parseData(file: File): Promise<any[][]> {
		const shiftIfNeeded = (data: any[][]) => {
			if (
				data[0][0].toLowerCase() === "imię" ||
				data[0][0].toLowerCase() === "imie"
			) {
				data.shift();
			}
			return data;
		};

		return new Promise<any[][]>((resolve, reject) => {
			const reader = new FileReader();
			console.log("file reader initialized");
			console.log(file.type);
			reader.onload = (ev: ProgressEvent<FileReader>) => {
				if (ev.target) {
					const data: string = ev.target.result as string;
					switch (file.type) {
						case "application/vnd.ms-excel":
							console.log("xls file");
							const workbook = XLSX.read(data, { type: "binary" });
							const sheetName = workbook.SheetNames[0];
							const sheet = workbook.Sheets[sheetName];
							let parsedData: any[][] = XLSX.utils.sheet_to_json(sheet, {
								header: 1,
							});
							parsedData = shiftIfNeeded(parsedData);
							parsedData = parsedData.filter(
								(element: any[]) => element.length >= 11
							);
							resolve(parsedData);
							break;
						case "text/csv":
							let csvData: any[][] = data
								.slice(data.indexOf("\n") + 1)
								.split(/\r?\n/) // Split by \r\n or \n line endings
								.map((element: string) => element.split(";"))
								.filter((element: string[]) => element.length > 0)
								.map((element: string[]) =>
									element.map((el: string) => el.trim())
								);
							csvData = shiftIfNeeded(csvData);
							csvData = csvData.filter(
								(element: any[]) => element.length >= 11
							);
							resolve(csvData);
							break;
					}
				} else {
					reject(new Error("Error reading file"));
				}
			};
			reader.onerror = () => {
				reject(new Error("Error reading file"));
			};
			reader.readAsBinaryString(file);
		});
	}
}