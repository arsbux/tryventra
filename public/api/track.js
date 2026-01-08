(function () {
    const script = document.currentScript;
    const founderId = script ? script.getAttribute('data-id') : null;
    if (!founderId) return;

    const endpoint = script.src.replace('.js', '/event');
    const sessionId = sessionStorage.getItem('v_sid') || Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('v_sid', sessionId);

    const visitorId = localStorage.getItem('v_vid') || Math.random().toString(36).substring(2, 15);
    localStorage.setItem('v_vid', visitorId);

    const track = (eventName, metadata = {}) => {
        const payload = {
            founder_id: founderId,
            session_id: sessionId,
            visitor_id: visitorId,
            event_name: eventName,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            ua: navigator.userAgent,
            screen_size: `${window.innerWidth}x${window.innerHeight}`,
            metadata,
            timestamp: new Date().toISOString()
        };

        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
            fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(() => { });
        }
    };

    // Track Pageview
    track('pageview');

    // Track Time Spent
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        track('session_end', { duration_seconds: duration });
    });

    // Track Sections Seen
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                track('section_view', { section_id: entry.target.id || entry.target.tagName });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section, [id]').forEach(el => observer.observe(el));

})();
