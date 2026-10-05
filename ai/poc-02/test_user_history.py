import unittest
from datetime import datetime

from user_history import (
    create_history_entry,
    summarize_user_history,
    filter_history_by_user,
)


class TestUserHistory(unittest.TestCase):

    def test_create_history_entry(self):
        entry = create_history_entry(
            user_id="user-100",
            user_role="ثبت‌کننده",
            operation="ثبت رکورد",
            record_id=9790,
            status="انجام شد",
            result="موفق",
            note="ثبت آزمایشی",
            timestamp="2026-10-05T08:00:00+00:00",
        )

        self.assertEqual(entry["user_id"], "user-100")
        self.assertEqual(entry["record_id"], "9790")
        self.assertEqual(entry["result"], "موفق")

    def test_create_history_requires_user(self):
        with self.assertRaises(ValueError):
            create_history_entry(
                user_id="",
                user_role="ثبت‌کننده",
                operation="ثبت رکورد",
                record_id=9790,
                status="انجام شد",
                result="موفق",
            )

    def test_create_history_requires_operation(self):
        with self.assertRaises(ValueError):
            create_history_entry(
                user_id="user-100",
                user_role="ثبت‌کننده",
                operation="",
                record_id=9790,
                status="انجام شد",
                result="موفق",
            )

    def test_create_history_requires_record_id(self):
        with self.assertRaises(ValueError):
            create_history_entry(
                user_id='user-100',
                user_role='ثبت‌کننده',
                operation='ثبت رکورد',
                record_id=None,
                status='انجام شد',
                result='موفق',
            )

    def test_create_history_generates_timestamp(self):
        entry = create_history_entry(
            user_id='user-100',
            user_role='ثبت‌کننده',
            operation='ثبت رکورد',
            record_id=9790,
            status='انجام شد',
            result='موفق',
        )

        self.assertIn('timestamp', entry)
        self.assertTrue(entry['timestamp'])
        datetime.fromisoformat(entry['timestamp'])

    def test_create_history_preserves_given_timestamp(self):
        timestamp = '2026-10-05T08:00:00+00:00'
        entry = create_history_entry(
            user_id='user-100',
            user_role='ثبت‌کننده',
            operation='ثبت رکورد',
            record_id=9790,
            status='انجام شد',
            result='موفق',
            timestamp=timestamp,
        )

        self.assertEqual(entry['timestamp'], timestamp)

    def test_summarize_ignores_entries_without_user_id(self):
        entries = [
            {'user_id': 'user-100', 'result': 'موفق'},
            {'user_id': '', 'result': 'موفق'},
            {'result': 'موفق'},
            {'user_id': 'user-200', 'result': 'تأیید نهایی'},
        ]

        result = summarize_user_history(entries)

        summary = {item['user_id']: item for item in result}

        self.assertEqual(set(summary), {'user-100', 'user-200'})
        self.assertEqual(summary['user-100']['total_operations'], 1)
        self.assertEqual(summary['user-200']['total_operations'], 1)

    def test_filter_history_by_user(self):
        entries = [
            {"user_id": "user-100", "operation": "ثبت"},
            {"user_id": "user-200", "operation": "تأیید"},
            {"user_id": "user-100", "operation": "اصلاح"},
        ]

        result = filter_history_by_user(entries, "user-100")

        self.assertEqual(len(result), 2)
        self.assertEqual(
            [item["operation"] for item in result],
            ["ثبت", "اصلاح"],
        )

    def test_summarize_user_history(self):
        entries = [
            {"user_id": "user-100", "result": "موفق"},
            {"user_id": "user-100", "result": "برگشت برای اصلاح"},
            {"user_id": "user-100", "result": "موفق"},
            {"user_id": "user-200", "result": "تأیید نهایی"},
        ]

        result = summarize_user_history(entries)

        summary = {
            item["user_id"]: item
            for item in result
        }

        self.assertEqual(summary["user-100"]["total_operations"], 3)
        self.assertEqual(summary["user-100"]["successful_operations"], 2)
        self.assertEqual(summary["user-100"]["returned_operations"], 1)

        self.assertEqual(summary["user-200"]["total_operations"], 1)
        self.assertEqual(summary["user-200"]["approved_operations"], 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)