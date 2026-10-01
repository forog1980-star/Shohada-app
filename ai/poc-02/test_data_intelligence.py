import unittest

from data_intelligence import (
    normalize_stage,
    find_duplicate_groups,
    classify_duplicate_group,
    find_identity_conflicts,
    find_location_conflicts,
    find_incomplete_records,
    find_field_conflicts,
    find_stage_normalizations,
    find_stage_anomalies,
    analyze_records,
)


class TestDataIntelligence(unittest.TestCase):

    def test_stage_normalization(self):
        self.assertEqual(
            normalize_stage("نصب سنگ مرمت شده"),
            "نصب مرمتی شده",
        )

        self.assertEqual(
            normalize_stage("سنگ تعویضی نصب شد"),
            "نصب تعویضی شده",
        )

        self.assertEqual(
            normalize_stage("تعویضی نصب شده"),
            "نصب تعویضی شده",
        )

        self.assertEqual(
            normalize_stage("ارسال به واحد تعویض"),
            "ارسال به واحد تعویض",
        )

    def test_duplicate_same_record(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "رضایی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 2,
                "name": " احمد ",
                "lastname": "رضایی",
                "piece": "۲۴",
                "grave_row": "10",
                "grave_number": "۵",
                "stone_type": "ترمیمی",
                "stage": "نصب سنگ مرمت شده",
            },
        ]

        findings = find_duplicate_groups(records)

        self.assertEqual(len(findings), 1)

        finding = findings[0]

        self.assertEqual(
            finding.category,
            "DUPLICATE",
        )

        self.assertEqual(
            finding.record_ids,
            [1, 2],
        )

        self.assertEqual(
            len(finding.records),
            2,
        )

        self.assertEqual(
            finding.reason,
            "formatting_only_duplicate",
        )

    def test_duplicate_field_conflict(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "رضایی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 2,
                "name": "احمد",
                "lastname": "رضایی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "تعویضی",
                "stage": "نصب تعویضی شده",
            },
        ]

        findings = find_duplicate_groups(records)

        self.assertEqual(len(findings), 1)

        finding = findings[0]

        self.assertEqual(
            finding.category,
            "DUPLICATE",
        )

        self.assertEqual(
            finding.reason,
            "field_conflict_duplicate",
        )

        self.assertEqual(
            finding.record_ids,
            [1, 2],
        )

    def test_classify_duplicate_group(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "رضایی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 2,
                "name": "احمد",
                "lastname": "رضایی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "تعویضی",
                "stage": "نصب تعویضی شده",
            },
        ]

        result = classify_duplicate_group(records)

        self.assertEqual(
            result[0],
            "field_conflict_duplicate",
        )

        self.assertIsInstance(
            result[1],
            dict,
        )

    def test_identity_conflict(self):
        records = [
            {
                "id": 1,
                "name": "محمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "محمد",
                "lastname": "کریمی",
                "piece": "26",
                "grave_row": "20",
                "grave_number": "8",
            },
        ]

        findings = find_identity_conflicts(records)

        self.assertEqual(len(findings), 1)

        finding = findings[0]

        self.assertEqual(
            finding.category,
            "IDENTITY_CONFLICT",
        )

        self.assertEqual(
            finding.record_ids,
            [1, 2],
        )

        self.assertEqual(
            len(finding.records),
            2,
        )

    def test_location_conflict(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "رضا",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
        ]

        findings = find_location_conflicts(records)

        self.assertEqual(len(findings), 1)

        finding = findings[0]

        self.assertEqual(
            finding.category,
            "LOCATION_CONFLICT",
        )

        self.assertEqual(
            finding.record_ids,
            [1, 2],
        )

        self.assertEqual(
            len(finding.records),
            2,
        )

    def test_incomplete_data(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "",
                "lastname": "رضایی",
                "piece": "26",
                "grave_row": "10",
                "grave_number": "8",
            },
        ]

        findings = find_incomplete_records(records)

        self.assertEqual(len(findings), 2)

        ids = {
            finding.record_ids[0]
            for finding in findings
        }

        self.assertEqual(
            ids,
            {1, 2},
        )

    def test_field_conflict(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 2,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "تعویضی",
                "stage": "نصب تعویضی شده",
            },
        ]

        findings = find_field_conflicts(records)

        self.assertEqual(len(findings), 1)

        finding = findings[0]

        self.assertEqual(
            finding.record_ids,
            [1, 2],
        )

        self.assertIsInstance(
            finding.details,
            dict,
        )

    def test_stage_normalizations(self):
        records = [
            {
                "id": 1,
                "stage": "نصب سنگ مرمت شده",
            },
            {
                "id": 2,
                "stage": "سنگ تعویضی نصب شد",
            },
            {
                "id": 3,
                "stage": "نصب مرمتی شده",
            },
        ]

        findings = find_stage_normalizations(records)

        self.assertEqual(len(findings), 2)

        ids = {
            finding.record_ids[0]
            for finding in findings
        }

        self.assertEqual(
            ids,
            {1, 2},
        )

        for finding in findings:
            self.assertIsInstance(
                finding.details,
                dict,
            )

    def test_stage_anomalies(self):
        records = [
            {
                "id": 1,
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 2,
                "stage": "مرحله ناشناخته آزمایشی",
            },
            {
                "id": 3,
                "stage": "",
            },
        ]

        findings = find_stage_anomalies(records)

        self.assertEqual(len(findings), 1)

        self.assertEqual(
            findings[0].record_ids,
            [2],
        )

        self.assertEqual(
            findings[0].category,
            "STAGE_ANOMALY",
        )

    def test_full_analysis(self):
        records = [
            {
                "id": 1,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب سنگ مرمت شده",
            },
            {
                "id": 2,
                "name": "احمد",
                "lastname": "کریمی",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
                "stone_type": "ترمیمی",
                "stage": "نصب مرمتی شده",
            },
            {
                "id": 3,
                "name": "رضا",
                "lastname": "کریمی",
                "piece": "26",
                "grave_row": "20",
                "grave_number": "8",
                "stone_type": "تعویضی",
                "stage": "مرحله ناشناخته",
            },
        ]

        report = analyze_records(records)

        self.assertEqual(
            report.total_records,
            3,
        )

        self.assertEqual(
            len(report.duplicate_groups),
            1,
        )

        self.assertEqual(
            len(report.stage_normalizations),
            1,
        )

        self.assertEqual(
            len(report.stage_anomalies),
            1,
        )

        self.assertEqual(
            report.duplicate_record_count,
            2,
        )

        self.assertEqual(
            report.stage_normalization_record_count,
            1,
        )

        self.assertEqual(
            report.stage_anomaly_record_count,
            1,
        )


if __name__ == "__main__":
    unittest.main()