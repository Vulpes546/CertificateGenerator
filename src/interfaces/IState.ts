import { PDFDocument } from "pdf-lib";
import IPdfCoords from "./IPdfCoords";

export default interface IState {
	pdfs: PDFDocument[];
	data: string[][];
	url: string;
	statusCode: number;
	showDialog: boolean;
	pdfCoords: IPdfCoords;
	pdfTemplate: Blob;
}
