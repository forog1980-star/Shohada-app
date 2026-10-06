import sys
import unittest

sys.path.insert(0, r"..\poc-01")

from matching_engine import MATCH_EXACT, MATCH_NONE, MATCH_SIMILAR, classify


class AnonymousMartyrTests(unittest.TestCase):

    def test_anonymous_same_location_is_exact(self):
        source = {
            "name": "*** گمنام ***",
            "lastname": "",
            "piece": "24",
            "grave_row": "10",
            "grave_number": "5",
        }
        candidate = {
            "name": "(شهید گمنام)",
            "lastname": "",
            "piece": "24",
            "grave_row": "10",
            "grave_number": "5",
        }

        result = classify(source, [candidate])

        self.assertEqual(result.classification, MATCH_EXACT)

    def test_anonymous_similar_location_is_similar(self):
        source = {
            "name": "* گمنام **",
            "lastname": "",
            "piece": "24",
            "grave_row": "10",
            "grave_number": "5",
        }
        candidate = {
            "name": "*** شهید گمنام ***",
            "lastname": "",
            "piece": "24",
            "grave_row": "11",
            "grave_number": "5",
        }

        result = classify(source, [candidate])

        self.assertEqual(result.classification, MATCH_SIMILAR)

    def test_anonymous_different_location_is_none(self):
        source = {
            "name": "گمنام",
            "lastname": "",
            "piece": "24",
            "grave_row": "10",
            "grave_number": "5",
        }
        candidate = {
            "name": "شهید گمنام",
            "lastname": "",
            "piece": "26",
            "grave_row": "40",
            "grave_number": "12",
        }

        result = classify(source, [candidate])

        self.assertEqual(result.classification, MATCH_NONE)

    def test_named_martyr_logic_remains_unchanged(self):
        source = {
            "name": "محمد",
            "lastname": "حیدری",
            "piece": "29",
            "grave_row": "61",
            "grave_number": "3",
        }
        candidate = {
            "name": "محمد",
            "lastname": "حیدری",
            "piece": "30",
            "grave_row": "61",
            "grave_number": "3",
        }

        result = classify(source, [candidate])

        self.assertEqual(result.classification, MATCH_SIMILAR)


if __name__ == "__main__":
    unittest.main()
