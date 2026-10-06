import unittest

from statistics_engine import build_statistics


class TestStatisticsEngine(unittest.TestCase):

    def sample_payload(self):
        return {
            "analysis": {
                "analysisId": "qa-test-01",
                "analyzedAt": "2026-10-05T08:00:00+00:00",
                "sourceType": "snapshot",
                "sourceFile": "snapshot.json",
            },
            "quality": {
                "clean": 2,
                "problem": 1,
            },
            "issueCounts": {
                "مرحله خالی": 1,
            },
            "records": [
                {
                    "id": 1,
                    "operation": {
                        "stone_type": "ترمیمی",
                        "stage_normalized": "سنگ مرمت شده نصب شد",
                    },
                    "location": {
                        "piece": "24",
                    },
                    "status": "تأیید شده",
                    "quality": {
                        "status": "کامل",
                        "issues": [],
                    },
                    "scope": {
                        "official_piece": True,
                    },
                },
                {
                    "id": 2,
                    "operation": {
                        "stone_type": "تعویضی",
                        "stage_normalized": "سنگ تعویضی نصب شد",
                    },
                    "location": {
                        "piece": "26",
                    },
                    "status": "تأیید شده",
                    "quality": {
                        "status": "کامل",
                        "issues": [],
                    },
                    "scope": {
                        "official_piece": True,
                    },
                },
                {
                    "id": 3,
                    "operation": {
                        "stone_type": None,
                        "stage_normalized": None,
                    },
                    "location": {
                        "piece": "24",
                    },
                    "status": "تأیید شده",
                    "quality": {
                        "status": "ناقص",
                        "issues": ["مرحله خالی"],
                    },
                    "scope": {
                        "official_piece": False,
                    },
                },
            ],
        }

    def test_total_records(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(result["totals"]["records"], 3)

    def test_stone_type_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["operations"]["stoneType"],
            {
                "تعویضی": 1,
                "ترمیمی": 1,
                "نامشخص": 1,
            },
        )

    def test_stage_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["stages"]["counts"],
            {
                "سنگ تعویضی نصب شد": 1,
                "سنگ مرمت شده نصب شد": 1,
                "نامشخص": 1,
            },
        )

    def test_stage_shares(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["stages"]["shares"]["سنگ تعویضی نصب شد"]["count"],
            1,
        )
        self.assertEqual(
            result["stages"]["shares"]["سنگ تعویضی نصب شد"]["share_percent"],
            33.33,
        )

    def test_piece_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["pieces"],
            {
                "24": 2,
                "26": 1,
            },
        )

    def test_quality_summary(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(result["quality"]["clean"], 2)
        self.assertEqual(result["quality"]["problem"], 1)
        self.assertEqual(
            result["quality"]["statusCounts"],
            {
                "کامل": 2,
                "ناقص": 1,
            },
        )

    def test_quality_issue_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["quality"]["issueCounts"]["مرحله خالی"],
            1,
        )

    def test_scope_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(result["totals"]["officialRecords"], 2)
        self.assertEqual(result["totals"]["outOfScopeRecords"], 1)
        self.assertEqual(
            result["totals"]["officialSharePercent"],
            66.67,
        )

    def test_status_counts(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["status"]["counts"],
            {"تأیید شده": 3},
        )

    def test_source_metadata(self):
        result = build_statistics(self.sample_payload())
        self.assertEqual(
            result["source"]["analysisId"],
            "qa-test-01",
        )
        self.assertEqual(
            result["source"]["sourceFile"],
            "snapshot.json",
        )

    def test_invalid_records_type(self):
        payload = self.sample_payload()
        payload["records"] = {}
        with self.assertRaises(ValueError):
            build_statistics(payload)


if __name__ == "__main__":
    unittest.main(verbosity=2)