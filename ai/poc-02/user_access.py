ROLES = {
    "ثبت‌کننده": {
        "permissions": {
            "record.create",
            "record.edit",
            "record.view_own",
            "record.submit",
            "history.view_own",
        }
    },
    "ناظر": {
        "permissions": {
            "record.view",
            "record.review",
            "record.approve",
            "record.return",
            "history.view",
        }
    },
    "مدیر": {
        "permissions": {
            "record.view",
            "record.review",
            "report.quality",
            "report.performance",
            "user.manage",
            "history.view",
        }
    },
    "مدیر سیستم": {
        "permissions": {
            "record.view",
            "record.review",
            "record.approve",
            "record.return",
            "report.quality",
            "report.performance",
            "user.manage",
            "access.manage",
            "system.manage",
            "history.view",
        }
    },
}


def has_permission(role, permission):
    role_data = ROLES.get(role)
    if not role_data:
        return False

    return permission in role_data["permissions"]


def can_edit(role):
    return has_permission(role, "record.edit")


def can_approve(role):
    return has_permission(role, "record.approve")


def can_manage_users(role):
    return has_permission(role, "user.manage")


def can_approve_own_change(role, recorder_user_id, reviewer_user_id):
    if recorder_user_id is None or reviewer_user_id is None:
        return False

    if recorder_user_id == reviewer_user_id:
        return False

    return can_approve(role)
