# main.py
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()  # optional: load .env in dev

from schemas import BirthRequest, ReportResponse
from openrouter import call_openrouter
from db import insert_report, supabase

app = FastAPI(title="Astrology AI (OpenRouter + Supabase)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# The system prompt (use your polished prompt). Keep concise here; you can expand.
SYSTEM_PROMPT = """
You are an expert Vedic astrologer. Use the provided birth details to create a clear, practical astrology report.
Sections required: basic_details, personality, career (top 5), avoid (colors/habits/industries), marriage, planets, remedies, summary.
The report must be written in the user's selected language (English or Hindi).
Return JSON only, with keys exactly matching this structure.
"""

# Build the personalized user prompt using the request fields
def build_astrology_prompt(data: BirthRequest) -> str:
    user_text = f"""
    Generate a full astrology report for the following person. Return structured output as JSON with keys:
    basic_details, personality, career, avoid, marriage, planets, remedies, summary.

    Name: {data.name or 'Unknown'}
    Date of Birth: {data.dob.isoformat()}
    Time of Birth: {data.tob}
    Place of Birth: {data.pob}
    Preferred Language: {data.language or 'English'}
    Extra: {json.dumps(data.extra) if data.extra else "None"}

    The report must be written fully in the selected language above.Keep the JSON fields concise but meaningful. For lists, use arrays. For small texts, keep to 1-3 sentences.
    """
    return user_text

@app.get("/reports")
def list_reports():
    try:
        # Execute query
        res = supabase.table("reports").select("*").execute()

        # res ONLY contains `.data` — no `.error`, no `.status_code`
        if res.data is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch data from Supabase"
            )

        return {
            "success": True,
            "count": len(res.data),
            "data": res.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/{report_id}")
def get_report_by_id(report_id: str):
    try:
        # Query Supabase
        res = supabase.table("reports").select("*").eq("id", report_id).limit(1).execute()

        # Supabase returns only .data — NOT .error or .status_code
        if not res.data:
            raise HTTPException(
                status_code=404,
                detail=f"Report with id {report_id} not found"
            )

        return {
            "success": True,
            "data": res.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report", response_model=ReportResponse)
async def generate_report(req: BirthRequest):

    # Pass language to your prompt builder
    prompt = build_astrology_prompt(req)

    try:
        router_resp = await call_openrouter(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            max_tokens=1200,
            temperature=0.18
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenRouter call failed: {str(e)}")

    # Attempt to extract the model's textual output robustly (different API shapes)
    ai_text = None
    ai_json = None
    try:
        # common shapes:
        # chat completions: {'choices':[{'message':{'content':'...'}}], ...}
        if isinstance(router_resp, dict) and "choices" in router_resp:
            # try multiple shapes
            choice = router_resp["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                ai_text = choice["message"]["content"]
            elif "text" in choice:
                ai_text = choice.get("text")
            else:
                # fallback: store whole choice
                ai_text = json.dumps(choice)
        # completions style -> 'output' or 'data'
        elif isinstance(router_resp, dict) and "output" in router_resp:
            ai_text = router_resp["output"]
        else:
            # fallback: stringify
            ai_text = json.dumps(router_resp)
    except Exception:
        ai_text = json.dumps(router_resp)

    # Try to parse JSON from AI output
    try:
        ai_json = json.loads(ai_text) if isinstance(ai_text, str) else {"raw": ai_text}
    except Exception:
        ai_json = {"raw": ai_text}

    # SAVE into DB
    payload = {
        "name": req.name,
        "dob": req.dob.isoformat(),
        "tob": req.tob,
        "pob": req.pob,
        "language": req.language,
        "input_data": {
            "name": req.name,
            "dob": req.dob.isoformat(),
            "tob": req.tob,
            "pob": req.pob,
            "language": req.language,
            "extra": req.extra,
        },
        "ai_output": ai_json,
        # created_at will be set by DB default if configured; include for clarity
    }

    try:
        inserted = insert_report(payload)
    except Exception as e:
        # If DB insert fails, still return AI response but not persist
        raise HTTPException(status_code=500, detail=f"DB insert failed: {str(e)}")

    # inserted is list of records inserted; return first
    record = inserted[0] if isinstance(inserted, list) and len(inserted) > 0 else payload

    return {
        "id": record.get("id"),
        "name": record.get("name"),
        "dob": req.dob,
        "tob": record.get("tob"),
        "pob": record.get("pob"),
        "language": record.get("language"),
        "ai_output": record.get("ai_output"),
        "created_at": record.get("created_at"),
    }
