import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { rgb } from "pdf-lib";

export default async function generatePdf(data: string[]) {
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
