import unittest

import data_intelligence as d


class AnonymousPOC02Tests(unittest.TestCase):

    def test_anonymous_variants_same_location_are_duplicate(self):
        rows = [
            {
                "id": 1,
                "name": "گمنام",
                "lastname": "",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "*** شهید گمنام ***",
                "lastname": "",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
        ]

        findings = d.find_duplicate_groups(rows)

        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].category, "DUPLICATE")
        self.assertEqual(set(findings[0].record_ids), {1, 2})

    def test_anonymous_similar_location_is_not_duplicate(self):
        rows = [
            {
                "id": 1,
                "name": "گمنام",
                "lastname": "",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "شهید گمنام",
                "lastname": "",
                "piece": "24",
                "grave_row": "11",
                "grave_number": "5",
            },
        ]

        findings = d.find_duplicate_groups(rows)

        self.assertEqual(findings, [])

    def test_anonymous_different_locations_are_not_identity_conflict(self):
        rows = [
            {
                "id": 1,
                "name": "گمنام",
                "lastname": "",
                "piece": "24",
                "grave_row": "10",
                "grave_number": "5",
            },
            {
                "id": 2,
                "name": "شهید گمنام",
                "lastname": "",
                "piece": "24",
                "grave_row": "11",
                "grave_number": "5",
            },
        ]

        findings = d.find_identity_conflicts(rows)

        self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()
