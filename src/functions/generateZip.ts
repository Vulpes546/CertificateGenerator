import JSZip from "jszip";

export const generateZip = async (files: any, data: any[]) => {
	const zip = new JSZip();
	for (let i = 0; i < files.length; i++) {
		zip.file(
			`certyfikat_${data[i][0]}_${data[i][1]}_${data[i][8]}.pdf`,
			files[i]
		);
	}
	const content = await zip.generateAsync({ type: "blob" });
	return content;
};
