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

    const pathsMatch = (left, right) => left.length === right.length &&
        left.every((part, index) => permissionKey(part) === permissionKey(right[index]));
    const findAccessPermission = (permissions, path) => {
        const requestedPath = Array.isArray(path) ? path : [path];
        const findBestMatch = (candidatePath) => permissions
            .filter((permission) => pathsMatch(permission.path || [permission.label], candidatePath))
            .sort((left, right) => Number(right.hasUserRight) - Number(left.hasUserRight))[0];
        const matchedRight = findBestMatch(requestedPath);
        if (!matchedRight) return null;

        const inheritedPermissions = [];
        for (let length = 1; length <= requestedPath.length; length += 1) {
            const ancestor = findBestMatch(requestedPath.slice(0, length));
            if (ancestor) inheritedPermissions.push(ancestor);
        }
        return {
            rightId: matchedRight.rightId,
            access: inheritedPermissions.every((permission) => allowed(permission.access)) ? 1 : 0,
            new: matchedRight.new,
            edit: matchedRight.edit,
            delete: matchedRight.delete,
            parentRightID: matchedRight.parentRightID
        };
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
    const applyUserRightActions = (panel, permission) => {
        if (!panel || !permission) return;

        console.log('[UserRight actions]', {
            RightId: permission.rightId,
            NewAction: permission.new,
            EditAction: permission.edit,
            DeleteAction: permission.delete
        });

        const actionValues = {
            new: permission.new,
            edit: permission.edit,
            delete: permission.delete
        };
        panel.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach((control) => {
            const label = String(control.value || control.textContent || '').trim().toLowerCase();
            const action = ['new', 'edit', 'delete'].find((name) => new RegExp('\\b' + name + '\\b').test(label));
            if (!action || Number(actionValues[action]) === 1 || control.dataset.actionPermissionChecked === 'true') return;


            control.dataset.actionPermissionChecked = 'true';
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

        const rights = data.rightInfo || [];
        const rightsById = new Map(rights.map((right) => [String(right.RightId), right]));
        const rightPathCache = new Map();
        const getRightPath = (rightId, trail = new Set()) => {
            const id = String(rightId);
            if (rightPathCache.has(id)) return rightPathCache.get(id);
            if (trail.has(id)) return [];

            const right = rightsById.get(id);
            if (!right) return [];

            const nextTrail = new Set(trail);
            nextTrail.add(id);
            const parentId = Number(right.ParentRightID);
            const parentPath = parentId > 0 ? getRightPath(parentId, nextTrail) : [];
            const path = [...parentPath, right.RightDescription];
            rightPathCache.set(id, path);
            return path;
        };
        console.table(rights.map((right) => ({
            UserId: data.userId,
            RightId: right.RightId,
            Access: right.Access,
            NewAction: right.NewAction,
            EditAction: right.EditAction,
            DeleteAction: right.DeleteAction,
            HasUserRight: right.HasUserRight
        })));

        const rightInfo = rights
            .filter((right) => permissionKey(right.RootDescription) === permissionKey('ACCESS RIGHTS'))
            .map((right) => ({
                rightId: right.RightId,
                label: right.RightDescription,
                access: right.Access,
                hasUserRight: Number(right.HasUserRight) === 1,
                new: right.NewAction,
                edit: right.EditAction,
                delete: right.DeleteAction,
                parentRightID: right.ParentRightID,
                path: getRightPath(right.RightId).slice(1)
            }));
        const voucherRights = (data.voucherRights || []).map((right) => ({
            menuName: right.menuName,
            access: right.access,
            new: right.new,
            edit: right.edit,
            delete: right.del
        }));


        const getMenuPath = (link) => {
            const path = [];
            let item = link.closest('li');
            while (item) {
                const directLink = Array.from(item.children).find((child) => child.matches('a')) ||
                    Array.from(item.children)
                        .filter((child) => child.matches('div'))
                        .flatMap((child) => Array.from(child.children))
                        .find((child) => child.matches('a.uls'));
                if (directLink) path.unshift(directLink.textContent.trim());
                item = item.parentElement?.closest('li');
            }
            return path;
        };

        document.querySelectorAll('a[id^="toggleButton"]').forEach((link) => {
            const right = findAccessPermission(rightInfo, getMenuPath(link));
            const voucher = findPermission(voucherRights, link.textContent.trim());
            const permission = right || voucher;
            if (!permission) return;

            if (!right || Number(right.parentRightID) !== 1) restrictLink(link, permission);
            if (!allowed(permission.access)) return;

            if (voucher) {
                link.addEventListener('click', () => {
                    const panelId = link.id.replace('toggleButton', 'movableDiv');
                    setTimeout(() => applyVoucherActions(document.getElementById(panelId), voucher), 0);
                });
            }
            if (right) {
                const panel = document.getElementById(link.id.replace('toggleButton', 'movableDiv'));
                if (panel) {
                    link.addEventListener('click', () => {
                        setTimeout(() => applyUserRightActions(panel, right), 0);
                    });
                }
            }
        });

        document.querySelectorAll('.navbar-menu a.uls, .navbar-menu .dropdown-menu a:not([id^="toggleButton"])').forEach((link) => {
            const right = findAccessPermission(rightInfo, getMenuPath(link));
            if (right && Number(right.parentRightID) !== 1) restrictLink(link, right);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadPermissions().catch((error) => console.error('Permission loading failed:', error));
    });
})();