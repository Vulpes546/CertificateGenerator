import generatePdf from "./generatePdf";

export default async function generatePdfs(
	data,
	setState: (state: any) => void
) {
	setState((state) => ({ ...state, statusCode: 201 }));
	const pdfs: any[] = [];
	try {
		for (let i = 0; i < data.length; i++) {
			const pdf = await generatePdf(data[i]);
			pdfs.push(pdf);
		}
	} catch (error) {
		console.error(error);
		return setState((state) => ({ ...state, statusCode: 202 }));
	}
	return setState((state) => ({ ...state, pdfs: pdfs, statusCode: 200 }));
}
