import fs from "fs";
import pdf from "pdf-parse";

export const extractPDFText = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found at ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer); // pdf-parse v1.1.1
    return data.text;
};