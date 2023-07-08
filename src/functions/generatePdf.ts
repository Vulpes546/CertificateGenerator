import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export default async function generatePdf(data) {
	console.log("generating pdf");
	const url = "../../data/certyfikat_szablon_1_EZN_pusty.pdf";
	const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
	console.log(existingPdfBytes);
	const pdfDoc = await PDFDocument.load(existingPdfBytes);
	pdfDoc.registerFontkit(fontkit);
	const pages = pdfDoc.getPages();
	const firstPage = pages[0];
	const fontSize = 20;
	const robotoFontBytes = await fetch(
		"../../data/fonts/Roboto-Regular.ttf"
	).then((res) => res.arrayBuffer());
	const robotoFont = await pdfDoc.embedFont(robotoFontBytes);
	firstPage.drawText(data[0] + " " + data[1], {
		x: 220,
		y: 430,
		size: fontSize,
		font: robotoFont,
	});
	console.log("saving pdf");
	const pdfBytes = await pdfDoc.save();
	return pdfBytes;
}
