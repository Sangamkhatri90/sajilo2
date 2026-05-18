const NepaliDate = require("nepali-date");

function convertToNepaliDate(engDateStr) {
  if (!engDateStr || typeof engDateStr !== 'string') {
    throw new Error("Invalid date string");
  }

  const cleaned = engDateStr.trim().split(' ')[0];
  const parts = cleaned.split(/[-\/]/); // accept '/' or '-'

  if (parts.length !== 3) {
    throw new Error("Date string must be in YYYY/MM/DD or YYYY-MM-DD format");
  }

  const [year, month, day] = parts.map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    throw new Error("Invalid date parts");
  }

  const engDate = new Date(year, month - 1, day);
  if (
    engDate.getFullYear() !== year ||
    engDate.getMonth() !== month - 1 ||
    engDate.getDate() !== day
  ) {
    throw new Error("Invalid calendar date");
  }

  const nepaliDate = new NepaliDate(engDate);
  const yyyy = nepaliDate.getYear();
  const mm = String(nepaliDate.getMonth() + 1).padStart(2, '0');
  const dd = String(nepaliDate.getDate()).padStart(2, '0');

  return ` ${dd}/${mm}/${yyyy};`;
}

module.exports = convertToNepaliDate;