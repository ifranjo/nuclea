import tempfile
import unittest
from pathlib import Path

from process_images import apply_duplicate_plan, build_duplicate_plan, scan_images


class ProcessImagesTests(unittest.TestCase):
    def test_detects_exact_duplicates_and_prefers_base_name_as_keeper(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "IMG_0001.JPG").write_bytes(b"same-content")
            (root / "IMG_0001 (1).JPG").write_bytes(b"same-content")
            (root / "UNIQUE.JPG").write_bytes(b"unique-content")

            records = scan_images(root)
            plan = build_duplicate_plan(records)

            self.assertEqual(plan["summary"]["total_files"], 3)
            self.assertEqual(plan["summary"]["duplicate_groups"], 1)
            self.assertEqual(plan["summary"]["duplicate_files"], 1)
            self.assertEqual(plan["summary"]["reclaimable_bytes"], len(b"same-content"))

            group = plan["groups"][0]
            self.assertTrue(group["keeper"]["path"].endswith("IMG_0001.JPG"))
            self.assertEqual(len(group["duplicates"]), 1)
            self.assertTrue(group["duplicates"][0]["path"].endswith("IMG_0001 (1).JPG"))

    def test_apply_moves_duplicate_files_and_keeps_original(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            keeper = root / "DSC0001.JPG"
            duplicate = root / "DSC0001 (1).JPG"
            keeper.write_bytes(b"dup-bytes")
            duplicate.write_bytes(b"dup-bytes")

            records = scan_images(root)
            plan = build_duplicate_plan(records)
            moved = apply_duplicate_plan(plan, root / "_duplicates")

            self.assertEqual(moved, 1)
            self.assertTrue(keeper.exists())
            self.assertFalse(duplicate.exists())
            self.assertTrue((root / "_duplicates" / "DSC0001 (1).JPG").exists())


if __name__ == "__main__":
    unittest.main()
