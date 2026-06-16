import unittest

from blueprints.v0.project.db.collection.document.json_fields import (
    load_json_form_field,
    load_optional_json_form_field,
)
from errors import CustomAPIError


class JsonFormFieldTests(unittest.TestCase):
    def assert_invalid_json(self, value, field_name):
        with self.assertRaises(CustomAPIError) as context:
            load_json_form_field(value, field_name)

        self.assertEqual(context.exception.status_code, 400)
        self.assertIn(field_name, context.exception.message)

    def test_rejects_malformed_json(self):
        self.assert_invalid_json("{bad", "documents")

    def test_rejects_invalid_ejson_values(self):
        self.assert_invalid_json('{"$oid": "not-a-valid-objectid"}', "filter")

    def test_optional_empty_field_returns_none(self):
        self.assertIsNone(load_optional_json_form_field("", "projection"))

    def test_valid_json_still_parses(self):
        self.assertEqual(
            load_json_form_field('[{"ok": true}]', "documents"),
            [{"ok": True}],
        )


if __name__ == "__main__":
    unittest.main()
