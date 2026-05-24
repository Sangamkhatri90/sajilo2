
                // Enhanced loader: supports nested concurrent requests and smooth animation
                (function () {
                    const overlay = document.getElementById('page-loader');
                    const bar = document.getElementById('loader-bar');
                    const num = document.getElementById('loader-num');

                    if (!overlay || !bar || !num) return;

                    let activeRequests = 0;
                    let current = 0;
                    let target = 0;
                    let rafId = null;
                    let watchTimer = null;

                    function setVisual(v) {
                        const pct = Math.max(0, Math.min(100, Math.round(v)));
                        bar.style.width = pct + '%';
                        num.textContent = pct + '%';
                    }

                    function animate() {
                        current += (target - current) * 0.12 + 0.02;
                        if (Math.abs(target - current) < 0.3) current = target;
                        setVisual(current);
                        if (current !== target) rafId = requestAnimationFrame(animate);
                        else rafId = null;
                    }

                    function startFakeProgress() {
                        // move toward a safe intermediate target while work is active
                        target = Math.max(target, 50);
                        if (!rafId) animate();
                    }

                    function showLoading() {
                        activeRequests++;
                        if (activeRequests === 1) {
                            overlay.classList.remove('hidden');
                            overlay.setAttribute('aria-hidden', 'false');
                            // initial quick rise
                            target = 20;
                            if (!rafId) animate();
                            // then continue to fake progress
                            setTimeout(() => { if (activeRequests>0) startFakeProgress(); }, 120);
                            // start watchdog to avoid stuck overlay
                            if (watchTimer) clearTimeout(watchTimer);
                            watchTimer = setTimeout(() => {
                                console.warn('Loader watchdog: forcing hide after timeout');
                                // force-complete and reset
                                activeRequests = 0;
                                target = 100;
                                if (!rafId) animate();
                                setTimeout(() => {
                                    overlay.classList.add('hidden');
                                    overlay.setAttribute('aria-hidden', 'true');
                                    current = 0; target = 0; setVisual(0);
                                }, 350);
                            }, 20000); // 20s
                        }
                    }

                    function hideLoading() {
                        if (activeRequests > 0) activeRequests--;
                        if (activeRequests === 0) {
                            // finish to 100% then hide
                            target = 100;
                            if (!rafId) animate();
                            setTimeout(() => {
                                overlay.classList.add('hidden');
                                overlay.setAttribute('aria-hidden', 'true');
                                // reset values for next show
                                current = 0; target = 0; setVisual(0);
                                if (watchTimer) { clearTimeout(watchTimer); watchTimer = null; }
                            }, 350);
                        }
                    }

                    // One-time page-load loader: show immediately and hide on window.load
                    try {
                        showLoading();
                        window.addEventListener('load', () => {
                            // complete progress then hide
                            activeRequests = 0;
                            target = 100;
                            if (!rafId) animate();
                            setTimeout(() => {
                                overlay.classList.add('hidden');
                                overlay.setAttribute('aria-hidden', 'true');
                                current = 0; target = 0; setVisual(0);
                                if (watchTimer) { clearTimeout(watchTimer); watchTimer = null; }
                            }, 350);
                        });

                        // Allow manual dismiss on overlay click as a safety
                        overlay.addEventListener('click', function () {
                            console.warn('Overlay clicked: forcing loader hide');
                            activeRequests = 0;
                            target = 100;
                            if (!rafId) animate();
                            setTimeout(() => {
                                overlay.classList.add('hidden');
                                overlay.setAttribute('aria-hidden', 'true');
                                current = 0; target = 0; setVisual(0);
                                if (watchTimer) { clearTimeout(watchTimer); watchTimer = null; }
                            }, 150);
                        });
                    } catch (e) {
                        console.error('Loader init error', e);
                    }
                })();
