import { generateZip } from "./generateZip";

export default async function downloadZip(
	files: any,
	setState: (state: any) => void,
	data: any[]
) {
	setState((state) => ({ ...state, statusCode: 301 }));
	try {
		document.createElement("a");
		const zip = await generateZip(files, data);
		const url = window.URL.createObjectURL(zip);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "certyfikaty.zip");
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error(error);
		return setState((state) => ({ ...state, statusCode: 302 }));
	}
	return setState((state) => ({ ...state, statusCode: 300 }));
}
