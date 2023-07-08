import JSZip from "jszip";

export const generateZip = async (files: any) => {
	const zip = new JSZip();
	for (let i = 0; i < files.length; i++) {
		zip.file(`certyfikat${i + 1}.pdf`, files[i]);
	}
	const content = await zip.generateAsync({ type: "blob" });
	return content;
};
