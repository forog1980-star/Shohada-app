from datetime import datetime, timezone


def create_history_entry(
    user_id,
    user_role,
    operation,
    record_id,
    status,
    result,
    note="",
    timestamp=None,
):
    if not user_id:
        raise ValueError("user_id الزامی است.")

    if not operation:
        raise ValueError("operation الزامی است.")

    if record_id is None:
        raise ValueError("record_id الزامی است.")

    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    return {
        "user_id": str(user_id),
        "user_role": user_role or "",
        "operation": operation,
        "record_id": str(record_id),
        "timestamp": timestamp,
        "status": status or "",
        "result": result or "",
        "note": note or "",
    }


def summarize_user_history(entries):
    summary = {}

    for entry in entries:
        user_id = entry.get("user_id")
        if not user_id:
            continue

        if user_id not in summary:
            summary[user_id] = {
                "user_id": user_id,
                "total_operations": 0,
                "successful_operations": 0,
                "returned_operations": 0,
                "approved_operations": 0,
            }

        item = summary[user_id]
        item["total_operations"] += 1

        result = entry.get("result", "")

        if result == "موفق":
            item["successful_operations"] += 1

        if result == "برگشت برای اصلاح":
            item["returned_operations"] += 1

        if result == "تأیید نهایی":
            item["approved_operations"] += 1

    return list(summary.values())


def filter_history_by_user(entries, user_id):
    return [
        entry
        for entry in entries
        if entry.get("user_id") == user_id
    ]