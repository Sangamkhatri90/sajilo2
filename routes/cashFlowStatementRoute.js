// routes/cashFlowStatementRoute.js

const createJournalDates = require("./helpers/journalDates");

function registerCashFlowStatement(app, sql) {

    // Use the same SQL query style as the rest of your application.
    function queryAsync(conn, query, params = []) {
        return new Promise((resolve, reject) => {
            sql.query(conn, query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    }

    const dates = createJournalDates(sql);

    app.post("/api/cashFlowStatement", async (req, res) => {
        try {
            const conn = req.session?.conn;

            if (!conn) {
                return res.status(440).json({
                    success: false,
                    message: "Database session expired. Please select your organization again."
                });
            }

            const { cashbook, fromDate, toDate } = req.body || {};

            if (!String(cashbook || "").trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a Cash/Bank Book."
                });
            }

            if (!String(fromDate || "").trim() || !String(toDate || "").trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide both From Date and To Date."
                });
            }

            // 1. Date mode and date validation
            const isAD = await dates.getDateMode(conn);

            const from = dates.normDate(fromDate.trim(), isAD);
            const to = dates.normDate(toDate.trim(), isAD);

            if (
                !dates.dateRegex(isAD).test(from) ||
                !dates.dateRegex(isAD).test(to)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format."
                });
            }

            if (from > to) {
                return res.status(400).json({
                    success: false,
                    message: "From Date cannot be greater than To Date."
                });
            }

            const bounds = await dates.getPeriodDateBounds(
                conn,
                isAD,
                from,
                to
            );

            // 2. Resolve the selected Cash/Bank Book GLID
            const selectedLedger = await queryAsync(
                conn,
                `
                    SELECT TOP 1
                        GLID,
                        GLName,
                        GlAlias,
                        Category
                    FROM dbo.tbLedgerMaster
                    WHERE LTRIM(RTRIM(GLName)) = LTRIM(RTRIM(?))
                      AND Category IN ('C', 'B')
                `,
                [cashbook.trim()]
            );

            if (!selectedLedger.length) {
                return res.status(404).json({
                    success: false,
                    message: "Selected Cash/Bank Book was not found."
                });
            }

            const selectedGLID = selectedLedger[0].GLID;

            // 3. Select the opposite-side journal entries
            const dateCondition = isAD
                ? `
                    m.JV_Date >= CAST(? AS DATE)
                    AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))
                  `
                : `
                    m.JV_Miti BETWEEN ? AND ?
                  `;

            const transactionQuery = `
                SELECT
                    lm.GLID,
                    lm.GLName,
                    lm.GlAlias,
                    lm.Category,

                    lsg.LgrSubGrpID,
                    lsg.SubGrpName,
                    lsg.SubGrpAlias,

                    lg.LgrGrpID,
                    lg.GrpName,
                    lg.GrpAlias,

                    jd.SLID,
                    sl.SLName,
                    sl.MemberID,

                    SUM(ISNULL(jd.DrAmount, 0)) AS TotalDr,
                    SUM(ISNULL(jd.CrAmount, 0)) AS TotalCr

                FROM dbo.tbJournalDetails jd

                INNER JOIN dbo.tbJournalMaster m
                    ON m.JournalID = jd.JournalID

                INNER JOIN dbo.tbLedgerMaster lm
                    ON lm.GLID = jd.GLID

                LEFT JOIN dbo.tbLedgerSubGroup lsg
                    ON lsg.LgrSubGrpID = lm.LgrSubGrpID

                LEFT JOIN dbo.tbLedgerGroup lg
                    ON lg.LgrGrpID = lsg.LgrGrpID

                LEFT JOIN dbo.tbSubLedgerMaster sl
                    ON sl.SLID = jd.SLID

                WHERE
                    ${dateCondition}
                    AND jd.GLID <> ?

                    AND EXISTS (
                        SELECT 1
                        FROM dbo.tbJournalDetails selected
                        WHERE selected.JournalID = jd.JournalID
                          AND selected.GLID = ?
                    )

                GROUP BY
                    lm.GLID,
                    lm.GLName,
                    lm.GlAlias,
                    lm.Category,

                    lsg.LgrSubGrpID,
                    lsg.SubGrpName,
                    lsg.SubGrpAlias,

                    lg.LgrGrpID,
                    lg.GrpName,
                    lg.GrpAlias,

                    jd.SLID,
                    sl.SLName,
                    sl.MemberID

                ORDER BY
                    lg.LgrGrpID,
                    lsg.LgrSubGrpID,
                    lm.GLID,
                    jd.SLID
            `;

            const transactionRows = await queryAsync(
                conn,
                transactionQuery,
                [
                    from,
                    to,
                    selectedGLID,
                    selectedGLID
                ]
            );

            // 4. Calculate InFlow and OutFlow
            const rows = transactionRows.map(row => {
                const totalDr = Number(row.TotalDr) || 0;
                const totalCr = Number(row.TotalCr) || 0;

                const net = totalCr - totalDr;

                return {
                    GLID: row.GLID,
                    GLName: row.GLName,
                    GlAlias: row.GlAlias,
                    Category: row.Category,

                    LgrSubGrpID: row.LgrSubGrpID,
                    SubGrpName: row.SubGrpName,
                    SubGrpAlias: row.SubGrpAlias,

                    LgrGrpID: row.LgrGrpID,
                    GrpName: row.GrpName,
                    GrpAlias: row.GrpAlias,

                    SLID: row.SLID,
                    SLName: row.SLName,
                    MemberID: row.MemberID,

                    TotalDr: totalDr,
                    TotalCr: totalCr,

                    InFlow: Math.max(net, 0),
                    OutFlow: Math.max(-net, 0)
                };
            });

            // 5. Send the report data
            return res.json({
                success: true,

                selectedLedger: {
                    GLID: selectedGLID,
                    GLName: selectedLedger[0].GLName,
                    GlAlias: selectedLedger[0].GlAlias,
                    Category: selectedLedger[0].Category
                },

                dateMode: isAD ? "AD" : "LD",
                dateBounds: bounds,
                rows
            });

        } catch (error) {
            console.error("Cash Flow Statement Error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to generate Cash Flow Statement.",
                error: error.message
            });
        }
    });
}

module.exports = registerCashFlowStatement;
