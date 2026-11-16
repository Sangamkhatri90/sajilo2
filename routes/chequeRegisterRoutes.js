const express = require("express");
const util = require("util");
const { convertChequeRegisterDateToMiti } = require("../utils/dateUtils");

module.exports = ({ sql, connectionString }) => {
  const router = express.Router();
  const queryAsync = util.promisify(sql.query.bind(sql));

  class HttpError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }

  async function resolveDateRange(conn, from, to) {
    const rows = await queryAsync(conn, "SELECT TOP 1 DateType FROM tbSystemSettings");
    const dateType = rows[0]?.DateType || "AD";
    if (dateType !== "LD") return { dateType, from, to };

    // tbLocalDate is in the other database → connectionString, not session conn
    const [conv] = await queryAsync(
      connectionString,
      `SELECT
         (SELECT TOP 1 M_date FROM tbLocalDate WHERE M_Miti = ?) AS FromMiti,
         (SELECT TOP 1 M_date FROM tbLocalDate WHERE M_Miti = ?) AS ToMiti`,
      [convertChequeRegisterDateToMiti(from), convertChequeRegisterDateToMiti(to)]
    );
    if (!conv?.FromMiti || !conv?.ToMiti) throw new HttpError(400, "Date not found in local calendar");
    return { dateType, from: conv.FromMiti, to: conv.ToMiti };
  }

  function parseIds(list, key) {
    if (!Array.isArray(list) || !list.length) throw new HttpError(400, "No values selected");
    const ids = list.map(i => Number(i[key]));
    if (ids.some(Number.isNaN)) throw new HttpError(400, "Invalid values selected");
    return ids;
  }

  function buildChequeQuery({ status, idColumn, idCount, dateType, excludeSystemLedger }) {
    const journalDate = dateType === "LD" ? "JM.JV_Miti" : "JM.JV_Date";
    const joinType = status === "cashed" ? "INNER JOIN" : "LEFT JOIN";
    const where = ["CIM.IssueDate BETWEEN ? AND ?", "LM.Category = 'AT'"];
    if (status === "uncashed") where.push("JD.DetailID IS NULL");
    if (excludeSystemLedger) where.push("LM.GLID <> 1");
    if (idColumn) where.push(`${idColumn} IN (${Array(idCount).fill("?").join(",")})`);

    return `
      SELECT CID.ChequeNo, SLM.SlAlias, SLM.SLName, SLM.SLID, LM.GLID,
             JD.DetailID, JM.VoucherNo, CIM.IssueDate,
             ${journalDate} AS JournalDate, JD.DrAmount
      FROM tbChequeIssueMaster CIM
      INNER JOIN tbSubLedgerMaster SLM ON SLM.SLID = CIM.SLID
      INNER JOIN tbChequeIssueDetails CID ON CID.ChequeIssueID = CIM.ChequeIssueID
      INNER JOIN tbLedgerMaster LM ON LM.GLID = SLM.GLID
      ${joinType} tbJournalDetails JD ON JD.ChequeNo = CID.ChequeNo AND JD.SLID = CIM.SLID
      ${joinType} tbJournalMaster JM ON JM.JournalID = JD.JournalID
      WHERE ${where.join(" AND ")}
      ORDER BY SLM.SLName ASC`;
  }

  const chequeRoute = ({ status, filter }) => async (req, res) => {
    try {
      const conn = req.session.conn;
      const { dateFromChequeR, dateToChequeR } = req.body;
      const ids = filter ? parseIds(req.body[filter.bodyKey], filter.idKey) : [];
      const { dateType, from, to } = await resolveDateRange(conn, dateFromChequeR, dateToChequeR);
      const query = buildChequeQuery({
        status, dateType, idColumn: filter?.column, idCount: ids.length,
        excludeSystemLedger: req.body.excludeSystemLedger === true
      });
      res.json({ data: await queryAsync(conn, query, [from, to, ...ids]) });
    } catch (err) {
      console.error("[Cheque Register]", err);
      res.status(err.status || 500).json({ error: err.message || "Error fetching data" });
    }
  };

  const listRoute = (query, key) => async (req, res) => {
    try {
      res.json({ [key]: await queryAsync(req.session.conn, query) });
    } catch (err) {
      console.error("SQL error:", err);
      res.status(500).json({ message: `Error fetching ${key}` });
    }
  };

  const BY_SLID = { bodyKey: "checkedCRmemValuesCR", idKey: "SLID", column: "SLM.SLID" };
  const BY_GLID = { bodyKey: "checkedCRlgrValuesCR", idKey: "GLID", column: "LM.GLID" };

  router.post("/fetch-chequeCashNNonCash-data",          chequeRoute({ status: "all" }));
  router.post("/fetch-chequeCashNNonCashUC-data",        chequeRoute({ status: "cashed" }));
  router.post("/fetch-chequeCashUCNNonCash-data",        chequeRoute({ status: "uncashed" }));
  router.post("/fetch-chequeCashNNonCashUC-filterdata",  chequeRoute({ status: "cashed",   filter: BY_SLID }));
  router.post("/fetch-chequeCashUCNNonCash-filterdata",  chequeRoute({ status: "uncashed", filter: BY_SLID }));
  router.post("/fetch-chequeCashNNonCashUC-filterdata2", chequeRoute({ status: "cashed",   filter: BY_GLID }));
  router.post("/fetch-chequeCashUCNNonCash-filterdata2", chequeRoute({ status: "uncashed", filter: BY_GLID }));
  router.post("/fetch-chequeAll-filterdata",             chequeRoute({ status: "all",      filter: BY_SLID }));
  router.post("/fetch-chequeAll-filterdata2",            chequeRoute({ status: "all",      filter: BY_GLID }));

  router.get("/fetchmemberListforPandR",
    listRoute("SELECT SLID, SLName, SlAlias FROM dbo.tbSubLedgerMaster ORDER BY SLName ASC", "AccName"));
  router.get("/fetchLedgerListforPandR",
    listRoute("SELECT GLID, GLName, GLAlias FROM dbo.tbLedgerMaster WHERE Category = 'AT' AND GLID <> 1", "postingLedgers"));

  return router;
};
