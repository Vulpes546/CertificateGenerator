import * as XLSX from "xlsx";

export default function parseData(file: File): Promise<any[][]> {
	return new Promise<any[][]>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (ev: ProgressEvent<FileReader>) => {
			if (ev.target) {
				const data: string = ev.target.result as string;
				switch (file.type) {
					case "application/vnd.ms-excel":
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
						csvData = csvData.filter((element: any[]) => element.length >= 11);
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

const shiftIfNeeded = (data: any[][]) => {
	if (
		data[0][0].toLowerCase() === "imię" ||
		data[0][0].toLowerCase() === "imie"
	) {
		data.shift();
	}
	return data;
};
