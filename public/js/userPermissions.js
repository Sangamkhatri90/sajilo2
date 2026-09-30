(() => {
    const normalize = (value) => String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '');

    const allowed = (value) => value === null || Number(value) === 1;
    const permissionAliases = new Map([
        ['docclass', 'documentclass'],
        ['definenepalicalender', 'definenepalicalendar'],
        ['maturefdtransfer', 'maturedfdtransfer'],
        ['repothitcountreport', 'reporthitcountreport'],
        ['dartachalani', 'accesschalan']
    ]);
    const notifyDenied = () => {
        const message = 'Access denied.';
        if (typeof showCustomAlert === 'function') showCustomAlert(message);
        else alert(message);
    };

    const permissionKey = (value) => {
        const key = normalize(value)
            .replace(/reports$/, 'report')
            .replace(/books$/, 'book')
            .replace(/settings$/, 'setting')
            .replace(/entries$/, 'entry')
            .replace(/s$/, '');
        return permissionAliases.get(key) || key;
    };

    const findPermission = (permissions, label) => {
        const key = permissionKey(label);
        return permissions.find((permission) => permissionKey(permission.label || permission.menuName) === key);
    };

    const findAccessPermission = (permissions, label) => {
        const key = permissionKey(label);
        const matches = permissions.filter((permission) => permissionKey(permission.label) === key);
        if (!matches.length) return null;
        return { access: matches.every((permission) => allowed(permission.access)) ? 1 : 0 };
    };

    const restrictLink = (link, permission) => {
        if (allowed(permission.access) || link.dataset.permissionChecked === 'true') return;

        link.dataset.permissionChecked = 'true';
        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            notifyDenied();
        }, true);
        link.setAttribute('aria-disabled', 'true');
    };

    const applyVoucherActions = (panel, permission) => {
        if (!panel || !permission) return;

        panel.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach((control) => {
            if (control.dataset.permissionChecked === 'true') return;

            const label = String(control.value || control.textContent || '').trim().toLowerCase();
            const action = ['new', 'edit', 'delete'].find((name) => new RegExp('\\b' + name + '\\b').test(label));
            if (!action || allowed(permission[action])) return;

            control.dataset.permissionChecked = 'true';
            control.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                notifyDenied();
            }, true);
        });
    };

    const loadPermissions = async () => {
        const response = await fetch('/api/current-user-permissions');
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load permissions.');
        if (data.isAdmin) return;

        const rightInfo = (data.rightInfo || [])
            .filter((right) => permissionKey(right.RootDescription) === permissionKey('ACCESS RIGHTS'))
            .map((right) => ({
            label: right.RightDescription,
            access: right.Access
        }));
        const voucherRights = (data.voucherRights || []).map((right) => ({
            menuName: right.menuName,
            access: right.access,
            new: right.new,
            edit: right.edit,
            delete: right.del
        }));

        const systemPermission = findAccessPermission(rightInfo, 'System');
        if (!systemPermission || !allowed(systemPermission.access)) {
            const systemMenu = Array.from(document.querySelectorAll('.navbar-menu > .menu-item'))
                .find((item) => permissionKey(item.querySelector('a.uls')?.textContent) === permissionKey('System'));
            systemMenu?.style.setProperty('display', 'none', 'important');
        }

        document.querySelectorAll('a[id^="toggleButton"]').forEach((link) => {
            const label = link.textContent.trim();
            const right = findAccessPermission(rightInfo, label);
            const voucher = findPermission(voucherRights, label);
            const permission = right || voucher;
            if (!permission) return;

            restrictLink(link, permission);
            if (!allowed(permission.access)) return;

            if (voucher) {
                link.addEventListener('click', () => {
                    const panelId = link.id.replace('toggleButton', 'movableDiv');
                    setTimeout(() => applyVoucherActions(document.getElementById(panelId), voucher), 0);
                });
            }
        });

        document.querySelectorAll('.navbar-menu a.uls, .navbar-menu .dropdown-menu a:not([id^="toggleButton"])').forEach((link) => {
            const right = findAccessPermission(rightInfo, link.textContent.trim());
            if (right) restrictLink(link, right);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadPermissions().catch((error) => console.error('Permission loading failed:', error));
    });
})();