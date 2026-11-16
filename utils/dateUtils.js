const convertChequeRegisterDateToMiti = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return day ? `${day}/${month}/${year}` : date;
};
module.exports = { convertChequeRegisterDateToMiti };