from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import UploadResponse
import pdfplumber, io

router = APIRouter(prefix="/upload", tags=["upload"])

def extract_text_from_upload(file: UploadFile) -> str:
    content = file.file.read()
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
            return text
    else:
        return content.decode("utf-8", errors="ignore")

@router.post("/jd", response_model=UploadResponse)
async def upload_jd(file: UploadFile = File(...)):
    text = extract_text_from_upload(file)
    return UploadResponse(text=text, filename=file.filename)

@router.post("/resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    text = extract_text_from_upload(file)
    return UploadResponse(text=text, filename=file.filename)
