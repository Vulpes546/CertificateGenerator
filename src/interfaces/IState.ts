import { PDFDocument } from "pdf-lib";

export default interface IState {
	pdfs: PDFDocument[];
	data: string[][];
	url: string;
	statusCode: number;
	showDialog: boolean;
}
