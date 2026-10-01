import json
from collections import Counter
from pathlib import Path

from data_intelligence import analyze_records


SNAPSHOT_PATH = (
    Path(r"C:\مهدی\نرم افزار جستجوی شهدا\AI-POC-data")
    / "martyrs_supabase_snapshot_20261001.json"
)


def load_snapshot(path: Path):
    print(f"Reading snapshot: {path}")

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    if isinstance(data, dict):
        if "records" in data:
            records = data["records"]
        elif "data" in data:
            records = data["data"]
        else:
            raise ValueError(
                "Snapshot JSON object does not contain "
                "'records' or 'data'."
            )
    elif isinstance(data, list):
        records = data
    else:
        raise ValueError(
            "Unsupported snapshot JSON structure."
        )

    if not isinstance(records, list):
        raise ValueError(
            "Snapshot records must be a list."
        )

    return records


def print_duplicate_summary(report):
    print()
    print("----- جزئیات Duplicate -----")

    counter = Counter(
        finding.reason
        for finding in report.duplicate_groups
    )

    duplicate_types = [
        "exact_normalized_duplicate",
        "field_conflict_duplicate",
        "formatting_only_duplicate",
    ]

    for duplicate_type in duplicate_types:
        print(
            f"{duplicate_type}: "
            f"{counter.get(duplicate_type, 0)}"
        )


def print_conflict_summary(report):
    print()
    print("----- جزئیات Conflict -----")

    print(
        "Identity conflicts: "
        f"{len(report.identity_conflicts)} groups"
    )

    print(
        "Location conflicts: "
        f"{len(report.location_conflicts)} groups"
    )


def print_stage_normalizations(report):
    print()
    print("----- Stage normalization -----")

    if not report.stage_normalizations:
        print("موردی برای نرمال‌سازی مرحله وجود ندارد.")
        return

    counter = Counter()

    for finding in report.stage_normalizations:
        raw_stage = finding.details.get(
            "raw_stage",
            "",
        )

        normalized_stage = finding.details.get(
            "normalized_stage",
            "",
        )

        counter[
            (
                raw_stage,
                normalized_stage,
            )
        ] += len(finding.record_ids)

    for (
        raw_stage,
        normalized_stage,
    ), count in sorted(
        counter.items(),
        key=lambda item: (
            -item[1],
            item[0][0],
            item[0][1],
        ),
    ):
        print(
            f"{count:4d} | "
            f"{raw_stage} -> {normalized_stage}"
        )


def print_stage_anomalies(report):
    print()
    print("----- Stage anomalies -----")

    if not report.stage_anomalies:
        print("مورد ناشناخته‌ای در مرحله‌ها پیدا نشد.")
        return

    print(
        f"تعداد گروه‌ها: "
        f"{len(report.stage_anomalies)}"
    )

    print(
        f"تعداد رکوردها: "
        f"{report.stage_anomaly_record_count}"
    )

    for finding in report.stage_anomalies:
        raw_stage = finding.details.get(
            "raw_stage",
            "",
        )

        print(
            f"IDs={finding.record_ids} | "
            f"stage={raw_stage}"
        )


def print_incomplete_summary(report):
    print()
    print("----- Incomplete fields -----")

    field_counts = report.incomplete_field_counts()

    if not field_counts:
        print("اطلاعات ناقص پیدا نشد.")
        return

    for field_name, count in sorted(
        field_counts.items()
    ):
        print(
            f"{field_name}: {count}"
        )


def print_field_conflicts(report):
    print()
    print("----- Field conflicts -----")

    if not report.field_conflicts:
        print("موردی پیدا نشد.")
        return

    for finding in report.field_conflicts:
        print(
            f"IDs={finding.record_ids} | "
            f"{finding.details}"
        )


def print_duplicate_details(report):
    print()
    print("----- Duplicate groups -----")

    if not report.duplicate_groups:
        print("Duplicate group وجود ندارد.")
        return

    for index, finding in enumerate(
        report.duplicate_groups,
        start=1,
    ):
        print(
            f"{index:3d}. "
            f"reason={finding.reason} | "
            f"IDs={finding.record_ids}"
        )


def print_report(report):
    print()
    print("=" * 72)
    print("گزارش هوشمند کیفیت داده")
    print("=" * 72)

    print(
        f"کل رکوردها: "
        f"{report.total_records}"
    )

    print(
        f"تکراری: "
        f"{len(report.duplicate_groups)} گروه / "
        f"{report.duplicate_record_count} رکورد"
    )

    print(
        f"تعارض هویتی: "
        f"{len(report.identity_conflicts)} گروه / "
        f"{report.identity_conflict_record_count} رکورد"
    )

    print(
        f"تعارض محل: "
        f"{len(report.location_conflicts)} گروه / "
        f"{report.location_conflict_record_count} رکورد"
    )

    print(
        f"اطلاعات ناقص: "
        f"{report.incomplete_record_count} رکورد"
    )

    print(
        f"اختلاف فیلدی: "
        f"{len(report.field_conflicts)} گروه / "
        f"{report.field_conflict_record_count} رکورد"
    )

    print(
        f"نیازمند نرمال‌سازی مرحله: "
        f"{report.stage_normalization_record_count} رکورد"
    )

    print(
        f"مرحله ناشناخته/غیرقابل‌شناسایی: "
        f"{report.stage_anomaly_record_count} رکورد"
    )

    print_duplicate_summary(report)
    print_conflict_summary(report)
    print_stage_normalizations(report)
    print_stage_anomalies(report)
    print_incomplete_summary(report)
    print_field_conflicts(report)

    print()
    print("===== پایان تحلیل =====")


def main():
    records = load_snapshot(
        SNAPSHOT_PATH
    )

    print()
    print(
        f"Snapshot records: "
        f"{len(records)}"
    )

    report = analyze_records(
        records
    )

    print_report(report)


if __name__ == "__main__":
    main()