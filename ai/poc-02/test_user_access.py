import unittest

from user_access import (
    ROLES,
    has_permission,
    can_approve,
    can_edit,
    can_manage_users,
    can_approve_own_change,
)


class TestUserAccess(unittest.TestCase):

    def test_all_roles_exist(self):
        self.assertEqual(
            set(ROLES),
            {"ثبت‌کننده", "ناظر", "مدیر", "مدیر سیستم"}
        )

    def test_recorder_can_edit(self):
        self.assertTrue(can_edit("ثبت‌کننده"))

    def test_supervisor_can_approve(self):
        self.assertTrue(can_approve("ناظر"))

    def test_manager_can_manage_users(self):
        self.assertTrue(can_manage_users("مدیر"))

    def test_system_manager_has_full_access(self):
        self.assertTrue(has_permission("مدیر سیستم", "system.manage"))

    def test_recorder_cannot_approve(self):
        self.assertFalse(can_approve("ثبت‌کننده"))

    def test_reviewer_cannot_approve_own_change(self):
        self.assertFalse(
            can_approve_own_change(
                "ناظر",
                "user-100",
                "user-100"
            )
        )



    def test_permission_matrix(self):
        expected = {
            'ثبت‌کننده': {'record.create','record.edit','record.view_own','record.submit','history.view_own'},
            'ناظر': {'record.view','record.review','record.approve','record.return','history.view'},
            'مدیر': {'record.view','record.review','report.quality','report.performance','user.manage','history.view'},
            'مدیر سیستم': {'record.view','record.review','record.approve','record.return','report.quality','report.performance','user.manage','access.manage','system.manage','history.view'},
        }
        for role, permissions in expected.items():
            self.assertEqual(ROLES[role]['permissions'], permissions)

    def test_recorder_cannot_use_management_permissions(self):
        self.assertFalse(has_permission('ثبت‌کننده', 'record.approve'))
        self.assertFalse(has_permission('ثبت‌کننده', 'user.manage'))
        self.assertFalse(has_permission('ثبت‌کننده', 'system.manage'))

    def test_supervisor_cannot_manage_users(self):
        self.assertFalse(has_permission('ناظر', 'user.manage'))
        self.assertFalse(has_permission('ناظر', 'system.manage'))

    def test_manager_cannot_use_system_management(self):
        self.assertFalse(has_permission('مدیر', 'access.manage'))
        self.assertFalse(has_permission('مدیر', 'system.manage'))

    def test_unknown_role_has_no_permission(self):
        self.assertFalse(has_permission('نقش نامعتبر', 'record.view'))
        self.assertFalse(can_edit('نقش نامعتبر'))
        self.assertFalse(can_approve('نقش نامعتبر'))
        self.assertFalse(can_manage_users('نقش نامعتبر'))

    def test_missing_user_ids_cannot_approve(self):
        self.assertFalse(can_approve_own_change('ناظر', None, 'user-200'))
        self.assertFalse(can_approve_own_change('ناظر', 'user-100', None))

    def test_reviewer_can_approve_other_users_change(self):
        self.assertTrue(
            can_approve_own_change(
                "ناظر",
                "user-100",
                "user-200"
            )
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)