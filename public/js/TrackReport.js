
                        document.addEventListener('DOMContentLoaded', () => {
                            console.log("✅ DOM loaded — Tracker initialized (observer mode)");

                            let currentLoginID = null;

                            async function getNextLoginID() {
                                if (currentLoginID) return currentLoginID;

                                try {
                                    console.log("📡 Fetching next LoginID from server...");
                                    const res = await fetch('/api/getNextLoginID');
                                    const data = await res.json();
                                    currentLoginID = data.nextLoginID;
                                    console.log("✅ Received LoginID:", currentLoginID);
                                    return currentLoginID;
                                } catch (err) {
                                    console.error("❌ Error fetching LoginID:", err);
                                    return 1;
                                }
                            }

                            // Attach a MutationObserver to watch for display changes
                            const observer = new MutationObserver(async (mutationsList) => {
                                for (const mutation of mutationsList) {
                                    if (mutation.type === "attributes" && mutation.attributeName === "style") {
                                        const div = mutation.target;
                                        const computedDisplay = window.getComputedStyle(div).display;

                                        // Detect div shown (hit)
                                        if (computedDisplay === "block" && !div.dataset.sessionId) {
                                            const reportName = div.dataset.reportName || div.id;

                                            const hitTime = new Date().toISOString();
                                            const loginID = await getNextLoginID();

                                            console.log(`🟢 Detected open for: ${reportName} at ${hitTime}`);

                                            try {
                                                const res = await fetch('/api/reportHit', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ reportName, hitTime, loginID })
                                                });
                                                const data = await res.json();
                                                console.log("📥 /api/reportHit response:", data);

                                                if (data.success) {
                                                    div.dataset.sessionId = data.sessionId;
                                                    console.log(`✅ Hit recorded. CountID (sessionId): ${data.sessionId}`);
                                                } else {
                                                    console.error("❌ Failed to record hit:", data.error);
                                                }
                                            } catch (err) {
                                                console.error("❌ Error sending hit:", err);
                                            }
                                        }

                                        // Detect div hidden (close)
                                        if (computedDisplay === "none" && div.dataset.sessionId) {
                                            const sessionId = div.dataset.sessionId;
                                            const closeTime = new Date().toISOString();
                                            console.log(`🔴 Detected close for: ${div.id} (sessionId: ${sessionId})`);

                                            try {
                                                const res = await fetch('/api/reportClose', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ sessionId, closeTime })
                                                });
                                                const data = await res.json();
                                                console.log("📥 /api/reportClose response:", data);
                                                if (data.success) {
                                                    delete div.dataset.sessionId;
                                                    console.log(`✅ CloseTime recorded for CountID ${sessionId}`);
                                                }
                                            } catch (err) {
                                                console.error("❌ Error sending close:", err);
                                            }
                                        }
                                    }
                                }
                            });

                            // Observe all report divs
                            document.querySelectorAll('.report-div').forEach(div => {
                                observer.observe(div, { attributes: true, attributeFilter: ['style'] });
                            });

                            console.log("👀 Observing all report-div elements for display changes");
                        });
                   

                  