import unittest

from matching_engine import (
    MATCH_EXACT,
    MATCH_NONE,
    MATCH_SIMILAR,
    classify,
    conflict_groups,
    duplicate_groups,
    normalize,
)


class MatchingEngineTests(unittest.TestCase):
    def test_persian_normalization(self):
        self.assertEqual(
            normalize("  محمد‌حسين ۱۲۳ ي ك  "),
            "محمد حسین 123 ی ک",
        )
        self.assertEqual(normalize("آزاده"), "آزاده")

    def test_exact_uses_normalized_identity_and_location(self):
        source = {
            "name": "محمد حسين",
            "lastname": "حیدری",
            "piece": "۲۹",
            "grave_row": "۶۱",
            "grave_number": "۳",
        }
        candidate = {
            "name": "محمد حسین",
            "lastname": "حیدری",
            "piece": "29",
            "grave_row": "61",
            "grave_number": "3",
        }
        result = classify(source, [candidate])
        self.assertEqual(result.classification, MATCH_EXACT)
        self.assertEqual(len(result.exact), 1)

    def test_father_conflict_blocks_exact(self):
        source = {
            "name": "علی",
            "lastname": "احمدی",
            "father_name": "حسن",
            "piece": "24",
            "grave_row": "10",
            "grave_number": "5",
        }
        candidate = {**source, "father_name": "رضا"}
        result = classify(source, [candidate])
        self.assertEqual(result.classification, "CONFLICT")
        self.assertEqual(len(result.conflicts), 1)
        self.assertEqual(len(result.exact), 0)

    def test_same_identity_different_location_is_similar(self):
        source = {
            "name": "محمد",
            "lastname": "حیدری",
            "piece": "29",
            "grave_row": "61",
            "grave_number": "3",
        }
        candidate = {**source, "piece": "30"}
        result = classify(source, [candidate])
        self.assertEqual(result.classification, MATCH_SIMILAR)
        self.assertEqual(len(result.similar), 1)

    def test_no_match(self):
        source = {
            "name": "علی",
            "lastname": "احمدی",
            "piece": "1",
            "grave_row": "1",
            "grave_number": "1",
        }
        candidate = {
            "name": "رضا",
            "lastname": "کریمی",
            "piece": "50",
            "grave_row": "80",
            "grave_number": "20",
        }
        result = classify(source, [candidate])
        self.assertEqual(result.classification, MATCH_NONE)

    def test_duplicate_groups(self):
        a = {"name": "محمد", "lastname": "حیدری", "piece": "29", "grave_row": "61", "grave_number": "3"}
        b = {"name": "محمد", "lastname": "حیدری", "piece": "۲۹", "grave_row": "۶۱", "grave_number": "۳"}
        c = {"name": "محمد", "lastname": "حیدری", "piece": "29", "grave_row": "62", "grave_number": "3"}
        groups = duplicate_groups([a, b, c])
        self.assertEqual(len(groups), 1)
        self.assertEqual(len(next(iter(groups.values()))), 2)

    def test_conflict_groups(self):
        same_person = [
            {"name": "محمد", "lastname": "حیدری", "piece": "29", "grave_row": "61", "grave_number": "3"},
            {"name": "محمد", "lastname": "حیدری", "piece": "29", "grave_row": "62", "grave_number": "3"},
        ]
        same_location = [
            {"name": "علی", "lastname": "احمدی", "piece": "24", "grave_row": "10", "grave_number": "5"},
            {"name": "رضا", "lastname": "کریمی", "piece": "24", "grave_row": "10", "grave_number": "5"},
        ]
        result = conflict_groups(same_person + same_location)
        self.assertEqual(len(result), 2)


class ImportTests(unittest.TestCase):
    def test_module_imports(self):
        import matching_engine  # noqa: F401


if __name__ == "__main__":
    unittest.main()
