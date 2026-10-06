import sys
import unittest

sys.path.insert(0, r"..\poc-01")

from matching_engine import conflict_groups


class AnonymousConflictTests(unittest.TestCase):

    def test_anonymous_same_identity_different_locations_is_not_conflict(self):
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

        result = conflict_groups(rows)

        self.assertEqual(result, {})


if __name__ == "__main__":
    unittest.main()
