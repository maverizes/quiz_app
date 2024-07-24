import fs from "node:fs"

export const readFileCustom = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");

    return data.length ? JSON.parse(data) : [];
  } catch {
    console.log("File o'qishda xatolik");
  }
};

export const writeFileCustom = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 4));

    return "Muvaffaqiyatli yozildi ✅";
  } catch {
    console.log("File yozishda xatolik");
  }
};


