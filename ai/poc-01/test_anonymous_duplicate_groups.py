import sys
import unittest

sys.path.insert(0, r"..\poc-01")

from matching_engine import duplicate_groups


class AnonymousDuplicateGroupTests(unittest.TestCase):

    def test_anonymous_variants_same_location_form_duplicate_group(self):
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

        groups = duplicate_groups(rows)

        self.assertEqual(len(groups), 1)
        self.assertEqual(len(next(iter(groups.values()))), 2)

    def test_anonymous_similar_location_is_not_duplicate_group(self):
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

        groups = duplicate_groups(rows)

        self.assertEqual(groups, {})


if __name__ == "__main__":
    unittest.main()
