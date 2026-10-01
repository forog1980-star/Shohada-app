"""
POC-02 — Data Intelligence / Data Quality Analyzer

این ماژول فقط برای تحلیل خواندنی داده‌هاست.
هیچ اتصال یا عملیات نوشتن روی Supabase ندارد.

ورودی:
    لیستی از رکوردهای شهدا، با ساختار مشابه snapshot فعلی Supabase.

خروجی:
    تحلیل طبقه‌بندی‌شده:
    - Duplicate
    - Identity Conflict
    - Location Conflict
    - Incomplete Data
    - Field Conflict
    - Stage Normalization
    - Stage Anomaly

اصل مهم:
    تشخیص «مورد مشکوک» به معنی تصمیم برای اصلاح، حذف یا ادغام نیست.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Iterable

try:
    from matching_engine import normalize
except ImportError:
    from ai.poc_01.matching_engine import normalize


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

LOCATION_FIELDS = (
    "piece",
    "grave_row",
    "grave_number",
)

IDENTITY_FIELDS = (
    "name",
    "lastname",
)

STAGE_ALIASES = {
    "تعویضی نصب شده": "نصب تعویضی شده",
    "سنگ تعویضی نصب شد": "نصب تعویضی شده",
    "نصب سنگ تعویضی آماده شده": "نصب تعویضی شده",
    "نصب سنگ تعویضی شده": "نصب تعویضی شده",

    "نصب مرمتی شده": "نصب مرمتی شده",
    "نصب سنگ مرمت شده": "نصب مرمتی شده",
    "نصب سنگ مرمتی شده": "نصب مرمتی شده",
    "نصب سنگ مرمتی آماده شده": "نصب مرمتی شده",

    "طرح سنگ به واحد مرمت ارسال شد": "ارسال به واحد مرمت",
    "ارسال به واحد مرمت": "ارسال به واحد مرمت",

    "طرح سنگ به واحد تعویض ارسال شد": "ارسال به واحد تعویض",
    "ارسال به واحد تعویض": "ارسال به واحد تعویض",

    "سنگ تعویضی آماده": "سنگ تعویضی آماده",
}

EMPTY_VALUES = {
    None,
    "",
}


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class Finding:
    """یک یافته قابل بررسی توسط کارشناس."""

    category: str
    reason: str
    record_ids: list[Any] = field(default_factory=list)
    records: list[dict[str, Any]] = field(default_factory=list)
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class DataQualityReport:
    """گزارش ساختاریافته کیفیت داده."""

    total_records: int

    duplicate_groups: list[Finding]
    identity_conflicts: list[Finding]
    location_conflicts: list[Finding]
    incomplete_records: list[Finding]
    field_conflicts: list[Finding]

    stage_normalizations: list[Finding]
    stage_anomalies: list[Finding]

    @property
    def duplicate_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.duplicate_groups
        )

    @property
    def identity_conflict_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.identity_conflicts
        )

    @property
    def location_conflict_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.location_conflicts
        )

    @property
    def incomplete_record_count(self) -> int:
        return len(
            {
                record_id
                for item in self.incomplete_records
                for record_id in item.record_ids
            }
        )

    @property
    def field_conflict_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.field_conflicts
        )

    @property
    def stage_normalization_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.stage_normalizations
        )

    @property
    def stage_anomaly_record_count(self) -> int:
        return sum(
            len(item.record_ids)
            for item in self.stage_anomalies
        )

    def incomplete_field_counts(self) -> dict[str, int]:
        """
        تعداد دفعات مشاهده هر فیلد ناقص.

        یک رکورد ممکن است بیش از یک فیلد ناقص داشته باشد.
        بنابراین جمع این اعداد الزاماً برابر تعداد رکوردهای ناقص نیست.
        """

        counts: dict[str, int] = {}

        for finding in self.incomplete_records:
            for field_name in finding.details["missing_fields"]:
                counts[field_name] = (
                    counts.get(field_name, 0) + 1
                )

        return counts

    def summary(self) -> dict[str, Any]:
        """خلاصه مناسب برای آمار و مصرف آینده توسط AI."""

        return {
            "total_records": self.total_records,

            "duplicates": {
                "groups": len(self.duplicate_groups),
                "records": self.duplicate_record_count,
            },

            "identity_conflicts": {
                "groups": len(self.identity_conflicts),
                "records": self.identity_conflict_record_count,
            },

            "location_conflicts": {
                "groups": len(self.location_conflicts),
                "records": self.location_conflict_record_count,
            },

            "incomplete_data": {
                "groups": len(self.incomplete_records),
                "records": self.incomplete_record_count,
                "fields": self.incomplete_field_counts(),
            },

            "field_conflicts": {
                "groups": len(self.field_conflicts),
                "records": self.field_conflict_record_count,
            },

            "stage_normalization": {
                "records": self.stage_normalization_record_count,
            },

            "stage_anomalies": {
                "records": self.stage_anomaly_record_count,
            },
        }


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

def normalized_value(value: Any) -> str:
    """Normalize a single textual/numeric value."""

    if value is None:
        return ""

    return normalize(str(value))


def normalized_location(
    record: dict[str, Any],
) -> tuple[str, str, str]:
    """Return normalized piece/row/number."""

    return tuple(
        normalized_value(record.get(field_name))
        for field_name in LOCATION_FIELDS
    )


def normalized_identity(
    record: dict[str, Any],
) -> tuple[str, str]:
    """Return normalized name/lastname."""

    return tuple(
        normalized_value(record.get(field_name))
        for field_name in IDENTITY_FIELDS
    )


def normalized_full_key(
    record: dict[str, Any],
) -> tuple[str, ...]:
    """Identity + complete location."""

    return (
        *normalized_identity(record),
        *normalized_location(record),
    )


def record_id(
    record: dict[str, Any],
) -> Any:
    """Return record ID."""

    return record.get("id")


def is_empty(
    value: Any,
) -> bool:
    """Check whether a field is effectively empty."""

    return (
        value in EMPTY_VALUES
        or normalized_value(value) == ""
    )


# ---------------------------------------------------------------------------
# Stage normalization
# ---------------------------------------------------------------------------

def normalize_stage(
    value: Any,
) -> str:
    """
    Normalize known stage aliases.

    Unknown values are normalized but preserved as-is.
    """

    value_normalized = normalized_value(value)

    if not value_normalized:
        return ""

    return STAGE_ALIASES.get(
        value_normalized,
        value_normalized,
    )


# ---------------------------------------------------------------------------
# Duplicate analysis
# ---------------------------------------------------------------------------

def _field_values(
    records: Iterable[dict[str, Any]],
    field_name: str,
) -> set[str]:

    return {
        normalized_value(
            record.get(field_name)
        )
        for record in records
    }


def classify_duplicate_group(
    records: list[dict[str, Any]],
) -> tuple[str, dict[str, Any]]:
    """
    Classify a duplicate group.

    Types:
        exact_normalized_duplicate
        formatting_only_duplicate
        field_conflict_duplicate
    """

    stone_types = _field_values(
        records,
        "stone_type",
    )

    stages = {
        normalize_stage(
            record.get("stage")
        )
        for record in records
    }

    # اختلاف در اطلاعات عملیاتی
    if (
        len(stone_types) > 1
        or len(stages) > 1
    ):
        return (
            "field_conflict_duplicate",
            {
                "stone_types": sorted(
                    stone_types
                ),
                "normalized_stages": sorted(
                    stages
                ),
            },
        )

    raw_location_variants = {
        tuple(
            str(
                record.get(field_name)
                or ""
            )
            for field_name in LOCATION_FIELDS
        )
        for record in records
    }

    raw_identity_variants = {
        tuple(
            str(
                record.get(field_name)
                or ""
            )
            for field_name in IDENTITY_FIELDS
        )
        for record in records
    }

    # فقط تفاوت نگارشی/رقمی
    if (
        len(raw_location_variants) > 1
        or len(raw_identity_variants) > 1
    ):
        return (
            "formatting_only_duplicate",
            {
                "raw_identity_variants": sorted(
                    raw_identity_variants
                ),
                "raw_location_variants": sorted(
                    raw_location_variants
                ),
            },
        )

    return (
        "exact_normalized_duplicate",
        {},
    )


def find_duplicate_groups(
    records: list[dict[str, Any]],
) -> list[Finding]:

    groups: dict[
        tuple[str, ...],
        list[dict[str, Any]],
    ] = defaultdict(list)

    for record in records:
        groups[
            normalized_full_key(record)
        ].append(record)

    findings: list[Finding] = []

    for key, group in groups.items():

        # از تشکیل یک گروه بزرگ برای رکوردهای کاملاً خالی جلوگیری شود.
        if all(
            not value
            for value in key
        ):
            continue

        if len(group) < 2:
            continue

        duplicate_type, details = (
            classify_duplicate_group(group)
        )

        findings.append(
            Finding(
                category="DUPLICATE",
                reason=duplicate_type,
                record_ids=[
                    record_id(item)
                    for item in group
                ],
                records=group,
                details={
                    "full_key": key,
                    **details,
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Identity conflicts
# ---------------------------------------------------------------------------

def find_identity_conflicts(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    Same normalized name+lastname appearing at different locations.

    Missing locations are excluded from the actual location comparison.
    """

    groups: dict[
        tuple[str, str],
        list[dict[str, Any]],
    ] = defaultdict(list)

    for record in records:

        identity = normalized_identity(
            record
        )

        if not any(identity):
            continue

        groups[identity].append(record)

    findings: list[Finding] = []

    for identity, group in groups.items():

        complete_locations = {
            normalized_location(record)
            for record in group
            if all(
                normalized_location(record)
            )
        }

        if len(complete_locations) <= 1:
            continue

        findings.append(
            Finding(
                category="IDENTITY_CONFLICT",
                reason=(
                    "same_identity_different_locations"
                ),
                record_ids=[
                    record_id(item)
                    for item in group
                ],
                records=group,
                details={
                    "identity": identity,
                    "locations": sorted(
                        complete_locations
                    ),
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Location conflicts
# ---------------------------------------------------------------------------

def find_location_conflicts(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    Same complete grave location occupied by
    different normalized identities.
    """

    groups: dict[
        tuple[str, str, str],
        list[dict[str, Any]],
    ] = defaultdict(list)

    for record in records:

        location = normalized_location(
            record
        )

        if not all(location):
            continue

        groups[location].append(record)

    findings: list[Finding] = []

    for location, group in groups.items():

        identities = {
            normalized_identity(record)
            for record in group
            if any(
                normalized_identity(record)
            )
        }

        if len(identities) <= 1:
            continue

        findings.append(
            Finding(
                category="LOCATION_CONFLICT",
                reason=(
                    "same_location_different_identities"
                ),
                record_ids=[
                    record_id(item)
                    for item in group
                ],
                records=group,
                details={
                    "location": location,
                    "identities": sorted(
                        identities
                    ),
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Incomplete data
# ---------------------------------------------------------------------------

def find_incomplete_records(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    Report missing critical fields one record at a time.
    """

    findings: list[Finding] = []

    critical_fields = (
        "name",
        "lastname",
        "piece",
        "grave_row",
        "grave_number",
    )

    for record in records:

        missing = [
            field_name
            for field_name in critical_fields
            if is_empty(
                record.get(field_name)
            )
        ]

        if not missing:
            continue

        findings.append(
            Finding(
                category="INCOMPLETE_DATA",
                reason="missing_critical_fields",
                record_ids=[
                    record_id(record)
                ],
                records=[record],
                details={
                    "missing_fields": missing,
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Field conflicts
# ---------------------------------------------------------------------------

def find_field_conflicts(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    Find duplicate identity/location groups
    whose operational fields differ.
    """

    duplicate_groups = (
        find_duplicate_groups(records)
    )

    findings: list[Finding] = []

    for duplicate in duplicate_groups:

        group = duplicate.records

        stone_types = _field_values(
            group,
            "stone_type",
        )

        stages = {
            normalize_stage(
                record.get("stage")
            )
            for record in group
        }

        differences: dict[str, Any] = {}

        if len(stone_types) > 1:
            differences["stone_type"] = sorted(
                stone_types
            )

        if len(stages) > 1:
            differences["stage"] = sorted(
                stages
            )

        if not differences:
            continue

        findings.append(
            Finding(
                category="FIELD_CONFLICT",
                reason=(
                    "same_identity_location_"
                    "different_operational_fields"
                ),
                record_ids=duplicate.record_ids,
                records=group,
                details={
                    "full_key": duplicate.details.get(
                        "full_key"
                    ),
                    "differences": differences,
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Stage normalization
# ---------------------------------------------------------------------------

def find_stage_normalizations(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    مواردی که مقدار مرحله فقط نیازمند
    یکسان‌سازی نام است.

    این موارد خطای داده محسوب نمی‌شوند.
    """

    findings: list[Finding] = []

    for record in records:

        raw_stage = record.get("stage")

        if is_empty(raw_stage):
            continue

        normalized_stage = normalize_stage(
            raw_stage
        )

        if (
            normalized_value(raw_stage)
            == normalized_stage
        ):
            continue

        findings.append(
            Finding(
                category="STAGE_NORMALIZATION",
                reason="known_stage_alias",
                record_ids=[
                    record_id(record)
                ],
                records=[record],
                details={
                    "raw_stage": raw_stage,
                    "normalized_stage": (
                        normalized_stage
                    ),
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Stage anomalies
# ---------------------------------------------------------------------------

def find_stage_anomalies(
    records: list[dict[str, Any]],
) -> list[Finding]:
    """
    مواردی که مقدار مرحله نه خالی است
    و نه در فهرست مرحله‌های شناخته‌شده قرار دارد.
    """

    findings: list[Finding] = []

    known_stages = {
        normalized_value(value)
        for value in STAGE_ALIASES.values()
    }

    for record in records:

        raw_stage = record.get("stage")

        if is_empty(raw_stage):
            continue

        normalized_stage = normalize_stage(
            raw_stage
        )

        if normalized_stage in known_stages:
            continue

        findings.append(
            Finding(
                category="STAGE_ANOMALY",
                reason="unknown_stage_value",
                record_ids=[
                    record_id(record)
                ],
                records=[record],
                details={
                    "raw_stage": raw_stage,
                    "normalized_stage": (
                        normalized_stage
                    ),
                },
            )
        )

    return findings


# ---------------------------------------------------------------------------
# Main analyzer
# ---------------------------------------------------------------------------

def analyze_records(
    records: list[dict[str, Any]],
) -> DataQualityReport:
    """
    Run all read-only data-quality analyses.
    """

    # فقط کپی سطحی؛ داده ورودی تغییر نمی‌کند.
    safe_records = [
        dict(record)
        for record in records
    ]

    return DataQualityReport(
        total_records=len(safe_records),

        duplicate_groups=(
            find_duplicate_groups(
                safe_records
            )
        ),

        identity_conflicts=(
            find_identity_conflicts(
                safe_records
            )
        ),

        location_conflicts=(
            find_location_conflicts(
                safe_records
            )
        ),

        incomplete_records=(
            find_incomplete_records(
                safe_records
            )
        ),

        field_conflicts=(
            find_field_conflicts(
                safe_records
            )
        ),

        stage_normalizations=(
            find_stage_normalizations(
                safe_records
            )
        ),

        stage_anomalies=(
            find_stage_anomalies(
                safe_records
            )
        ),
    )


# ---------------------------------------------------------------------------
# Human-readable console report
# ---------------------------------------------------------------------------

def print_summary(
    report: DataQualityReport,
) -> None:
    """Print a concise Persian report."""

    print("=" * 72)
    print("گزارش هوشمند کیفیت داده")
    print("=" * 72)

    print(
        f"کل رکوردها: "
        f"{report.total_records}"
    )

    print()

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
        f"نرمال‌سازی مرحله: "
        f"{report.stage_normalization_record_count} رکورد"
    )

    print(
        f"مرحله ناشناخته/غیرمنتظره: "
        f"{report.stage_anomaly_record_count} رکورد"
    )

    print()

    print("فیلدهای ناقص:")

    for field_name, count in sorted(
        report.incomplete_field_counts().items()
    ):
        print(
            f"  {field_name}: {count}"
        )

    print("=" * 72)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

__all__ = [
    "DataQualityReport",
    "Finding",

    "analyze_records",

    "classify_duplicate_group",
    "find_duplicate_groups",

    "find_identity_conflicts",
    "find_location_conflicts",

    "find_incomplete_records",

    "find_field_conflicts",

    "find_stage_normalizations",
    "find_stage_anomalies",

    "normalize_stage",

    "print_summary",
]