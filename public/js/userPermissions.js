(() => {
    const normalize = (value) => String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '');

    const allowed = (value) => value === null || value === true || Number(value) === 1;
    const notifyDenied = () => {
        const message = 'Access denied.';
        if (typeof showCustomAlert === 'function') showCustomAlert(message);
        else alert(message);
    };

    const findPermission = (permissions, label) => {
        const key = normalize(label);
        return permissions.find((permission) => normalize(permission.label || permission.menuName) === key);
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

        const rightInfo = (data.rightInfo || []).map((right) => ({
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

        document.querySelectorAll('a[id^="toggleButton"]').forEach((link) => {
            const label = link.textContent.trim();
            const right = findPermission(rightInfo, label);
            const voucher = findPermission(voucherRights, label);
            const permission = right || voucher;
            if (!permission) return;

            if (!allowed(permission.access)) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    notifyDenied();
                }, true);
                link.setAttribute('aria-disabled', 'true');
                return;
            }

            if (voucher) {
                link.addEventListener('click', () => {
                    const panelId = link.id.replace('toggleButton', 'movableDiv');
                    setTimeout(() => applyVoucherActions(document.getElementById(panelId), voucher), 0);
                });
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadPermissions().catch((error) => console.error('Permission loading failed:', error));
    });
})();