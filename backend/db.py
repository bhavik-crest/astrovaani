# db.py
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in environment")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def insert_report(payload: dict):
    res = supabase.table("reports").insert(payload).execute()

    # FIX: use .error_message instead of error or status_code
    if getattr(res, "error_message", None):
        raise RuntimeError(f"Supabase insert failed: {res.error_message}")

    # res.data contains inserted rows
    return res.data