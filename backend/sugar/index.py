import json
import os
import pg8000.native
from datetime import date

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    import urllib.parse
    result = urllib.parse.urlparse(os.environ["DATABASE_URL"])
    return pg8000.native.Connection(
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port or 5432,
        database=result.path.lstrip("/"),
    )

def esc(s):
    return str(s).replace("'", "''")

def handler(event: dict, context) -> dict:
    """Трекинг сладостей — чтение и сохранение отметок участников."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        rows = conn.run(
            "SELECT date::text, person_id, sweet, checked FROM sugar_checks ORDER BY date DESC, person_id"
        )
        conn.close()

        data = {}
        for row in rows:
            d, person_id, sweet, checked = row
            if d not in data:
                data[d] = {}
            data[d][f"{person_id}__{sweet}"] = checked

        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps(data),
        }

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        date_str = body.get("date", str(date.today()))
        person_id = body.get("person_id", "")
        sweet = body.get("sweet", "")
        checked = bool(body.get("checked", True))
        checked_sql = "TRUE" if checked else "FALSE"

        sql = f"""
            INSERT INTO sugar_checks (date, person_id, sweet, checked, updated_at)
            VALUES ('{esc(date_str)}', '{esc(person_id)}', '{esc(sweet)}', {checked_sql}, NOW())
            ON CONFLICT (date, person_id, sweet)
            DO UPDATE SET checked = {checked_sql}, updated_at = NOW()
        """
        conn = get_conn()
        conn.run(sql)
        conn.close()

        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"ok": True}),
        }

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": "Method Not Allowed"}
